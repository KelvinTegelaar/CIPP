import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout.jsx'
import { CippQuarantineTable } from '../../../../components/CippComponents/CippQuarantineTable.jsx'
import tabOptions from './tabOptions.json'

const Page = () => <CippQuarantineTable entityType="SharePointOnline" />

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
