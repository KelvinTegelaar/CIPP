import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const pageTitle = "Consented Applications";

const Page = () => {
  const reportDB = useCippReportDB({
    apiUrl: "/api/ListOAuthApps",
    queryKey: "ListOAuthApps",
    cacheName: "OAuth2PermissionGrants",
    syncTitle: "Sync Consented Applications",
    allowToggle: true,
    defaultCached: true,
  });

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === "Tenant"),
    "Name",
    "ApplicationID",
    "ObjectID",
    "Scope",
    "StartTime",
    ...reportDB.cacheColumns.filter((c) => c !== "Tenant"),
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={simpleColumns}
        cardButton={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
