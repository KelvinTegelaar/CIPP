import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import {
  Block,
  Check,
  Delete,
  MenuBook,
  Visibility,
  Edit,
  VerifiedUser,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { CippCADeployDrawer } from "../../../../components/CippComponents/CippCADeployDrawer";
import { CippApiLogsDrawer } from "../../../../components/CippComponents/CippApiLogsDrawer";
import { PermissionButton } from "../../../../utils/permissions";
import { useSettings } from "../../../../hooks/use-settings.js";

// Page Component
const Page = () => {
  const pageTitle = "Conditional Access";
  const apiUrl = "/api/ListConditionalAccessPolicies";
  const cardButtonPermissions = ["Tenant.ConditionalAccess.ReadWrite"];
  const tenant = useSettings().currentTenant;

  // Actions configuration
  const actions = [
    {
      label: "Create template based on policy",
      type: "POST",
      url: "/api/AddCATemplate",
      dataFunction: (data) => {
        if (Array.isArray(data)) {
          return data.map((item) => JSON.parse(item.rawjson));
        }
        return JSON.parse(data.rawjson);
      },
      hideBulk: true,
      confirmText: `Are you sure you want to create a template based on "[displayName]"?`,
      icon: <MenuBook />,
      color: "info",
    },
    {
      label: "Change Display Name",
      type: "POST",
      url: "/api/EditCAPolicy",
      data: {
        GUID: "id",
      },
      confirmText: `What do you want to change the display name of "[displayName]" to?`,
      icon: <Edit />,
      color: "info",
      hideBulk: true,
      fields: [
        {
          type: "textField",
          name: "newDisplayName",
          label: "New Display Name",
          required: true,
          validate: (value) => {
            if (!value) {
              return "Display name is required.";
            }
            return true;
          },
        },
      ],
    },
    {
      label: "Enable policy",
      type: "POST",
      url: "/api/EditCAPolicy",
      data: {
        GUID: "id",
        State: "!Enabled",
      },
      confirmText: `Are you sure you want to enable "[displayName]"?`,
      condition: (row) => row.state !== "enabled",
      icon: <Check />,
      color: "info",
    },
    {
      label: "Disable policy",
      type: "POST",
      url: "/api/EditCAPolicy",
      data: {
        GUID: "id",
        State: "!Disabled",
      },
      confirmText: `Are you sure you want to disable "[displayName]"?`,
      condition: (row) => row.state !== "disabled",
      icon: <Block />,
      color: "info",
    },
    {
      label: "Set policy to report only",
      type: "POST",
      url: "/api/EditCAPolicy",
      data: {
        GUID: "id",
        State: "!enabledForReportingButNotEnforced",
      },
      confirmText: `Are you sure you want to set "[displayName]" to report only?`,
      condition: (row) => row.state !== "enabledForReportingButNotEnforced",
      icon: <Visibility />,
      color: "info",
    },
    {
      label: "Add service provider exception to policy",
      type: "POST",
      url: "/api/ExecCAServiceExclusion",
      data: {
        GUID: "id",
      },
      confirmText: `Are you sure you want to add the service provider exception to "[displayName]"?`,
      icon: <VerifiedUser />,
      color: "warning",
    },
    {
      label: "Delete policy",
      type: "POST",
      url: "/api/RemoveCAPolicy",
      data: {
        GUID: "id",
      },
      confirmText: `Are you sure you want to delete "[displayName]"?`,
      icon: <Delete />,
      color: "danger",
    },
  ];

  // Off-canvas configuration
  const offCanvas = {
    children: (row) => (
      <Box sx={{ pt: 4 }}>
        <CippJsonView object={JSON.parse(row?.rawjson ? row.rawjson : null)} defaultOpen={true} />
      </Box>
    ),
    size: "xl",
  };

  // Columns for CippTablePage
  const simpleColumns = [
    "Tenant",
    "displayName",
    "state",
    "modifiedDateTime",
    "clientAppTypes",
    "includePlatforms",
    "excludePlatforms",
    "includeLocations",
    "excludeLocations",
    "includeUsers",
    "excludeUsers",
    "includeGroups",
    "excludeGroups",
    "includeApplications",
    "excludeApplications",
    "grantControlsOperator",
    "builtInControls",
  ];

  return (
    <CippTablePage
      cardButton={
        <Box sx={{ display: "flex", gap: 1 }}>
          <CippCADeployDrawer requiredPermissions={cardButtonPermissions} />
          <CippApiLogsDrawer
            apiFilter="Conditional|CA Policy|CATemplate|CAPolicy"
            buttonText="View Logs"
            title="Conditional Access Logs"
            PermissionButton={PermissionButton}
            tenantFilter={tenant}
          />
        </Box>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;
export default Page;
