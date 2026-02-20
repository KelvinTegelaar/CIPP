import { Layout as DashboardLayout } from "../layouts/index.js";
import { CippWizardConfirmation } from "../components/CippWizard/CippWizardConfirmation.jsx";
import { CippDeploymentStep } from "../components/CippWizard/CIPPDeploymentStep.jsx";
import CippWizardPage from "../components/CippWizard/CippWizardPage.jsx";
import { CippWizardOptionsList } from "../components/CippWizard/CippWizardOptionsList.jsx";
import { CippSAMDeploy } from "../components/CippWizard/CippSAMDeploy.jsx";
import { CippTenantModeDeploy } from "../components/CippWizard/CippTenantModeDeploy.jsx";
import { CippBaselinesStep } from "../components/CippWizard/CippBaselinesStep.jsx";
import { CippNotificationsStep } from "../components/CippWizard/CippNotificationsStep.jsx";
import { CippAlertsStep } from "../components/CippWizard/CippAlertsStep.jsx";
import { CippAddTenantTypeSelection } from "../components/CippWizard/CippAddTenantTypeSelection.jsx";
import { CippDirectTenantDeploy } from "../components/CippWizard/CippDirectTenantDeploy.jsx";
import { CippGDAPTenantSetup } from "../components/CippWizard/CippGDAPTenantSetup.jsx";
import { CippGDAPTenantOnboarding } from "../components/CippWizard/CippGDAPTenantOnboarding.jsx";
import { BuildingOfficeIcon, CloudIcon, CpuChipIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const steps = [
    {
      description: "Onboarding",
      component: CippWizardOptionsList,
      componentProps: {
        title: "Select your setup method",
        subtext: `This wizard will guide you through setting up CIPPs access to your client tenants. If this is your first time setting up CIPP you will want to choose the option "Create application for me and connect to my tenants",`,
        valuesKey: "SyncTool",
        options: [
          {
            description:
              "Choose this option if this is your first setup, or if you'd like to redo the previous setup.",
            icon: <CpuChipIcon />,
            label: "First Setup",
            value: "FirstSetup",
          },
          {
            description:
              "Choose this option if you would like to add a tenant to your environment.",
            icon: <CpuChipIcon />,
            label: "Add a tenant",
            value: "AddTenant",
          },
          {
            description:
              "Choose this option if you want to setup which application registration is used to connect to your tenants.",
            icon: <CpuChipIcon />,
            label: "Create a new application registration for me and connect to my tenants",
            value: "CreateApp",
          },
          {
            description: "I would like to refresh my token or replace the account I've used.",
            icon: <CloudIcon />,
            label: "Refresh Tokens for existing application registration",
            value: "UpdateTokens",
          },
          {
            description:
              "I have an existing application and would like to manually enter my token, or update them. This is only recommended for advanced users.",
            icon: <BuildingOfficeIcon />,
            label: "Manually enter credentials",
            value: "Manual",
          },
        ],
      },
    },
    {
      description: "Application",
      component: CippSAMDeploy,
      showStepWhen: (values) =>
        values?.selectedOption === "CreateApp" || values?.selectedOption === "FirstSetup",
    },
    {
      description: "Tenants",
      component: CippTenantModeDeploy,
      showStepWhen: (values) =>
        values?.selectedOption === "CreateApp" || values?.selectedOption === "FirstSetup",
    },
    {
      description: "Tenant Type",
      component: CippAddTenantTypeSelection,
      showStepWhen: (values) => values?.selectedOption === "AddTenant",
    },
    {
      description: "Direct Tenant",
      component: CippDirectTenantDeploy,
      showStepWhen: (values) =>
        values?.selectedOption === "AddTenant" && values?.tenantType === "Direct",
    },
    {
      description: "GDAP Setup",
      component: CippGDAPTenantSetup,
      showStepWhen: (values) =>
        values?.selectedOption === "AddTenant" && values?.tenantType === "GDAP",
    },
    {
      description: "GDAP Onboarding",
      component: CippGDAPTenantOnboarding,
      showStepWhen: (values) =>
        values?.selectedOption === "AddTenant" &&
        values?.tenantType === "GDAP" &&
        values?.GDAPInviteAccepted === true,
    },
    {
      description: "Baselines",
      component: CippBaselinesStep,
      showStepWhen: (values) => values?.selectedOption === "FirstSetup",
    },
    {
      description: "Notifications",
      component: CippNotificationsStep,
      showStepWhen: (values) => values?.selectedOption === "FirstSetup",
    },
    {
      description: "Next Steps",
      component: CippAlertsStep,
      showStepWhen: (values) => values?.selectedOption === "FirstSetup",
    },
    {
      description: "Refresh Tokens",
      component: CippDeploymentStep,
      showStepWhen: (values) => values?.selectedOption === "UpdateTokens",
    },
    {
      description: "Manually enter credentials",
      component: CippDeploymentStep,
      showStepWhen: (values) => values?.selectedOption === "Manual",
    },
    {
      description: "Confirmation",
      component: CippWizardConfirmation,
      //confirm and finish button, perform tasks, launch checks etc.
    },
  ];

  return (
    <>
      <CippWizardPage
        backButton={false}
        steps={steps}
        wizardTitle="Setup Wizard"
        postUrl={"/api/ExecCombinedSetup"}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
