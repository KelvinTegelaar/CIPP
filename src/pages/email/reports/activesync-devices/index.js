import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'

const Page = () => {
  return (
    <CippTablePage
      title="ActiveSync Devices"
      apiUrl="/api/ListActiveSyncDevices"
      simpleColumns={[
        'userDisplayName',
        'userPrincipalName',
        'deviceFriendlyName',
        'deviceModel',
        'deviceOS',
        'deviceType',
        'clientType',
        'clientVersion',
        'deviceAccessState',
        'firstSyncTime',
        'lastSyncAttemptTime',
        'lastSuccessSync',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>

export default Page
