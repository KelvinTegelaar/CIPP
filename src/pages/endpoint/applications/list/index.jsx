import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog.jsx'
import { CippApplicationDeployDrawer } from '../../../../components/CippComponents/CippApplicationDeployDrawer'
import { Button } from '@mui/material'
import { Stack } from '@mui/system'
import { CippIntuneDeploymentStatus } from '../../../../components/CippComponents/CippIntuneDeploymentStatus.jsx'
import { useSettings } from '../../../../hooks/use-settings.js'
import { useDialog } from '../../../../hooks/use-dialog.js'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { useTenantLabel } from '../../../../hooks/use-tenant-label'
import { useCippIntuneAppActions } from '../../../../components/CippComponents/CippIntuneAppActions.jsx'

const Page = () => {
  const pageTitle = 'Applications'
  const vppSyncDialog = useDialog()
  const tenant = useSettings().currentTenant
  const tenantLabel = useTenantLabel(tenant)

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListApps',
    queryKey: 'ListApps',
    cacheName: 'IntuneApplications',
    syncTitle: 'Sync Intune Applications Report',
    allowToggle: true,
    defaultCached: false,
    serverPagination: true,
  })

  const appActions = useCippIntuneAppActions()
  const actions = [
    {
      label: 'View Application',
      link: '/endpoint/applications/list/app?appId=[id]',
      icon: <CippIcons.EyeIcon />,
      color: 'info',
      multiPost: false,
    },
    ...appActions,
  ]

  const offCanvas = {
    extendedInfoFields: [
      'installExperience.runAsAccount',
      'installExperience.deviceRestartBehavior',
      'isAssigned',
      'createdDateTime',
      'lastModifiedDateTime',
      'isFeatured',
      'publishingState',
      'dependentAppCount',
      'rules.0.ruleType',
      'rules.0.fileOrFolderName',
      'rules.0.path',
    ],
    actions: actions,
    children: (row) => (
      <CippIntuneDeploymentStatus
        row={row}
        tenant={tenant}
        type="mobileApps"
        url="/api/ListAppDeploymentStatus"
      />
    ),
    size: 'lg',
  }

  const simpleColumns = [
    ...reportDB.cacheColumns,
    'displayName',
    'AppAssignment',
    'AppExclude',
    'publishingState',
    'lastModifiedDateTime',
    'createdDateTime',
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        queryKey={reportDB.resolvedQueryKey}
        cardButton={
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
            }}
          >
            <CippApplicationDeployDrawer />
            <Button
              onClick={vppSyncDialog.handleOpen}
              startIcon={<CippIcons.Sync />}
            >
              Sync VPP
            </Button>
          </Stack>
        }
        dataSourceControls={reportDB.controls}
      />
      <CippApiDialog
        title="Sync VPP Tokens"
        createDialog={vppSyncDialog}
        api={{
          type: 'POST',
          url: '/api/ExecSyncVPP',
          data: {},
          confirmText: `Are you sure you want to sync Apple Volume Purchase Program (VPP) tokens? This will sync all VPP tokens for ${tenantLabel}.`,
        }}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout tenantGroupSupport={true} allTenantsSupport={true}>
    {page}
  </DashboardLayout>
)
export default Page
