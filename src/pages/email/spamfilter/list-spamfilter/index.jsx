import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Spam Filters";
  const apiUrl = "/api/ListSpamfilter";

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      icon: <CippIcons.Book />,
      url: "/api/AddSpamfilterTemplate",
      dataFunction: (data) => {
        return { ...data };
      },
      confirmText: "Are you sure you want to create a template based on this rule?",
    },
    {
      label: "Enable Rule",
      type: "POST",
      icon: <CippIcons.Check />,
      url: "/api/EditSpamfilter",
      data: {
        State: "!enable",
        name: "Name",
      },
      confirmText: "Are you sure you want to enable this rule?",
      condition: (row) => row.ruleState === "Disabled",
    },
    {
      label: "Disable Rule",
      type: "POST",
      icon: <CippIcons.Block />,
      url: "/api/EditSpamfilter",
      data: {
        State: "!disable",
        name: "Name",
      },
      confirmText: "Are you sure you want to disable this rule?",
      condition: (row) => row.ruleState === "Enabled",
    },
    {
      label: "Delete Rule",
      type: "POST",
      icon: <CippIcons.Delete />,
      url: "/api/RemoveSpamFilter",
      data: {
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
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button
            component={Link}
            href="/email/spamfilter/list-spamfilter/add"
            startIcon={<CippIcons.RocketLaunch />}
          >
            Deploy Spamfilter
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
