import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import CippJsonView from "/src/components/CippFormPages/CippJSONView";
import tabOptions from "./tabOptions.json";

const DirectoryAuditsPage = () => {
  const offCanvas = {
    children: (row) => <CippJsonView object={row} defaultOpen={true} />,
    size: "xl",
  };

  return (
    <CippTablePage
      title="Directory Audits"
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "auditLogs/directoryAudits",
        $orderby: "activityDateTime desc",
        $top: 999,
        manualPagination: true,
      }}
      apiDataKey="Results"
      actions={[]}
      offCanvas={offCanvas}
      simpleColumns={[
        "activityDateTime",
        "activityDisplayName",
        "category",
        "result",
        "initiatedBy.user.userPrincipalName",
        "targetResources",
      ]}
    />
  );
};

DirectoryAuditsPage.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default DirectoryAuditsPage;
