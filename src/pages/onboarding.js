import { Layout as DashboardLayout } from "../layouts/index.js";
import { CippWizardConfirmation } from "../components/CippWizard/CippWizardConfirmation";
import { CippDeploymentStep } from "../components/CippWizard/CIPPDeploymentStep";
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
              "Choose this option if this is your first setup, or need to replace the existing application.",
            icon: <CpuChipIcon />,
            label: "Create application for me and connect to my tenants",
            value: "CreateApp",
          },
          {
            description: "I would like to refresh my token or replace the account I've used.",
            icon: <CloudIcon />,
            label: "Refresh Tokens for existing application ",
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
