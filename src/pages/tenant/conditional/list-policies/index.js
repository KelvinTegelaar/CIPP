import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import {
  Block as BlockIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  AddModerator as AddModeratorIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import Link from "next/link";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { CippCADeployDrawer } from "../../../../components/CippComponents/CippCADeployDrawer";

// Page Component
const Page = () => {
  const pageTitle = "Conditional Access";
  const apiUrl = "/api/ListConditionalAccessPolicies";

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
      confirmText: "Are you sure you want to create a template based on this policy?",
      icon: <MenuBookIcon />,
      color: "info",
    },
    {
      label: "Enable policy",
      type: "POST",
      url: "/api/EditCAPolicy",
      data: {
        GUID: "id",
        State: "!Enabled",
      },
      confirmText: "Are you sure you want to enable this policy?",
      condition: (row) => row.state !== "enabled",
      icon: <CheckIcon />,
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
      confirmText: "Are you sure you want to disable this policy?",
      condition: (row) => row.state !== "disabled",
      icon: <BlockIcon />,
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
      confirmText: "Are you sure you want to set this policy to report only?",
      condition: (row) => row.state !== "enabledForReportingButNotEnforced",
      icon: <VisibilityIcon />,
      color: "info",
    },
    {
      label: "Delete policy",
      type: "POST",
      url: "/api/RemoveCAPolicy",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to delete this policy?",
      icon: <DeleteIcon />,
      color: "danger",
    },
    {
      label: "Change Display Name",
      type: "POST",
      url: "/api/EditCAPolicy",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to change the display name of this policy?",
      icon: <EditIcon />,
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
      label: "Add service provider exception to policy",
      type: "POST",
      url: "/api/ExecCAServiceExclusion",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to add the service provider exception to this policy?",
      icon: <DeleteIcon />,
      color: "warning",
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
        <>
          <CippCADeployDrawer />
        </>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
