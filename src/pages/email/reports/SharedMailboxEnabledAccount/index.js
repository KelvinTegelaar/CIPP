import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Block } from "@mui/icons-material";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const Page = () => {
  const reportDB = useCippReportDB({
    apiUrl: "/api/ListSharedMailboxAccountEnabled",
    queryKey: "ListSharedMailboxAccountEnabled",
    cacheName: "Mailboxes",
    syncTitle: "Sync Shared Mailbox Cache",
    allowToggle: true,
    defaultCached: false,
  });

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === "Tenant"),
    "UserPrincipalName",
    "displayName",
    "accountEnabled",
    "assignedLicenses",
    "onPremisesSyncEnabled",
    ...reportDB.cacheColumns.filter((c) => c !== "Tenant"),
  ];

  return (
    <>
      <CippTablePage
        title="Shared Mailbox with Enabled Account"
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        cardButton={reportDB.controls}
        actions={[
          {
            label: "Block Sign In",
            type: "POST",
            icon: <Block />,
            url: "/api/ExecDisableUser",
            data: { ID: "id" },
            confirmText: "Are you sure you want to block the sign-in for this mailbox?",
            condition: (row) => row.accountEnabled && !row.onPremisesSyncEnabled,
          },
        ]}
        offCanvas={{
          extendedInfoFields: [
            "UserPrincipalName",
            "displayName",
            "accountEnabled",
            "assignedLicenses",
            "onPremisesSyncEnabled",
          ],
        }}
        simpleColumns={simpleColumns}
        filters={[
          {
            id: "accountEnabled",
            value: "Yes",
          },
        ]}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
