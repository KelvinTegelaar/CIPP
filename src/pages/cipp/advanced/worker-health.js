import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Memory,
  Speed,
  PlayArrow,
  HourglassEmpty,
  CheckCircle,
  Warning,
  Cancel,
  Delete,
  LowPriority,
  Timeline,
  RocketLaunch,
  Pause,
  FileDownload,
  FileUpload,
  Refresh,
  Close,
} from "@mui/icons-material";
import { Grid } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippInfoBar } from "../../../components/CippCards/CippInfoBar";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";

const formatDuration = (ms) => {
  if (ms === 0 || ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const formatUptime = (seconds) => {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const WorkerStatusChip = ({ isBusy, currentFunction }) => {
  if (isBusy) {
    return (
      <Chip
        label={currentFunction || "Busy"}
        color="warning"
        size="small"
        icon={<PlayArrow />}
        sx={{ maxWidth: 200 }}
      />
    );
  }
  return <Chip label="Idle" color="success" size="small" icon={<CheckCircle />} />;
};

const UtilizationBar = ({ value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ flexGrow: 1 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(value, 100)}
        color={value > 80 ? "error" : value > 50 ? "warning" : "primary"}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
    <Typography variant="body2" sx={{ minWidth: 45 }}>
      {value}%
    </Typography>
  </Box>
);

const WorkerTable = ({ workers, title }) => {
  if (!workers || workers.length === 0) return null;

  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <CardHeader title={title} titleTypographyProps={{ variant: "h6" }} />
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Worker</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Invocations</TableCell>
                <TableCell align="right">Utilization</TableCell>
                <TableCell align="right">Avg</TableCell>
                <TableCell align="right">Min</TableCell>
                <TableCell align="right">Max</TableCell>
                <TableCell align="right">Last</TableCell>
                <TableCell align="right">Alloc</TableCell>
                <TableCell align="right">Faults</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workers.map((w) => (
                <TableRow key={w.WorkerId}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      W{w.WorkerId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <WorkerStatusChip isBusy={w.IsBusy} currentFunction={w.CurrentFunction} />
                  </TableCell>
                  <TableCell align="right">{w.TotalInvocations?.toLocaleString() ?? 0}</TableCell>
                  <TableCell align="right">
                    <UtilizationBar value={w.UtilizationPct ?? 0} />
                  </TableCell>
                  <TableCell align="right">{formatDuration(w.AvgDurationMs)}</TableCell>
                  <TableCell align="right">{formatDuration(w.MinDurationMs)}</TableCell>
                  <TableCell align="right">{formatDuration(w.MaxDurationMs)}</TableCell>
                  <TableCell align="right">{formatDuration(w.LastDurationMs)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={`Total ${w.TotalAllocMB ?? 0} MB • last ${w.LastAllocMB ?? 0} MB • avg ${w.AvgAllocMB ?? 0} MB / call`} arrow>
                      <Typography variant="body2" fontWeight={500}>
                        {w.TotalAllocMB != null ? `${w.TotalAllocMB} MB` : "—"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    {w.TotalFaults > 0 ? (
                      <Chip label={w.TotalFaults} color="error" size="small" />
                    ) : (
                      "0"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const TIME_RANGES = [
  { label: "1h", minutes: 60 },
  { label: "6h", minutes: 360 },
  { label: "24h", minutes: 1440 },
  { label: "3d", minutes: 4320 },
  { label: "7d", minutes: 10080 },
];

const formatChartTime = (timestamp, rangeMinutes) => {
  const d = new Date(timestamp);
  if (rangeMinutes <= 1440) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STARTUP_PHASES = [
  { key: "BaseWorkerMs", label: "Base Worker", fkey: "BaseFunctionCount", color: "#7c4dff" },
  { key: "WarmupMs", label: "Warmup", fkey: null, color: "#ffc107" },
  { key: "HttpReadyMs", label: "HTTP Ready", fkey: "HttpFunctionCount", color: "#00c853" },
  { key: "HttpPoolFullMs", label: "HTTP Pool Full", fkey: null, color: "#69f0ae" },
  { key: "BgReadyMs", label: "BG Ready", fkey: "BgFunctionCount", color: "#29b6f6" },
  { key: "FullyReadyMs", label: "Fully Ready", fkey: null, color: "#66bb6a" },
];

const StartupTimingBar = ({ startup }) => {
  if (!startup) return null;

  // Build segments as incremental durations between phases
  const phases = STARTUP_PHASES.filter((p) => startup[p.key] > 0);
  const totalMs = startup.FullyReadyMs || Math.max(...phases.map((p) => startup[p.key]), 1);

  // Compute incremental segments (each phase = cumulative time to that point)
  const segments = phases.map((phase, i) => {
    const cumMs = startup[phase.key];
    const prevMs = i > 0 ? startup[phases[i - 1].key] : 0;
    const deltaMs = Math.max(cumMs - prevMs, 0);
    return {
      ...phase,
      cumMs,
      deltaMs,
      pct: totalMs > 0 ? (deltaMs / totalMs) * 100 : 0,
      functions: phase.fkey ? startup[phase.fkey] : null,
    };
  });

  return (
    <Card>
      <CardHeader
        title="Startup Timing"
        titleTypographyProps={{ variant: "subtitle1" }}
        avatar={<RocketLaunch fontSize="small" color="primary" />}
        subheader={`${startup.ReadinessMode} / ${startup.WarmupMode} — ${startup.CpuCount} CPUs, ${startup.HttpPoolSize}H + ${startup.BgPoolSize}BG — Total: ${formatDuration(totalMs)}`}
        subheaderTypographyProps={{ variant: "caption" }}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1.5, pb: "12px !important" }}>
        {/* Single horizontal stacked bar */}
        <Box sx={{ display: "flex", height: 28, borderRadius: 1, overflow: "hidden", mb: 1.5 }}>
          {segments.map((seg) => (
            <Tooltip
              key={seg.key}
              arrow
              title={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {seg.label}
                  </Typography>
                  <Typography variant="caption">
                    {formatDuration(seg.deltaMs)} (cumulative: {formatDuration(seg.cumMs)})
                  </Typography>
                  {seg.functions != null && (
                    <Typography variant="caption" display="block">
                      {seg.functions} functions loaded
                    </Typography>
                  )}
                </Box>
              }
            >
              <Box
                sx={{
                  width: `${Math.max(seg.pct, 1)}%`,
                  backgroundColor: seg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: seg.pct > 8 ? 0 : 4,
                  cursor: "pointer",
                  transition: "filter 0.15s",
                  "&:hover": { filter: "brightness(1.2)" },
                }}
              >
                {seg.pct > 12 && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#fff", fontWeight: 600, fontSize: 10, textShadow: "0 1px 2px rgba(0,0,0,.4)" }}
                  >
                    {formatDuration(seg.deltaMs)}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
        {/* Legend */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {segments.map((seg) => (
            <Stack key={seg.key} direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: seg.color, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary">
                {seg.label}
                {seg.functions != null && ` (${seg.functions})`}
              </Typography>
            </Stack>
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ ml: "auto !important" }}>
            Modules: {startup.SharedModuleCount} shared
            {startup.HttpOnlyModuleCount > 0 && `, ${startup.HttpOnlyModuleCount} HTTP`}
            {startup.BgOnlyModuleCount > 0 && `, ${startup.BgOnlyModuleCount} BG`}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

const CompactStatsRow = ({ snapshot }) => {
  if (!snapshot) return null;

  const http = snapshot.HttpPool || {};
  const bg = snapshot.BgPool || {};
  const jobs = snapshot.Jobs || {};
  const limiter = snapshot.Limiter || {};
  const mem = snapshot.Memory || {};

  const sections = [
    {
      label: "HTTP Pool",
      color: "primary",
      stats: [
        { k: "Size", v: http.PoolSize ?? 0 },
        { k: "Busy", v: http.BusyCount ?? 0, w: http.BusyCount >= http.PoolSize },
        { k: "Invocations", v: http.TotalInvocations?.toLocaleString() ?? 0 },
        { k: "Util", v: `${http.AvgUtilizationPct ?? 0}%`, w: http.AvgUtilizationPct > 80 },
        { k: "Avg", v: formatDuration(http.AvgDurationMs) },
        { k: "Faults", v: http.TotalFaults ?? 0, w: http.TotalFaults > 0 },
      ],
    },
    {
      label: "BG Pool",
      color: "warning",
      stats: [
        { k: "Size", v: bg.PoolSize ?? 0 },
        { k: "Busy", v: bg.BusyCount ?? 0, w: bg.BusyCount >= bg.PoolSize },
        { k: "Invocations", v: bg.TotalInvocations?.toLocaleString() ?? 0 },
        { k: "Util", v: `${bg.AvgUtilizationPct ?? 0}%`, w: bg.AvgUtilizationPct > 80 },
        { k: "Avg", v: formatDuration(bg.AvgDurationMs) },
        { k: "Faults", v: bg.TotalFaults ?? 0, w: bg.TotalFaults > 0 },
      ],
    },
    {
      label: "Jobs",
      color: "info",
      stats: [
        { k: "Running", v: jobs.Running ?? 0 },
        { k: "Queued", v: jobs.Queued ?? 0, w: jobs.Queued > 10 },
        { k: "Done", v: jobs.Completed?.toLocaleString() ?? 0 },
        { k: "Failed", v: jobs.Failed ?? 0, w: jobs.Failed > 0 },
      ],
    },
    {
      label: "Limiter",
      color: "default",
      stats: [
        { k: "Active", v: `${limiter.Active ?? 0} / ${limiter.CurrentMax ?? 0}` },
        { k: "Waiting", v: limiter.Waiting ?? 0 },
        ...(limiter.IsHttpThrottled ? [{ k: "Status", v: "Throttled", w: true }] : []),
      ],
    },
    {
      label: "Memory",
      color: "secondary",
      stats: [
        { k: "Container", v: `${mem.ContainerUsedMB ?? mem.RssMB ?? 0} / ${mem.ContainerLimitMB ?? 0}MB`, w: mem.UsagePct > 85 },
        { k: "App RSS", v: `${mem.RssMB ?? 0}MB` },
        { k: "Other", v: `${mem.OtherRssMB ?? 0}MB` },
        { k: "GC Heap", v: `${mem.HeapMB ?? 0}MB` },
        { k: "Committed", v: `${mem.CommittedMB ?? 0}MB` },
        { k: "GC Limit", v: `${mem.GCHeapLimitMB ?? 0}MB` },
        { k: "Usage", v: `${mem.UsagePct ?? 0}%`, w: mem.UsagePct > 85 },
        { k: "GC", v: `${mem.GC0 ?? 0}/${mem.GC1 ?? 0}/${mem.GC2 ?? 0}` },
        ...(mem.TestDataCacheCount != null ? [{ k: "Cache", v: `${mem.TestDataCacheCount} entries` }] : []),
      ],
    },
    {
      label: "CPU",
      color: "warning",
      stats: [
        { k: "Container", v: `${mem.ContainerCpuPct ?? mem.CpuPct ?? 0}%`, w: (mem.ContainerCpuPct ?? 0) > 80 },
        { k: "App", v: `${mem.CpuPct ?? 0}%`, w: mem.CpuPct > 80 },
        { k: "Other", v: `${mem.OtherCpuPct ?? 0}%` },
      ],
    },
  ];

  return (
    <Card>
      <CardContent sx={{ py: 1, px: 0, "&:last-child": { pb: 1 } }}>
        <TableContainer>
          <Table size="small" sx={{ "& td, & th": { borderBottom: "none", py: 0.25, px: 1 } }}>
            <TableBody>
              {sections.map((sec) => (
                <TableRow key={sec.label}>
                  <TableCell sx={{ width: 100 }}>
                    <Chip label={sec.label} size="small" color={sec.color} variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  {sec.stats.map((s) => (
                    <TableCell key={s.k} align="center">
                      <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
                        {s.k}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={s.w ? "error.main" : "text.primary"} lineHeight={1.3}>
                        {s.v}
                      </Typography>
                    </TableCell>
                  ))}
                  {/* Pad empty cells so columns stay aligned */}
                  {Array.from({ length: Math.max(0, 6 - sec.stats.length) }).map((_, i) => (
                    <TableCell key={`pad-${i}`} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const HistoryChart = ({ data, rangeMinutes, title, icon, children }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title={title} titleTypographyProps={{ variant: "h6" }} avatar={icon} />
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <Typography variant="body2" color="text.secondary">
              No historical data available yet — data collection starts after 60 seconds
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} titleTypographyProps={{ variant: "h6" }} avatar={icon} />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            {children(data, theme)}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const Page = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [historyRange, setHistoryRange] = useState(60);
  const [paused, setPaused] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [jobLimit, setJobLimit] = useState(2000);

  const isImported = importedData !== null;
  const effectivePaused = paused || isImported;

  const healthQuery = ApiGetCall({
    url: "/api/ListWorkerHealth",
    data: { Action: "Snapshot" },
    queryKey: "WorkerHealth",
    refetchInterval: effectivePaused ? false : 5000,
  });

  const startupQuery = ApiGetCall({
    url: "/api/ListWorkerHealth",
    data: { Action: "Startup" },
    queryKey: "WorkerStartup",
  });

  const historyQuery = ApiGetCall({
    url: "/api/ListWorkerHealth",
    data: { Action: "History", Minutes: String(historyRange), MaxPoints: "500" },
    queryKey: `WorkerHistory-${historyRange}`,
    refetchInterval: effectivePaused ? false : 60000,
  });

  const jobAction = ApiPostCall({
    relatedQueryKeys: ["WorkerHealthJobs", "WorkerHealth"],
  });

  const cacheDiagQuery = ApiGetCall({
    url: "/api/ListWorkerHealth",
    data: { Action: "CacheDiag" },
    queryKey: "WorkerCacheDiag",
    refetchInterval: effectivePaused ? false : 30000,
  });

  // Resolve data: imported overrides live
  const snapshot = isImported ? importedData.snapshot : healthQuery.data?.Results;
  const startupInfo = isImported ? importedData.startup : startupQuery.data?.Results;
  const importedJobs = useMemo(() => {
    if (!isImported || !importedData.jobs) return null;
    // Handle both array and { Results: [...] } shapes from query cache
    if (Array.isArray(importedData.jobs)) return importedData.jobs;
    if (Array.isArray(importedData.jobs?.Results)) return importedData.jobs.Results;
    if (Array.isArray(importedData.jobs?.data?.Results)) return importedData.jobs.data.Results;
    if (Array.isArray(importedData.jobs?.data)) return importedData.jobs.data;
    return [];
  }, [isImported, importedData]);

  const historyData = useMemo(() => {
    const raw = isImported
      ? importedData.history?.Data ?? importedData.history
      : historyQuery.data?.Results?.Data;
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((p) => ({
      ...p,
      time: formatChartTime(p.TimestampUtc, isImported ? importedData.historyRange ?? 60 : historyRange),
    }));
  }, [historyQuery.data, historyRange, importedData, isImported]);

  // ── Export ──
  const handleExport = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      historyRange,
      snapshot: healthQuery.data?.Results ?? null,
      startup: startupQuery.data?.Results ?? null,
      history: historyQuery.data?.Results ?? null,
      jobs: null,
    };
    // Try to grab current job data from query cache
    // CippDataTable may store the key with extra params, so search by prefix
    const allQueries = queryClient.getQueriesData({ queryKey: ["WorkerHealthJobs"] });
    for (const [, data] of allQueries) {
      if (data) {
        const rows = data?.Results ?? data?.data?.Results ?? data;
        if (Array.isArray(rows)) {
          payload.jobs = rows;
          break;
        }
      }
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worker-health-${new Date().toISOString().slice(0, 16).replace(/:/g, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [healthQuery.data, startupQuery.data, historyQuery.data, historyRange, queryClient]);

  // ── Import ──
  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setImportedData(data);
        setPaused(true);
      } catch {
        // invalid JSON — ignore
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    event.target.value = "";
  }, []);

  const handleClearImport = useCallback(() => {
    setImportedData(null);
    setPaused(false);
  }, []);

  const handleRefreshHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [`WorkerHistory-${historyRange}`] });
  }, [queryClient, historyRange]);

  const infoBarData = useMemo(() => {
    if (!snapshot) return [];
    const http = snapshot.HttpPool || {};
    const bg = snapshot.BgPool || {};
    const jobs = snapshot.Jobs || {};
    const limiter = snapshot.Limiter || {};

    return [
      {
        icon: <Memory />,
        name: "HTTP Workers",
        data: `${http.BusyCount ?? 0} / ${http.PoolSize ?? 0} busy`,
        color: http.BusyCount >= http.PoolSize ? "error" : "primary",
      },
      {
        icon: <Speed />,
        name: "BG Workers",
        data: `${bg.BusyCount ?? 0} / ${bg.PoolSize ?? 0} busy`,
        color: bg.BusyCount >= bg.PoolSize ? "error" : "primary",
      },
      {
        icon: jobs.Running > 0 ? <PlayArrow /> : <HourglassEmpty />,
        name: "Job Queue",
        data: `${jobs.Running ?? 0} running, ${jobs.Queued ?? 0} queued`,
        color: jobs.Queued > 10 ? "warning" : "primary",
      },
      {
        icon: limiter.IsHttpThrottled ? <Warning /> : <CheckCircle />,
        name: "BG Limiter",
        data: limiter.IsHttpThrottled
          ? "HTTP Throttled"
          : `${limiter.Active ?? 0} / ${limiter.CurrentMax ?? 0} active`,
        color: limiter.IsHttpThrottled ? "error" : "primary",
      },
      {
        icon: <Memory />,
        name: "Memory",
        data: `${snapshot.Memory?.ContainerUsedMB ?? snapshot.Memory?.RssMB ?? 0}MB / ${snapshot.Memory?.ContainerLimitMB ?? 0}MB (${snapshot.Memory?.UsagePct ?? 0}%)`,
        color: (snapshot.Memory?.UsagePct ?? 0) > 85 ? "error" : (snapshot.Memory?.UsagePct ?? 0) > 70 ? "warning" : "primary",
      },
      {
        icon: <Speed />,
        name: "CPU",
        data: `${snapshot.Memory?.ContainerCpuPct ?? snapshot.Memory?.CpuPct ?? 0}% container / ${snapshot.Memory?.CpuPct ?? 0}% app`,
        color: (snapshot.Memory?.ContainerCpuPct ?? snapshot.Memory?.CpuPct ?? 0) > 80 ? "error" : (snapshot.Memory?.ContainerCpuPct ?? snapshot.Memory?.CpuPct ?? 0) > 50 ? "warning" : "primary",
      },
    ];
  }, [snapshot]);

  const jobSimpleColumns = ["Name", "RunName", "Priority", "Status", "QueuedUtc", "WaitSeconds", "DurationSeconds"];

  const jobActions = useMemo(
    () => [
      {
        label: "Cancel Job",
        icon: <Cancel />,
        color: "error.main",
        noConfirm: true,
        customFunction: (row) => {
          jobAction.mutate({
            url: "/api/ListWorkerHealth",
            data: { Action: "CancelJob", JobId: row.Id },
          });
        },
        condition: (row) => row.Status === "Queued",
      },
      {
        label: "Change Priority",
        icon: <LowPriority />,
        fields: [
          {
            type: "textField",
            name: "Priority",
            label: "New Priority (0 = highest)",
          },
        ],
        url: "/api/ListWorkerHealth",
        data: { Action: "ChangePriority" },
        dataFunction: (row, formData) => ({
          Action: "ChangePriority",
          JobId: row.Id,
          Priority: parseInt(formData.Priority, 10),
        }),
        confirmText: "Change",
        condition: (row) => row.Status === "Queued",
        relatedQueryKeys: ["WorkerHealthJobs", "WorkerHealth"],
      },
      {
        label: "Cancel Run",
        icon: <Cancel />,
        color: "error.main",
        noConfirm: true,
        customFunction: (row) => {
          if (row.RunName) {
            jobAction.mutate({
              url: "/api/ListWorkerHealth",
              data: { Action: "CancelRun", RunName: row.RunName },
            });
          }
        },
        condition: (row) => row.Status === "Queued" && row.RunName,
      },
      {
        label: "Delete",
        icon: <Delete />,
        noConfirm: true,
        customFunction: (row) => {
          jobAction.mutate({
            url: "/api/ListWorkerHealth",
            data: { Action: "DeleteJob", JobId: row.Id },
          });
        },
        condition: (row) => row.Status !== "Queued" && row.Status !== "Running",
      },
    ],
    [jobAction]
  );

  const jobFilters = useMemo(
    () => [
      { filterName: "Queued", value: [{ id: "Status", value: "Queued" }] },
      { filterName: "Running", value: [{ id: "Status", value: "Running" }] },
      { filterName: "Failed", value: [{ id: "Status", value: "Failed" }] },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Worker Health | CIPP</title>
      </Head>
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={2}>
            {/* ── Header toolbar ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Worker Health</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                {isImported && (
                  <Chip
                    label={`Viewing imported data (${importedData.exportedAt ? new Date(importedData.exportedAt).toLocaleString() : "unknown"})`}
                    color="info"
                    size="small"
                    onDelete={handleClearImport}
                    deleteIcon={<Close />}
                  />
                )}
                {!isImported && healthQuery.isFetching && <CircularProgress size={16} />}
                {!isImported && snapshot && (
                  <Typography variant="caption" color="text.secondary">
                    Uptime: {formatUptime(snapshot.UptimeSeconds)}
                  </Typography>
                )}
                <Tooltip title={effectivePaused ? "Resume auto-refresh" : "Pause auto-refresh"}>
                  <IconButton
                    size="small"
                    onClick={() => setPaused((p) => !p)}
                    color={effectivePaused ? "warning" : "default"}
                    disabled={isImported}
                  >
                    {effectivePaused ? <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export page data as JSON">
                  <IconButton size="small" onClick={handleExport}>
                    <FileDownload fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Import page data from JSON">
                  <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                    <FileUpload fontSize="small" />
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: "none" }}
                  onChange={handleImport}
                />
              </Stack>
            </Stack>

            {/* ── KPI bar ── */}
            <CippInfoBar isFetching={false} data={infoBarData} />

            {/* ── Compact pool / jobs / limiter stats ── */}
            <CompactStatsRow snapshot={snapshot} />

            {/* ── Worker tables ── */}
            <WorkerTable workers={snapshot?.HttpPool?.Workers} title="HTTP Workers" />
            <WorkerTable workers={snapshot?.BgPool?.Workers} title="Background Workers" />

            {/* ── Job Queue ── */}
            {isImported && importedJobs ? (
              <Card>
                <CardHeader title="Job Queue (imported)" titleTypographyProps={{ variant: "h6" }} />
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  {importedJobs.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No job data was captured in this export
                      </Typography>
                    </Box>
                  ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {jobSimpleColumns.map((col) => (
                            <TableCell key={col}>{col}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importedJobs.slice(0, 200).map((row, i) => (
                          <TableRow key={row.Id ?? i}>
                            {jobSimpleColumns.map((col) => (
                              <TableCell key={col}>
                                {row[col] != null ? String(row[col]) : "—"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  )}
                </CardContent>
              </Card>
            ) : (
              <CippDataTable
                title="Job Queue"
                queryKey={`WorkerHealthJobs-${jobLimit}`}
                api={{
                  url: "/api/ListWorkerHealth",
                  data: { Action: "Jobs", Limit: String(jobLimit) },
                  dataKey: "Results",
                }}
                simpleColumns={jobSimpleColumns}
                actions={jobActions}
                filters={jobFilters}
                defaultSorting={[{ id: "QueuedUtc", desc: true }]}
                cardButton={
                  <ToggleButtonGroup
                    value={jobLimit}
                    exclusive
                    onChange={(_, val) => val !== null && setJobLimit(val)}
                    size="small"
                  >
                    {[500, 2000, 5000, 10000].map((n) => (
                      <ToggleButton key={n} value={n}>
                        {n >= 1000 ? `${n / 1000}k` : n}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                }
              />
            )}

            {/* ── Historical Trends header with controls ── */}
            <Card>
              <CardHeader
                title="Historical Trends"
                titleTypographyProps={{ variant: "h6" }}
                avatar={<Timeline color="primary" />}
                action={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {!isImported && (
                      <Tooltip title="Refresh history data">
                        <IconButton size="small" onClick={handleRefreshHistory}>
                          <Refresh fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <ToggleButtonGroup
                      value={isImported ? (importedData.historyRange ?? 60) : historyRange}
                      exclusive
                      onChange={(_, val) => val !== null && setHistoryRange(val)}
                      size="small"
                      disabled={isImported}
                    >
                      {TIME_RANGES.map((r) => (
                        <ToggleButton key={r.minutes} value={r.minutes}>
                          {r.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Stack>
                }
              />
            </Card>

            <Grid container spacing={2}>
              <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
                <HistoryChart
                  data={historyData}
                  rangeMinutes={historyRange}
                  title="Worker Utilization %"
                  icon={<Speed color="primary" />}
                >
                  {(data, t) => (
                    <LineChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickMargin={4} unit="%" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: t.palette.background.paper,
                          border: `1px solid ${t.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="HttpUtilizationPct" name="HTTP" stroke={t.palette.primary.main} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="BgUtilizationPct" name="Background" stroke={t.palette.warning.main} strokeWidth={2} dot={false} />
                    </LineChart>
                  )}
                </HistoryChart>
              </Grid>
              <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
                <HistoryChart
                  data={historyData}
                  rangeMinutes={historyRange}
                  title="Invocations / Interval"
                  icon={<PlayArrow color="primary" />}
                >
                  {(data, t) => (
                    <BarChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} />
                      <YAxis tick={{ fontSize: 11 }} tickMargin={4} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: t.palette.background.paper,
                          border: `1px solid ${t.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                      <Legend />
                      <Bar dataKey="HttpInvocations" name="HTTP" fill={t.palette.primary.main} />
                      <Bar dataKey="BgInvocations" name="Background" fill={t.palette.warning.main} />
                    </BarChart>
                  )}
                </HistoryChart>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
                <HistoryChart
                  data={historyData}
                  rangeMinutes={historyRange}
                  title="Memory Usage (MB)"
                  icon={<Memory color="primary" />}
                >
                  {(data, t) => (
                    <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} />
                      <YAxis tick={{ fontSize: 11 }} tickMargin={4} unit="MB" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: t.palette.background.paper,
                          border: `1px solid ${t.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="ContainerUsedMB" name="Container Total" fill={t.palette.error.light} stroke={t.palette.error.main} fillOpacity={0.15} />
                      <Area type="monotone" dataKey="RssMB" name="App RSS" fill={t.palette.warning.light} stroke={t.palette.warning.main} fillOpacity={0.2} />
                      <Area type="monotone" dataKey="OtherRssMB" name="Other (sshd, sidecar...)" fill={t.palette.info.light} stroke={t.palette.info.main} fillOpacity={0.2} />
                      <Area type="monotone" dataKey="HeapMB" name="GC Heap" fill={t.palette.primary.light} stroke={t.palette.primary.main} fillOpacity={0.3} />
                      <Area type="monotone" dataKey="CommittedMB" name="Committed" fill={t.palette.success.light} stroke={t.palette.success.main} fillOpacity={0.1} />
                    </AreaChart>
                  )}
                </HistoryChart>
              </Grid>
              <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
                <HistoryChart
                  data={historyData}
                  rangeMinutes={historyRange}
                  title="CPU Usage %"
                  icon={<Speed color="primary" />}
                >
                  {(data, t) => (
                    <LineChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickMargin={4} unit="%" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: t.palette.background.paper,
                          border: `1px solid ${t.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="ContainerCpuPct" name="Container CPU" stroke={t.palette.error.main} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="CpuPct" name="App CPU" stroke={t.palette.secondary.main} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="OtherCpuPct" name="Other CPU" stroke={t.palette.info.main} strokeWidth={2} strokeDasharray="4 2" dot={false} />
                    </LineChart>
                  )}
                </HistoryChart>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
                <HistoryChart
                  data={historyData}
                  rangeMinutes={historyRange}
                  title="Job Queue Depth"
                  icon={<HourglassEmpty color="primary" />}
                >
                  {(data, t) => (
                    <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} />
                      <YAxis tick={{ fontSize: 11 }} tickMargin={4} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: t.palette.background.paper,
                          border: `1px solid ${t.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="JobsQueued" name="Queued" fill={t.palette.info.light} stroke={t.palette.info.main} fillOpacity={0.3} />
                      <Area type="monotone" dataKey="JobsRunning" name="Running" fill={t.palette.success.light} stroke={t.palette.success.main} fillOpacity={0.3} />
                    </AreaChart>
                  )}
                </HistoryChart>
              </Grid>
              <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
                <HistoryChart
                  data={historyData}
                  rangeMinutes={historyRange}
                  title="Faults & Avg Duration"
                  icon={<Warning color="primary" />}
                >
                  {(data, t) => (
                    <LineChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.palette.divider} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} />
                      <YAxis yAxisId="faults" tick={{ fontSize: 11 }} tickMargin={4} />
                      <YAxis yAxisId="duration" orientation="right" tick={{ fontSize: 11 }} tickMargin={4} unit="ms" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: t.palette.background.paper,
                          border: `1px solid ${t.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                      <Legend />
                      <Line yAxisId="faults" type="monotone" dataKey="HttpFaults" name="HTTP Faults" stroke={t.palette.error.main} strokeWidth={2} dot={false} />
                      <Line yAxisId="faults" type="monotone" dataKey="BgFaults" name="BG Faults" stroke={t.palette.error.light} strokeWidth={2} dot={false} />
                      <Line yAxisId="duration" type="monotone" dataKey="HttpAvgDurationMs" name="HTTP Avg Duration" stroke={t.palette.primary.light} strokeWidth={1} strokeDasharray="5 5" dot={false} />
                      <Line yAxisId="duration" type="monotone" dataKey="BgAvgDurationMs" name="BG Avg Duration" stroke={t.palette.warning.light} strokeWidth={1} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  )}
                </HistoryChart>
              </Grid>
            </Grid>

            {/* ── TestData Cache Diagnostics ── */}
            {(() => {
              const diag = cacheDiagQuery.data?.Results;
              if (!diag) return null;
              const types = diag.TypeBreakdown ?? [];
              const trackedMB = diag.TrackedTotalMB ?? 0;
              const maxMB = diag.MaxMB ?? 0;
              const memPct = maxMB > 0 ? (trackedMB / maxMB) * 100 : 0;
              const totalReads = (diag.Hits ?? 0) + (diag.Misses ?? 0);
              const fmtUtc = (s) => (s ? new Date(s).toLocaleString() : "—");

              const cacheStats = [
                { k: "Hits", v: (diag.Hits ?? 0).toLocaleString() },
                { k: "Misses", v: (diag.Misses ?? 0).toLocaleString() },
                {
                  k: "Hit Rate",
                  v: `${diag.HitRate ?? 0}%`,
                  w: totalReads > 100 && diag.HitRate < 50,
                },
                {
                  k: "Evictions",
                  v: (diag.Evictions ?? 0).toLocaleString(),
                  w: (diag.Evictions ?? 0) > 0,
                },
                {
                  k: "Oversized",
                  v: (diag.Oversized ?? 0).toLocaleString(),
                  w: (diag.Oversized ?? 0) > 0,
                  tip: "Values that exceeded the per-entry size cap and were silently dropped — they were never cached.",
                },
                { k: "Accesses", v: (diag.AccessCount ?? 0).toLocaleString() },
                {
                  k: "TTL",
                  v: `${diag.TtlSeconds ?? 0}s`,
                  tip: `Earliest expiry: ${fmtUtc(diag.EarliestExpiryUtc)} • Latest expiry: ${fmtUtc(diag.LatestExpiryUtc)}`,
                },
              ];

              return (
                <Card>
                  <CardHeader
                    title="TestData Cache"
                    titleTypographyProps={{ variant: "h6" }}
                    subheader={`${diag.ActiveEntries ?? 0} active / ${diag.ExpiredEntries ?? 0} expired — ${diag.EstimatedTotalMB ?? 0} MB estimated`}
                    action={
                      <Chip
                        label={`${diag.TotalEntries ?? 0} entries`}
                        color={diag.TotalEntries > 5000 ? "error" : diag.TotalEntries > 1000 ? "warning" : "success"}
                        size="small"
                      />
                    }
                  />
                  <CardContent sx={{ pt: 0, pb: types.length > 0 ? 2 : "12px !important" }}>
                    {/* Capacity bar */}
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Capacity
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {trackedMB} / {maxMB} MB ({Math.round(memPct)}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(memPct, 100)}
                        color={memPct > 85 ? "error" : memPct > 70 ? "warning" : "primary"}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    {/* Stats row */}
                    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2, rowGap: 1 }}>
                      {cacheStats.map((s) => {
                        const cell = (
                          <Box sx={{ minWidth: 80 }}>
                            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
                              {s.k}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={s.w ? "error.main" : "text.primary"}
                              lineHeight={1.3}
                            >
                              {s.v}
                            </Typography>
                          </Box>
                        );
                        if (s.tip) {
                          return (
                            <Tooltip key={s.k} title={s.tip} arrow>
                              {cell}
                            </Tooltip>
                          );
                        }
                        return <Fragment key={s.k}>{cell}</Fragment>;
                      })}
                    </Stack>
                  </CardContent>
                  {types.length > 0 && (
                    <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                      <TableContainer sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Data Type</TableCell>
                              <TableCell align="right">Tenants</TableCell>
                              <TableCell align="right">Items</TableCell>
                              <TableCell align="right">Est. MB</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {types.map((t) => (
                              <TableRow key={t.Type}>
                                <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{t.Type}</TableCell>
                                <TableCell align="right">{t.EntryCount}</TableCell>
                                <TableCell align="right">{t.TotalItems?.toLocaleString()}</TableCell>
                                <TableCell align="right">{t.TotalMB}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  )}
                </Card>
              );
            })()}

            {/* ── Startup Timing (bottom) ── */}
            <StartupTimingBar startup={startupInfo} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
