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
  Policy,
  CheckCircle,
  Cancel,
  Report,
} from "@mui/icons-material";
import { Box, Paper, Avatar, Typography, Chip, Divider, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Stack } from "@mui/system";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { CippCADeployDrawer } from "../../../../components/CippComponents/CippCADeployDrawer";
import { CippApiLogsDrawer } from "../../../../components/CippComponents/CippApiLogsDrawer";
import { PermissionButton } from "../../../../utils/permissions";
import { useSettings } from "../../../../hooks/use-settings.js";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { getInitials, stringToColor } from "../../../../utils/get-initials";

// Page Component
const Page = () => {
  const pageTitle = "Conditional Access";
  const apiUrl = "/api/ListConditionalAccessPolicies";
  const cardButtonPermissions = ["Tenant.ConditionalAccess.ReadWrite"];
  const tenant = useSettings().currentTenant;
  const theme = useTheme();

  // Actions configuration
  const actions = [
    {
      label: "Edit Policy",
      link: "/tenant/conditional/list-policies/edit?id=[id]",
      icon: <Edit />,
      color: "info",
      hideBulk: true,
      category: "edit",
    },
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
      category: "edit",
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
      category: "edit",
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
      category: "manage",
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
      category: "manage",
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
      category: "manage",
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
      category: "security",
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
      color: "error",
      category: "danger",
    },
  ];

  // Helper for policy state
  const getPolicyStateInfo = (state) => {
    switch (state) {
      case "enabled":
        return { label: "Enabled", color: theme.palette.success.main, icon: <CheckCircle fontSize="small" /> };
      case "disabled":
        return { label: "Disabled", color: theme.palette.error.main, icon: <Cancel fontSize="small" /> };
      case "enabledForReportingButNotEnforced":
        return { label: "Report Only", color: theme.palette.warning.main, icon: <Report fontSize="small" /> };
      default:
        return { label: state || "Unknown", color: theme.palette.grey[500], icon: <Policy fontSize="small" /> };
    }
  };

  // Off-canvas configuration
  const offCanvas = {
    children: (row) => {
      const stateInfo = getPolicyStateInfo(row.state);
      
      return (
        <Stack spacing={3}>
          {/* Hero Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(stateInfo.color, 0.15)} 0%, ${alpha(stateInfo.color, 0.05)} 100%)`,
              borderLeft: `4px solid ${stateInfo.color}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: stringToColor(row.displayName || "P"),
                  width: 56,
                  height: 56,
                }}
              >
                <Policy />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {row.displayName || "Unknown Policy"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.Tenant}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Status */}
          <Box>
            <Typography 
              variant="overline" 
              color="text.secondary" 
              sx={{ fontWeight: 600, letterSpacing: 1, mb: 1.5, display: "block" }}
            >
              Policy Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={stateInfo.icon}
                label={stateInfo.label}
                sx={{ 
                  fontWeight: 600, 
                  bgcolor: alpha(stateInfo.color, 0.1),
                  color: stateInfo.color,
                  borderColor: stateInfo.color,
                }}
                variant="outlined"
              />
            </Stack>
          </Box>

          {row.modifiedDateTime && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Last Modified</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getCippFormatting(row.modifiedDateTime, "modifiedDateTime")}
                </Typography>
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Policy JSON */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Policy Configuration
            </Typography>
            <CippJsonView object={JSON.parse(row?.rawjson ? row.rawjson : null)} defaultOpen={true} />
          </Box>
        </Stack>
      );
    },
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
