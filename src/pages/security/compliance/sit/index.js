import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Book } from '@mui/icons-material'
import { CippDeployCompliancePolicyDrawer } from '../../../../components/CippComponents/CippDeployCompliancePolicyDrawer.jsx'
import { CippSitRulePackDetails } from '../../../../components/CippComponents/CippSitRulePackDetails.jsx'
import { PermissionButton } from '../../../../utils/permissions.js'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const pageTitle = 'Sensitive Information Types'
  const apiUrl = '/api/ListSensitiveInfoType'
  const tenantFilter = useSettings().currentTenant
  const cardButtonPermissions = ['Security.SensitiveInfoType.ReadWrite']

  const actions = [
    {
      label: 'Create template based on SIT',
      type: 'POST',
      icon: <Book />,
      url: '/api/AddSensitiveInfoTypeTemplate',
      data: {
        Identity: 'Name',
      },
      hideBulk: true,
      confirmText: 'Are you sure you want to create a template based on this Sensitive Information Type?',
      // Only Microsoft built-ins can't be templated; custom regex and fingerprint SITs both can.
      condition: (row) => row.Publisher && !String(row.Publisher).startsWith('Microsoft'),
    },
    {
      label: 'Delete SIT',
      type: 'POST',
      icon: <TrashIcon />,
      url: '/api/RemoveSensitiveInfoType',
      data: {
        Identity: 'Name',
      },
      confirmText:
        'Are you sure you want to delete this Sensitive Information Type? Built-in Microsoft types cannot be deleted.',
      color: 'danger',
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'Name',
      'Description',
      'Publisher',
      'Type',
      'Recommended',
      'RulePackId',
      'RulePackVersion',
      'State',
    ],
    actions: actions,
    children: (row) => <CippSitRulePackDetails row={row} tenant={tenantFilter} />,
    size: 'lg',
  }

  const simpleColumns = [
    'Name',
    'Publisher',
    'Type',
    'Description',
    'Recommended',
    'RulePackVersion',
    'State',
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey={`ListSensitiveInfoType-${tenantFilter}`}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippDeployCompliancePolicyDrawer
          mode="SensitiveInfoType"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
export default Page
