// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Launch } from "@mui/icons-material";
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "Enterprise Applications";
  const apiUrl = "/api/ListGraphRequest";

  const actions = [
    {
      icon: <Launch />,
      label: "View Application",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/[id]/appId/[appId]`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "createdDateTime",
      "publisherName",
      "replyUrls",
      "appOwnerOrganizationId",
      "tags",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "info.logoUrl",
    "displayName",
    "appId",
    "createdDateTime",
    "publisherName",
    "homepage",
    "passwordCredentials",
    "keyCredentials",
  ];

  const apiParams = {
    Endpoint: "servicePrincipals",
    $select:
      "id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,appOwnerOrganizationId,tags,passwordCredentials,keyCredentials",
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
