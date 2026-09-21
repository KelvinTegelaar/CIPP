import { useMemo, useState } from "react";
import { CippIcons } from "../../../../utils/icon-registry";
import Head from "next/head";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import {
  AreaChart,
  BarChart,
  ComposedChart,
  Area,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { ApiGetCall } from "../../../../api/ApiCall";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import tabOptions from "./tabOptions";
import { useTitleClaimedByTabPicker } from "../../../../layouts/tab-navigation-context";
import {
  aggregateDiagnosticsClients,
  sortDiagnosticsChecks,
  buildClientLogQuery,
  buildRequestSeries,
  buildStackedSeries,
  getCheckLabel,
  formatBytes,
} from "../../../../utils/instance-diagnostics";

const WINDOWS = [
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 },
  { label: "14d", hours: 336 },
];

// Maps the backend's check vocabulary onto the labels the shared Status chip
// formatter (get-cipp-formatting.jsx) already recognizes, rather than adding a
// one-off chip renderer for this page.
const STATUS_LABEL = { FAIL: "Failed", WARN: "Warning", PASS: "Passed", INFO: "Info" };

// Health buckets are naive 'yyyy-MM-ddTHH:mm' UTC strings, egress buckets full ISO — both
// become epoch ms so the 5 and 15 minute strips share one numeric time axis.
const bucketEpoch = (bucket) =>
  bucket ? new Date(bucket.endsWith("Z") ? bucket : `${bucket}:00Z`).getTime() : null;

