import { deriveCacheSummary } from '../../../src/components/CippAllTenants/useAllTenantsDashboard'

const HOUR = 3600000

const hoursAgo = (hours) => new Date(Date.now() - hours * HOUR).toISOString()

const tenant = (domain, displayName = domain) => ({
  defaultDomainName: domain,
  displayName,
})

const row = (Tenant, Type, hours, Count = 1) => ({
  Tenant,
  Type,
  Count,
  LastRefresh: hoursAgo(hours),
})

describe('deriveCacheSummary', () => {
  it('ages a tenant by its oldest scheduled collection', () => {
    const summary = deriveCacheSummary(
      [row('a.com', 'Users', 2), row('a.com', 'Mailboxes', 100)],
      [tenant('a.com', 'Alpha')]
    )

    expect(summary.freshness).toEqual({ fresh: 0, stale: 1, missing: 0 })
    expect(summary.staleTenants).toEqual([
      {
        name: 'Alpha',
        detail: 'Oldest collection 4 days old',
        severity: 'critical',
      },
    ])
  })

  it('ignores collections the nightly orchestrator never refreshes', () => {
    // SharePointSharingLinks is populated on demand only, so a months-old row says nothing about
    // whether this tenant is still syncing.
    const summary = deriveCacheSummary(
      [
        row('a.com', 'Users', 2),
        row('a.com', 'SharePointSharingLinks', 24 * 90),
        row('a.com', 'SharePointPermissions', 24 * 60),
        row('a.com', 'OneDriveRootPermissions', 24 * 45),
      ],
      [tenant('a.com', 'Alpha')]
    )

    expect(summary.freshness).toEqual({ fresh: 1, stale: 0, missing: 0 })
    expect(summary.staleTenants).toEqual([])
  })

  it('counts a tenant with only ad-hoc collections as never cached', () => {
    const summary = deriveCacheSummary(
      [row('a.com', 'SharePointSharingLinks', 24 * 90)],
      [tenant('a.com', 'Alpha')]
    )

    expect(summary.freshness).toEqual({ fresh: 0, stale: 0, missing: 1 })
    expect(summary.staleTenants).toEqual([
      {
        name: 'Alpha',
        detail: 'No cached collections found',
        severity: 'critical',
      },
    ])
  })

  it('warns between 30 and 72 hours and reports the age in hours', () => {
    const summary = deriveCacheSummary(
      [row('a.com', 'Users', 48)],
      [tenant('a.com', 'Alpha')]
    )

    expect(summary.freshness).toEqual({ fresh: 0, stale: 1, missing: 0 })
    expect(summary.staleTenants[0]).toMatchObject({
      detail: 'Oldest collection 48 hours old',
      severity: 'warning',
    })
  })

  it('still totals ad-hoc collections into the scale figures', () => {
    // Excluding a type from the age judgement must not remove its records from the estate inventory.
    const summary = deriveCacheSummary(
      [
        row('a.com', 'Users', 2, 40),
        row('b.com', 'Users', 2, 60),
        row('a.com', 'SharePointSharingLinks', 24 * 90, 500),
      ],
      [tenant('a.com'), tenant('b.com')]
    )

    expect(summary.scale).toEqual([
      { label: 'Users', value: 100, average: 50 },
      { label: 'Mailboxes', value: 0, average: 0 },
      { label: 'Managed devices', value: 0, average: 0 },
    ])
    expect(summary.hasData).toBe(true)
  })

  it('reports tenants with no rows at all as never cached', () => {
    const summary = deriveCacheSummary(
      [row('a.com', 'Users', 2)],
      [tenant('a.com'), tenant('b.com')]
    )

    expect(summary.freshness).toEqual({ fresh: 1, stale: 0, missing: 1 })
    expect(summary.staleTenants).toEqual([
      {
        name: 'b.com',
        detail: 'No cached collections found',
        severity: 'critical',
      },
    ])
  })
})
