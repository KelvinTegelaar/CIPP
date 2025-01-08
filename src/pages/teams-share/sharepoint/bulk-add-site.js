import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { CippWizardCSVImport } from "/src/components/CippWizard/CippWizardCSVImport";

const BulkAddSiteForm = () => {
  const tenantFilter = useSettings().currentTenant;

  const fields = [
    "SiteName",
    "siteDescription",
    "siteOwner",
    "TemplateName",
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