const formatChartTime = (epoch, hours) => {
  const d = new Date(epoch);
  if (hours <= 24) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// Always the full date + time — a bare clock time is ambiguous on a multi-day window.
const formatFullDateTime = (epoch) => {
  const d = new Date(epoch);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRatio = (ratio) => (ratio != null ? `${ratio}x` : "—");

// Same nested view for a client's log lines, used both from the API Clients table
// and from a client row inside an Event's off-canvas.
const ClientLogsTable = ({ appId, hours }) => {
  const logsQuery = ApiGetCall({
    url: "/api/ListContainerLogs",
    data: { Action: "Query", Query: buildClientLogQuery(appId, hours) },
    queryKey: `InstanceDiagnosticsClientLogs-${appId}-${hours}`,
    waiting: !!appId,
    // Log lines change every second; never serve a cached result when the drawer opens.
    staleTime: 0,
  });

  return (
    <CippDataTable
      noCard
      title="Log lines"
      data={logsQuery.data?.Results ?? []}
      simpleColumns={["Timestamp", "Level", "Message"]}
      isFetching={logsQuery.isFetching}
      refreshFunction={logsQuery.refetch}
    />
  );
};

const clientLogsOffCanvas = (hours) => ({
  size: "lg",
  title: "Client Log Lines",
  children: (row) => <ClientLogsTable appId={row.AppId} hours={hours} />,
});

const ChecksCard = ({ checks, isFetching, refreshFunction }) => {
  const rows = useMemo(
    () =>
      sortDiagnosticsChecks(checks).map((c) => ({
        ...c,
        Check: getCheckLabel(c.Check),
        Status: STATUS_LABEL[c.Status] ?? c.Status,
      })),
    [checks]
  );

  return (
    <CippDataTable
      title="Checks"
      data={rows}
      // Fix text stays reachable in the row's off-canvas — showing it here means a
      // "No data" chip on every PASS row, since only failing checks carry a fix.
      simpleColumns={["Check", "Status", "Detail"]}
      isFetching={isFetching}
      refreshFunction={refreshFunction}
      offCanvasOnRowClick={true}
      offCanvas={{ extendedInfoFields: ["Check", "Status", "Detail", "Fix"] }}
    />
  );
};

const buildEventRows = (events) =>
  (events ?? []).map((e, i) => {
    const topClients = e.TopClients ?? [];
    const busiest = topClients[0];
    return {
      id: `${e.Bucket}-${i}`,
      Time: formatFullDateTime(bucketEpoch(e.Bucket)),
      Event: e.Type === "boot" ? "Container restarted" : "Out of memory",
      Outage: e.Type === "boot" && e.GapMinutes != null ? `${e.GapMinutes} min` : "",
      BusiestClient: busiest ? busiest.AppName || busiest.AppId : "—",
      RequestsPriorHour: busiest?.Count ?? "—",
      BaselinePerHour: busiest?.Baseline ?? "—",
      Ratio: formatRatio(busiest?.Ratio),
      TopClients: topClients.map((c) => ({
        Client: c.AppName || c.AppId,
        AppId: c.AppId,
        IP: c.IP,
        Count: c.Count,
        Baseline: c.Baseline,
        Ratio: formatRatio(c.Ratio),
      })),
    };
  });

const EventsCard = ({ events, hours, isFetching, refreshFunction }) => {
  const rows = useMemo(() => buildEventRows(events), [events]);

  return (
    <CippDataTable
      title="Restart & Out-of-Memory Events"
      data={rows}
      simpleColumns={[
        "Time",
        "Event",
        "Outage",
        "BusiestClient",
        "RequestsPriorHour",
        "BaselinePerHour",
        "Ratio",
      ]}
      isFetching={isFetching}
      refreshFunction={refreshFunction}
      offCanvasOnRowClick={true}
      offCanvas={{
        size: "lg",
        title: "Busiest Clients Before Event",
        children: (row) => (
          <CippDataTable
            noCard
            title="Clients around this event"
            data={row.TopClients ?? []}
            simpleColumns={["Client", "IP", "Count", "Baseline", "Ratio"]}
            offCanvasOnRowClick={true}
            offCanvas={clientLogsOffCanvas(hours)}
          />
        ),
      }}
    />
  );
};

const ApiClientsCard = ({ buckets, hours, egressClients, isFetching, refreshFunction }) => {
  // Executed comes from the log (requests that ran PowerShell), Served from Craft's wire
  // accounting, so a cache-only client shows up with Served but no Executed.
  const rows = useMemo(() => {
    const egressById = new Map((egressClients ?? []).map((c) => [c.AppId, c]));
    const logRows = aggregateDiagnosticsClients(buckets).map((c) => {
      const egress = egressById.get(c.AppId);
      egressById.delete(c.AppId);
      return {
        ...c,
        Client: c.AppName || c.AppId,
        ExecutedRequests: c.Count,
        ...(egress ? { ServedRequests: egress.Requests, EgressToday: formatBytes(egress.Bytes) } : {}),
      };
    });
    const egressOnly = Array.from(egressById.values()).map((c) => ({
      AppId: c.AppId,
      AppName: c.AppName,
      Client: c.AppName || c.AppId,
      ExecutedRequests: 0,
      ServedRequests: c.Requests,
      EgressToday: formatBytes(c.Bytes),
      SharePct: 0,
    }));
    return logRows.concat(egressOnly);
  }, [buckets, egressClients]);

  const columns = egressClients
    ? ["Client", "IP", "ExecutedRequests", "ServedRequests", "EgressToday", "SharePct"]
    : ["Client", "IP", "ExecutedRequests", "SharePct"];

  return (
    <CippDataTable
      title="API Clients"
      data={rows}
      simpleColumns={columns}
      isFetching={isFetching}
      refreshFunction={refreshFunction}
      offCanvasOnRowClick={true}
      offCanvas={clientLogsOffCanvas(hours)}
    />
  );
};

// primary and warning are both orange in the CIPP theme, so they never sit side by side.
const CLIENT_COLOR_KEYS = ["primary", "info", "success", "secondary"];

// Small bordered sub-chart, stacked full-width under the "Health Timeline" card header so
// every sub-chart's x-axis lines up (same buckets, same left margin).
const SubChart = ({ title, caption, height = 220, children }) => (
  <Grid size={{ xs: 12 }}>
    <Box sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1, p: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: caption ? 0 : 1 }}>
        {title}
      </Typography>
      {caption && (
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
          {caption}
        </Typography>
      )}
      <Box sx={{ height }}>
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </Box>
    </Box>
  </Grid>
);

const chartTooltipStyle = (t) => ({
  contentStyle: {
    backgroundColor: t.palette.background.paper,
    border: `1px solid ${t.palette.divider}`,
    borderRadius: 4,
  },
  labelFormatter: (value) => formatFullDateTime(value),
});

const clientColor = (t, index) => t.palette[CLIENT_COLOR_KEYS[index % CLIENT_COLOR_KEYS.length]].main;

