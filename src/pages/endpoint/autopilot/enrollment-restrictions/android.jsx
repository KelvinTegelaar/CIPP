import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout.jsx'
import { AndroidEnrollmentRestrictions } from '../../../../components/CippComponents/EnrollmentRestrictionTabs.jsx'
import tabOptions from './tabOptions.json'

const Page = () => <AndroidEnrollmentRestrictions />

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
