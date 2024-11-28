import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { useSettings } from "../../../../hooks/use-settings";
import { CippWizardAppApproval } from "../../../../components/CippWizard/CippWizardAppApproval";

const Page = () => {
  const initialState = useSettings();
  const steps = [
    {
      title: "Step 1",
      description: "Tenant Selection",
      component: CippTenantStep,
      componentProps: {
        allTenants: false,
        type: "single",
      },
    },
    {
      title: "Step 2",
      description: "App Selection",
      component: CippWizardAppApproval,
    },
    {
      title: "Step 3",
      description: "Confirmation",
      component: CippWizardConfirmation,
    },
  ];

  return (
    <>
      <CippWizardPage
        initialState={{ ...initialState.offboardingDefaults, ...{ Scheduled: { enabled: false } } }}
        steps={steps}
        postUrl="/api/ExecOffboardUser"
        wizardTitle="User Offboarding Wizard"
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
