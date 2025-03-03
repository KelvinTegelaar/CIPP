import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Block, Check } from "@mui/icons-material";

/* Note: Tenant information is passed directly in apiData instead of using Redux (e.g., useSelector) */
/* Original file included a "Delete Rule" action. If needed, add back by following other action formats. */
/* Columns have been converted to simpleColumns matching the original column names exactly. */
/* Removed custom formatters and FontAwesome imports, as table formatting is handled by CippTablePage */

const Page = () => {
  const pageTitle = "List of Safe Link Filters";
  const apiUrl = "/api/ListSafeLinksFilters";

  const actions = [
    {
      label: "Enable Rule",
      type: "POST",
      icon: <Check />,
      url: "/api/EditSafeLinksFilter",
      data: {
        State: "Enable",
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to enable this rule?",
      color: "info",
      condition: (row) => row.State === "Disabled",
    },
    {
      label: "Disable Rule",
      type: "POST",
      icon: <Block />,
      url: "/api/EditSafeLinksFilter",
      data: {
        State: "Disable",
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to disable this rule?",
      color: "info",
      condition: (row) => row.State === "Enabled",
    },
    /* TODO: implement Delete Rule action
    {
      label: "Delete Rule",
      type: "GET",
      url: "/api/EditSafeLinksFilter",
      data: {
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "danger",
    },
    */
  ];

  const offCanvas = {
    extendedInfoFields: ["RuleName", "Name", "State", "WhenCreated", "WhenChanged"],
    actions: actions, // Attaching actions to offCanvas per original design
  };

  const simpleColumns = [
    "RuleName",
    "Name",
    "State",
    "Priority",
    "RecipientDomainIs",
    "EnableSafeLinksForEmail",
    "EnableSafeLinksForTeams",
    "EnableSafeLinksForOffice",
    "TrackClicks",
    "ScanUrls",
    "EnableForInternalSenders",
    "DeliverMessageAfterScan",
    "AllowClickThrough",
    "DisableUrlRewrite",
    "EnableOrganizationBranding",
    "WhenCreated",
    "WhenChanged",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
