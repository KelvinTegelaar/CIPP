import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import tabOptions from "./tabOptions";
import { Button, SvgIcon } from "@mui/material";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { useDialog } from "/src/hooks/use-dialog";
import { Sync } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Tenants - Backend";
  const createDialog = useDialog();

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
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={createDialog.handleOpen}
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <Sync />
            </SvgIcon>
            Force Refresh
          </Button>
        }
        tenantInTitle={false}
        apiUrl="/api/ExecExcludeTenant?ListAll=True"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={columns}
      />
      <CippApiDialog
        title="Force Refresh Tenant"
        createDialog={createDialog}
        fields={[
          {
            type: "textField",
            name: "tenantFilter",
            label: "Default Domain Name or Tenant ID",
          },
        ]}
        api={{
          url: "/api/ListTenants",
          confirmText:
            "This will refresh the tenant and update the tenant details. This can be used to force a tenant to reappear in the list. Run this with no Tenant Filter to refresh all tenants.",
          type: "GET",
          data: { TriggerRefresh: "!true", TenantFilter: "tenantFilter" },
          replacementBehaviour: "removeNulls",
        }}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);
export default Page;
