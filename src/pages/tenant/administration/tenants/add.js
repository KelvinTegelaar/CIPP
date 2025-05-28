import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippWizardPage from "../../../../components/CippWizard/CippWizardPage.jsx";
import { CippWizardOptionsList } from "../../../../components/CippWizard/CippWizardOptionsList.jsx";
import { CippAddTenantForm } from "../../../../components/CippWizard/CippAddTenantForm.jsx";
import { BuildingOfficeIcon, CloudIcon } from "@heroicons/react/24/outline";
import CippWizardConfirmation from "../../../../components/CippWizard/CippWizardConfirmation.jsx";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Tenant Type",
      component: CippWizardOptionsList,
      componentProps: {
        name: "TenantType",
        title: "New Tenant Deployment",
        subtext: `Choose the type of tenant you would like to deploy.`,
        valuesKey: "TenantType",
        options: [
          {
            description: "I would like to deploy a new tenant for my customer",
            icon: <BuildingOfficeIcon />,
            label: "Customer Tenant",
            value: "CustomerTenant",
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
      component: CippWizardConfirmation,
    },
  ];

  return (
    <>
      <CippWizardPage
        backButton={false}
        steps={steps}
        wizardTitle="Add New Tenant"
        postUrl={"/api/AddTenant?Action=AddTenant"}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
