import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { useSettings } from "../../../../hooks/use-settings";
import { CippWizardAppApproval } from "../../../../components/CippWizard/CippWizardAppApproval";
import { Alert } from "@mui/material";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Tenant Selection",
      component: CippTenantStep,
      componentProps: {
        preText: (
          <Alert severity="info">
            Did you know you can also deploy applications by using our standards? Use the standard
            if you have to deploy an application to all your tenants
          </Alert>
        ),
        allTenants: false,
        type: "multiple",
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
        initialState={{ configMode: "template", CopyPermissions: true }}
        steps={steps}
        postUrl="/api/ExecAddMultiTenantApp"
        wizardTitle="Application Approval Wizard"
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
