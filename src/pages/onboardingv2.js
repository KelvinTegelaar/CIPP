import { Layout as DashboardLayout } from '../layouts/index.js'
import OnboardingWizardPage from '../components/CippWizard/OnboardingWizardPage.jsx'

const Page = () => <OnboardingWizardPage />

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
