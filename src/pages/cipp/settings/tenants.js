import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "Tenants - Backend";

  // Actions formatted as per your guidelines
  const actions = [
    {
      label: "Exclude Tenants",
      type: "POST",
      url: `/api/ExecExcludeTenant?AddExclusion=true`,
      data: { value: "customerId" },
      confirmText: "Are you sure you want to exclude these tenants?",
      multiPost: false,
    },
    {
      label: "Include Tenants",
      type: "POST",
      url: `/api/ExecExcludeTenant?RemoveExclusion=true`,
      data: { value: "customerId" },
      confirmText: "Are you sure you want to include these tenants?",
      multiPost: false,
    },
    {
      label: "Refresh CPV Permissions",
      type: "POST",
      url: `/api/ExecCPVPermissions`,
      data: { TenantFilter: "customerId" },
      confirmText: "Are you sure you want to refresh the CPV permissions for these tenants?",
      multiPost: false,
    },
    {
      label: "Reset CPV Permissions",
      type: "POST",
      url: `/api/ExecCPVPermissions?&ResetSP=true`,
      data: { TenantFilter: "customerId" },
      confirmText:
        "Are you sure you want to reset the CPV permissions for these tenants? (This will delete the Service Principal and re-add it.)",
      multiPost: false,
    },
    {
      label: "Remove Tenant",
      type: "POST",
      url: `/api/ExecRemoveTenant`,
      data: { TenantID: "customerId" },
      confirmText: "Are you sure you want to remove this tenant?",
      multiPost: false,
    },
  ];

  // Offcanvas details
  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "defaultDomainName",
      "Excluded",
      "ExcludeDate",
      "ExcludeUser",
    ],
    actions: actions,
  };

  // Columns for the table
  const columns = [
    "displayName", // Tenant Name
    "defaultDomainName", // Default Domain
    "Excluded", // Excluded Status
    "ExcludeDate", // Exclude Date
    "ExcludeUser", // Exclude User
  ];

  return (
    <CippTablePage
      title={pageTitle}
      tenantInTitle={false}
      apiUrl="/api/ExecExcludeTenant?ListAll=True"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={columns}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);
export default Page;
