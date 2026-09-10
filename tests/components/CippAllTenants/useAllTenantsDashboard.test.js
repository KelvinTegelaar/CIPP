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
    expect(summary.staleTenants[0]).toMatchObject({
      name: 'Alpha',
      domain: 'a.com',
      detail: 'Oldest collection 4 days old',
      severity: 'critical',
    })
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

  it('says so when a tenant has only ad-hoc collections rather than none', () => {
    const summary = deriveCacheSummary(
      [row('a.com', 'SharePointSharingLinks', 24 * 90)],
      [tenant('a.com', 'Alpha')]
    )

    expect(summary.freshness).toEqual({ fresh: 0, stale: 0, missing: 1 })
    expect(summary.staleTenants[0]).toMatchObject({
      name: 'Alpha',
      detail: 'Only on-demand collections cached',
      severity: 'critical',
      ageHours: null,
      collections: [],
    })
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

  it('attaches only the collections that are behind, oldest first', () => {
    const summary = deriveCacheSummary(
      [
        row('a.com', 'Users', 2),
        row('a.com', 'SPOTenant', 216),
        row('a.com', 'Mailboxes', 72.5),
        row('a.com', 'Groups', 29),
      ],
      [tenant('a.com', 'Alpha')]
    )

    const [alpha] = summary.staleTenants
    expect(alpha.collections.map((entry) => entry.type)).toEqual([
      'SPOTenant',
      'Mailboxes',
    ])
    expect(alpha.collections[0].ageHours).toBeCloseTo(216, 1)
    expect(alpha.collections[0].lastRefresh).toBeTruthy()
  })

  it('sorts never cached first, then oldest, without truncating the list', () => {
    const tenants = ['a', 'b', 'c', 'd', 'e', 'f'].map((letter) =>
      tenant(`${letter}.com`)
    )
    const summary = deriveCacheSummary(
      [
        row('a.com', 'Users', 100),
        row('b.com', 'Users', 400),
        row('c.com', 'Users', 200),
        row('d.com', 'Users', 50),
        row('e.com', 'Users', 300),
      ],
      tenants
    )

    // f.com has no rows at all, so it leads; the rest follow oldest first.
    expect(summary.staleTenants.map((entry) => entry.domain)).toEqual([
      'f.com',
      'b.com',
      'e.com',
      'c.com',
      'a.com',
      'd.com',
    ])
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
    expect(summary.staleTenants[0]).toMatchObject({
      name: 'b.com',
      detail: 'No cached collections found',
      severity: 'critical',
    })
  })
})
