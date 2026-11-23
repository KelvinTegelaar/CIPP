import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Alert, Button } from '@mui/material'
import { Box, Grid, Stack } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { ApiGetCall, ApiPostCall } from '../../../../../api/ApiCall'
import { getListGraphBulkRequestRows } from '../../../../../utils/getListGraphBulkRequestRows.js'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { CippPropertyListCard } from '../../../../../components/CippCards/CippPropertyListCard'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
import { CippIntuneDeploymentStatus } from '../../../../../components/CippComponents/CippIntuneDeploymentStatus.jsx'
import { useCippIntuneAppActions } from '../../../../../components/CippComponents/CippIntuneAppActions.jsx'
import tabOptions from './tabOptions'

const TARGETS = {
  '#microsoft.graph.allLicensedUsersAssignmentTarget': ['All users', 'Include'],
  '#microsoft.graph.allDevicesAssignmentTarget': ['All devices', 'Include'],
  '#microsoft.graph.groupAssignmentTarget': [null, 'Include'],
  '#microsoft.graph.exclusionGroupAssignmentTarget': [null, 'Exclude'],
}

const INTENTS = {
  required: 'Required',
  available: 'Available',
  availableWithoutEnrollment: 'Available without enrollment',
  uninstall: 'Uninstall',
}

