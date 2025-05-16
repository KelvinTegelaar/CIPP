import { Layout as DashboardLayout } from "../layouts/index.js";
import { CippWizardConfirmation } from "../components/CippWizard/CippWizardConfirmation.js";
import { CippDeploymentStep } from "../components/CippWizard/CIPPDeploymentStep.js";
import CippWizardPage from "../components/CippWizard/CippWizardPage.jsx";
import { CippWizardOptionsList } from "../components/CippWizard/CippWizardOptionsList.jsx";
import { BuildingOfficeIcon, CloudIcon, CpuChipIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
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
      title: "Step 2",
      description: "Application",
      component: CippDeploymentStep,
    },
    {
      title: "Step 3",
      description: "Tenants",
      component: CippDeploymentStep,
    },
    {
      title: "Step 4",
      description: "Baselines",
      component: CippDeploymentStep,
    },
    {
      title: "Step 5",
      description: "Integrations",
      component: CippDeploymentStep,
    },
    {
      title: "Step 6",
      description: "Notifications",
      component: CippDeploymentStep,
    },
    {
      title: "Step 7",
      description: "Alerts",
      component: CippDeploymentStep,
    },
    {
      title: "Step 8",
      description: "Confirmation",
      component: CippWizardConfirmation,
    },
  ];

  return (
    <>
      <CippWizardPage
        backButton={false}
        steps={steps}
        wizardTitle="SAM Setup"
        postUrl={"/api/ExecSAMSetup"}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
