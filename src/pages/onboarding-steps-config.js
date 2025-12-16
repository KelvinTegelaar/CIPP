import { lazy } from "react";
import { BuildingOfficeIcon, CloudIcon, CpuChipIcon } from "@heroicons/react/24/outline";

// Lazy load wizard step components to reduce initial bundle size and transitive dependencies
const CippWizardOptionsList = lazy(() =>
  import("../components/CippWizard/CippWizardOptionsList.jsx").then((module) => ({
    default: module.CippWizardOptionsList,
  }))
);

const CippSAMDeploy = lazy(() =>
  import("../components/CippWizard/CippSAMDeploy.jsx").then((module) => ({
    default: module.CippSAMDeploy,
  }))
);

const CippTenantModeDeploy = lazy(() =>
  import("../components/CippWizard/CippTenantModeDeploy.jsx").then((module) => ({
    default: module.CippTenantModeDeploy,
  }))
);

const CippBaselinesStep = lazy(() =>
  import("../components/CippWizard/CippBaselinesStep.jsx").then((module) => ({
    default: module.CippBaselinesStep,
  }))
);

const CippNotificationsStep = lazy(() =>
  import("../components/CippWizard/CippNotificationsStep.jsx").then((module) => ({
    default: module.CippNotificationsStep,
  }))
);

const CippAlertsStep = lazy(() =>
  import("../components/CippWizard/CippAlertsStep.jsx").then((module) => ({
    default: module.CippAlertsStep,
  }))
);

const CippDeploymentStep = lazy(() =>
  import("../components/CippWizard/CIPPDeploymentStep.jsx").then((module) => ({
    default: module.CippDeploymentStep,
  }))
);

const CippWizardConfirmation = lazy(() =>
  import("../components/CippWizard/CippWizardConfirmation.jsx").then((module) => ({
    default: module.CippWizardConfirmation,
  }))
);

/**
 * Configuration for onboarding wizard steps.
 * Components are lazy-loaded to reduce initial bundle size and transitive dependencies.
 */
export const onboardingSteps = [
  {
    description: "Onboarding",
    component: CippWizardOptionsList,
    componentProps: {
      title: "Select your setup method",
      subtext: `This wizard will guide you through setting up CIPPs access to your client tenants. If this is your first time setting up CIPP you will want to choose the option "Create application for me and connect to my tenants".`,
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
          description: "Choose this option if you would like to add a tenant to your environment.",
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
      values?.selectedOption === "CreateApp" ||
      values?.selectedOption === "FirstSetup" ||
      values?.selectedOption === "AddTenant",
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
    // Final step: displays summary of selections and provides submit button to execute setup
  },
];