const Page = () => {
  const router = useRouter()
  const { appId } = router.query
  const currentTenant = useSettings().currentTenant
  const tenantFilter = router.query.tenantFilter ?? currentTenant
  const appQueryKey = `IntuneApp-${tenantFilter}-${appId}`

  const appRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `deviceAppManagement/mobileApps/${appId}`,
      $expand: 'assignments',
      tenantFilter,
    },
    queryKey: appQueryKey,
    waiting: Boolean(appId),
  })
  const results = appRequest.data?.Results
  const app = Array.isArray(results) ? results[0] : results
  const assignments = app?.assignments ?? []

  // Group and filter names for the assignment rows, in one batched lookup.
  const namesBulk = ApiPostCall({})
  const lookupIds = [
    ...new Set(assignments.map((a) => a.target?.groupId).filter(Boolean)),
  ].sort()
  const hasFilters = assignments.some(
    (a) => a.target?.deviceAndAppManagementAssignmentFilterId
  )
  const lookupKey = `${lookupIds.join(',')}|${hasFilters}`
  useEffect(() => {
    if (!lookupIds.length && !hasFilters) return
    namesBulk.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        tenantFilter,
        Requests: [
          ...lookupIds.map((id) => ({
            id,
            url: `/groups/${id}?$select=id,displayName`,
            method: 'GET',
          })),
          ...(hasFilters
            ? [
                {
                  id: 'filters',
                  url: '/deviceManagement/assignmentFilters?$select=id,displayName',
                  method: 'GET',
                },
              ]
            : []),
        ],
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupKey, tenantFilter])

  const names = {}
  for (const row of getListGraphBulkRequestRows(namesBulk)) {
    if (row.id === 'filters') {
      for (const filter of row.body?.value ?? [])
        names[filter.id] = filter.displayName
    } else if (row.body?.displayName) {
      names[row.id] = row.body.displayName
    }
  }

  const assignmentRows = assignments.map((a) => {
    const [fixedTarget, direction] = TARGETS[a.target?.['@odata.type']] ?? [
      a.target?.['@odata.type'],
      'Include',
    ]
    const filterId = a.target?.deviceAndAppManagementAssignmentFilterId
    const filterType = a.target?.deviceAndAppManagementAssignmentFilterType
    return {
      id: a.id,
      Target: fixedTarget ?? names[a.target?.groupId] ?? a.target?.groupId,
      Direction: direction,
      Intent: direction === 'Exclude' ? '' : (INTENTS[a.intent] ?? a.intent),
      Filter:
        filterId && filterType !== 'none'
          ? `${filterType === 'exclude' ? 'Exclude' : 'Include'}: ${names[filterId] ?? filterId}`
          : '',
      source: a.source,
    }
  })

  const assignmentActions = [
    {
      label: 'Remove assignment',
      type: 'POST',
      url: '/api/ExecRemoveAppAssignment',
      icon: <CippIcons.Delete />,
      color: 'danger',
      multiPost: false,
      // Assignments that come from a policy set are changed on the policy set.
      condition: (row) => row.source !== 'policySets',
      customDataformatter: (row) => ({
        tenantFilter,
        ID: appId,
        AssignmentId: row.id,
      }),
      relatedQueryKeys: [appQueryKey],
      confirmText:
        'Remove the [Direction] assignment for "[Target]"? The app\'s other assignments are kept.',
    },
  ]

  const appActions = useCippIntuneAppActions()
  const actionsData = useMemo(
    () => (app ? { ...app, Tenant: tenantFilter } : undefined),
    [app, tenantFilter]
  )

  const title = !appId
    ? 'No application selected'
    : appRequest.isError || (appRequest.isSuccess && !app?.displayName)
      ? 'Application not found'
      : (app?.displayName ?? 'Loading...')
  const appType = app?.['@odata.type']?.replace('#microsoft.graph.', '')
  const firstRule = app?.rules?.[0]

  const subtitle = app
    ? [
        { icon: <CippIcons.Apps />, text: appType },
        {
          icon: <CippIcons.Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={app.id} />,
        },
        {
          icon: <CippIcons.CalendarIcon />,
          text: (
            <>
              Last modified: <CippTimeAgo data={app.lastModifiedDateTime} />
            </>
          ),
        },
        {
          icon: <CippIcons.Launch />,
          text: (
            <Button
              color="muted"
              style={{ paddingLeft: 0 }}
              size="small"
              href={`https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_Apps/SettingsMenu/~/0/appId/${app.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Intune
            </Button>
          ),
        },
      ]
    : []

  const propertyItems = [
    { label: 'Publisher', value: app?.publisher },
    { label: 'Version', value: app?.displayVersion },
    { label: 'Publishing state', value: app?.publishingState },
    {
      label: 'Featured in Company Portal',
      value: app?.isFeatured ? 'Yes' : 'No',
    },
    {
      label: 'Created',
      value: app?.createdDateTime && <CippTimeAgo data={app.createdDateTime} />,
    },
    { label: 'Install command', value: app?.installCommandLine },
    { label: 'Uninstall command', value: app?.uninstallCommandLine },
    { label: 'Run as', value: app?.installExperience?.runAsAccount },
    {
      label: 'Restart behaviour',
      value: app?.installExperience?.deviceRestartBehavior,
    },
    {
      label: 'Detection rule',
      value:
        firstRule &&
        [firstRule.ruleType, firstRule.path, firstRule.fileOrFolderName]
          .filter(Boolean)
          .join(' · '),
    },
  ].filter((item) => item.value)

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      titleControl={
        <CippEntitySwitcher
          title={title}
          currentId={appId}
          queryParamKey="appId"
          entityName="application"
          api={{
            url: '/api/ListGraphRequest',
            data: {
              Endpoint: 'deviceAppManagement/mobileApps',
              tenantFilter,
              $select: 'id,displayName,publisher',
              $top: 999,
            },
            queryKey: `AppSwitcher-${tenantFilter}`,
          }}
          getPrimary={(item) => item.displayName}
          getSecondary={(item) => item.publisher}
          sortByPrimary
        />
      }
      subtitle={subtitle}
      actions={app ? appActions : []}
      actionsData={actionsData}
      queryKeys={[appQueryKey]}
      backUrl="/endpoint/applications/list"
      isFetching={appRequest.isLoading}
    >
      <CippHead title={title} />
      {!appId && (
        <Alert severity="info" sx={{ m: 2 }}>
          No application selected. Open this page from the Applications list.
        </Alert>
      )}
      {appId && appRequest.isLoading && <CippFormSkeleton layout={[2, 1]} />}
      {appRequest.isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Could not load this application. It may have been deleted, or CIPP may
          not have access to Intune in this tenant.
        </Alert>
      )}
      {app && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippPropertyListCard
                title="Application"
                propertyItems={propertyItems}
                isFetching={appRequest.isFetching}
                copyItems={true}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                <CippDataTable
                  title="Assignments"
                  data={assignmentRows}
                  simpleColumns={
                    hasFilters
                      ? ['Target', 'Direction', 'Intent', 'Filter']
                      : ['Target', 'Direction', 'Intent']
                  }
                  actions={assignmentActions}
                  isFetching={appRequest.isFetching || namesBulk.isPending}
                  refreshFunction={() => appRequest.refetch()}
                />
                <CippIntuneDeploymentStatus
                  row={{ id: app.id }}
                  tenant={tenantFilter}
                  type="mobileApps"
                  url="/api/ListAppDeploymentStatus"
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
