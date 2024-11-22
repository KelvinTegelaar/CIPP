import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Spam Filters";

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      url: "/api/AddSpamfilterTemplate",
      data: {},
      confirmText: "Are you sure you want to create a template based on this rule?",
    },
    {
      label: "Enable Rule",
      type: "POST",
      url: "/api/EditSpamfilter",
      data: {
        State: "enable",
        TenantFilter: "Tenant",
        name: "Name",
      },
      confirmText: "Are you sure you want to enable this rule?",
    },
    {
      label: "Disable Rule",
      type: "POST",
      url: "/api/EditSpamfilter",
      data: {
        State: "disable",
        TenantFilter: "Tenant",
        name: "Name",
      },
      confirmText: "Are you sure you want to disable this rule?",
    },
    {
      label: "Delete Rule",
      type: "POST",
      url: "/api/RemoveSpamFilter",
      data: {
        TenantFilter: "Tenant",
        name: "Name",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "IncreaseScoreWithImageLinks",
      "IncreaseScoreWithNumericIps",
      "IncreaseScoreWithRedirectToOtherPort",
      "IncreaseScoreWithBizOrInfoUrls",
      "MarkAsSpamEmptyMessages",
      "MarkAsSpamJavaScriptInHtml",
      "MarkAsSpamFramesInHtml",
      "MarkAsSpamObjectTagsInHtml",
      "MarkAsSpamEmbedTagsInHtml",
      "MarkAsSpamFormTagsInHtml",
      "MarkAsSpamWebBugsInHtml",
      "MarkAsSpamSensitiveWordList",
      "MarkAsSpamSpfRecordHardFail",
      "MarkAsSpamFromAddressAuthFail",
      "MarkAsSpamBulkMail",
      "MarkAsSpamNdrBackscatter",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "IsDefault",
    "ruleState",
    "rulePrio",
    "HighConfidenceSpamAction",
    "BulkSpamAction",
    "PhishSpamAction",
    "WhenCreated",
    "WhenChanged",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/Listspamfilter"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      titleButton={{
        label: "Deploy Spam Filter",
        href: "/email/spamfilter/deploy",
      }}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
