import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippIcons } from "../../../../utils/icon-registry"
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Safe Links Policies";
  const apiUrl = "/api/ListSafeLinksPolicy";

  const filterList = [
    {
      filterName: "Enabled Rules",
      value: [{ id: "State", value: "Enabled" }],
      type: "column",
    },
    {
      filterName: "Disabled Rules",
      value: [{ id: "State", value: "Disabled" }],
      type: "column",
    }
  ];

  // Rows for orphaned built-in EOP rules carry PolicyName = null, so every condition has to
  // tolerate a missing name rather than dereferencing it. A row with no policy behind it is
  // Microsoft managed for these purposes, which is what the string comparisons already encode.
  const isMicrosoftManaged = (row) => {
    const name = row?.PolicyName ?? "";
    return (
      row?.IsBuiltIn === true ||
      name.startsWith("Standard Preset Security Policy") ||
      name.startsWith("Strict Preset Security Policy") ||
      name === "Built-In Protection Policy"
    );
  };

  const actions = [
      {
        label: "Edit Safe Links Policy",
        link: "/security/safelinks/safelinks/edit?PolicyName=[PolicyName]&RuleName=[RuleName]&tenantFilter=[tenantFilter]",
        pinned: true,
        icon: <CippIcons.Edit />,
        color: "success",
        target: "_self",
        condition: (row) => !isMicrosoftManaged(row),
      },
      {
        label: "Enable Rule",
        type: "POST",
        icon: <CippIcons.Check />,
        url: "/api/EditSafeLinksPolicy",
        data: {
          PolicyName: "PolicyName",
          Name: "PolicyName",
          Enabled: true
        },
        confirmText: "Are you sure you want to enable this rule?",
        color: "info",
        condition: (row) => row.State === "Disabled" && !isMicrosoftManaged(row),
      },
      {
        label: "Disable Rule",
        type: "POST",
        icon: <CippIcons.Block />,
        url: "/api/EditSafeLinksPolicy",
        data: {
          PolicyName: "PolicyName",
          Name: "PolicyName",
          Enabled: false
        },
        confirmText: "Are you sure you want to disable this rule?",
        color: "info",
        condition: (row) => row.State === "Enabled" && !isMicrosoftManaged(row),
      },
      {
        label: "Set Priority",
        type: "POST",
        icon: <CippIcons.LowPriority />,
        url: "/api/EditSafeLinksPolicy",
        condition: (row) => !isMicrosoftManaged(row),
        data: {
          PolicyName: "PolicyName",
          Name: "PolicyName"
        },
        confirmText: "What would you like to set the priority to?",
        color: "info",
        hideBulk: true,
        fields: [
          {
            type: "number",
            name: "Priority",
            label: "Priority",
            placeholder: "Enter a number",
            validators: {
              required: "Priority is required",
              min: {
                value: 0,
                message: "Priority must be at least 0 and no more than -1 of the lowest priority",
              },
            },
          },
        ],
      },
      {
        label: "Create template based on policy",
        type: "POST",
        url: "/api/AddSafeLinksPolicyTemplate",
        postEntireRow: true,
        confirmText: "Are you sure you want to create a template based on this policy?",
        icon: <CippIcons.Book />,
        hideBulk: true,
        condition: (row) => !isMicrosoftManaged(row),
      },
      {
        label: "Delete Rule",
        type: "POST",
        icon: <CippIcons.Delete />,
        url: "/api/ExecDeleteSafeLinksPolicy",
        data: {
          RuleName: "RuleName",
          PolicyName: "PolicyName",
        },
        confirmText: "Are you sure you want to delete this policy and rule?",
        color: "danger",
        condition: (row) => !isMicrosoftManaged(row),
      }
    ];

  // Define columns for the table
  const simpleColumns = [
    "PolicyName",
    "ConfigurationStatus",
    "IsValid",
    "State",
    "Priority",
    "Description",
    "RecipientDomainIs",
    "SentTo",
    "SentToMemberOf",
    "ExceptIfSentTo",
    "ExceptIfSentToMemberOf",
    "ExceptIfRecipientDomainIs",
    "DoNotRewriteUrls",
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

  const offCanvas = {
    extendedInfoFields: ["RuleName", "ConfigurationStatus", "IsValid", "PolicyName", "State", "WhenCreated", "WhenChanged"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filterList}
      cardButton={
        <>
          <Button component={Link} href="/security/safelinks/safelinks/add" startIcon={<CippIcons.Policy />}>
            Add Safe Links Policy
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;