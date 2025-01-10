import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Inactive users (6 months)";
  const apiUrl = "/api/ListInactiveAccounts";
  const actions = [];

  const offCanvas = null;

  const simpleColumns = [
    "tenantDisplayName",
    "userPrincipalName",
    "displayName",
    "lastNonInteractiveSignInDateTime",
    "numberOfAssignedLicenses",
    "lastRefreshedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      // apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
