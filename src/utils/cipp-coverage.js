// Pure helpers for the V2 audit-log coverage views (KPIs, time-series charts, per-tenant heatmap).
// All aggregation is derived client-side from the rows ListAuditLogCoverage returns.

export const NON_TERMINAL = ["Planned", "Created", "Downloaded"];

export const STATE_LABELS = {
  Processed: "Processed",
  InFlight: "In-flight",
  Retrying: "Retrying / delayed",
  DeadLetter: "Dead-letter",
  Skipped: "Skipped",
  Gap: "Gap",
};

// Candidate bucket sizes (minutes), smallest first. buildBuckets picks the smallest that keeps
// the column count within `target` so the heatmap/charts stay readable across 1h .. 30d periods.
const BUCKET_CHOICES = [30, 60, 120, 180, 360, 720, 1440];

export const toMs = (v) => {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
};

export function pickBucketMinutes(spanMinutes, target = 40) {
  for (const m of BUCKET_CHOICES) {
    if (spanMinutes / m <= target) return m;
  }
  return BUCKET_CHOICES[BUCKET_CHOICES.length - 1];
}

export function buildBuckets(rows, target = 40) {
  const starts = [];
  const ends = [];
  for (const r of rows) {
    const s = toMs(r.WindowStart);
    if (s != null) {
      starts.push(s);
      ends.push(toMs(r.WindowEnd) ?? s);
    }
  }
  if (!starts.length) return null;
  const min = Math.min(...starts);
  const max = Math.max(...ends);
  const spanMin = Math.max(30, (max - min) / 60000);
  const bucketMin = pickBucketMinutes(spanMin, target);
  const bucketMs = bucketMin * 60000;
  const startMs = Math.floor(min / bucketMs) * bucketMs;
  const count = Math.max(1, Math.ceil((max - startMs + 1) / bucketMs));
  return { startMs, bucketMs, bucketMin, count };
}

export function bucketIndexOf(ms, b) {
  if (ms == null || !b) return -1;
  const i = Math.floor((ms - b.startMs) / b.bucketMs);
  if (i < 0) return -1;
  return Math.min(i, b.count - 1);
}

export function bucketStartMs(i, b) {
  return b.startMs + i * b.bucketMs;
}

// Single-row health classification (current state, not history - retries that recovered read green).
export function classifyRow(r) {
  if (r.State === "DeadLetter") return "DeadLetter";
  if (NON_TERMINAL.includes(r.State) && Number(r.Attempts) > 0) return "Retrying";
  if (NON_TERMINAL.includes(r.State)) return "InFlight";
  if (r.State === "Processed") return "Processed";
  if (r.State === "Skipped") return "Skipped";
  return "Processed";
}

// Worst (most severe) classification across a cell's rows.
export function classifyCell(rows) {
  if (!rows.length) return "Empty";
  const order = ["DeadLetter", "Retrying", "InFlight", "Processed", "Skipped"];
  const present = new Set(rows.map(classifyRow));
  for (const s of order) {
    if (present.has(s)) return s;
  }
  return "Processed";
}

export function latencyMinutes(r) {
  const we = toMs(r.WindowEnd);
  const c = toMs(r.CreatedUtc);
  const d = toMs(r.DownloadedUtc);
  const p = toMs(r.ProcessedUtc);
  return {
    create: we != null && c != null ? (c - we) / 60000 : null,
    download: c != null && d != null ? (d - c) / 60000 : null,
    process: d != null && p != null ? (p - d) / 60000 : null,
    total: we != null && p != null ? (p - we) / 60000 : null,
  };
}

