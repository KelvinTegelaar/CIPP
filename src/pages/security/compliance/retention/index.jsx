import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippDeployCompliancePolicyDrawer } from '../../../../components/CippComponents/CippDeployCompliancePolicyDrawer.jsx'
import { PermissionButton } from '../../../../utils/permissions'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const pageTitle = 'Purview Retention Policies'
  const apiUrl = '/api/ListRetentionCompliancePolicy'
  const tenantFilter = useSettings().currentTenant
  const cardButtonPermissions = ['Security.RetentionCompliancePolicy.ReadWrite']

  const actions = [
    {
      label: 'Create template based on policy',
      type: 'POST',
      icon: <CippIcons.Book />,
      url: '/api/AddRetentionCompliancePolicyTemplate',
      data: { Identity: 'Name' },
      confirmText: 'Are you sure you want to create a template based on this retention policy?',
      hideBulk: true,
    },
    {
      label: 'Enable Policy',
      type: 'POST',
      icon: <CippIcons.Check />,
      url: '/api/EditRetentionCompliancePolicy',
      data: {
        State: '!enable',
        Identity: 'Name',
      },
      confirmText: 'Are you sure you want to enable this retention policy?',
      condition: (row) => row.Enabled === false,
    },
    {
      label: 'Disable Policy',
      type: 'POST',
      icon: <CippIcons.Block />,
      url: '/api/EditRetentionCompliancePolicy',
      data: {
        State: '!disable',
        Identity: 'Name',
      },
      confirmText: 'Are you sure you want to disable this retention policy?',
      condition: (row) => row.Enabled === true,
    },
    {
      label: 'Delete Policy',
      type: 'POST',
      icon: <CippIcons.Delete />,
      url: '/api/RemoveRetentionCompliancePolicy',
      data: {
        Identity: 'Name',
      },
      confirmText: 'Are you sure you want to delete this retention policy?',
      color: 'danger',
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'Name',
      'Comment',
      'Enabled',
      'ScopedLocations',
      'RetentionAction',
      'RetentionDuration',
      'RestrictiveRetention',
      'ExchangeLocation',
      'SharePointLocation',
      'OneDriveLocation',
      'ModernGroupLocation',
      'TeamsChannelLocation',
      'TeamsChatLocation',
      'RuleCount',
      'CreatedBy',
      'WhenCreatedUTC',
      'WhenChangedUTC',
    ],
    actions: actions,
  }

  const simpleColumns = [
    'Name',
    'Enabled',
    'ScopedLocations',
    'RuleCount',
    'RetentionAction',
    'RetentionDuration',
    'RestrictiveRetention',
    'CreatedBy',
    'WhenChangedUTC',
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey={`ListRetentionCompliancePolicy-${tenantFilter}`}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippDeployCompliancePolicyDrawer
          mode="RetentionCompliancePolicy"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
export default Page
