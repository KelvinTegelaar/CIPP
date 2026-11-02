import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout.jsx'
import { WindowsEnrollmentRestrictions } from '../../../../components/CippComponents/EnrollmentRestrictionTabs.jsx'
import tabOptions from './tabOptions.json'

const Page = () => <WindowsEnrollmentRestrictions />

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
