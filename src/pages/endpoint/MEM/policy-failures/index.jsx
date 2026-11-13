import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useSettings } from '../../../../hooks/use-settings.js'
import { CippIntunePolicyFailureDetails } from '../../../../components/CippComponents/CippIntunePolicyFailureDetails.jsx'
import { CippIcons } from '../../../../utils/icon-registry'

const Page = () => {
  const tenant = useSettings().currentTenant

  const actions = [
    {
      label: 'Open Intune',
      link: `https://intune.microsoft.com/${tenant}`,
      color: 'info',
      icon: <CippIcons.EyeIcon />,
      target: '_blank',
      multiPost: false,
      external: true,
    },
  ]

  const offCanvas = {
    extendedInfoFields: ['displayName', 'PolicyTypeName', 'platform', 'errorDevices', 'conflictDevices'],
    actions: actions,
    children: (row) => <CippIntunePolicyFailureDetails row={row} tenant={tenant} />,
    size: 'lg',
  }

  return (
    <CippTablePage
      title="Policy Failures"
      apiUrl="/api/ListIntunePolicyFailures"
      apiDataKey="Results"
      queryKey={`IntunePolicyFailures-${tenant}`}
      actions={actions}
      offCanvas={offCanvas}
      offCanvasOnRowClick={true}
      simpleColumns={['displayName', 'PolicyTypeName', 'platform', 'errorDevices', 'conflictDevices']}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
export default Page
