import { useMemo } from 'react'
import { ApiGetCall } from '../../api/ApiCall.jsx'

// Some CIPP endpoints return a bare array, others wrap in { Results: [...] }. Normalise both.
export const asArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.Results)) return payload.Results
  return []
}

const daysUntil = (value) => {
  if (!value) return null
  const end = new Date(value)
  if (Number.isNaN(end.getTime())) return null
  return Math.floor((end.getTime() - Date.now()) / 86400000)
}

const hoursSince = (value) => {
  if (!value) return null
  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return null
  return (Date.now() - then.getTime()) / 3600000
}

const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0)

/**
 * Latest-score summary plus portfolio trend from ListSecureScoreReport rows. Pure so the dashboard
 * card and the full-page All Tenants secure score view derive identical numbers from one shape.
 * `displayNameByDomain` is only a fallback — the endpoint already resolves TenantName for tenants
 * it still knows about.
 */
export const deriveSecureScoreSummary = (rows, displayNameByDomain = new Map()) => {
  const empty = {
    average: 0,
    best: null,
    worst: null,
    scored: 0,
    trend: [],
    delta: null,
    ranked: [],
  }
  if (!rows.length) return empty

  const scored = rows.filter((row) => Number(row?.MaxScore) > 0)
  if (!scored.length) return empty

  const withNames = scored.map((row) => ({
    tenant: row.Tenant,
    name: row.TenantName || displayNameByDomain.get(row.Tenant) || row.Tenant,
    percent: Number(row.PercentageScore ?? 0),
    current: Number(row.CurrentScore ?? 0),
    max: Number(row.MaxScore ?? 0),
  }))

  const sorted = [...withNames].sort((a, b) => a.percent - b.percent)

  // Portfolio trend: average the per-tenant percentage for each captured day. Each day is averaged
  // only over the tenants that actually reported it, so a tenant that started reporting mid-window
  // does not drag the earlier points down.
  const byDate = new Map()
  scored.forEach((row) => {
    ;(row.History ?? []).forEach((point) => {
      const date = String(point?.Date ?? '').slice(0, 10)
      if (!date) return
      const entry = byDate.get(date) ?? { total: 0, count: 0 }
      entry.total += Number(point?.PercentageScore ?? 0)
      entry.count += 1
      byDate.set(date, entry)
    })
  })

  const trend = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      date,
      percent: value.count ? Math.round((value.total / value.count) * 10) / 10 : 0,
    }))

  const delta =
    trend.length > 1
      ? Math.round((trend[trend.length - 1].percent - trend[0].percent) * 10) / 10
      : null

  return {
    average: Math.round(withNames.reduce((sum, row) => sum + row.percent, 0) / withNames.length),
    worst: sorted[0],
    best: sorted[sorted.length - 1],
    scored: withNames.length,
    trend,
    delta,
    // Every scored tenant, worst first — the full-page view's leaderboards slice this.
    ranked: sorted,
  }
}

// Headline collections for the Portfolio info bar. Three, so that with the tenant count they fill
// CippInfoBar's four-across grid exactly — its divider rules assume four items. Each tile links
// through to the corresponding list page.
const SCALE_TYPES = [
  { type: 'Users', label: 'Users' },
  { type: 'Mailboxes', label: 'Mailboxes' },
  { type: 'ManagedDevices', label: 'Managed devices' },
]

/**
 * Every read the All Tenants dashboard performs, plus the derivations each card needs.
 *
 * Deliberately built only from endpoints that a baseline `readonly` user can call, and only from
 * data that was reduced to a number before the request arrived (test results, alignment scores,
 * cache count rows). Nothing here hydrates per-user or per-device records across the estate.
 */