const RequestsChart = ({ data, series, xAxis, theme: t }) => (
  <SubChart title="API Requests / 5 min">
    <BarChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
      <XAxis {...xAxis} />
      <YAxis tick={{ fontSize: 11 }} tickMargin={4} />
      <YAxis yAxisId="spacer" orientation="right" width={44} tick={false} axisLine={false} />
      <RechartsTooltip {...chartTooltipStyle(t)} />
      <Legend />
      {series.map((s, i) => (
        <Bar
          key={s.AppId}
          dataKey={s.AppId}
          name={s.AppName}
          stackId="clients"
          barSize={6}
          fill={clientColor(t, i)}
        />
      ))}
      {data.some((row) => row.Other > 0) && (
        <Bar dataKey="Other" name="Other" stackId="clients" barSize={6} fill={t.palette.grey[500]} />
      )}
    </BarChart>
  </SubChart>
);

const EgressChart = ({ data, series, caption, colorIndex, xAxis, theme: t }) => (
  <SubChart title="API Egress / 15 min" caption={caption}>
    <BarChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
      <XAxis {...xAxis} />
      <YAxis tick={{ fontSize: 11 }} tickMargin={4} unit="MB" />
      <YAxis yAxisId="spacer" orientation="right" width={44} tick={false} axisLine={false} />
      <RechartsTooltip
        {...chartTooltipStyle(t)}
        formatter={(value, name) => [`${Number(value).toFixed(1)} MB`, name]}
      />
      <Legend />
      {series.map((s, i) => (
        <Bar
          key={s.AppId}
          dataKey={s.AppId}
          name={s.AppName}
          stackId="egress"
          barSize={14}
          fill={clientColor(t, colorIndex.get(s.AppId) ?? i)}
        />
      ))}
      {data.some((row) => row.Other > 0) && (
        <Bar dataKey="Other" name="Other" stackId="egress" barSize={14} fill={t.palette.grey[500]} />
      )}
    </BarChart>
  </SubChart>
);

const HeapChart = ({ data, heapCapMb, eventMarkers, xAxis, theme: t }) => {
  const peak = data.reduce((max, d) => (d.Heap != null && d.Heap > max ? d.Heap : max), 0);
  const domainMax = Math.max(heapCapMb || 0, peak) * 1.05;

  return (
    <SubChart title="Heap (MB)">
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
        <XAxis {...xAxis} />
        <YAxis domain={[0, domainMax]} tick={{ fontSize: 11 }} tickMargin={4} unit="MB" />
        <YAxis yAxisId="spacer" orientation="right" width={44} tick={false} axisLine={false} />
        <RechartsTooltip {...chartTooltipStyle(t)} />
        <Legend />
        <Area
          type="monotone"
          dataKey="Heap"
          name="Heap (MB)"
          fill={t.palette.primary.main}
          stroke={t.palette.primary.main}
          fillOpacity={0.3}
          connectNulls
        />
        {heapCapMb ? (
          <ReferenceLine
            y={heapCapMb}
            stroke={t.palette.error.main}
            strokeDasharray="4 2"
            label={{ value: "GC cap", fontSize: 10, position: "insideTopRight" }}
          />
        ) : null}
        {eventMarkers.map((e, i) => (
          <ReferenceLine
            key={`${e.Bucket}-${i}`}
            x={e.t}
            stroke={e.Type === "boot" ? t.palette.error.main : t.palette.error.dark}
            strokeDasharray="4 2"
            label={{ value: e.Type === "boot" ? "Restart" : "OOM", fontSize: 10, position: "insideBottomLeft", angle: -90 }}
          />
        ))}
      </AreaChart>
    </SubChart>
  );
};

const PoolChart = ({ data, xAxis, theme: t }) => (
  <SubChart title="Pool Pressure">
    <ComposedChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
      <XAxis {...xAxis} />
      <YAxis yAxisId="pool" tick={{ fontSize: 11 }} tickMargin={4} />
      <YAxis yAxisId="wait" orientation="right" width={44} tick={{ fontSize: 11 }} tickMargin={4} unit="s" />
      <RechartsTooltip {...chartTooltipStyle(t)} />
      <Legend />
      <Bar yAxisId="pool" dataKey="PoolExhaustedCount" name="Pool exhausted" barSize={6} fill={t.palette.error.main} />
      <Line
        yAxisId="wait"
        type="monotone"
        dataKey="MaxLimiterWaitSec"
        name="Max wait (s)"
        stroke={t.palette.warning.main}
        strokeWidth={2}
        dot={false}
      />
    </ComposedChart>
  </SubChart>
);

