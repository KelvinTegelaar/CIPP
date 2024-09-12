import { Layout as DashboardLayout } from "../layouts/index.js";
import { Key, Refresh } from "@mui/icons-material";
import { CippWizardConfirmation } from "../components/CippWizard/CippWizardConfirmation";
import { CippWizardOptionsList } from "../components/CippWizard/CippWizardOptionsList";
import { CippDeploymentStep } from "../components/CippWizard/CIPPDeploymentStep";
import CippWizardPage from "../components/CippWizard/CippWizardPage.jsx";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Onboarding",
      component: CippWizardOptionsList,
      componentProps: {
        title: "Select your option",
        subtext: "Choose the onboarding option",
        valuesKey: "Option",
        options: [
          {
            description: "This is my first time using CIPP, or I need to create a new application.",
            icon: <Cog8ToothIcon />,
            label: "I would like CIPP to create an application for me",
            value: "samwizard",
          },
          {
            description:
              "I would like to refresh my token or replace the user I've used for my previous token.",
            icon: <Refresh />,
            label: "Refresh my authentication",
            value: "refreshTokens",
          },
          {
            description:
              "I have an existing application and would like to manually enter my token, or update them.",
            icon: <Key />,
            label: "I have my tokens to enter",
            value: "ownTokens",
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
      <CippWizardPage steps={steps} wizardTitle="Onboarding" />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
