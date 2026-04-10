import { Button, SvgIcon } from "@mui/material";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { useCippGDAPTrace } from "../../../components/CippSettings/CippGDAP/CippGDAPTrace";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import tabOptions from "./tabOptions";
import { useDialog } from "../../../hooks/use-dialog";
import {
  Sync,
  Block,
  PlayArrow,
  RestartAlt,
  Delete,
  Add,
  Refresh,
} from "@mui/icons-material";
import cacheTypes from "../../../data/CIPPDBCacheTypes.json";

const Page = () => {
  const pageTitle = "Tenants - Backend";
  const createDialog = useDialog();
  const { ref: gdapRef, traceGdapAction, CippGDAPTrace } = useCippGDAPTrace();

  const actions = [
    {
      label: "Exclude Tenants",
      type: "POST",
      url: "/api/ExecExcludeTenant?AddExclusion=true",
      icon: <Block />,
      data: { value: "customerId" },
      confirmText: "Are you sure you want to exclude [displayName]?",
      multiPost: false,
      condition: (row) => row.displayName !== "*Partner Tenant",
    },
    {
      label: "Include Tenants",
      type: "POST",
      url: "/api/ExecExcludeTenant?RemoveExclusion=true",
      icon: <Add />,
      data: { value: "customerId" },
      confirmText: "Are you sure you want to include [displayName]?",
      multiPost: false,
      condition: (row) => row.displayName !== "*Partner Tenant",
    },
    {
      label: "Refresh CPV Permissions",
      type: "POST",
      url: "/api/ExecCPVPermissions",
      icon: <PlayArrow />,
      data: { tenantFilter: "customerId" },
      confirmText: "Are you sure you want to refresh the CPV permissions for [displayName]?",
      multiPost: false,
    },
    {
      label: "Reset CPV Permissions",
      type: "POST",
      url: "/api/ExecCPVPermissions?&ResetSP=true",
      icon: <RestartAlt />,
      data: { tenantFilter: "customerId" },
      confirmText:
        "Are you sure you want to reset the CPV permissions for [displayName]? (This will delete the Service Principal and re-add it.)",
      multiPost: false,
      condition: (row) =>
        row.displayName !== "*Partner Tenant" && row.delegatedPrivilegeStatus !== "directTenant",
    },
    {
      label: "Remove Tenant",
      type: "POST",
      url: "/api/ExecRemoveTenant",
      icon: <Delete />,
      data: { TenantID: "customerId" },
      confirmText:
        "Are you sure you want to remove [displayName]? If this is a Direct Tenant, this will no longer be accessible until you add it via the Setup Wizard.",
      multiPost: false,
      condition: (row) => row.displayName !== "*Partner Tenant",
    },
    {
      label: "Refresh CIPPDB Cache",
      type: "GET",
      url: "/api/ExecCIPPDBCache",
      icon: <Refresh />,
      data: { Name: "Name", TenantFilter: "customerId" },
      confirmText: "Select the cache type to refresh for [displayName]:",
      multiPost: false,
      allowResubmit: true,
      hideBulk: true,
      fields: [
        {
          type: "autoComplete",
          name: "Name",
          label: "Cache Type",
          placeholder: "Select a cache type",
          options: cacheTypes.map((cacheType) => ({
            label: cacheType.friendlyName,
            value: cacheType.type,
            description: cacheType.description,
          })),
          multiple: false,
          creatable: false,
          required: true,
        },
      ],
      customDataformatter: (rowData, actionData, formData) => {
        const tenantFilter = rowData?.defaultDomainName || rowData?.customerId || "";
        const cacheTypeName = formData.Name?.value || formData.Name || "";
        return {
          Name: cacheTypeName,
          TenantFilter: tenantFilter,
        };
      },
    },
    traceGdapAction,
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "defaultDomainName",
      "delegatedPrivilegeStatus",
      "Excluded",
      "ExcludeDate",
      "ExcludeUser",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "defaultDomainName",
    "delegatedPrivilegeStatus",
    "Excluded",
    "ExcludeDate",
    "ExcludeUser",
  ];

  const filters = [
    {
      filterName: "Included tenants",
      value: [{ id: "Excluded", value: "No" }],
      type: "column",
    },
    {
      filterName: "Excluded tenants",
      value: [{ id: "Excluded", value: "Yes" }],
      type: "column",
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey="tenants-table"
        apiUrl="/api/ExecExcludeTenant?ListAll=True"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filters}
        tenantInTitle={false}
        showTenantSelector={true}
        showAllTenantsSelector={true}
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
      />
      <CippApiDialog
        title="Force Refresh Tenant"
        createDialog={createDialog}
        fields={[
          {
            type: "textField",
            name: "tenantFilter",
            label: "Default Domain Name or Tenant ID",
            disableVariables: true,
          },
        ]}
        api={{
          url: "/api/ListTenants",
          confirmText:
            "This will refresh the tenant and update the tenant details. This can be used to force a tenant to reappear in the list. Run this with no Tenant Filter to refresh all tenants.",
          type: "GET",
          data: { TriggerRefresh: "!true" },
          replacementBehaviour: "removeNulls",
        }}
      />
      <CippGDAPTrace ref={gdapRef} />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);
export default Page;
