import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippAuditLogSearchDrawer } from "../../../../components/CippComponents/CippAuditLogSearchDrawer.jsx";
import { EyeIcon } from "@heroicons/react/24/outline";
import { ManageSearch } from "@mui/icons-material";
import tabOptions from "./tabOptions.json";
import { useSettings } from "../../../../hooks/use-settings";

const simpleColumns = ["displayName", "status", "filterStartDateTime", "filterEndDateTime"];

const apiUrl = "/api/ListAuditLogSearches?Type=Searches";
const pageTitle = "Log Searches";

const actions = [
  {
    label: "View Results",
    link: "/tenant/administration/audit-logs/search-results?id=[id]&name=[displayName]",
    color: "primary",
    icon: <EyeIcon />,
  },
  {
    label: "Process Logs",
    url: "/api/ExecAuditLogSearch",
    confirmText:
      "Process these logs? Note: This will only alert on logs that match your Alert Configuration rules.",
    type: "POST",
    data: {
      Action: "ProcessLogs",
      SearchId: "id",
    },
    icon: <ManageSearch />,
  },
];

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const queryKey = `AuditLogSearches-${currentTenant}`;

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={apiUrl}
        apiDataKey="Results"
        simpleColumns={simpleColumns}
        queryKey={queryKey}
        actions={actions}
        cardButton={<CippAuditLogSearchDrawer relatedQueryKeys={[queryKey]} />}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