const Page = () => {
  const theme = useTheme();
  const titleClaimed = useTitleClaimedByTabPicker("Diagnostics");
  const queryClient = useQueryClient();
  const [hours, setHours] = useState(24);

  const checksQuery = ApiGetCall({
    url: "/api/ListInstanceDiagnostics",
    data: { Action: "Checks", Hours: String(hours) },
    queryKey: `InstanceDiagnosticsChecks-${hours}`,
  });

  const timelineQuery = ApiGetCall({
    url: "/api/ListInstanceDiagnostics",
    data: { Action: "Timeline", Hours: String(hours) },
    queryKey: `InstanceDiagnosticsTimeline-${hours}`,
  });

  const checks = checksQuery.data?.Results ?? [];
  const buckets = useMemo(() => timelineQuery.data?.Results?.Buckets ?? [], [timelineQuery.data]);
  const events = useMemo(() => timelineQuery.data?.Results?.Events ?? [], [timelineQuery.data]);
  const heapCapMb = timelineQuery.data?.Results?.HeapCapMb ?? null;
  const egress = timelineQuery.data?.Results?.Egress;
  const egressAvailable = egress?.Available ?? false;
  const isFetching = checksQuery.isFetching || timelineQuery.isFetching;

  const chartData = useMemo(
    () =>
      buckets.map((b) => ({
        ...b,
        t: bucketEpoch(b.Bucket),
        Heap: b.HeapMb ?? b.HeapMbLive ?? null,
      })),
    [buckets]
  );

  const requestSeries = useMemo(() => buildRequestSeries(buckets), [buckets]);
  const requestChartData = useMemo(
    () => requestSeries.data.map((row) => ({ ...row, t: bucketEpoch(row.Bucket) })),
    [requestSeries]
  );
  // Colour is keyed on the request chart's client order, so a client looks the same in both strips.
  const clientColorIndex = useMemo(
    () => new Map(requestSeries.series.map((s, i) => [s.AppId, i])),
    [requestSeries]
  );

  const egressSeries = useMemo(
    () =>
      buildStackedSeries(egress?.Buckets ?? [], {
        bucketKey: "BucketStart",
        valueKey: "Bytes",
        order: requestSeries.series.map((s) => s.AppId),
      }),
    [egress, requestSeries]
  );
  const egressChartData = useMemo(
    () =>
      egressSeries.data.map(({ Bucket, ...values }) => {
        const row = { t: bucketEpoch(Bucket) };
        for (const [key, value] of Object.entries(values)) {
          row[key] = Math.round(((Number(value) || 0) / 1048576) * 10) / 10;
        }
        return row;
      }),
    [egressSeries]
  );
  const egressCaption = egress
    ? [
        egress.Enforcing
          ? `Today: ${formatBytes(egress.TodayBytes)} of ${formatBytes(egress.CapBytes)} (${
              egress.CapBytes > 0 ? Math.round((egress.TodayBytes / egress.CapBytes) * 100) : 0
            }%)`
          : `Today: ${formatBytes(egress.TodayBytes)}`,
        egress.TodayShed > 0 ? ` \u00b7 ${egress.TodayShed} refused (429)` : "",
      ].join("")
    : null;

  // 5 and 15 minute buckets can never share a category axis, so every strip is drawn on one
  // numeric time axis with the same domain and ticks.
  const timeDomain = useMemo(() => {
    const stamps = chartData
      .map((d) => d.t)
      .concat(egressChartData.map((d) => d.t))
      .filter((t) => t != null);
    if (stamps.length === 0) return null;
    // Pad by a bucket width either side so the first and last bars are not clipped.
    return [Math.min(...stamps) - 5 * 60000, Math.max(...stamps) + 15 * 60000];
  }, [chartData, egressChartData]);

  const timeTicks = useMemo(() => {
    if (!timeDomain) return [];
    const [from, to] = timeDomain;
    const step = (to - from) / 7;
    return Array.from({ length: 8 }, (_, i) => Math.round(from + i * step));
  }, [timeDomain]);

  const timeAxis = {
    type: "number",
    dataKey: "t",
    scale: "time",
    domain: timeDomain ?? ["dataMin", "dataMax"],
    ticks: timeTicks,
    allowDataOverflow: true,
    tickFormatter: (value) => formatChartTime(value, hours),
    tick: { fontSize: 11 },
    tickMargin: 8,
  };

  const showPoolChart = buckets.some(
    (b) => (b.PoolExhaustedCount ?? 0) > 0 || (b.MaxLimiterWaitMs ?? 0) >= 10000
  );
  const poolChartData = useMemo(
    () => chartData.map((b) => ({ ...b, MaxLimiterWaitSec: (b.MaxLimiterWaitMs ?? 0) / 1000 })),
    [chartData]
  );

  // Markers outside the drawn window would sit on the axis edge, so drop them.
  const eventMarkers = useMemo(
    () =>
      events
        .map((e) => ({ ...e, t: bucketEpoch(e.Bucket) }))
        .filter((e) => e.t != null && timeDomain && e.t >= timeDomain[0] && e.t <= timeDomain[1]),
    [events, timeDomain]
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: [`InstanceDiagnosticsChecks-${hours}`] });
    queryClient.invalidateQueries({ queryKey: [`InstanceDiagnosticsTimeline-${hours}`] });
  };

  const isEmpty =
    !checksQuery.isFetching &&
    !timelineQuery.isFetching &&
    checks.length === 0 &&
    buckets.length === 0 &&
    events.length === 0;

  return (
    <>
      <Head>
        <title>Diagnostics | CIPP</title>
      </Head>
      <Box sx={{ flexGrow: 1, pb: { xs: 10, md: 4 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2}>
            {/* ── Header toolbar ── */}
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              {titleClaimed ? <Box /> : <Typography variant="h4">Diagnostics</Typography>}
              <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                {isFetching && <CircularProgress size={16} />}
                <ToggleButtonGroup
                  value={hours}
                  exclusive
                  onChange={(_, val) => val !== null && setHours(val)}
                  size="small"
                >
                  {WINDOWS.map((w) => (
                    <ToggleButton key={w.hours} value={w.hours}>
                      {w.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={handleRefresh}>
                    <CippIcons.Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {isEmpty && (
              <Alert severity="info">
                No diagnostic samples yet — samples are collected every 5 minutes, so this fills
                in as the instance keeps running.
              </Alert>
            )}

            {!isEmpty && (
              <>
                {/* ── Checks ── */}
                <ChecksCard checks={checks} isFetching={checksQuery.isFetching} refreshFunction={handleRefresh} />

                {/* ── Health Timeline ── */}
                <Card>
                  <CardHeader
                    title="Health Timeline"
                    avatar={<CippIcons.Timeline color="primary" />}
                    slotProps={{ title: { variant: "h6" } }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    {chartData.length === 0 ? (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        No timeline samples in this window yet
                      </Typography>
                    ) : (
                      <Grid container spacing={2}>
                        <RequestsChart
                          data={requestChartData}
                          series={requestSeries.series}
                          xAxis={timeAxis}
                          theme={theme}
                        />
                        {egressAvailable && (
                          <EgressChart
                            data={egressChartData}
                            series={egressSeries.series}
                            caption={egressCaption}
                            colorIndex={clientColorIndex}
                            xAxis={timeAxis}
                            theme={theme}
                          />
                        )}
                        <HeapChart
                          data={chartData}
                          heapCapMb={heapCapMb}
                          eventMarkers={eventMarkers}
                          xAxis={timeAxis}
                          theme={theme}
                        />
                        {showPoolChart && (
                          <PoolChart data={poolChartData} xAxis={timeAxis} theme={theme} />
                        )}
                      </Grid>
                    )}
                  </CardContent>
                </Card>

                {/* ── Events ── */}
                <EventsCard
                  events={events}
                  hours={hours}
                  isFetching={timelineQuery.isFetching}
                  refreshFunction={handleRefresh}
                />

                {/* ── API clients ── */}
                <ApiClientsCard
                  buckets={buckets}
                  hours={hours}
                  egressClients={egressAvailable ? egress.Clients : null}
                  isFetching={timelineQuery.isFetching}
                  refreshFunction={handleRefresh}
                />
              </>
            )}

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
