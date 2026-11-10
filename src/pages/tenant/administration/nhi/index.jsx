import { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import { Button, Stack, Tooltip, Typography } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippOffCanvas } from '../../../../components/CippComponents/CippOffCanvas'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import { useBecEvidenceDownload } from '../../../../components/CippComponents/CippBecEvidenceDownload'
import { CippIcons } from '../../../../utils/icon-registry'
import { ApiPostCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'

// Pick one or more apps or managed identities and queue an NHI investigation for each.
const StartInvestigationDrawer = ({ tenant }) => {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const formControl = useForm({ mode: 'onChange', defaultValues: { apps: [] } })
  const selected =
    useWatch({ control: formControl.control, name: 'apps' }) || []
  const queue = ApiPostCall({ relatedQueryKeys: [`ListNHIReports-${tenant}`] })

  const handleClose = () => {
    setVisible(false)
    queue.reset()
    formControl.reset({ apps: [] })
  }
  const handleStart = () => {
    const ids = selected.map((app) => app?.value ?? app).filter(Boolean)
    if (ids.length === 0) return
    // One app: open its case and start the run there, so you watch it run.
    if (ids.length === 1) {
      handleClose()
      router.push(
        `/tenant/administration/nhi/case?servicePrincipalId=${encodeURIComponent(ids[0])}&tenantFilter=${encodeURIComponent(tenant)}&start=true`
      )
      return
    }
    queue.mutate(
      {
        url: '/api/ExecNHICheck',
        data: { tenantFilter: tenant, servicePrincipalIds: ids },
      },
      { onSuccess: () => handleClose() }
    )
  }

  return (
    <>
      <Tooltip
        title={
          tenant === 'AllTenants'
            ? 'Select a single tenant to start an investigation'
            : ''
        }
      >
        <span>
          <Button
            variant="contained"
            startIcon={<CippIcons.TravelExplore />}
            onClick={() => setVisible(true)}
            disabled={tenant === 'AllTenants'}
          >
            Start investigation
          </Button>
        </span>
      </Tooltip>
      <CippOffCanvas
        title="Start an NHI compromise investigation"
        visible={visible}
        onClose={handleClose}
        size="md"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={queue} />
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button variant="outlined" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={handleStart}
                disabled={queue.isPending || selected.length === 0}
              >
                {queue.isPending
                  ? 'Queuing investigations...'
                  : 'Start investigation'}
              </Button>
            </Stack>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Investigates an app (enterprise application) or managed identity for
            compromise over the last 7 days, against what it did in the 23 days
            before: its sign-ins and credentials, changes made to it, what it
            changed in the directory and the mail and files it reached. Pick one
            app to watch the run, or several to queue a run for each. Metadata
            only. Sign-in checks need Entra ID P1.
          </Typography>
          <CippFormComponent
            type="autoComplete"
            name="apps"
            label="Apps or managed identities to investigate"
            formControl={formControl}
            multiple
            creatable={false}
            disabled={queue.isPending}
            api={{
              url: '/api/ListGraphRequest',
              data: {
                Endpoint: 'servicePrincipals',
                $select: 'id,appId,displayName,servicePrincipalType',
                $top: 999,
                $count: true,
              },
              dataKey: 'Results',
              labelField: (sp) =>
                `${sp.displayName} (${sp.servicePrincipalType === 'ManagedIdentity' ? 'managed identity' : sp.appId})`,
              valueField: 'id',
              queryKey: `NHIAppPicker-${tenant}`,
            }}
          />
        </Stack>
      </CippOffCanvas>
    </>
  )
}

const Page = () => {
  const { currentTenant } = useSettings()
  const { download } = useBecEvidenceDownload({
    url: '/api/ExecNHIEvidenceExport',
    prefix: 'NHI',
  })
  const caseLink =
    '/tenant/administration/nhi/case?servicePrincipalId=[ServicePrincipalId]&caseId=[CaseId]&tenantFilter=[Tenant]'

  const actions = [
    {
      label: 'Open case',
      icon: <CippIcons.Visibility />,
      link: caseLink,
      multiPost: false,
    },
    {
      label: 'Download evidence (ZIP)',
      icon: <CippIcons.Archive />,
      noConfirm: true,
      customFunction: (row) => download(row),
      condition: (row) => row.Status === 'Completed',
    },
    {
      label: 'Delete run',
      icon: <CippIcons.DeleteForever />,
      type: 'POST',
      url: '/api/ExecNHIReport',
      data: { Action: '!Delete', caseId: 'CaseId', tenantFilter: 'Tenant' },
      confirmText:
        // one placeholder: with several rows selected each one becomes "the N selected rows"
        'Permanently delete [CaseId], including the investigation results?',
      relatedQueryKeys: [`ListNHIReports-${currentTenant}`],
      multiPost: false,
    },
  ]

  return (
    <CippTablePage
      title="Non-Human Identity Compromise"
      apiUrl="/api/ListNHIReports"
      queryKey={`ListNHIReports-${currentTenant}`}
      actions={actions}
      offCanvas={{
        extendedInfoFields: [
          'CaseId',
          'Tenant',
          'DisplayName',
          'AppId',
          'ServicePrincipalId',
          'ServicePrincipalType',
          'Status',
          'Level',
          'EvidenceLevel',
          'Impact',
          'Score',
          'IncompleteCount',
          'ExtractedAt',
          'RequestedAt',
          'RequestedBy',
          'ContainmentRuns',
          'ErrorMessage',
        ],
        actions,
      }}
      cardButton={<StartInvestigationDrawer tenant={currentTenant} />}
      simpleColumns={[
        'Tenant',
        'DisplayName',
        'ServicePrincipalType',
        'Level',
        'EvidenceLevel',
        'Impact',
        'Score',
        'Status',
        'ExtractedAt',
        'RequestedBy',
        'ContainmentRuns',
        'CaseId',
      ]}
      filters={[
        {
          filterName: 'Critical cases',
          value: [{ id: 'Level', value: 'Critical' }],
          type: 'column',
        },
        {
          filterName: 'High cases',
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
