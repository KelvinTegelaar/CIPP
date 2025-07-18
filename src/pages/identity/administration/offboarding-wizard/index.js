import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { CippWizardAutoComplete } from "../../../../components/CippWizard/CippWizardAutoComplete";
import { CippWizardOffboarding } from "../../../../components/CippWizard/CippWizardOffboarding";
import { useSettings } from "../../../../hooks/use-settings";

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
      description: "User Selection",
      component: CippWizardAutoComplete,
      componentProps: {
        title: "Select the users to offboard",
        name: "user",
        placeholder: "Select User",
        type: "multiple",
        api: {
          url: "/api/ListGraphRequest",
          dataKey: "Results",
          queryKey: "Users - {tenant}",
          data: {
            Endpoint: "users",
            manualPagination: true,
            $select: "id,userPrincipalName,displayName",
            $count: true,
            $orderby: "displayName",
            $top: 999,
          },
          labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
          valueField: "userPrincipalName",
        },
      },
    },
    {
      title: "Step 3",
      description: "Offboarding Options",
      component: CippWizardOffboarding,
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
