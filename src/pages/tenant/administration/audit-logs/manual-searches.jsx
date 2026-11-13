import { useState } from "react";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippAuditLogSearchDrawer } from "../../../../components/CippComponents/CippAuditLogSearchDrawer.jsx";
import tabOptions from "./tabOptions.json";
import { useSettings } from "../../../../hooks/use-settings";

const simpleColumns = ["displayName", "status", "filterStartDateTime", "filterEndDateTime"];

const apiUrl = "/api/ListAuditLogSearches?Type=Searches";
const pageTitle = "Manual Searches";

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const queryKey = `AuditLogSearches-${currentTenant}`;
  // The search a user chose to copy; handing it to the drawer opens the form prefilled with it.
  const [copySource, setCopySource] = useState(null);

  const actions = [
    {
      label: "View Results",
      link: "/tenant/administration/audit-logs/search-results?id=[id]&name=[displayName]",
      pinned: true,
      color: "primary",
      icon: <CippIcons.EyeIcon />,
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
      icon: <CippIcons.ManageSearch />,
    },
    {
      label: "Copy Search",
      noConfirm: true,
      customFunction: (row) => setCopySource(row),
      hideBulk: true,
      icon: <CippIcons.CopyAll />,
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={apiUrl}
        apiDataKey="Results"
        simpleColumns={simpleColumns}
        queryKey={queryKey}
        actions={actions}
        cardButton={
          <CippAuditLogSearchDrawer
            relatedQueryKeys={[queryKey]}
            copySource={copySource}
            onClose={() => setCopySource(null)}
          />
        }
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
