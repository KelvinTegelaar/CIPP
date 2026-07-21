import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";
import {
  CippAnonymizedReportAlert,
  useReportAnonymized,
} from "../../../../components/CippComponents/CippAnonymizedReportAlert";

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

  const anonymized = useReportAnonymized({
    url: reportDB.resolvedApiUrl,
    queryKey: reportDB.resolvedQueryKey,
    fields: ["UPN"],
  });

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        tableFilter={<CippAnonymizedReportAlert show={anonymized} />}
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
