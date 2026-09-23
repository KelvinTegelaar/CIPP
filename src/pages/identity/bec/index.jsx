import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import {
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { CippOffCanvas } from '../../../components/CippComponents/CippOffCanvas'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippApiResults } from '../../../components/CippComponents/CippApiResults'
import { useBecEvidenceDownload } from '../../../components/CippComponents/CippBecEvidenceDownload'
import { CippIcons } from '../../../utils/icon-registry'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'

// Columns shown for a single run — used both by the flat "All runs" table and inside a
// user's run-history drawer, so the two never drift.
const RUN_COLUMNS = [
  'Level',
  'Score',
  'Status',
  'ExtractedAt',
  'RequestedBy',
  'ContainmentRuns',
  'CaseId',
]

// The run history behind a per-user summary row: every run for that user, newest first,
// with the same per-run actions as the flat view (open, download, delete a specific run).
// Opened from the row's "View runs" action rather than the More-Info drawer, so a drawer
// never stacks on top of another.
const UserRunsDrawer = ({ row, actions, drawerVisible, setDrawerVisible }) => {
  const runs = Array.isArray(row?.Runs) ? row.Runs : []
  return (
    <CippOffCanvas
      title={`Runs for ${row?.UserPrincipalName ?? row?.DisplayName ?? 'user'}`}
      size="xl"
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
    >
      <CippDataTable
        noCard={true}
        title={`${runs.length} ${runs.length === 1 ? 'run' : 'runs'}`}
        data={runs}
        actions={actions}
        simpleColumns={RUN_COLUMNS}
      />
    </CippOffCanvas>
  )
}

// Quick action: pick one or more users and queue a BEC investigation for each. Runs land in the
// table below; each is its own case.
const StartInvestigationDrawer = ({ tenant }) => {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { users: [] },
  })
  const queue = ApiPostCall({
    relatedQueryKeys: [
      `ListBECReports-${tenant}`,
      `ListBECReports-grouped-${tenant}`,
    ],
  })

  const handleStart = () => {
    const users = formControl.getValues('users') || []
    const ids = users.map((u) => u?.value ?? u).filter(Boolean)
    if (ids.length === 0) return
    // One user: open its case workspace and start the run there, so you watch it run.
    if (ids.length === 1) {
      setVisible(false)
      router.push(
        `/identity/bec/case?userId=${encodeURIComponent(ids[0])}&tenantFilter=${encodeURIComponent(
          tenant
        )}&start=true`
      )
      return
    }
    // Several users: queue one run each; they appear in the table as they finish.
    queue.mutate({
      url: '/api/ExecBECBulkCheck',
      data: { tenantFilter: tenant, UserIds: ids },
    })
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<CippIcons.TravelExplore />}
        onClick={() => setVisible(true)}
      >
        Start investigation
      </Button>
      <CippOffCanvas
        title="Start a BEC investigation"
        visible={visible}
        onClose={() => setVisible(false)}
        size="md"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={queue} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleStart}
                disabled={queue.isPending}
              >
                Start investigation
              </Button>
            </Stack>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Pick one user to open its case workspace and watch the run, or
            several to queue a run for each (they appear in the table as they
            finish). Each run is kept as a case. Metadata only — no message
            content is read.
          </Typography>
          <CippFormComponent
            type="autoComplete"
            name="users"
            label="Users to investigate"
            formControl={formControl}
            multiple
            creatable={false}
            api={{
              url: '/api/ListUsers',
              data: { tenantFilter: tenant },
              labelField: (u) => `${u.displayName} (${u.userPrincipalName})`,
              valueField: 'id',
              queryKey: `ListUsers-${tenant}`,
            }}
          />
        </Stack>
      </CippOffCanvas>
    </>
  )
}

