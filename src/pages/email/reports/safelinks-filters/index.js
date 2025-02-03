import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

/* Note: Tenant information is passed directly in apiData instead of using Redux (e.g., useSelector) */
/* Original file included a "Delete Rule" action. If needed, add back by following other action formats. */
/* Columns have been converted to simpleColumns matching the original column names exactly. */
/* Removed custom formatters and FontAwesome imports, as table formatting is handled by CippTablePage */

const Page = () => {
  return (
    <CippTablePage
      title="List of Safe Link Filters"
      apiUrl="/api/ListSafeLinksFilters"
      actions={[
        {
          label: "Enable Rule",
          type: "POST",
          url: "/api/EditSafeLinksFilter",
          data: {
            State: "Enable",
            TenantFilter: "tenant.defaultDomainName",
            RuleName: "RuleName",
          },
          confirmText: "Are you sure you want to enable this rule?",
        },
        {
          label: "Disable Rule",
          type: "POST",
          url: "/api/EditSafeLinksFilter",
          data: {
            State: "Disable",
            TenantFilter: "tenant.defaultDomainName",
            RuleName: "RuleName",
          },
          confirmText: "Are you sure you want to disable this rule?",
        },
      ]}
      offCanvas={{
        extendedInfoFields: ["RuleName", "Name", "State", "WhenCreated", "WhenChanged"],
        actions: [
          {
            label: "Enable Rule",
            color: "info",
            url: "/api/EditSafeLinksFilter",
            type: "POST",
            data: { State: "Enable", TenantFilter: "tenant.defaultDomainName" },
            confirmText: "Are you sure you want to enable this rule?",
          },
          {
            label: "Disable Rule",
            color: "info",
            url: "/api/EditSafeLinksFilter",
            type: "POST",
            data: { State: "Disable", TenantFilter: "tenant.defaultDomainName" },
            confirmText: "Are you sure you want to disable this rule?",
          },
        ],
      }}
      simpleColumns={[
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
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
