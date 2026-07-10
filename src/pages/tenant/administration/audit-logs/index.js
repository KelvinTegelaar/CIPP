import { useState } from "react";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippDateRangeFilter } from "../../../../components/CippComponents/CippDateRangeFilter";
import { EyeIcon } from "@heroicons/react/24/outline";
import tabOptions from "./tabOptions.json";

// Saved Logs Configuration
const savedLogsColumns = ["Timestamp", "Tenant", "Title", "Actions"];
const savedLogsApiUrl = "/api/ListAuditLogs";
const savedLogsActions = [
  {
    label: "View Log",
    link: "/tenant/administration/audit-logs/log?id=[LogId]",
    color: "primary",
    icon: <EyeIcon />,
  },
];

const Page = () => {
  // Preserves the previous behaviour: RelativeTime defaults to "7d" and is always sent.
  const [apiParams, setApiParams] = useState({ RelativeTime: "7d" });

  const handleApply = ({ RelativeTime, StartDate, EndDate }) => {
    setApiParams({
      RelativeTime: RelativeTime ? RelativeTime : "7d",
      ...(StartDate && { StartDate }),
      ...(EndDate && { EndDate }),
    });
  };

  const searchFilter = (
    <CippDateRangeFilter
      title="Search Options"
      defaultTime={7}
      defaultInterval={{ label: "Days", value: "d" }}
      onApply={handleApply}
    />
  );

  return (
    <CippTablePage
      tableFilter={searchFilter}
      title="Saved Logs"
      apiUrl={savedLogsApiUrl}
      apiDataKey="Results"
      simpleColumns={savedLogsColumns}
      queryKey={`SavedLogs-${apiParams.RelativeTime ?? ""}-${apiParams.StartDate ?? ""}-${
        apiParams.EndDate ?? ""
      }`}
      apiData={apiParams}
      actions={savedLogsActions}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
