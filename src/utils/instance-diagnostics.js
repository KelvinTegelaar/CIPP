// Pure helpers for the Diagnostics tab — kept dependency-free so they're cheap to unit test.

// Backend check ids are machine-readable slugs; map the known ones to readable labels.
// Unknown ids (future checks) pass through unchanged.
export const CHECK_LABELS = {
  oom: "Out of memory",
  "heap-headroom": "Heap headroom",
  watchdog: "Watchdog restarts",
  "pool-exhausted": "HTTP worker pool",
  "stalled-runs": "Stalled runs",
  "api-clients": "API clients",
  egress: "API egress",
  restarts: "Container restarts",
  orchestrator: "Orchestrator",
  "container-log": "Platform container log",
};
export const getCheckLabel = (id) => CHECK_LABELS[id] ?? id;

// Sums Clients[].Count across every Timeline bucket, grouped by AppId.
export const aggregateDiagnosticsClients = (buckets) => {
  const totals = new Map();
  for (const bucket of buckets ?? []) {
    for (const client of bucket?.Clients ?? []) {
      if (!client?.AppId) continue;
      const existing = totals.get(client.AppId) ?? {
        AppId: client.AppId,
        AppName: client.AppName,
        IP: client.IP,
        Count: 0,
      };
      existing.Count += Number(client.Count) || 0;
      if (client.AppName) existing.AppName = client.AppName;
      if (client.IP) existing.IP = client.IP;
      totals.set(client.AppId, existing);
    }
  }
  const rows = Array.from(totals.values()).sort((a, b) => b.Count - a.Count);
  const grandTotal = rows.reduce((sum, r) => sum + r.Count, 0);
  return rows.map((r) => ({
    ...r,
    SharePct: grandTotal > 0 ? Math.round((r.Count / grandTotal) * 1000) / 10 : 0,
  }));
};

// FAIL, WARN, INFO, PASS — worst first.
const STATUS_ORDER = { FAIL: 0, WARN: 1, INFO: 2, PASS: 3 };
export const sortDiagnosticsChecks = (checks) =>
  [...(checks ?? [])].sort(
    (a, b) => (STATUS_ORDER[a.Status] ?? 99) - (STATUS_ORDER[b.Status] ?? 99)
  );

// Stacked-bar series for a Health Timeline strip: the top N clients by total value over the
// window get their own series, everything else is folded into "Other".
// `order` pins leading series to a caller-supplied AppId order so a client keeps the same
// colour across strips; `bucketKey`/`valueKey` pick the bucket timestamp and the value to sum.
export const buildStackedSeries = (
  buckets,
  { bucketKey = "Bucket", valueKey = "Count", topN = 4, order } = {}
) => {
  const totals = new Map();
  for (const bucket of buckets ?? []) {
    for (const client of bucket?.Clients ?? []) {
      if (!client?.AppId) continue;
      const existing = totals.get(client.AppId) ?? {
        AppId: client.AppId,
        AppName: client.AppName,
        Total: 0,
      };
      existing.Total += Number(client[valueKey]) || 0;
      if (client.AppName) existing.AppName = client.AppName;
      totals.set(client.AppId, existing);
    }
  }

  const ordered = [];
  for (const appId of order ?? []) {
    const client = totals.get(appId);
    if (client) ordered.push(client);
  }
  const rest = Array.from(totals.values())
    .filter((c) => !ordered.includes(c))
    .sort((a, b) => b.Total - a.Total);
  const topClients = ordered.concat(rest).slice(0, topN);
  const topIds = new Set(topClients.map((c) => c.AppId));

  const data = (buckets ?? []).map((bucket) => {
    const row = { Bucket: bucket[bucketKey] };
    for (const id of topIds) row[id] = 0;
    let other = 0;
    for (const client of bucket?.Clients ?? []) {
      if (!client?.AppId) continue;
      const value = Number(client[valueKey]) || 0;
      if (topIds.has(client.AppId)) {
        row[client.AppId] += value;
      } else {
        other += value;
      }
    }
    if (other > 0) row.Other = other;
    return row;
  });

  return { data, series: topClients.map((c) => ({ AppId: c.AppId, AppName: c.AppName || c.AppId })) };
};

export const buildRequestSeries = (buckets, topN = 4) => buildStackedSeries(buckets, { topN });

// Human-readable byte size, one decimal place, B/KB/MB/GB.
export const formatBytes = (bytes) => {
  const n = Number(bytes) || 0;
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n.toFixed(1)} B`;
};

// Deep-link query for the Logs tab, scoped to one API client's calls in the current window.
export const buildClientLogQuery = (appId, hoursWindow) =>
  `search all files\n| where Message contains "AppId=${appId}"\n| where Timestamp > ago(${hoursWindow}h)\n| take 1000\n| sort by Timestamp desc`;
