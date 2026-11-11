import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { CippIcons } from '../../../../utils/icon-registry'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from './tabOptions.json'

const actions = [
  {
    label: 'Edit Profile',
    link: '/tenant/gsa/traffic-forwarding/edit?id=[id]',
    icon: <CippIcons.Edit />,
    color: 'info',
    hideBulk: true,
  },
  {
    label: 'Enable Profile',
    type: 'POST',
    url: '/api/EditGSATrafficForwardingProfile',
    data: { id: 'id', state: '!enabled' },
    confirmText: 'Enable the [name] traffic profile?',
    icon: <CippIcons.CheckCircle />,
    color: 'info',
    multiPost: false,
    condition: (row) => row.state !== 'enabled' && !row.licenseWarning,
  },
  {
    label: 'Disable Profile',
    type: 'POST',
    url: '/api/EditGSATrafficForwardingProfile',
    data: { id: 'id', state: '!disabled' },
    confirmText:
      'Disable the [name] traffic profile? Its traffic stops going through Global Secure Access.',
    icon: <CippIcons.Block />,
    color: 'danger',
    multiPost: false,
    condition: (row) => row.state === 'enabled',
  },
]

const Page = () => {
  const tenant = useSettings().currentTenant
  return (
    <CippTablePage
      title="Traffic Forwarding"
      apiUrl="/api/ListGSATrafficForwarding"
      queryKey={`ListGSATrafficForwarding-${tenant}`}
      actions={actions}
      offCanvas={{
        children: (row) => <CippJsonView object={row} defaultOpen={true} />,
        size: 'xl',
      }}
      simpleColumns={[
        'name',
        'state',
        'assignment',
        'policies',
        'remoteNetworks',
        'linkedConditionalAccessPolicies',
        'licenseWarning',
      ]}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