const Page = () => {
  const { currentTenant } = useSettings()
  const [viewMode, setViewMode] = useState('flat')
  const isByUser = viewMode === 'byUser'
  // Renders the report PDFs in-memory and exports, without opening the case.
  const { download } = useBecEvidenceDownload()

  // Grouped mode: the same runs reduced to one row per user (their worst recent level, run count and
  // latest run) and fed to the table via `data` with no apiUrl — the Standards page's grouping pattern.
  // Its own queryKey, separate from the flat table's: that one is an infinite-query cache ({pages}),
  // and reading it here as a plain array yielded nothing, so the grouped view came up empty.
  const groupedCall = ApiGetCall({
    url: '/api/ListBECReports',
    data: { tenantFilter: currentTenant },
    queryKey: `ListBECReports-grouped-${currentTenant}`,
    waiting: isByUser,
  })
  const groupedByUser = useMemo(() => {
    const runs = Array.isArray(groupedCall.data) ? groupedCall.data : []
    const rank = { High: 3, Medium: 2, Low: 1 }
    const when = (row) =>
      new Date(row?.ExtractedAt || row?.RequestedAt || 0).getTime() || 0
    const byUser = new Map()
    runs.forEach((run) => {
      const key = run.UserPrincipalName || run.UserId || 'unknown'
      if (!byUser.has(key)) byUser.set(key, [])
      byUser.get(key).push(run)
    })
    return [...byUser.values()]
      .map((list) => {
        const runsNewestFirst = [...list].sort((a, b) => when(b) - when(a))
        const latest = runsNewestFirst[0]
        const worst = [...list].sort(
          (a, b) => (rank[b.Level] || 0) - (rank[a.Level] || 0)
        )[0]
        return {
          ...latest,
          Level: worst?.Level ?? latest?.Level,
          RunCount: list.length,
          // Full run history for this user (newest first), powering the "View runs" drawer.
          Runs: runsNewestFirst,
        }
      })
      .sort(
        (a, b) =>
          (rank[b.Level] || 0) - (rank[a.Level] || 0) || when(b) - when(a)
      )
  }, [groupedCall.data])

  const modeToggle = (
    <ToggleButtonGroup
      key="mode"
      size="small"
      exclusive
      value={viewMode}
      onChange={(event, value) => value && setViewMode(value)}
    >
      <ToggleButton value="flat">All runs</ToggleButton>
      <ToggleButton value="byUser">By user</ToggleButton>
    </ToggleButtonGroup>
  )

  // Actions on a single run — the flat "All runs" rows, and every row inside a user's
  // run-history drawer. Open in any state (a queued/running case shows live progress, a
  // failed one its error); download bundles both report PDFs client-side; delete removes
  // one run and refreshes both views.
  const runActions = [
    {
      label: 'Open case',
      icon: <CippIcons.Visibility />,
      link: '/identity/bec/case?userId=[UserId]&caseId=[CaseId]&tenantFilter=[Tenant]',
      multiPost: false,
    },
    {
      // The server GET path cannot include the PDFs, so this is client-driven.
      label: 'Download evidence (ZIP, with PDFs)',
      icon: <CippIcons.Archive />,
      noConfirm: true,
      customFunction: (row) => download(row),
      condition: (row) => row.Status === 'Completed',
    },
    {
      label: 'Delete run',
      icon: <CippIcons.DeleteForever />,
      type: 'POST',
      url: '/api/ExecBECReport',
      data: {
        Action: '!Delete',
        caseId: 'CaseId',
        tenantFilter: 'Tenant',
      },
      confirmText:
        'Delete run [CaseId] for [UserPrincipalName] permanently, including its results and evidence package?',
      // Refresh both the flat list and the grouped view's source fetch (its rows are a
      // static snapshot, so it only updates when its own query is invalidated).
      relatedQueryKeys: [
        `ListBECReports-${currentTenant}`,
        `ListBECReports-grouped-${currentTenant}`,
      ],
      multiPost: false,
    },
  ]

  // Actions on a per-user summary row: drill into the whole run history, or act on the
  // latest run directly.
  const groupedRowActions = [
    {
      label: 'View runs',
      icon: <CippIcons.History />,
      multiPost: false,
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <UserRunsDrawer
          row={row}
          actions={runActions}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
    },
    {
      label: 'Open latest case',
      icon: <CippIcons.Visibility />,
      link: '/identity/bec/case?userId=[UserId]&caseId=[CaseId]&tenantFilter=[Tenant]',
      multiPost: false,
    },
    {
      label: 'Download latest evidence (ZIP, with PDFs)',
      icon: <CippIcons.Archive />,
      noConfirm: true,
      customFunction: (row) => download(row),
      condition: (row) => row.Status === 'Completed',
    },
  ]

  const actions = isByUser ? groupedRowActions : runActions

  const offCanvas = {
    extendedInfoFields: [
      'CaseId',
      'Tenant',
      'UserPrincipalName',
      'DisplayName',
      'Status',
      'Level',
      'Score',
      ...(isByUser ? ['RunCount'] : ['IncompleteCount']),
      'ExtractedAt',
      'RequestedAt',
      'RequestedBy',
      'ContainmentRuns',
      'ErrorMessage',
    ],
    // The More-Info drawer offers the latest-run shortcuts; "View runs" opens its own
    // drawer, so it is kept out of here to avoid stacking one drawer on another.
    actions: isByUser
      ? groupedRowActions.filter((a) => typeof a.customComponent !== 'function')
      : runActions,
  }

  return (
    <CippTablePage
      key={viewMode}
      title="Business Email Compromise"
      apiUrl={isByUser ? undefined : '/api/ListBECReports'}
      data={isByUser ? groupedByUser : undefined}
      // Distinct key for the grouped view: it feeds the table static (collapsed) rows via
      // `data`, but CippDataTable's internal query still reads whatever is cached under its
      // queryKey. Sharing the flat view's key let the cached per-run list overwrite the
      // grouped rows, so nothing ever collapsed. The page still fetches (and invalidates)
      // the runs under the plain key via `groupedCall`.
      queryKey={
        isByUser
          ? `ListBECReports-byUser-${currentTenant}`
          : `ListBECReports-${currentTenant}`
      }
      actions={actions}
      offCanvas={offCanvas}
      cardButton={[
        modeToggle,
        <StartInvestigationDrawer key="start" tenant={currentTenant} />,
      ]}
      simpleColumns={
        isByUser
          ? [
              // A per-user summary: worst level seen, how many runs, and the latest run's
              // score/status/date. The individual runs live behind "View runs".
              'Tenant',
              'UserPrincipalName',
              'Level',
              'RunCount',
              'Score',
              'Status',
              'ExtractedAt',
            ]
          : [
              'Tenant',
              'UserPrincipalName',
              'Level',
              'Score',
              'Status',
              'ExtractedAt',
              'RequestedBy',
              'ContainmentRuns',
              'CaseId',
            ]
      }
      filters={[
        // Both apply to either view: in "By user" the columns hold the worst level seen
        // and the latest run's status, so "High threat level" surfaces any user with a
        // High run.
        {
          filterName: 'High threat level',
          value: [{ id: 'Level', value: 'High' }],
          type: 'column',
        },
        {
          filterName: 'Completed runs',
          value: [{ id: 'Status', value: 'Completed' }],
          type: 'column',
        },
      ]}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>
)

export default Page
