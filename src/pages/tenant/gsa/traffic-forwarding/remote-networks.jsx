import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from './tabOptions.json'

const Page = () => {
  const tenant = useSettings().currentTenant
  return (
    <CippTablePage
      title="Remote Networks"
      apiUrl="/api/ListGSARemoteNetworks"
      queryKey={`ListGSARemoteNetworks-${tenant}`}
      offCanvas={{
        children: (row) => <CippJsonView object={row} defaultOpen={true} />,
        size: 'xl',
      }}
      simpleColumns={['name', 'region', 'profiles', 'deviceLinks']}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
