import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { AppleADEEnrollmentProfiles } from './EnrollmentProfileTabs.jsx'
import tabOptions from './tabOptions.json'

const Page = () => <AppleADEEnrollmentProfiles />

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
