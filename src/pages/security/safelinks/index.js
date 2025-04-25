import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Block, Check, LowPriority, Edit, DeleteForever, Policy, Book } from "@mui/icons-material";
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
  
  const actions = [
      {
        label: "Edit Safe Links Policy",
        link: "/security/safelinks/edit?PolicyName=[PolicyName]&RuleName=[RuleName]&tenantFilter=[tenantFilter]",
        icon: <Edit />,
        color: "success",
        target: "_self",
      },
      {
        label: "Enable Rule",
        type: "POST",
        icon: <Check />,
        url: "/api/EditSafeLinksPolicy",
        data: {
          OriginalPolicyName: "PolicyName",
          Name: "PolicyName",
          Enabled: true
        },
        confirmText: "Are you sure you want to enable this rule?",
        color: "info",
        condition: (row) => row.State === "Disabled",
      },
      {
        label: "Disable Rule",
        type: "POST",
        icon: <Block />,
        url: "/api/EditSafeLinksPolicy",
        data: {
          OriginalPolicyName: "PolicyName",
          Name: "PolicyName",
          Enabled: false
        },
        confirmText: "Are you sure you want to disable this rule?",
        color: "info",
        condition: (row) => row.State === "Enabled",
      },
      {
        label: "Set Priority",
        type: "POST",
        icon: <LowPriority />,
        url: "/api/EditSafeLinksPolicy",
        data: {
          OriginalPolicyName: "PolicyName",
          Name: "PolicyName"
        },
        confirmText: "What would you like to set the priority to?",
        color: "info",
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
        icon: <Book />,
      },
      {
        label: "Delete Rule",
        type: "GET",
        icon: <DeleteForever />,
        url: "/api/ExecDeleteSafeLinksPolicy",
        data: {
          RuleName: "RuleName",
          PolicyName: "PolicyName",
        },
        confirmText: "Are you sure you want to delete this policy and rule?",
        color: "danger",
      }
    ];

  // Define columns for the table
  const simpleColumns = [
    "PolicyName",
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
    extendedInfoFields: ["RuleName", "PolicyName", "State", "WhenCreated", "WhenChanged"],
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
          <Button component={Link} href="safelinks/add" startIcon={<Policy />}>
            Add Safe Links Policy
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;