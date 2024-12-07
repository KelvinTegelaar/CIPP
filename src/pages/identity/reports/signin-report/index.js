import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Sign Ins Report";
  const apiUrl = "/api/ListSignIns";
  const actions = [];
  const offCanvas = null;
  const simpleColumns = [
    "createdDateTime",
    "userPrincipalName",
    "clientAppUsed",
    "authenticationRequirement",
    "errorCode",
    "additionalDetails",
    "locationcipp",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={apiUrl}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
