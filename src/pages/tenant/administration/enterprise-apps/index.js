// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Enterprise Applications";
  const apiUrl = "/api/ListGraphRequest";

  const actions = [];

  const offCanvas = {
    extendedInfoFields: ["displayName", "publisherName"],
    actions: actions,
  };

  const simpleColumns = [
    "Tenant",
    "CippStatus",
    "displayName",
    "appId",
    "createdDateTime",
    "publisherName",
    "homepage",
  ];

  const apiParams = {
    TenantFilter: "tenant?.defaultDomainName",  // dynamically use the tenant filter
    Endpoint: "servicePrincipals",
    Parameters: {
      $filter: "tags/any(t:t eq 'WindowsAzureActiveDirectoryIntegratedApp')",
      $select: "appId,displayName,createdDateTime,homepage,publisherName,tags",
      $count: true,
    },
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      params={apiParams}  // Adding API parameters here
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;