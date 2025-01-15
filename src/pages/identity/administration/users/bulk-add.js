import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippWizardConfirmation } from "/src/components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "/src/components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "/src/components/CippWizard/CippTenantStep.jsx";
import { useSettings } from "../../../../hooks/use-settings";
import { CippWizardCSVImport } from "../../../../components/CippWizard/CippWizardCSVImport";
import { CippWizardBulkOptions } from "../../../../components/CippWizard/CippWizardBulkOptions";

const Page = () => {
  const initialState = useSettings();
  const addedFields = initialState?.defaultAttributes
    ? //if we have default attributes, add the label object to the fields array
      initialState.userAttributes.map((item) => item.label)
    : [];
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
      component: CippWizardCSVImport,
      componentProps: {
        name: "bulkUser",
        fields: [
          "givenName",
          "surName",
          "displayName",
          "mailNickName",
          "domain",
          "JobTitle",
          "streetAddress",
          "PostalCode",
          "City",
          "State",
          "Department",
          "MobilePhone",
          "businessPhones",
          ...addedFields,
        ],
      },
    },
    {
      title: "Step 3",
      description: "Extra Options",
      component: CippWizardBulkOptions,
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
        initialState={{
          usageLocation: initialState.usageLocation,
          tenantFilter: initialState.currentTenant,
        }}
        steps={steps}
        postUrl="/api/AddUserBulk"
        wizardTitle="Bulk Add User Wizard"
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
