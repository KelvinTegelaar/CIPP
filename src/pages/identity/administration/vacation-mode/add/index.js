import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import CippWizardPage from "../../../../../components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "../../../../../components/CippWizard/CippTenantStep.jsx";
import { CippWizardAutoComplete } from "../../../../../components/CippWizard/CippWizardAutoComplete";
import { CippWizardVacationActions } from "../../../../../components/CippWizard/CippWizardVacationActions";
import { CippWizardVacationSchedule } from "../../../../../components/CippWizard/CippWizardVacationSchedule";
import { CippWizardVacationConfirmation } from "../../../../../components/CippWizard/CippWizardVacationConfirmation";

const Page = () => {
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
        title: "Select the users to apply vacation mode for",
        name: "Users",
        placeholder: "Select Users",
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
          addedField: {
            userPrincipalName: "userPrincipalName",
          },
          labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
          valueField: "userPrincipalName",
        },
      },
    },
    {
      title: "Step 3",
      description: "Vacation Actions",
      component: CippWizardVacationActions,
    },
    {
      title: "Step 4",
      description: "Schedule",
      component: CippWizardVacationSchedule,
    },
    {
      title: "Step 5",
      description: "Review & Submit",
      component: CippWizardVacationConfirmation,
    },
  ];

  const initialState = {
    tenantFilter: null,
    Users: [],
    enableCAExclusion: false,
    PolicyId: null,
    excludeLocationAuditAlerts: false,
    enableMailboxPermissions: false,
    delegates: [],
    permissionTypes: [],
    autoMap: true,
    includeCalendar: false,
    calendarPermission: null,
    canViewPrivateItems: false,
    enableOOO: false,
    oooInternalMessage: null,
    oooExternalMessage: null,
    startDate: null,
    endDate: null,
    postExecution: [],
    reference: null,
  };

  return (
    <CippWizardPage
      initialState={initialState}
      steps={steps}
      wizardTitle="Vacation Mode Wizard"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
