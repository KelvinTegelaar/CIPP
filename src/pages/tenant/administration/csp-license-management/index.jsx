import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Box, Button, Stack } from "@mui/material";
import Link from "next/link";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "CSP License Management";
  const apiUrl = "/api/listCSPLicenses";

  const integrationSettings = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "ListExtensionsConfig",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const isExternalCsp = integrationSettings?.data?.ExternalCSP?.Enabled === true;
  // Changes here are purchases, so show when they go to Sherweb. External CSP has no vendor mark.
  const showSherwebLogo = !isExternalCsp && integrationSettings?.data?.Sherweb?.Enabled === true;
  const sherwebLogo =
    useSettings().currentTheme?.value === "dark"
      ? "/assets/integrations/sherweb_dark.png"
      : "/assets/integrations/sherweb.png";

  const allActions = [
    {
      label: "Increase licence count by 1",
      type: "POST",
      icon: <CippIcons.PlusIcon />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Add", sku: "sku", add: 1 },
      confirmText: "Are you sure you want to buy 1 extra licence?",
      multiPost: false,
    },
    {
      label: "Decrease licence count by 1",
      type: "POST",
      icon: <CippIcons.MinusIcon />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Remove", sku: "sku", Remove: 1 },
      confirmText: "Are you sure you want to decrease the licence count by 1?",
      multiPost: false,
    },
    {
      label: "Increase licence count",
      type: "POST",
      icon: <CippIcons.PlusIcon />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Add", sku: "sku" },
      fields: [
        {
          type: "textField",
          name: "add",
          label: "The number of licences to add",
          multiple: false,
        },
      ],
      confirmText: "Enter the amount of licences to buy, and press confirm.",
      multiPost: false,
    },
    {
      label: "Decrease licence count",
      type: "POST",
      icon: <CippIcons.MinusIcon />,
      url: "/api/ExecCSPLicense",
      fields: [
        {
          type: "textField",
          name: "remove",
          label: "Licences",
          multiple: false,
        },
      ],
      data: { Action: "!Remove", sku: "sku" },
      confirmText: "Enter the number of licences to remove. This must be a number greater than 0.",
      multiPost: false,
    },
    {
      label: "Schedule decrease of 1 at next renewal",
      sherwebOnly: true,
      type: "POST",
      icon: <CippIcons.EventRepeat />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!ScheduleRemoval", sku: "sku", Remove: 1 },
      fields: [
        {
          type: "number",
          name: "DaysAfterRenewal",
          label: "Days after renewal to execute (default 1, at most 6)",
          multiple: false,
        },
      ],
      confirmText:
        "Schedule a decrease of 1 licence for [productName], executed shortly after the renewal date ([commitmentTerm.renewalConfiguration.renewalDate])? Committed subscriptions can only be decreased in the first seven days of a new term, so the task runs just after renewal rather than before it. The decrease only happens if at least 1 licence is unassigned at that time; otherwise it is skipped and nothing changes.",
      multiPost: false,
    },
    {
      label: "Cancel Subscription",
      type: "POST",
      icon: <CippIcons.DeleteForever />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Cancel", SubscriptionIds: isExternalCsp ? "subscriptionId" : "id" },
      confirmText: "Are you sure you want to cancel this entire subscription?",
      multiPost: false,
    },
  ];
  const actions = allActions.filter((action) => !(isExternalCsp && action.sherwebOnly));

  const offCanvas = null; // No off-canvas details provided

  const simpleColumns = isExternalCsp
    ? ["name", "sku", "purchaseDate", "quantity", "renewalDate", "billingCycle", "commitmentTerm"]
    : [
        "productName",
        "sku",
        "purchaseDate",
        "quantity",
        "commitmentTerm.renewalConfiguration.renewalDate",
        "TermInfo",
      ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
          {showSherwebLogo && (
            <>
              <Box component="img" src={sherwebLogo} alt="Sherweb" sx={{ height: 22, mr: 1 }} />
              <Button
                component="a"
                href="https://cumulus.sherweb.com/"
                target="_blank"
                rel="noreferrer"
                startIcon={<CippIcons.OpenInNew />}
              >
                Cumulus Portal
              </Button>
            </>
          )}
          <Button component={Link} href="/tenant/administration/add-subscription" startIcon={<CippIcons.ShoppingCart />}>
            Add Subscription
          </Button>
        </Stack>
      }
    />
  );
};

// CSP subscriptions belong to one customer; there is no cross-tenant view.
Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
