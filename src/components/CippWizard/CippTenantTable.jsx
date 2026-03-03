import { Button, SvgIcon } from "@mui/material";
import { CippTablePage } from "../CippComponents/CippTablePage.jsx";
import { Sync, Block, PlayArrow, RestartAlt, Delete, Add, Refresh } from "@mui/icons-material";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import cacheTypes from "../../data/CIPPDBCacheTypes.json";

export const CippTenantTable = ({
  title = "Tenants",
  tenantInTitle = false,
  customColumns = null,
  customFilters = null,
  showCardButton = true,
  showTenantSelector = true,
  showAllTenantsSelector = true,
  onRefreshButtonClick = null,
}) => {
  const createDialog = useDialog();

  // Actions formatted as per your guidelines
  const actions = [
    {
      label: "Exclude Tenants",
      type: "POST",
      url: `/api/ExecExcludeTenant?AddExclusion=true`,
      icon: <Block />,
      data: { value: "customerId" },
      confirmText: "Are you sure you want to exclude [displayName]?",
      multiPost: false,
      condition: (row) => row.displayName !== "*Partner Tenant",
    },
    {
      label: "Include Tenants",
      type: "POST",
      url: `/api/ExecExcludeTenant?RemoveExclusion=true`,
      icon: <Add />,
      data: { value: "customerId" },
      confirmText: "Are you sure you want to include [displayName]?",
      multiPost: false,
      condition: (row) => row.displayName !== "*Partner Tenant",
    },
    {
      label: "Refresh CPV Permissions",
      type: "POST",
      url: `/api/ExecCPVPermissions`,
      icon: <PlayArrow />,
      data: { tenantFilter: "customerId" },
      confirmText: "Are you sure you want to refresh the CPV permissions for [displayName]?",
      multiPost: false,
    },
    {
      label: "Reset CPV Permissions",
      type: "POST",
      url: `/api/ExecCPVPermissions?&ResetSP=true`,
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
      url: `/api/ExecRemoveTenant`,
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
      url: `/api/ExecCIPPDBCache`,
      icon: <Refresh />,
      data: { Name: "Name", TenantFilter: "customerId" },
      confirmText: "Select the cache type to refresh for [displayName]:",
      multiPost: false,
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
        const tenantFilter = rowData?.customerId || rowData?.defaultDomainName || "";
        // Extract value from autoComplete object (which returns { label, value } or just value)
        const cacheTypeName = formData.Name?.value || formData.Name || "";
        return {
          Name: cacheTypeName,
          TenantFilter: tenantFilter,
        };
      },
    },
  ];

  // Offcanvas details
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

  // Columns for the table
  const columns = customColumns || [
    "displayName", // Tenant Name
    "defaultDomainName", // Default Domain
    "delegatedPrivilegeStatus", // Delegated Privilege Status
    "Excluded", // Excluded Status
    "ExcludeDate", // Exclude Date
    "ExcludeUser", // Exclude User
  ];

  // Default filters
  const defaultFilters = [
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

  const filters = customFilters || defaultFilters;

  return (
    <>
      <CippTablePage
        title={title}
        queryKey="tenants-table"
        cardButton={
          showCardButton ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onRefreshButtonClick || createDialog.handleOpen}
            >
              <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
                <Sync />
              </SvgIcon>
              Force Refresh
            </Button>
          ) : null
        }
        tenantInTitle={tenantInTitle}
        apiUrl="/api/ExecExcludeTenant?ListAll=True"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={columns}
        filters={filters}
        showTenantSelector={showTenantSelector}
        showAllTenantsSelector={showAllTenantsSelector}
      />
      {showCardButton && !onRefreshButtonClick && (
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
      )}
    </>
  );
};

export default CippTenantTable;
