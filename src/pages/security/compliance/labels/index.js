import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Book, Palette } from '@mui/icons-material'
import { TrashIcon } from '@heroicons/react/24/outline'
import { CippDeployCompliancePolicyDrawer } from '../../../../components/CippComponents/CippDeployCompliancePolicyDrawer.jsx'
import { PermissionButton } from '../../../../utils/permissions.js'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const pageTitle = 'Sensitivity Labels'
  const apiUrl = '/api/ListSensitivityLabel'
  const tenantFilter = useSettings().currentTenant
  const cardButtonPermissions = ['Security.SensitivityLabel.ReadWrite']

  const actions = [
    {
      label: 'Create template based on label',
      type: 'POST',
      icon: <Book />,
      url: '/api/AddSensitivityLabelTemplate',
      dataFunction: (data) => {
        return { ...data }
      },
      confirmText: 'Are you sure you want to create a template based on this sensitivity label?',
      hideBulk: true,
    },
    {
      label: 'Set Label Color',
      type: 'POST',
      icon: <Palette />,
      url: '/api/EditSensitivityLabel',
      data: {
        Identity: 'Guid',
      },
      fields: [
        {
          label: 'Label Color',
          // Dot notation so the value posts as parameters.AdvancedSettings.color, the shape
          // EditSensitivityLabel passes straight to Set-Label. Submitting an empty value clears
          // a previously set custom color.
          name: 'parameters.AdvancedSettings.color',
          type: 'colorPicker',
        },
      ],
      confirmText:
        'Pick a custom color for this sensitivity label. This supports any hex color, beyond the preset palette available in the Purview portal. Leave empty to clear the custom color.',
      hideBulk: true,
    },
    {
      label: 'Delete Label',
      type: 'POST',
      icon: <TrashIcon />,
      url: '/api/RemoveSensitivityLabel',
      data: {
        Identity: 'Guid',
      },
      confirmText:
        'Are you sure you want to delete this sensitivity label? Labels currently published to users will be removed from policies.',
      color: 'danger',
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'DisplayName',
      'Name',
      'Comment',
      'Tooltip',
      'ParentId',
      'ContentType',
      'Color',
      'EncryptionEnabled',
      'EncryptionProtectionType',
      'ContentMarkingHeaderEnabled',
      'ContentMarkingFooterEnabled',
      'ContentMarkingWatermarkEnabled',
      'SiteAndGroupProtectionEnabled',
      'Priority',
      'Disabled',
      'PublishedInPolicies',
    ],
    actions: actions,
  }

  const simpleColumns = [
    'DisplayName',
    'Name',
    'Color',
    'ContentType',
    'EncryptionEnabled',
    'ContentMarkingHeaderEnabled',
    'ContentMarkingWatermarkEnabled',
    'SiteAndGroupProtectionEnabled',
    'Priority',
    'Disabled',
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey={`ListSensitivityLabel-${tenantFilter}`}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippDeployCompliancePolicyDrawer
          mode="SensitivityLabel"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
export default Page
