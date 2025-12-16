import { Layout as DashboardLayout } from "../layouts/index.js";
import CippWizardPage from "../components/CippWizard/CippWizardPage.jsx";
import { onboardingSteps } from "./onboarding-steps-config.js";

const Page = () => {
  return (
    <>
      <CippWizardPage
        backButton={false}
        steps={onboardingSteps}
        wizardTitle="Setup Wizard"
        postUrl={"/api/ExecCombinedSetup"}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
