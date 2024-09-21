import { Layout as DashboardLayout } from "../layouts/index.js";
import { CippWizardConfirmation } from "../components/CippWizard/CippWizardConfirmation";
import { CippDeploymentStep } from "../components/CippWizard/CIPPDeploymentStep";
import CippWizardPage from "../components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "../components/CippWizard/CippTenantStep.jsx";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Onboarding",
      component: CippTenantStep,
      componentProps: {
        allTenants: true,
        type: "select",
      },
    },
    {
      title: "Step 2",
      description: "Configuration",
      component: CippDeploymentStep,
    },
    {
      title: "Step 3",
      description: "Confirmation",
      component: CippWizardConfirmation,
    },
  ];

  return (
    <>
      <CippWizardPage steps={steps} wizardTitle="Onboarding" />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
