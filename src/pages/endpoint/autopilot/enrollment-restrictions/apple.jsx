import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout.jsx'
import { AppleEnrollmentRestrictions } from '../../../../components/CippComponents/EnrollmentRestrictionTabs.jsx'
import tabOptions from './tabOptions.json'

const Page = () => <AppleEnrollmentRestrictions />

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
