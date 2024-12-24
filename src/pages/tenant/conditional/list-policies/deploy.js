import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "../../../../components/CippWizard/CippTenantStep";
import { CippCAForm } from "../../../../components/CippWizard/CippCAForm";

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
      description: "Conditional Access Configuration",
      component: CippCAForm,
    },
    {
      title: "Step 3",
      description: "Confirmation",
      component: CippWizardConfirmation,
    },
  ];

  return (
    <>
      <CippWizardPage steps={steps} wizardTitle="Deploy CA Policy" postUrl={"/api/AddCAPolicy"} />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
