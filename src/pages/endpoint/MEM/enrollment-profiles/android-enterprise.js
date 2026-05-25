import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { AndroidEnterpriseEnrollmentProfiles } from './EnrollmentProfileTabs.jsx'
import tabOptions from './tabOptions.json'

const Page = () => <AndroidEnterpriseEnrollmentProfiles />

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
