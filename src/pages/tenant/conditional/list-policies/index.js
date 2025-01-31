import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import {
  Block as BlockIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  AddModerator as AddModeratorIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";

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
        return JSON.parse(data.rawjson);
      },
      confirmText: "Are you sure you want to create a template based on this policy?",
      icon: <MenuBookIcon />,
      color: "info",
    },
    {
      label: "Enable policy",
      type: "GET",
      url: "/api/EditCAPolicy?State=Enabled",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to enable this policy?",
      icon: <CheckIcon />,
      color: "info",
    },
    {
      label: "Disable policy",
      type: "GET",
      url: "/api/EditCAPolicy?State=Disabled",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to disable this policy?",
      icon: <BlockIcon />,
      color: "info",
    },
    {
      label: "Set policy to report only",
      type: "GET",
      url: "/api/EditCAPolicy?State=enabledForReportingButNotEnforced",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to set this policy to report only?",
      icon: <VisibilityIcon />,
      color: "info",
    },
    {
      label: "Delete policy",
      type: "GET",
      url: "/api/RemoveCAPolicy",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to delete this policy?",
      icon: <DeleteIcon />,
      color: "danger",
    },
  ];

  // Off-canvas configuration
  const offCanvas = {
    children: (row) => <CippJsonView object={JSON.parse(row?.rawjson ? row.rawjson : null)} />,
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
          <Button
            component={Link}
            href="/tenant/conditional/list-policies/deploy"
            startIcon={<AddModeratorIcon />}
          >
            Deploy Conditional Access Policy
          </Button>
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
