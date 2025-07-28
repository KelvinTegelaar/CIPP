import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { CippDriftTemplateSelection } from "./CippDriftTemplateSelection";
import { CippDriftNotificationSettings } from "./CippDriftNotificationSettings";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Information & Tenant Selection",
      component: CippTenantStep,
      componentProps: {
        type: "multiple",
        allTenants: true,
      },
    },
    {
      title: "Step 2",
      description: "Drift Standard Template Selection",
      component: CippDriftTemplateSelection,
    },
    {
      title: "Step 3",
      description: "Notification Settings",
      component: CippDriftNotificationSettings,
    },
    {
      title: "Step 4",
      description: "Confirmation",
      component: CippWizardConfirmation,
    },
  ];

  return (
    <>
      <CippWizardPage
        steps={steps}
        wizardTitle="Apply Drift Standard Template"
        postUrl="/api/ExecApplyDriftTemplate"
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