const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Per-tenant grid of bucket states. Interior empty buckets (between a tenant's first and last
// window) become "Gap"; auditing-disabled tenants (only Skipped rows) render fully Skipped.
export function tenantGrid(rows, b) {
  const byTenant = new Map();
  for (const r of rows) {
    const key = r.Tenant || r.TenantId || "?";
    if (!byTenant.has(key)) byTenant.set(key, []);
    byTenant.get(key).push(r);
  }
  const out = [];
  for (const [name, tRows] of byTenant) {
    const cells = Array.from({ length: b.count }, () => []);
    for (const r of tRows) {
      const i = bucketIndexOf(toMs(r.WindowStart), b);
      if (i >= 0) cells[i].push(r);
    }
    const onlySkipped = tRows.length > 0 && tRows.every((r) => r.State === "Skipped");
    const occ = cells.map((c) => c.length > 0);
    const first = occ.indexOf(true);
    const last = occ.lastIndexOf(true);
    const states = cells.map((c, i) => {
      if (c.length) return classifyCell(c);
      if (onlySkipped) return "Skipped";
      if (first !== -1 && i > first && i < last) return "Gap";
      return "Empty";
    });
    out.push({ name, cells, states });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

// One column per distinct regular-window start time. Tenants create windows on the same cadence,
// so columns line up across tenants - this lets the heatmap show every window individually rather
// than bucketing several into one cell.
export function windowColumns(rows) {
  const set = new Set();
  for (const r of rows) {
    if (r.Type === "Reconciliation" || r.Type === "Manual") continue;
    const s = toMs(r.WindowStart);
    if (s != null) set.add(s);
  }
  return Array.from(set).sort((a, b) => a - b);
}

// Per-tenant state for each window column. Missing interior columns (a tenant has windows before
// and after this one but not at it) are gaps; auditing-disabled tenants (only Skipped) render Skipped.
export function tenantWindowGrid(rows, columns) {
  const colIndex = new Map();
  columns.forEach((ms, i) => colIndex.set(ms, i));
  const byTenant = new Map();
  for (const r of rows) {
    if (r.Type === "Reconciliation" || r.Type === "Manual") continue;
    const key = r.Tenant || r.TenantId || "?";
    if (!byTenant.has(key)) byTenant.set(key, []);
    byTenant.get(key).push(r);
  }
  const out = [];
  for (const [name, tRows] of byTenant) {
    const cells = Array.from({ length: columns.length }, () => []);
    for (const r of tRows) {
      const i = colIndex.get(toMs(r.WindowStart));
      if (i != null) cells[i].push(r);
    }
    const onlySkipped = tRows.length > 0 && tRows.every((r) => r.State === "Skipped");
    const occ = cells.map((c) => c.length > 0);
    const first = occ.indexOf(true);
    const last = occ.lastIndexOf(true);
    const states = cells.map((c, i) => {
      if (c.length) return classifyCell(c);
      if (onlySkipped) return "Skipped";
      if (first !== -1 && i > first && i < last) return "Gap";
      return "Empty";
    });
    out.push({ name, cells, states });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export function summarize(rows) {
  const num = (v) => Number(v) || 0;
  // Manual ad-hoc searches aren't pipeline coverage windows - exclude from dashboard stats.
  rows = (rows || []).filter((r) => r.Type !== "Manual");
  const total = rows.length;
  const processed = rows.filter((r) => r.State === "Processed").length;
  const deadletter = rows.filter((r) => r.State === "DeadLetter").length;
  const skipped = rows.filter((r) => r.State === "Skipped").length;
  const retriedWindows = rows.filter((r) => num(r.RetryCount) > 0).length;
  const throttleEvents = rows.reduce((a, r) => a + num(r.ThrottleCount), 0);
  const totalRecords = rows.reduce((a, r) => a + num(r.RecordCount), 0);
  const matched = rows.reduce((a, r) => a + num(r.MatchedCount), 0);
  const lat = rows
    .filter((r) => r.Type !== "Reconciliation" && r.State === "Processed")
    .map((r) => latencyMinutes(r).total)
    .filter((v) => v != null && v >= 0);
  const recon = rows.filter((r) => r.Type === "Reconciliation");
  let gaps = 0;
  const cols = windowColumns(rows);
  if (cols.length) {
    for (const t of tenantWindowGrid(rows, cols)) gaps += t.states.filter((s) => s === "Gap").length;
  }
  return {
    total,
    processed,
    deadletter,
    skipped,
    retriedWindows,
    throttleEvents,
    totalRecords,
    matched,
    medianLatency: median(lat),
    reconTotal: recon.length,
    reconProcessed: recon.filter((r) => r.State === "Processed").length,
    gaps,
  };
}
