import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const Page = () => {
  const pageTitle = "Teams Activity List";

  const reportDB = useCippReportDB({
    apiUrl: "/api/ListTeamsActivity?type=TeamsUserActivityUser",
    queryKey: "ListTeamsActivity-TeamsUserActivityUser",
    cacheName: "TeamsActivity",
    syncTitle: "Sync Teams Activity Report",
    allowToggle: true,
    defaultCached: false,
  });

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={[
          ...reportDB.cacheColumns,
          "UPN",
          "LastActive",
          "MeetingCount",
          "CallCount",
          "TeamsChat",
        ]}
        cardButton={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
