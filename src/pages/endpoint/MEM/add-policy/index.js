import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "../../../../components/CippWizard/CippTenantStep";
import { CippIntunePolicy } from "../../../../components/CippWizard/CippIntunePolicy";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Tenant Selection",
      component: CippTenantStep,
      componentProps: { type: "multiple" },
    },
    {
      title: "Step 2",
      description: "Policy Configuration",
      component: CippIntunePolicy,
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
        queryKeys={[["Configuration Policies"]]}
        steps={steps}
        wizardTitle="Apply Policy Wizard"
        postUrl={"/api/AddPolicy"}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
