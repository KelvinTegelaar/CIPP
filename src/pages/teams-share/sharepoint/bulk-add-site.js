import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { useSettings } from "../../../hooks/use-settings";
import { CippWizardConfirmation } from "../../../components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "../../../components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "../../../components/CippWizard/CippTenantStep.jsx";
import { CippWizardCSVImport } from "../../../components/CippWizard/CippWizardCSVImport";

const BulkAddSiteForm = () => {
  const tenantFilter = useSettings().currentTenant;

  const fields = [
    "siteName",
    "siteDescription",
    "siteOwner",
    "templateName",
    "siteDesign",
    "sensitivityLabel",
  ];

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
      description: "Upload CSV",
      component: CippWizardCSVImport,
      componentProps: {
        name: "bulkSites",
        fileName: "BulkSites",
        fields: fields,
        manualFields: false,
      },
    },
    {
      title: "Step 3",
      description: "Review and Confirm",
      component: CippWizardConfirmation,
    },
  ];

  return (
    <CippWizardPage
      initialState={{ tenantFilter }}
      steps={steps}
      postUrl="/api/AddSiteBulk"
      wizardTitle="Bulk Add Site Wizard"
    />
  );
};

const Page = () => {
  return <BulkAddSiteForm />;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
