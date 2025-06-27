import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { useSettings } from "../../../../hooks/use-settings";
import { CippWizardAutopilotImport } from "../../../../components/CippWizard/CippWizardAutopilotImport";
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
      component: CippWizardAutopilotImport,
      componentProps: {
        name: "autopilotData",
        fields: [
          { 
            friendlyName: "Serialnumber", 
            propertyName: "SerialNumber",
            alternativePropertyNames: ["Device Serial Number"]
          },
          { 
            friendlyName: "Manufacturer", 
            propertyName: "oemManufacturerName",
            alternativePropertyNames: ["Manufacturer name"]
          },
          { 
            friendlyName: "Model", 
            propertyName: "modelName",
            alternativePropertyNames: ["Device model"]
          },
          { 
            friendlyName: "Product ID", 
            propertyName: "productKey",
            alternativePropertyNames: ["Windows Product ID"]
          },
          { 
            friendlyName: "Hardware hash", 
            propertyName: "hardwareHash",
            alternativePropertyNames: ["Hardware Hash"]
          }
        ],
        fileName: "autopilot-template"
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
