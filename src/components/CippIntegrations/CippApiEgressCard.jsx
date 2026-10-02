import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/system";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ApiGetCall } from "../../api/ApiCall";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";

// Authoritative per-client API egress from Craft's CraftEgressAccounting table (via /api/ListApiEgress):
// a used-of-cap gauge for the instance total, a stacked-by-client trend over the selected window, and
// today's top endpoints for all API clients, one client, or signed-in users (tracked, never capped).
// Shows a notice instead when accounting is off / not hosted.

const RANGE_OPTIONS = [
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 },
];

const formatBytes = (b) => {
  if (b == null) return "-";
  if (b >= 1073741824) return `${(b / 1073741824).toFixed(2)} GB`;
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
};

const formatBucketTime = (iso, hours) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  if (hours > 48) return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${hh}:${mm}`;
  return `${hh}:${mm}`;
};

export const CippApiEgressCard = () => {
  const theme = useTheme();
  const [hours, setHours] = useState(24);
  const [endpointSource, setEndpointSource] = useState("all");

  const query = ApiGetCall({
    url: "/api/ListApiEgress",
    data: { Hours: String(hours) },
    queryKey: `ApiEgressUsage-${hours}`,
  });
  const r = query.data?.Results;

  const palette = useMemo(
    () => [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
    ],
    [theme]
  );

  // Stacked chart rows: bytes -> MB per client per bucket.
  const chartData = useMemo(() => {
    const ids = r?.ClientIds ?? [];
    return (r?.Trend ?? []).map((bucket) => {
      const row = {
        time: formatBucketTime(bucket.BucketStartUtc, hours),
        topEndpoints: bucket.TopEndpoints ?? [],
      };
      ids.forEach((id) => {
        row[id] = Math.round(((bucket[id] ?? 0) / 1048576) * 100) / 100;
      });
      return row;
    });
  }, [r, hours]);

  const endpointSources = useMemo(
    () => [
      { value: "all", label: "All API clients", endpoints: r?.Endpoints ?? [] },
      ...(r?.Clients ?? []).map((c) => ({
        value: c.AppId,
        label: c.Name,
        endpoints: c.Endpoints ?? [],
      })),
      ...(r?.Interactive
        ? [
            {
              value: "interactive",
              label: "Signed-in users (not capped)",
              endpoints: r.Interactive.Endpoints ?? [],
            },
          ]
        : []),
    ],
    [r]
  );
  const selectedSource =
    endpointSources.find((s) => s.value === endpointSource) ?? endpointSources[0];
  const endpointRows = useMemo(
    () =>
      selectedSource.endpoints.map((e) => ({
        Endpoint: e.Endpoint,
        Egress: formatBytes(e.Bytes),
        Requests: e.Requests,
        AvgSize: formatBytes(e.AvgBytes),
        MaxSize: formatBytes(e.MaxBytes),
        CacheHitPct: e.Requests > 0 ? Math.round((e.CacheHits / e.Requests) * 100) : 0,
        Errors: e.Errors,
        Shed: e.Shed,
      })),
    [selectedSource]
  );

  if (query.isSuccess && !r?.Enabled) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            API egress accounting is not enabled on this instance.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const clientIds = r?.ClientIds ?? [];
  const capBytes = r?.CapBytes ?? 0;
  const pct = r?.PctOfCap ?? (capBytes > 0 ? Math.round(((r?.BytesToday ?? 0) / capBytes) * 100) : 0);
  const capReached = r?.CapReachedUtc != null;
  const gaugeColor = capReached
    ? theme.palette.error.main
    : pct >= 80
    ? theme.palette.warning.main
    : theme.palette.success.main;
  const gaugeData = [{ name: "used", value: Math.min(100, Math.max(0, pct)), fill: gaugeColor }];

  return (
    <Card>
      <CardHeader
        title="API Egress"
        slotProps={{ title: { variant: "h6" } }}
        action={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={hours}
            onChange={(e, v) => v && setHours(v)}
          >
            {RANGE_OPTIONS.map((o) => (
              <ToggleButton key={o.hours} value={o.hours}>
                {o.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          {/* ── Used-of-cap gauge / total ── */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack alignItems="center" spacing={0.5}>
              {capBytes > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={gaugeData}
                      startAngle={220}
                      endAngle={-40}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" background cornerRadius={8} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <Typography variant="h5" sx={{ mt: -6, mb: 3 }}>
                    {pct}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatBytes(r?.BytesToday)} of {formatBytes(capBytes)} today
                  </Typography>
                </>
              ) : (
                <Stack alignItems="center" spacing={0.5} sx={{ py: 4 }}>
                  <Typography variant="h5">{formatBytes(r?.BytesToday)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    used today (accounting only, no cap)
                  </Typography>
                </Stack>
              )}
              {capReached && (
                <Typography variant="caption" color="error">
                  Cap reached - requests shed with 429 ({r?.ShedRequests} today)
                </Typography>
              )}
              {!capReached && r?.ShedRequests > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {r.ShedRequests} shed today
                </Typography>
              )}
              {r?.Interactive && (
                <Typography variant="caption" color="text.secondary">
                  Signed-in users: {formatBytes(r.Interactive.Bytes)} across{" "}
                  {r.Interactive.Requests} requests (not capped)
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* ── Stacked per-client trend ── */}
          <Grid size={{ xs: 12, md: 8 }}>
            {chartData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No egress recorded in this window yet.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} minTickGap={24} />
                  <YAxis tick={{ fontSize: 11 }} tickMargin={4} unit="MB" />
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} MB`, r?.ClientNames?.[name] ?? name]}
                    labelFormatter={(label, payload) => {
                      const top = payload?.[0]?.payload?.topEndpoints ?? [];
                      return top.length
                        ? `${label} - top: ${top
                            .map((e) => `${e.Endpoint} ${formatBytes(e.Bytes)}`)
                            .join(", ")}`
                        : label;
                    }}
                  />
                  <Legend formatter={(name) => r?.ClientNames?.[name] ?? name} />
                  {clientIds.map((id, i) => (
                    <Area
                      key={id}
                      type="monotone"
                      dataKey={id}
                      name={id}
                      stackId="egress"
                      stroke={palette[i % palette.length]}
                      fill={palette[i % palette.length]}
                      fillOpacity={0.5}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Grid>

          {/* ── Today's top endpoints ── */}
          <Grid size={{ xs: 12 }}>
            <CippAutoComplete
              creatable={false}
              disableClearable
              multiple={false}
              size="small"
              label="Endpoints for"
              options={endpointSources.map(({ value, label }) => ({ value, label }))}
              value={{ value: selectedSource.value, label: selectedSource.label }}
              onChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                if (next?.value) setEndpointSource(next.value);
              }}
              sx={{ minWidth: 260, maxWidth: 400, mb: 1 }}
            />
            <CippDataTable
              noCard
              title="Top endpoints today"
              data={endpointRows}
              isFetching={query.isFetching}
              queryKey="ApiEgressEndpointsTable"
              simpleColumns={[
                "Endpoint",
                "Egress",
                "Requests",
                "AvgSize",
                "MaxSize",
                "CacheHitPct",
                "Errors",
                "Shed",
              ]}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CippApiEgressCard;
