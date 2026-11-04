import { describe, it, expect } from 'vitest'
import {
  flattenControlRows,
  groupMembers,
  rollupControls,
  scoreBucket,
  tenantChange,
  tenantGroupLookup,
} from '../../../src/components/CippAllTenants/AllTenantsSecureScore'

// The All Tenants secure score Table/Controls tabs are built from one report payload: per-tenant
// slim control scores plus a shared Catalog. These helpers do the join and the counting, so the
// numbers on screen are only as right as they are.

const report = {
  Results: [
    {
      Tenant: 'alpha.onmicrosoft.com',
      TenantId: 'alpha-id',
      TenantName: 'Alpha',
      Controls: [
        { controlName: 'MFA', score: 10, scoreInPercentage: 100, state: 'Default' },
        { controlName: 'SSPR', score: 0, scoreInPercentage: 0, state: 'Ignored', stateBy: 'admin' },
      ],
    },
    {
      Tenant: 'beta.onmicrosoft.com',
      TenantId: 'beta-id',
      TenantName: 'Beta',
      Controls: [{ controlName: 'MFA', score: 5, scoreInPercentage: 50 }],
    },
  ],
  Catalog: {
    MFA: { title: 'Require MFA', tier: 'Core', maxScore: 10, threats: ['Account breach', 'Phishing'] },
    SSPR: { title: 'Enable SSPR', tier: 'Defense in depth', maxScore: 1 },
  },
}

describe('scoreBucket', () => {
  it('buckets by percentage and treats a missing percentage as no data', () => {
    expect(scoreBucket(100)).toBe('Complete')
    expect(scoreBucket(42)).toBe('Partial')
    expect(scoreBucket(0)).toBe('Not started')
    expect(scoreBucket(null)).toBe('No data')
    expect(scoreBucket(undefined)).toBe('No data')
  })

  it('uses labels that never contain one another (presets filter with contains)', () => {
    const labels = [100, 50, 0, null].map(scoreBucket)
    labels.forEach((label) =>
      labels.filter((other) => other !== label).forEach((other) => expect(label.includes(other)).toBe(false))
    )
  })
})

describe('tenantChange', () => {
  it('is the newest minus the oldest percentage', () => {
    expect(
      tenantChange([
        { PercentageScore: 40.5 },
        { PercentageScore: 45 },
        { PercentageScore: 52.25 },
      ])
    ).toBe(11.75)
  })

  it('is null without at least two points', () => {
    expect(tenantChange([{ PercentageScore: 40 }])).toBeNull()
    expect(tenantChange(undefined)).toBeNull()
  })
})

describe('tenantGroupLookup', () => {
  it('maps each member tenant to its sorted group names', () => {
    const lookup = tenantGroupLookup({
      Results: [
        { Name: 'Zeta', Members: [{ customerId: 'alpha-id' }] },
        { Name: 'Acme', Members: [{ customerId: 'alpha-id' }, { customerId: 'beta-id' }] },
      ],
    })
    expect(lookup.get('alpha-id')).toBe('Acme, Zeta')
    expect(lookup.get('beta-id')).toBe('Acme')
  })
})

describe('flattenControlRows', () => {
  const rows = flattenControlRows(report.Results, report.Catalog, new Map([['alpha-id', 'Acme']]))

  it('emits one row per tenant x reported control', () => {
    expect(rows).toHaveLength(3)
  })

  it('joins the catalog metadata back onto each row', () => {
    const row = rows.find((r) => r.Tenant === 'beta.onmicrosoft.com')
    expect(row).toMatchObject({
      Title: 'Require MFA',
      Tier: 'Core',
      Points: '5 / 10',
      ScorePercent: 50,
      ScoreBucket: 'Partial',
      State: 'Default',
    })
  })

  it('carries state details and tenant groups', () => {
    const row = rows.find((r) => r.ControlName === 'SSPR')
    expect(row).toMatchObject({ State: 'Ignored', StateBy: 'admin', TenantGroups: 'Acme' })
    expect(rows.find((r) => r.Tenant === 'alpha.onmicrosoft.com' && r.ControlName === 'MFA').Threats).toBe(
      'Account breach, Phishing'
    )
  })
})

describe('rollupControls', () => {
  const rows = flattenControlRows(report.Results, report.Catalog)
  const rollup = rollupControls(rows, 2)

  it('counts each bucket per control and averages the scored tenants', () => {
    const mfa = rollup.find((r) => r.ControlName === 'MFA')
    expect(mfa).toMatchObject({ Reporting: 2, Complete: 1, Partial: 1, NotStarted: 0, NoData: 0 })
    expect(mfa.AveragePercent).toBe(75)
  })

  it('counts tenants that do not report a control as no data', () => {
    const sspr = rollup.find((r) => r.ControlName === 'SSPR')
    expect(sspr).toMatchObject({ Reporting: 1, NotStarted: 1, NoData: 1 })
  })

  it('sorts the weakest control first', () => {
    expect(rollup.map((r) => r.ControlName)).toEqual(['SSPR', 'MFA'])
  })
})

describe('groupMembers', () => {
  const groups = [
    { Id: 'g1', Name: 'Production', Members: [{ customerId: 'alpha-id' }] },
    { Id: 'g2', Name: 'NonProduction', Members: [{ customerId: 'beta-id' }] },
  ]

  it('matches membership by group id, not by a name that contains another', () => {
    const members = groupMembers(groups, ['g1'])
    expect(members.has('alpha-id')).toBe(true)
    expect(members.has('beta-id')).toBe(false)
  })

  it('unions the members of every selected group', () => {
    const members = groupMembers(groups, ['g1', 'g2'])
    expect([...members].sort()).toEqual(['alpha-id', 'beta-id'])
  })

  it('is null when no group is selected', () => {
    expect(groupMembers(groups, [])).toBeNull()
  })
})
