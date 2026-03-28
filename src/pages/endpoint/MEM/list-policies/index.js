import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { PermissionButton } from '../../../../utils/permissions.js'
import { CippPolicyDeployDrawer } from '../../../../components/CippComponents/CippPolicyDeployDrawer.jsx'
import { useSettings } from '../../../../hooks/use-settings.js'
import { useCippIntunePolicyActions } from '../../../../components/CippComponents/CippIntunePolicyActions.jsx'

const Page = () => {
  const pageTitle = 'Configuration Policies'
  const cardButtonPermissions = ['Endpoint.MEM.ReadWrite']
  const tenant = useSettings().currentTenant

  const actions = useCippIntunePolicyActions(tenant, 'URLName', {
    templateData: {
      ID: 'id',
      URLName: 'URLName',
    },
    deleteUrlName: 'URLName',
  })

  const offCanvas = {
    extendedInfoFields: [
      'createdDateTime',
      'displayName',
      'lastModifiedDateTime',
      'PolicyTypeName',
    ],
    actions: actions,
  }

  const simpleColumns = [
    'Tenant',
    'displayName',
    'PolicyTypeName',
    'PolicyAssignment',
    'PolicyExclude',
    'description',
    'lastModifiedDateTime',
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListIntunePolicy?type=ESP"
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippPolicyDeployDrawer
          buttonText="Deploy Policy"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>
export default Page