export const useAllTenantsDashboard = () => {
  const tenantsApi = ApiGetCall({
    url: '/api/ListTenants',
    queryKey: 'AllTenantsDashboard-Tenants',
    waiting: true,
  })

  // summary returns the estate roll-up only. The row list is one entry per tenant per standard, and
  // this card renders four bucket counts, an average, four low scorers and two pending totals.
  const alignmentApi = ApiGetCall({
    url: '/api/ListTenantAlignment',
    data: { summary: true },
    queryKey: 'AllTenantsDashboard-Alignment',
    waiting: true,
  })

  // countsOnly returns the aggregates with no rows. Deriving them here pulled the estate's whole
  // failed-test set over the wire, growing linearly with tenant count.
  const failedTestsApi = ApiGetCall({
    url: '/api/ListTestResultsTenants',
    data: { status: 'Failed', countsOnly: 'true' },
    queryKey: 'AllTenantsDashboard-FailedTests',
    waiting: true,
  })

  const domainsApi = ApiGetCall({
    url: '/api/ListDomainAnalyser',
    data: { tenantFilter: 'AllTenants' },
    queryKey: 'AllTenantsDashboard-Domains',
    waiting: true,
  })

  // countsOnly reads the pre-computed '<Type>-Count' rows, so this stays a single table query
  // regardless of how many tenants exist.
  const countsApi = ApiGetCall({
    url: '/api/ListDBCache',
    data: { tenantFilter: 'AllTenants', countsOnly: 'true' },
    queryKey: 'AllTenantsDashboard-Counts',
    waiting: true,
  })

  // ListLogs defaults to today's partition when no date is supplied, which keeps this cheap.
  const logsApi = ApiGetCall({
    url: '/api/ListLogs',
    data: { Filter: 'True', Severity: 'Error,Critical' },
    queryKey: 'AllTenantsDashboard-Logs',
    waiting: true,
  })

  // Score fields only — the endpoint projects away controlScores, which is ~15 KB per cached record.
  // includeHistory adds the retained daily scores for the trend line; those rows have to be read to
  // find the latest anyway, so the only cost is three more numbers per day per tenant.
  const secureScoreApi = ApiGetCall({
    url: '/api/ListSecureScoreReport',
    data: { tenantFilter: 'AllTenants', includeHistory: 'true' },
    queryKey: 'AllTenantsDashboard-SecureScore',
    waiting: true,
  })

  const tenants = useMemo(
    () => asArray(tenantsApi.data).filter((tenant) => tenant?.customerId !== 'AllTenants'),
    [tenantsApi.data]
  )

  const tenantCount = tenants.length

  const displayNameByDomain = useMemo(() => {
    const map = new Map()
    tenants.forEach((tenant) => {
      if (tenant?.defaultDomainName) {
        map.set(tenant.defaultDomainName, tenant.displayName || tenant.defaultDomainName)
      }
    })
    return map
  }, [tenants])

  /* ---------------------------------------------------------------- delegation */

  const delegation = useMemo(() => {
    const buckets = { expired: 0, week: 0, month: 0, quarter: 0, healthy: 0 }
    const urgent = []
    let noAutoExtendSoon = 0

    tenants.forEach((tenant) => {
      const days = daysUntil(tenant?.relationshipEnd)
      if (days === null) {
        buckets.healthy += 1
        return
      }
      if (days < 0) buckets.expired += 1
      else if (days <= 7) buckets.week += 1
      else if (days <= 30) buckets.month += 1
      else if (days <= 90) buckets.quarter += 1
      else buckets.healthy += 1

      if (days <= 30) {
        if (!tenant?.hasAutoExtend) noAutoExtendSoon += 1
        urgent.push({
          name: tenant.displayName || tenant.defaultDomainName,
          days,
          hasAutoExtend: !!tenant?.hasAutoExtend,
        })
      }
    })

    urgent.sort((a, b) => a.days - b.days)

    return {
      buckets,
      urgent,
      noAutoExtendSoon,
      expiringSoon: buckets.expired + buckets.week + buckets.month,
    }
  }, [tenants])

  /* ---------------------------------------------------------------- alignment */

  const alignment = useMemo(() => {
    const summary = alignmentApi.data ?? {}
    const buckets = summary.Buckets ?? {}

    return {
      // Only ever read for its length — the endpoint returns the count directly.
      scores: { length: summary.ScoredTenantCount ?? 0 },
      buckets: {
        strong: buckets.Strong ?? 0,
        good: buckets.Good ?? 0,
        weak: buckets.Weak ?? 0,
        poor: buckets.Poor ?? 0,
      },
      average: summary.Average ?? 0,
      lowest: (summary.Lowest ?? []).map((item) => ({
        tenant: item.Tenant,
        name: item.Name ?? item.Tenant,
        score: item.Score ?? 0,
      })),
      pendingDeviations: summary.PendingDeviations ?? 0,
      pendingTenantCount: summary.PendingTenantCount ?? 0,
    }
  }, [alignmentApi.data])

  /* ------------------------------------------------------------- test results */

  const tests = useMemo(() => {
    const counts = failedTestsApi.data?.Counts ?? {}
    const byTestType = counts.ByTestType ?? {}
    // The facet is keyed by the TestType as stored ('Identity'); match without assuming casing.
    const identityKey = Object.keys(byTestType).find((key) => key.toLowerCase() === 'identity')
    const identity = (identityKey ? byTestType[identityKey] : null) ?? {}

    return {
      identityRows: (identity.TopChecks ?? [])
        .slice(0, 4)
        .map((check) => ({ label: check.Name, tenantCount: check.TenantCount })),
      identityTenantCount: identity.Tenants ?? 0,
      high: counts.HighRiskFailed ?? 0,
      highRiskTenantCount: counts.HighRiskTenants ?? 0,
    }
  }, [failedTestsApi.data])

  /* ------------------------------------------------------------ mail hygiene */

  const mail = useMemo(() => {
    const rows = asArray(domainsApi.data)
    const total = rows.length
    if (!total) return { total: 0, meters: [] }

    const spf = rows.filter((row) => row?.SPFPassAll).length
    const dkim = rows.filter((row) => row?.DKIMEnabled).length
    const dmarc = rows.filter((row) =>
      ['quarantine', 'reject'].includes(String(row?.DMARCActionPolicy ?? '').toLowerCase())
    ).length
    const dnssec = rows.filter((row) => row?.DNSSECPresent).length

    const meter = (label, value) => {
      const pct = percent(value, total)
      return {
        label,
        percent: pct,
        caption: `${value} of ${total} domains`,
        severity: pct >= 80 ? 'ok' : pct >= 50 ? 'warning' : 'critical',
      }
    }

    return {
      total,
      meters: [
        meter('SPF valid', spf),
        meter('DKIM signing', dkim),
        meter('DMARC enforced', dmarc),
        meter('DNSSEC', dnssec),
      ],
    }
  }, [domainsApi.data])

  /* ------------------------------------------------------ scale and freshness */

  const cache = useMemo(() => {
    const rows = asArray(countsApi.data)

    const totals = new Map()
    const tenantOldest = new Map()

    rows.forEach((row) => {
      const type = row?.Type
      const count = Number(row?.Count ?? 0)
      if (type) totals.set(type, (totals.get(type) ?? 0) + count)

      const age = hoursSince(row?.LastRefresh)
      if (row?.Tenant && age !== null) {
        const current = tenantOldest.get(row.Tenant)
        if (current === undefined || age > current) tenantOldest.set(row.Tenant, age)
      }
    })

    const scale = SCALE_TYPES.map(({ type, label }) => ({
      label,
      value: totals.get(type) ?? 0,
      average: tenantCount ? Math.round((totals.get(type) ?? 0) / tenantCount) : 0,
    }))

    let fresh = 0
    let stale = 0
    let missing = 0
    const staleTenants = []

    // A tenant the cache has never written has no rows at all, so absence is the signal here —
    // iterate the tenant list rather than the returned rows.
    tenants.forEach((tenant) => {
      const domain = tenant?.defaultDomainName
      const age = domain ? tenantOldest.get(domain) : undefined
      const name = tenant?.displayName || domain
      if (age === undefined) {
        missing += 1
        staleTenants.push({
          name,
          detail: 'No cached collections found',
          severity: 'critical',
        })
      } else if (age > 72) {
        stale += 1
        staleTenants.push({
          name,
          detail: `Oldest collection ${Math.round(age / 24)} days old`,
          severity: 'critical',
        })
      } else if (age > 30) {
        stale += 1
        staleTenants.push({
          name,
          detail: `Oldest collection ${Math.round(age)} hours old`,
          severity: 'warning',
        })
      } else {
        fresh += 1
      }
    })

    return {
      scale,
      hasData: rows.length > 0,
      freshness: { fresh, stale, missing },
      staleTenants: staleTenants.slice(0, 5),
    }
  }, [countsApi.data, tenants, tenantCount])

  /* ------------------------------------------------------------ secure score */

  const secureScore = useMemo(
    () => deriveSecureScoreSummary(asArray(secureScoreApi.data), displayNameByDomain),
    [secureScoreApi.data, displayNameByDomain]
  )

  /* -------------------------------------------------------------------- logs */

  const logs = useMemo(() => {
    const rows = asArray(logsApi.data).filter((row) =>
      ['error', 'critical'].includes(String(row?.Severity ?? '').toLowerCase())
    )

    const byTenant = new Map()
    rows.forEach((row) => {
      const tenant = row?.Tenant
      if (!tenant || tenant === 'CIPP') return
      const entry = byTenant.get(tenant) ?? { count: 0, latest: null }
      entry.count += 1
      if (!entry.latest) entry.latest = row?.Message
      byTenant.set(tenant, entry)
    })

    const offenders = [...byTenant.entries()]
      .map(([tenant, value]) => ({
        tenant,
        name: displayNameByDomain.get(tenant) ?? tenant,
        count: value.count,
        latest: value.latest,
      }))
      .sort((a, b) => b.count - a.count)

    return { total: rows.length, offenders, tenantCount: byTenant.size }
  }, [logsApi.data, displayNameByDomain])

  /* --------------------------------------------------- tenants needing attention */

  const attention = useMemo(() => {
    const rows = []

    tenants.forEach((tenant) => {
      const name = tenant?.displayName || tenant?.defaultDomainName
      const status = String(tenant?.delegatedPrivilegeStatus ?? '').toLowerCase()
      if (status && !status.includes('delegatedadminprivileges')) {
        rows.push({
          key: `${tenant.customerId}-delegation`,
          name,
          detail: `Delegated privilege status: ${tenant.delegatedPrivilegeStatus}`,
          severity: 'critical',
          chipLabel: 'Delegation',
        })
      } else if (tenant?.RequiresRefresh) {
        rows.push({
          key: `${tenant.customerId}-refresh`,
          name,
          detail: 'Cached tenant details are stale and need a refresh',
          severity: 'warning',
          chipLabel: 'Needs refresh',
        })
      }
    })

    logs.offenders.slice(0, 3).forEach((offender) => {
      // The count goes in the chip rather than the detail, so the detail line is free to carry the
      // actual message — repeating "Errors logged" on every row said nothing the stripe didn't.
      rows.push({
        key: `${offender.tenant}-errors`,
        name: offender.name,
        detail: offender.latest || 'Logged an error today',
        severity: 'critical',
        chipLabel: `${offender.count} error${offender.count === 1 ? '' : 's'}`,
      })
    })

    const order = { critical: 0, warning: 1, ok: 2 }
    rows.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))

    return { rows: rows.slice(0, 6), total: rows.length }
  }, [tenants, logs.offenders])

  const isLoading =
    tenantsApi.isLoading ||
    alignmentApi.isLoading ||
    failedTestsApi.isLoading ||
    domainsApi.isLoading ||
    countsApi.isLoading ||
    logsApi.isLoading ||
    secureScoreApi.isLoading

  return {
    tenantCount,
    tenants: tenantsApi,
    alignmentApi,
    failedTestsApi,
    domainsApi,
    countsApi,
    logsApi,
    secureScoreApi,
    delegation,
    alignment,
    tests,
    mail,
    cache,
    logs,
    secureScore,
    attention,
    isLoading,
  }
}
