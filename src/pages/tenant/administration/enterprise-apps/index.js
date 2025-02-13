// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Launch } from "@mui/icons-material";

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
    {
      icon: <Launch />,
      label: "View App Registration",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/[appId]`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
      condition: (row) => row.tags.includes("WindowsAzureActiveDirectoryIntegratedApp"),
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
  ];

  const apiParams = {
    Endpoint: "servicePrincipals",
    $select:
      "id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,appOwnerOrganizationId,tags",
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
