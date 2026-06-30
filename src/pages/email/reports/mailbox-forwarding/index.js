import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const Page = () => {
  const reportDB = useCippReportDB({
    apiUrl: "/api/ListMailboxForwarding",
    queryKey: "mailbox-forwarding",
    cacheName: "Mailboxes",
    syncTitle: "Sync Mailbox Cache",
    allowToggle: false,
    defaultCached: true,
  });

  const columns = [
    ...reportDB.cacheColumns.filter((c) => c === "Tenant"),
    "UPN",
    "DisplayName",
    "RecipientTypeDetails",
    "ForwardingType",
    "ForwardTo",
    "DeliverToMailboxAndForward",
    ...reportDB.cacheColumns.filter((c) => c !== "Tenant"),
  ];

  const filters = [
    {
      filterName: "External Forwarding",
      value: [{ id: "ForwardingType", value: "External" }],
      type: "column",
    },
    {
      filterName: "Internal Forwarding",
      value: [{ id: "ForwardingType", value: "Internal" }],
      type: "column",
    },
  ];

  return (
    <>
      <CippTablePage
        title="Mailbox Forwarding Report"
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        apiData={reportDB.resolvedApiData}
        simpleColumns={columns}
        filters={filters}
        cardButton={reportDB.controls}
        offCanvas={null}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
