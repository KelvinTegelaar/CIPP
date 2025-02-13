import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Block, Check } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "List of Safe Attachment Filters";
  const apiUrl = "/api/ListSafeAttachmentsFilters";

  // Actions converted from legacy code:
  const actions = [
    {
      label: "Enable Rule",
      type: "GET",
      icon: <Check />,
      url: "/api/EditSafeAttachmentsFilter",
      data: {
        State: "!enable",
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to enable this rule?",
      color: "info",
      condition: (row) => row.State === "Disabled"
    },
    {
      label: "Disable Rule",
      type: "GET",
      icon: <Block />,
      url: "/api/EditSafeAttachmentsFilter",
      data: {
        State: "Disable",
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to disable this rule?",
      color: "info",
      condition: (row) => row.State === "Enabled",
    },
    // Commented out "Delete Rule" action from the original file as it was also commented in legacy code
    /*
    {
      label: "Delete Rule",
      type: "GET",
      url: "/api/RemoveSafeAttachmentsFilter",
      data: {
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "danger",
    },
    */
  ];

  // Off-canvas setting including extended info fields for detailed rule information display:
  const offCanvas = {
    extendedInfoFields: ["RuleName", "Name", "State", "WhenCreated", "WhenChanged"],
    actions: actions, // Attaching actions to offCanvas per original design
  };

  // Columns simplified from legacy configuration:
  const simpleColumns = [
    "RuleName",
    "Name",
    "State",
    "Priority",
    "RecipientDomainIs",
    "Action",
    "QuarantineTag",
    "Redirect",
    "RedirectAddress",
    "WhenCreated",
    "WhenChanged",
  ];

  /* 
    Notes:
    - The original file includes tenant data fetch through Redux (`useSelector`). This is no longer necessary, as tenant handling is managed within the `CippTablePage`.
    - Offcanvas visibility states (`ocVisible`) are removed since `CippTablePage` now manages them directly.
    - Filters and other utilities (e.g., `cellBooleanFormatter`, `cellDateFormatter`, etc.) are not included in this new structure; please confirm if custom formatting is required, and we can add relevant utilities as separate imports if necessary.
  */

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
