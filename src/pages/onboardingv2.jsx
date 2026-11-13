import { Layout as DashboardLayout } from '../layouts/index'
import OnboardingWizardPage from '../components/CippWizard/OnboardingWizardPage.jsx'

const Page = () => <OnboardingWizardPage />

Page.getLayout = (page) => <DashboardLayout usesTenant={false}>{page}</DashboardLayout>

export default Page
