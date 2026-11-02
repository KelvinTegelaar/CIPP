import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout.jsx'
import { CippUserReportedMessagesTable } from '../../../../components/CippComponents/CippUserReportedMessagesTable.jsx'
import tabOptions from './tabOptions.json'

const Page = () => <CippUserReportedMessagesTable />

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
