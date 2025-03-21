import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippWizardPage from "../../../../components/CippWizard/CippWizardPage.jsx";
import { CippWizardOptionsList } from "../../../../components/CippWizard/CippWizardOptionsList.jsx";
import { CippAddTenantForm } from "../../../../components/CippWizard/CippAddTenantForm.jsx";
import { CippAddTenantConfirmation } from "../../../../components/CippWizard/CippAddTenantConfirmation.jsx";
import { BuildingOfficeIcon, CloudIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Select Reseller Type",
      component: CippWizardOptionsList,
      componentProps: {
        title: "Select your reseller type",
        subtext: `Choose the type of reseller you are to proceed with adding a new tenant.`,
        valuesKey: "ResellerType",
        options: [
          {
            description: "Use this option if you are a Direct Reseller",
            icon: <CloudIcon />,
            label: "I'm a Tier 1 CSP",
            value: "Tier1",
          },
          {
            description: "Use this option if you are an Indirect Reseller",
            icon: <BuildingOfficeIcon />,
            label: "I'm a Tier 2 CSP",
            value: "Tier2",
          },
        ],
      },
    },
    {
      title: "Step 2",
      description: "Enter Tenant Details",
      component: CippAddTenantForm,
    },
    {
      title: "Step 3",
      description: "Confirm and Submit",
      component: CippAddTenantConfirmation,
    },
  ];

  return (
    <>
      <CippWizardPage
        backButton={false}
        steps={steps}
        wizardTitle="Add New Tenant"
        postUrl={"/api/AddTenant"}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
