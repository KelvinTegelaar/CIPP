import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { useSettings } from "../../../../hooks/use-settings";
import { CippWizardCSVImport } from "../../../../components/CippWizard/CippWizardCSVImport";
import { CippWizardBulkOptions } from "../../../../components/CippWizard/CippWizardBulkOptions";
import { CippWizardAutopilotOptions } from "../../../../components/CippWizard/CippWizardAutopilotOptions";

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
      description: "Device Import",
      component: CippWizardCSVImport,
      componentProps: {
        name: "autopilotData",
        manualFields: true,
        fields: ["SerialNumber", "oemManufacturerName", "modelName", "productKey", "hardwareHash"],
        nameToCSVMapping: {
          SerialNumber: "Device serial number",
          oemManufacturerName: "Manufacturer name",
          modelName: "Device Model",
          productKey: "Windows product ID",
          hardwareHash: "Hardware hash",
        },
      },
    },
    {
      title: "Step 3",
      description: "Extra Options",
      component: CippWizardAutopilotOptions,
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
        postUrl="/api/AddAPDevice"
        wizardTitle="Add Autopilot device wizard"
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
