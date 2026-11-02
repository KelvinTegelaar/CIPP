// Shapes the ListCAPolicyImpact response (sign-ins per UTC day, split by a policy's own evaluation
// result) into what the usage report drawer renders. Pure functions so they can be unit tested.

export const CA_IMPACT_RESULTS = {
  success: { label: 'Success', color: 'success', reportOnly: false },
  failure: { label: 'Failure', color: 'error', reportOnly: false },
  notApplied: { label: 'Not applied', color: 'neutral', reportOnly: false },
  notEnabled: { label: 'Not enabled', color: 'neutral', reportOnly: false },
  unknown: { label: 'Unknown', color: 'neutral', reportOnly: false },
  reportOnlySuccess: {
    label: 'Report-only: Success',
    color: 'success',
    reportOnly: true,
  },
  reportOnlyFailure: {
    label: 'Report-only: Failure',
    color: 'error',
    reportOnly: true,
  },
  reportOnlyInterrupted: {
    label: 'Report-only: User action required',
    color: 'warning',
    reportOnly: true,
  },
  reportOnlyNotApplied: {
    label: 'Report-only: Not applied',
    color: 'neutral',
    reportOnly: true,
  },
}

// Results where the policy applied but its controls were not met. These are the sign-ins the
// portal lists as samples, and the ones worth drilling into.
export const CA_IMPACT_NOT_MET_RESULTS = [
  'failure',
  'reportOnlyFailure',
  'reportOnlyInterrupted',
]

// The API reads a 30 day window in ten day segments so the newest days can show first.
export const CA_IMPACT_SEGMENT_DAYS = 10

const PRIMARY_RESULTS_BY_STATE = {
  enabled: ['success', 'failure', 'notApplied'],
  enabledForReportingButNotEnforced: [
    'reportOnlySuccess',
    'reportOnlyFailure',
    'reportOnlyInterrupted',
    'reportOnlyNotApplied',
  ],
  disabled: ['notEnabled'],
}

const toCount = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toPercent = (value, total) => {
  const denominator = toCount(total)
  if (denominator <= 0) return 0
  return Math.round((toCount(value) / denominator) * 1000) / 10
}

export const getImpactResultLabel = (key) =>
  CA_IMPACT_RESULTS[key]?.label ?? key ?? 'Unknown'

export const getImpactResultColor = (key) =>
  CA_IMPACT_RESULTS[key]?.color ?? 'neutral'

export const getImpactSegmentCount = (days) =>
  Math.max(1, Math.ceil(toCount(days) / CA_IMPACT_SEGMENT_DAYS))

/**
 * Which results to chart for a policy. The policy's current state picks the primary set (enforced
 * policies show success/failure/not applied, report-only ones show the report-only results). Any
 * other result that still has sign-ins in the window is appended, because a policy can change state
 * mid-window and those sign-ins should not vanish from the totals.
 */
export const getImpactResultKeys = (state, totals = {}) => {
  const primary =
    PRIMARY_RESULTS_BY_STATE[state] ?? PRIMARY_RESULTS_BY_STATE.enabled
  const extras = Object.keys(CA_IMPACT_RESULTS).filter(
    (key) => !primary.includes(key) && toCount(totals?.[key]) > 0
  )
  return [...primary, ...extras]
}

export const formatImpactDay = (isoDay) => {
  if (!isoDay) return ''
  const date = new Date(`${isoDay}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return isoDay
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Folds the segments of one window into a single report. Segments are the Results objects the API
 * returned for Segment 0, 1, 2 of the same policy and window, in any order, with holes for segments
 * that have not arrived yet. Neighbouring segments share a UTC date at their boundary, so day rows
 * with the same date are summed rather than deduplicated.
 */
export const mergeImpactSegments = (segments = []) => {
  const present = (Array.isArray(segments) ? segments : []).filter(
    (segment) =>
      segment && typeof segment === 'object' && Array.isArray(segment.days)
  )
  if (present.length === 0) return null

  const first = present[0]
  const byDate = new Map()
  const totals = {}
  const samples = []
  const partialReasons = []
  let signInCount = 0
  let partial = false
  let oldestSignInSeen = null

  for (const segment of present) {
    for (const row of segment.days) {
      if (!row?.date) continue
      const merged = byDate.get(row.date) ?? { date: row.date }
      for (const [key, value] of Object.entries(row)) {
        if (key === 'date') continue
        merged[key] = toCount(merged[key]) + toCount(value)
      }
      byDate.set(row.date, merged)
    }
    for (const [key, value] of Object.entries(segment.totals ?? {})) {
      totals[key] = toCount(totals[key]) + toCount(value)
    }
    if (Array.isArray(segment.samples)) samples.push(...segment.samples)
    signInCount += toCount(segment.signInCount)
    if (segment.partial) partial = true
    if (segment.partialReason) partialReasons.push(segment.partialReason)
    if (
      segment.oldestSignInSeen &&
      (!oldestSignInSeen || segment.oldestSignInSeen < oldestSignInSeen)
    ) {
      oldestSignInSeen = segment.oldestSignInSeen
    }
  }

  const days = [...byDate.values()].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  )
  samples.sort((a, b) =>
    (a?.createdDateTime ?? '') < (b?.createdDateTime ?? '')
      ? 1
      : (a?.createdDateTime ?? '') > (b?.createdDateTime ?? '')
        ? -1
        : 0
  )

  return {
    id: first.id,
    displayName: first.displayName,
    state: first.state,
    windowDays: first.windowDays,
    source: first.source,
    loadedSegments: present.length,
    signInCount,
    partial,
    partialReason:
      partialReasons.length > 0
        ? [...new Set(partialReasons)].join('; ')
        : null,
    oldestSignInSeen,
    days,
    totals,
    samples,
  }
}

/**
 * Stacked series for the daily chart. One series per result key, one point per day, in the order
 * the backend returned the days. With percent set each point is that result's share of the day's
 * total, so quiet days chart as zero rather than dividing by zero.
 */
export const buildImpactChart = (
  days = [],
  keys = [],
  { percent = false, formatLabel } = {}
) => {
  const rows = Array.isArray(days) ? days : []
  const labels = rows.map((row) =>
    formatLabel ? formatLabel(row.date) : row.date
  )
  const series = keys.map((key) => ({
    name: getImpactResultLabel(key),
    data: rows.map((row) =>
      percent ? toPercent(row?.[key], row?.total) : toCount(row?.[key])
    ),
  }))
  return { labels, series }
}

/**
 * Totals row: count and share of all evaluated sign-ins for each result key.
 */
export const summarizeImpact = (totals = {}, keys = []) =>
  keys.map((key) => ({
    key,
    label: getImpactResultLabel(key),
    color: getImpactResultColor(key),
    count: toCount(totals?.[key]),
    percent: toPercent(totals?.[key], totals?.total),
  }))

export const filterImpactSamples = (samples = [], day) => {
  const rows = Array.isArray(samples) ? samples : []
  if (!day) return rows
  return rows.filter((sample) => sample?.day === day)
}
