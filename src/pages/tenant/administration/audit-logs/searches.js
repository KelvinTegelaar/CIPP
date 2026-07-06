import { useMemo, useState } from "react";
import { Chip, Stack } from "@mui/material";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippDateRangeFilter } from "../../../../components/CippComponents/CippDateRangeFilter";
import tabOptions from "./tabOptions.json";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall } from "../../../../api/ApiCall";

// Log Searches lists the V2 audit-log coverage ledger - one row per search window the pipeline runs.
// The full diagnostic dashboard lives on the advanced "Search Coverage" tab; this is the everyday view.
const simpleColumns = [
  "Tenant",
  "Type",
  "WindowStart",
  "WindowEnd",
  "State",
  "SearchStatus",
  "RecordCount",
  "MatchedCount",
  "LastError",
];
const apiUrl = "/api/ListAuditLogCoverage";

const Page = () => {
  const tenant = useSettings().currentTenant;
  const [dateParams, setDateParams] = useState({ RelativeTime: "48h" });

  const dateApiData = useMemo(
    () => ({
      ...(dateParams.RelativeTime ? { RelativeTime: dateParams.RelativeTime } : {}),
      ...(dateParams.StartDate ? { StartDate: dateParams.StartDate } : {}),
      ...(dateParams.EndDate ? { EndDate: dateParams.EndDate } : {}),
    }),
    [dateParams]
  );
  const periodKey = `${dateParams.RelativeTime ?? ""}-${dateParams.StartDate ?? ""}-${
    dateParams.EndDate ?? ""
  }`;

  // Small health summary (own fetch; the table fetches separately). Both honour the tenant selector.
  const statsQuery = ApiGetCall({
    url: apiUrl,
    data: { tenantFilter: tenant, ...dateApiData },
    queryKey: `LogSearchHealth-${tenant}-${periodKey}`,
    waiting: !!tenant,
  });

  const health = useMemo(() => {
    const d = statsQuery.data;
    const rows = Array.isArray(d) ? d : Array.isArray(d?.Results) ? d.Results : [];
    const searching = rows.filter((r) => r.State === "Planned" || r.State === "Created").length;
    const failed = rows.filter((r) => r.State === "DeadLetter").length;
    const skipped = rows.filter((r) => r.State === "Skipped").length;
    return { total: rows.length, searching, failed, skipped };
  }, [statsQuery.data]);

  const tableFilter = (
    <Stack spacing={1.5}>
      <CippDateRangeFilter
        title="Search Options"
        defaultTime={48}
        defaultInterval={{ label: "Hours", value: "h" }}
        onApply={setDateParams}
      />
      {!statsQuery.isFetching && health.total > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {health.failed === 0 ? (
            <Chip size="small" color="success" label="All log searches healthy" />
          ) : (
            <Chip size="small" color="error" label={`${health.failed} failed permanently`} />
          )}
          <Chip
            size="small"
            color="info"
            variant="outlined"
            label={`${health.searching} currently searching`}
          />
          {health.skipped > 0 && (
            <Chip size="small" variant="outlined" label={`${health.skipped} skipped (auditing off)`} />
          )}
        </Stack>
      )}
    </Stack>
  );

  return (
    <CippTablePage
      tableFilter={tableFilter}
      title="Log Searches"
      apiUrl={apiUrl}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      apiData={dateApiData}
      queryKey={`LogSearches-${tenant}-${periodKey}`}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
