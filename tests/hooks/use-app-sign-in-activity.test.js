import {
  addAppSignInActivity,
  buildAppSignInLookup,
} from '../../src/hooks/use-app-sign-in-activity'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.parse('2026-11-04T12:00:00Z')
const daysAgo = (days, from = NOW) => new Date(from - days * DAY).toISOString()

const result = (overrides = {}) => ({
  appsCollected: true,
  appsCollectedAt: daysAgo(0),
  apps: [],
  credentialsCollected: true,
  credentialsCollectedAt: daysAgo(0),
  credentials: [],
  ...overrides,
})

const apply = (rows, res) => addAppSignInActivity(rows, buildAppSignInLookup(res, NOW), NOW)

describe('addAppSignInActivity', () => {
  it('labels apps by their last sign-in like the exposure report', () => {
    const rows = apply(
      [{ appId: 'A-ACTIVE' }, { appId: 'a-idle' }, { appId: 'a-stale' }, { appId: 'a-never' }],
      result({
        apps: [
          { appId: 'a-active', lastSignInDateTime: daysAgo(3) },
          { appId: 'a-idle', lastSignInDateTime: daysAgo(45) },
          { appId: 'a-stale', lastSignInDateTime: daysAgo(120) },
        ],
      })
    )

    expect(rows.map((r) => r.signInActivity)).toEqual([
      'Active',
      'Idle 30+ days',
      'Stale 90+ days',
      'No sign-in recorded',
    ])
    expect(rows[0].daysSinceLastSignIn).toBe(3)
    expect(rows[3].lastSignInDateTime).toBeNull()
  })

  it('measures idle time from when the report was collected, not from now', () => {
    // Collected 100 days ago: a sign-in 5 days before that collection is still Active.
    const collected = NOW - 100 * DAY
    const [row] = apply(
      [{ appId: 'a' }],
      result({
        appsCollectedAt: new Date(collected).toISOString(),
        apps: [{ appId: 'a', lastSignInDateTime: daysAgo(5, collected) }],
      })
    )

    expect(row.signInActivity).toBe('Active')
  })

  it('counts unexpired sign-in credentials unused for 90 days or never used', () => {
    const [row] = apply(
      [
        {
          appId: 'a',
          passwordCredentials: [
            { keyId: 'used', endDateTime: daysAgo(-30) },
            { keyId: 'old-use', endDateTime: daysAgo(-30) },
            { keyId: 'expired', endDateTime: daysAgo(1) },
          ],
          keyCredentials: [
            { keyId: 'never', usage: 'Verify' },
            { keyId: 'signing', usage: 'Sign' },
          ],
        },
      ],
      result({
        credentials: [
          { keyId: 'USED', lastSignInDateTime: daysAgo(2) },
          { keyId: 'old-use', lastSignInDateTime: daysAgo(200) },
          { keyId: 'expired', lastSignInDateTime: daysAgo(400) },
        ],
      })
    )

    expect(row.unusedCredentialCount).toBe(2)
    expect(row.credentialUse).toBe('Unused credentials (2 of 3)')
    expect(row.lastCredentialSignInDateTime).toBe(daysAgo(2))
  })

  it('says when there are no active credentials or every one was used', () => {
    const rows = apply(
      [
        { appId: 'none', passwordCredentials: [], keyCredentials: [] },
        { appId: 'used', passwordCredentials: [{ keyId: 'k1' }] },
      ],
      result({ credentials: [{ keyId: 'k1', lastSignInDateTime: daysAgo(10) }] })
    )

    expect(rows.map((r) => r.credentialUse)).toEqual(['No active credentials', 'All used in 90 days'])
  })

  it('reports Unknown when a report was never collected, and passes rows through without a result', () => {
    const [row] = apply(
      [{ appId: 'a', passwordCredentials: [{ keyId: 'k1' }] }],
      result({ appsCollected: false, credentialsCollected: false })
    )

    expect(row.signInActivity).toBe('Unknown (not collected)')
    expect(row.credentialUse).toBe('Unknown (not collected)')
    expect(row.unusedCredentialCount).toBeUndefined()

    const rows = [{ appId: 'a' }]
    expect(addAppSignInActivity(rows, buildAppSignInLookup(undefined, NOW), NOW)).toBe(rows)
  })
})
