// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Launch } from "@mui/icons-material";
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "App Registrations";
  const apiUrl = "/api/ListGraphRequest";

  const actions = [
    {
      icon: <Launch />,
      label: "View App Registration",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/[appId]`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      icon: <Launch />,
      label: "View API Permissions",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/[appId]`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "id",
      "appId",
      "createdDateTime",
      "signInAudience",
      "replyUrls",
      "requiredResourceAccess",
      "web",
      "api",
      "passwordCredentials",
      "keyCredentials",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "appId",
    "createdDateTime",
    "signInAudience",
    "web.redirectUris",
    "publisherDomain",
    "passwordCredentials",
    "keyCredentials",
  ];

  const apiParams = {
    Endpoint: "applications",
    $select:
      "id,appId,displayName,createdDateTime,signInAudience,web,api,requiredResourceAccess,publisherDomain,replyUrls,passwordCredentials,keyCredentials",
    $count: true,
    $top: 999,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={apiParams}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
