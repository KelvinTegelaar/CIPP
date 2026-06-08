import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { PermissionButton } from '../../../../utils/permissions.js'
import { CippPolicyDeployDrawer } from '../../../../components/CippComponents/CippPolicyDeployDrawer.jsx'
import { useSettings } from '../../../../hooks/use-settings.js'
import { useCippIntunePolicyActions } from '../../../../components/CippComponents/CippIntunePolicyActions.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { Stack } from '@mui/system'

const Page = () => {
  const pageTitle = 'App Protection & Configuration Policies'
  const cardButtonPermissions = ['Endpoint.MEM.ReadWrite']
  const tenant = useSettings().currentTenant

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListAppProtectionPolicies',
    queryKey: 'ListAppProtectionPolicies',
    cacheName: 'IntuneAppProtectionPolicies',
    syncTitle: 'Sync App Protection Policies Report',
    allowToggle: true,
    defaultCached: false,
  })

  const actions = useCippIntunePolicyActions(tenant, 'URLName', {
    templateData: {
      ID: 'id',
      URLName: 'managedAppPolicies',
    },
    platformType: 'deviceAppManagement',
    deleteUrlName: 'URLName',
  })

  const offCanvas = {
    extendedInfoFields: [
      'createdDateTime',
      'displayName',
      'lastModifiedDateTime',
      'PolicyTypeName',
      'PolicySource',
    ],
    actions: actions,
  }

  const simpleColumns = [
    ...reportDB.cacheColumns,
    'displayName',
    'PolicyTypeName',
    'PolicyAssignment',
    'PolicyExclude',
    'lastModifiedDateTime',
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippPolicyDeployDrawer
              buttonText="Deploy Policy"
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
            {reportDB.controls}
          </Stack>
        }
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
