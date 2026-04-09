import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Block, Check } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "List of Anti-Phishing Filters";

  // Actions to perform (Enable/Disable/Delete Rules) - Delete Rule is commented for review
  const actions = [
    {
      label: "Enable Rule",
      type: "POST",
      icon: <Check />,
      url: "/api/EditAntiPhishingFilter",
      data: {
        State: "!Enable",
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to enable this rule?",
      condition: (row) => row.State === "Disabled",
    },
    {
      label: "Disable Rule",
      type: "POST",
      icon: <Block />,
      url: "/api/EditAntiPhishingFilter",
      data: {
        State: "!Disable",
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to disable this rule?",
      condition: (row) => row.State === "Enabled",
    },
    // Uncomment the following block if Delete Rule is to be re-enabled in the future
    /*
    {
      label: "Delete Rule",
      type: "POST",
      url: "/api/RemoveAntiPhishingFilter",
      data: {
        RuleName: "RuleName",
      },
      confirmText: "Are you sure you want to delete this rule?",
    },
    */
  ];

  // Off-canvas structure: displays extended details and includes actions (Enable/Disable Rule)
  const offCanvas = {
    extendedInfoFields: [
      "RuleName", // Rule Name
      "Name", // Policy Name
      "State", // Enabled/Disabled
      "WhenCreated", // Creation Date
      "WhenChanged", // Last Modified Date
    ],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAntiPhishingFilters"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "RuleName",
        "Name",
        "State",
        "Priority",
        "RecipientDomainIs",
        "ExcludedDomains",
        "ExcludedSenders",
        "PhishThresholdLevel",
        "EnableMailboxIntelligence",
        "EnableMailboxIntelligenceProtection",
        "EnableSpoofIntelligence",
        "EnableFirstContactSafetyTips",
        "EnableSimilarUsersSafetyTips",
        "EnableSimilarDomainsSafetyTips",
        "EnableUnusualCharactersSafetyTips",
        "EnableUnauthenticatedSender",
        "EnableViaTag",
        "EnableOrganizationDomainsProtection",
        "AuthenticationFailAction",
        "SpoofQuarantineTag",
        "MailboxIntelligenceProtectionAction",
        "MailboxIntelligenceQuarantineTag",
        "TargetedUserProtectionAction",
        "TargetedUserQuarantineTag",
        "TargetedDomainProtectionAction",
        "TargetedDomainQuarantineTag",
        "WhenCreated",
        "WhenChanged",
      ]}
    />
  );
};

// Layout configuration: ensure page uses DashboardLayout
Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
