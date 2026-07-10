import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box, Container, Grid } from "@mui/system";
import {
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippHead } from "../../../../components/CippComponents/CippHead";
import { CippDateRangeFilter } from "../../../../components/CippComponents/CippDateRangeFilter";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { CippInfoBar } from "../../../../components/CippCards/CippInfoBar";
import { CippCoverageHeatmap } from "../../../../components/CippComponents/CippCoverageHeatmap";
import { Chart } from "../../../../components/chart";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import tabOptions from "./tabOptions.json";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall } from "../../../../api/ApiCall";
import {
  buildBuckets,
  bucketIndexOf,
  bucketStartMs,
  classifyRow,
  latencyMinutes,
  summarize,
  toMs,
  STATE_LABELS,
} from "../../../../utils/cipp-coverage";

const simpleColumns = [
  "Tenant",
  "Type",
  "WindowStart",
  "WindowEnd",
  "State",
  "SearchStatus",
  "RecordCount",
  "MatchedCount",
  "Attempts",
  "RetryCount",
  "ThrottleCount",
  "ProcessedUtc",
  "NextAttemptUtc",
  "LastError",
  "LastErrorUtc",
  "LastPolledUtc",
];

const bucketLabel = (ms) =>
  new Date(ms).toLocaleString([], {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const Page = () => {
  const theme = useTheme();
  const tenant = useSettings().currentTenant;
  const [dateParams, setDateParams] = useState({ RelativeTime: "48h" });
  const [tableFilterTenant, setTableFilterTenant] = useState(null);

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

  // Charts/KPIs/heatmap share one fetch; the detail table fetches separately. Both honour the selector.
  const statsQuery = ApiGetCall({
    url: "/api/ListAuditLogCoverage",
    data: { tenantFilter: tenant, ...dateApiData },
    queryKey: `AuditLogCoverageStats-${tenant}-${periodKey}`,
    waiting: !!tenant,
  });

  const rows = useMemo(() => {
    const d = statsQuery.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.Results)) return d.Results;
    return [];
  }, [statsQuery.data]);

  const stats = useMemo(() => summarize(rows), [rows]);

  const kpis = useMemo(() => {
    const pct = stats.total ? Math.round((stats.processed / stats.total) * 100) : 0;
    const attention = stats.deadletter + stats.skipped + stats.gaps;
    return [
      {
        icon: <ShieldCheckIcon />,
        data: `${pct}%`,
        name: "Processed",
        color: pct >= 95 ? "success" : "warning",
        toolTip: `${stats.processed} of ${stats.total} windows · ${stats.totalRecords} records, ${stats.matched} matched`,
      },
      {
        icon: <ClockIcon />,
        data: stats.medianLatency != null ? `${Math.round(stats.medianLatency)}m` : "—",
        name: "Median latency",
        color: "secondary",
        toolTip: "Median window close → processed (regular windows)",
      },
      {
        icon: <ExclamationTriangleIcon />,
        data: attention,
        name: "Needs attention",
        color: attention > 0 ? "error" : "success",
        toolTip: `${stats.deadletter} dead-lettered · ${stats.skipped} skipped · ${stats.gaps} gaps`,
      },
      {
        icon: <BoltIcon />,
        data: stats.throttleEvents,
        name: "Throttle / retries",
        color: stats.throttleEvents > 0 || stats.retriedWindows > 0 ? "warning" : "secondary",
        toolTip: `${stats.throttleEvents} throttle defers · ${stats.retriedWindows} windows retried`,
      },
    ];
  }, [stats]);

  // Window status over time: stacked bar with a custom tooltip that names the tenant(s) behind any
  // error/retry/dead-letter segment (regular windows only; reconciliation excluded from the trend).
  const statusChart = useMemo(() => {
    const b = buildBuckets(rows);
    if (!b) return null;
    const keys = ["Processed", "InFlight", "Retrying", "DeadLetter"];
    const colorMap = {
      Processed: theme.palette.success.main,
      InFlight: theme.palette.info?.main || theme.palette.primary.main,
      Retrying: theme.palette.warning.main,
      DeadLetter: theme.palette.error.main,
    };
    const counts = keys.map(() => new Array(b.count).fill(0));
    const tenantsByBucket = Array.from({ length: b.count }, () => ({}));
    for (const r of rows) {
      if (r.Type === "Reconciliation" || r.Type === "Manual") continue;
      const i = bucketIndexOf(toMs(r.WindowStart), b);
      if (i < 0) continue;
      const st = classifyRow(r);
      const ki = keys.indexOf(st);
      if (ki < 0) continue;
      counts[ki][i] += 1;
      if (st !== "Processed") {
        const lbl = STATE_LABELS[st];
        const t = (r.Tenant || r.TenantId || "?").replace(/\.onmicrosoft\.com$/, "");
        tenantsByBucket[i][lbl] = tenantsByBucket[i][lbl] || {};
        tenantsByBucket[i][lbl][t] = (tenantsByBucket[i][lbl][t] || 0) + 1;
      }
    }
    const labels = Array.from({ length: b.count }, (_, i) => bucketLabel(bucketStartMs(i, b)));
    const colors = keys.map((k) => colorMap[k]);
    const bg = theme.palette.background.paper;
    const fg = theme.palette.text.primary;
    const sub = theme.palette.text.secondary;
    const series = keys.map((k, ki) => ({ name: STATE_LABELS[k], data: counts[ki] }));
    const options = {
      chart: { type: "bar", stacked: true, background: "transparent", toolbar: { show: false } },
      theme: { mode: theme.palette.mode },
      colors,
      plotOptions: { bar: { columnWidth: "72%" } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: labels,
        tickAmount: Math.min(12, b.count),
        labels: { rotate: -45, hideOverlappingLabels: true, style: { fontSize: "10px" } },
      },
      yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
      legend: { show: true, position: "top" },
      grid: { borderColor: theme.palette.divider },
      tooltip: {
        custom: ({ dataPointIndex, w }) => {
          const cat = w.globals.labels[dataPointIndex];
          let html = `<div style="padding:8px 10px;background:${bg};color:${fg};font-size:12px;min-width:170px">`;
          html += `<div style="font-weight:500;margin-bottom:6px">${cat}</div>`;
          keys.forEach((k, ki) => {
            const v = counts[ki][dataPointIndex];
            if (!v) return;
            const lbl = STATE_LABELS[k];
            html += `<div style="display:flex;align-items:center;gap:6px;margin-top:3px"><span style="width:8px;height:8px;border-radius:2px;background:${colors[ki]};display:inline-block"></span><span>${lbl}: ${v}</span></div>`;
            const tn = tenantsByBucket[dataPointIndex][lbl];
            if (tn) {
              const parts = Object.entries(tn)
                .map(([t, c]) => `${t} (${c})`)
                .join(", ");
              html += `<div style="margin:1px 0 2px 14px;color:${sub};font-size:11px">${parts}</div>`;
            }
          });
          html += `</div>`;
          return html;
        },
      },
    };
    return { series, options };
  }, [rows, theme]);

  // Latency stage breakdown + audit volume over the same buckets.
  const trendCharts = useMemo(() => {
    const b = buildBuckets(rows);
    if (!b) return null;
    const sums = [0, 1, 2].map(() => new Array(b.count).fill(0));
    const cnts = new Array(b.count).fill(0);
    const recSum = new Array(b.count).fill(0);
    const matSum = new Array(b.count).fill(0);
    for (const r of rows) {
      if (r.Type === "Reconciliation" || r.Type === "Manual") continue;
      const i = bucketIndexOf(toMs(r.WindowStart), b);
      if (i < 0) continue;
      recSum[i] += Number(r.RecordCount) || 0;
      matSum[i] += Number(r.MatchedCount) || 0;
      if (r.State === "Processed") {
        const l = latencyMinutes(r);
        if (l.total != null && l.total >= 0) {
          sums[0][i] += Math.max(0, l.create || 0);
          sums[1][i] += Math.max(0, l.download || 0);
          sums[2][i] += Math.max(0, l.process || 0);
          cnts[i] += 1;
        }
      }
    }
    const labels = Array.from({ length: b.count }, (_, i) => bucketLabel(bucketStartMs(i, b)));
    const avg = (si) => sums[si].map((s, i) => (cnts[i] ? Math.round(s / cnts[i]) : null));
    const axis = {
      xaxis: {
        categories: labels,
        tickAmount: Math.min(10, b.count),
        labels: { rotate: -45, hideOverlappingLabels: true, style: { fontSize: "10px" } },
      },
      yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
      legend: { show: true, position: "top" },
      grid: { borderColor: theme.palette.divider },
      dataLabels: { enabled: false },
      theme: { mode: theme.palette.mode },
    };
    return {
      latSeries: [
        { name: "Create lag", data: avg(0) },
        { name: "Download lag", data: avg(1) },
        { name: "Process lag", data: avg(2) },
      ],
      latOptions: {
        ...axis,
        chart: { type: "area", stacked: true, background: "transparent", toolbar: { show: false }, zoom: { enabled: false } },
        colors: [theme.palette.warning.main, theme.palette.info?.main || theme.palette.primary.main, theme.palette.success.main],
        stroke: { curve: "smooth", width: 2 },
        fill: { type: "solid", opacity: 0.25 },
        tooltip: { theme: theme.palette.mode, y: { formatter: (v) => (v == null ? "—" : `${Math.round(v)} min`) } },
      },
      volSeries: [
        { name: "Records", data: recSum },
        { name: "Matched", data: matSum },
      ],
      volOptions: {
        ...axis,
        chart: { type: "line", background: "transparent", toolbar: { show: false }, zoom: { enabled: false } },
        colors: [theme.palette.primary.main, theme.palette.error.main],
        stroke: { curve: "smooth", width: 2 },
        markers: { size: 0, hover: { size: 4 } },
        tooltip: { theme: theme.palette.mode },
      },
    };
  }, [rows, theme]);

  // Triage feed: windows that errored, retried, throttled, were skipped or dead-lettered. Newest first.
  const problems = useMemo(() => {
    const num = (v) => Number(v) || 0;
    const list = rows.filter(
      (r) =>
        r.State === "DeadLetter" ||
        r.State === "Skipped" ||
        num(r.RetryCount) > 0 ||
        num(r.ThrottleCount) > 0
    );
    list.sort((a, b) => {
      const ta = toMs(a.LastErrorUtc) || toMs(a.WindowStart) || 0;
      const tb = toMs(b.LastErrorUtc) || toMs(b.WindowStart) || 0;
      return tb - ta;
    });
    return list.slice(0, 12);
  }, [rows]);

  const offCanvas = {
    children: (row) => <CippJsonView object={row} defaultOpen={true} title="Coverage Window Details" />,
    size: "lg",
  };

  const tableFilters = tableFilterTenant ? [{ id: "Tenant", value: tableFilterTenant }] : [];

  const ChartCard = ({ title, subheader, ready, children }) => (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <Divider />
      <CardContent>
        {statsQuery.isFetching ? (
          <Skeleton variant="rounded" sx={{ height: 280 }} />
        ) : !ready ? (
          <Typography color="text.secondary" variant="body2" sx={{ py: 6, textAlign: "center" }}>
            No search windows in this period.
          </Typography>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <CippHead title="Search Coverage" />
      <Box sx={{ p: 3 }}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <CippDateRangeFilter
              title="Period"
              defaultTime={48}
              defaultInterval={{ label: "Hours", value: "h" }}
              onApply={setDateParams}
            />

            <CippInfoBar data={kpis} isFetching={statsQuery.isFetching} />

            <ChartCard
              title="Window status over time"
              subheader="Window states per bucket — hover an error/retry segment to see which tenant(s)"
              ready={!!statusChart}
            >
              {statusChart && (
                <Chart options={statusChart.options} series={statusChart.series} type="bar" height={300} />
              )}
            </ChartCard>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard
                  title="Latency over time"
                  subheader="Average pipeline lag by stage (close → processed)"
                  ready={!!trendCharts}
                >
                  {trendCharts && (
                    <Chart options={trendCharts.latOptions} series={trendCharts.latSeries} type="area" height={300} />
                  )}
                </ChartCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard
                  title="Audit volume over time"
                  subheader={`Records downloaded and rule matches · ${stats.totalRecords} records, ${stats.matched} matched`}
                  ready={!!trendCharts}
                >
                  {trendCharts && (
                    <Chart options={trendCharts.volOptions} series={trendCharts.volSeries} type="line" height={300} />
                  )}
                </ChartCard>
              </Grid>
            </Grid>

            <Card>
              <CardHeader
                title="Per-tenant coverage"
                subheader="Each cell is a time bucket; empty cells are coverage gaps. Click a cell to filter the table."
              />
              <Divider />
              <CardContent>
                {statsQuery.isFetching ? (
                  <Skeleton variant="rounded" sx={{ height: 200 }} />
                ) : (
                  <CippCoverageHeatmap
                    rows={rows}
                    onCellClick={({ tenant: t }) => setTableFilterTenant(t)}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Problems & retries"
                subheader="Windows that errored, retried, throttled, were skipped or dead-lettered"
              />
              <Divider />
              <CardContent sx={{ pt: 0 }}>
                {statsQuery.isFetching ? (
                  <Skeleton variant="rounded" sx={{ height: 120 }} />
                ) : problems.length === 0 ? (
                  <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: "center" }}>
                    No problems in this period — everything processed cleanly.
                  </Typography>
                ) : (
                  <Stack divider={<Divider flexItem />}>
                    {problems.map((r, i) => {
                      const num = (v) => Number(v) || 0;
                      const badge =
                        r.State === "DeadLetter"
                          ? { label: "Dead-letter", color: "error" }
                          : r.State === "Skipped"
                            ? { label: "Skipped", color: "default" }
                            : num(r.ThrottleCount) > 0
                              ? { label: `Throttle ×${num(r.ThrottleCount)}`, color: "warning" }
                              : { label: `Retry ×${num(r.RetryCount)}`, color: "warning" };
                      const when = r.LastErrorUtc || r.ProcessedUtc || r.WindowStart;
                      return (
                        <Stack
                          key={`${r.Tenant}-${r.WindowStart}-${i}`}
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          sx={{ py: 1 }}
                        >
                          <Typography variant="body2" sx={{ minWidth: 160 }} noWrap title={r.Tenant}>
                            {String(r.Tenant || "").replace(/\.onmicrosoft\.com$/, "")}
                          </Typography>
                          <Chip size="small" label={badge.label} color={badge.color} variant="outlined" />
                          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }} noWrap title={r.LastError}>
                            {r.LastError || "—"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                            {when ? new Date(when).toLocaleString() : "—"}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Card>
              <Divider />
              {tableFilterTenant && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Filtered to {tableFilterTenant.replace(/\.onmicrosoft\.com$/, "")}
                  </Typography>
                  <Button size="small" onClick={() => setTableFilterTenant(null)}>
                    Clear
                  </Button>
                </Stack>
              )}
              <CippDataTable
                key={`coverage-table-${tableFilterTenant ?? "all"}`}
                title={tenant ? `Search Coverage - ${tenant}` : "Search Coverage"}
                api={{
                  url: "/api/ListAuditLogCoverage",
                  data: { tenantFilter: tenant, ...dateApiData },
                  dataKey: "Results",
                }}
                simple={false}
                simpleColumns={simpleColumns}
                filters={tableFilters}
                offCanvas={offCanvas}
                queryKey={`AuditLogCoverageTable-${tenant}-${periodKey}`}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
