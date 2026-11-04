import { useCallback, useMemo } from 'react'
import { ApiGetCall } from '../api/ApiCall'

const DAY_MS = 24 * 60 * 60 * 1000

const toTime = (value) => {
  const time = value ? Date.parse(value) : NaN
  return Number.isNaN(time) ? null : time
}

// Same labels as the App Permission Exposure report.
const activityLabel = (days) => {
  if (days === null) return 'No sign-in recorded'
  if (days <= 30) return 'Active'
  if (days <= 90) return 'Idle 30+ days'
  return 'Stale 90+ days'
}

// Secrets and Verify certificates sign the app in; Sign and Encrypt keys protect tokens.
const signInCredentials = (row, now) =>
  [...(row.passwordCredentials ?? []), ...(row.keyCredentials ?? []).filter((k) => k?.usage === 'Verify')].filter(
    (c) => c?.keyId && !(toTime(c.endDateTime) && toTime(c.endDateTime) < now)
  )

// The ListAppSignInActivity result indexed for lookups; null when there is none.
export const buildAppSignInLookup = (result, now = Date.now()) => {
  if (!result || typeof result !== 'object') return null
  return {
    appsCollected: Boolean(result.appsCollected),
    appsAt: toTime(result.appsCollectedAt) ?? now,
    apps: new Map((result.apps ?? []).map((a) => [String(a.appId).toLowerCase(), a])),
    credentialsCollected: Boolean(result.credentialsCollected),
    credentialsAt: toTime(result.credentialsCollectedAt) ?? now,
    credentials: new Map((result.credentials ?? []).map((c) => [String(c.keyId).toLowerCase(), c])),
  }
}

// Adds to each row of an app list when the app, and each of its unexpired sign-in credentials,
// last signed in. Idle time is measured from when each report was collected, so a collection that
// stopped running never makes an app look idle.
export const addAppSignInActivity = (rows, lookup, now = Date.now()) => {
  if (!lookup) return rows
  return rows.map((row) => {
    const added = {}
    if (lookup.appsCollected) {
      const activity = lookup.apps.get(String(row.appId).toLowerCase())
      const last = toTime(activity?.lastSignInDateTime)
      const days = last === null ? null : Math.max(0, Math.floor((lookup.appsAt - last) / DAY_MS))
      added.signInActivity = activityLabel(days)
      added.lastSignInDateTime = activity?.lastSignInDateTime ?? null
      added.daysSinceLastSignIn = days
    } else {
      added.signInActivity = 'Unknown (not collected)'
    }
    if (lookup.credentialsCollected) {
      const credentials = signInCredentials(row, now)
      let lastUse = null
      let unused = 0
      for (const credential of credentials) {
        const use = toTime(
          lookup.credentials.get(String(credential.keyId).toLowerCase())?.lastSignInDateTime
        )
        if (use !== null && (lastUse === null || use > lastUse)) lastUse = use
        if (use === null || (lookup.credentialsAt - use) / DAY_MS > 90) unused++
      }
      added.lastCredentialSignInDateTime = lastUse === null ? null : new Date(lastUse).toISOString()
      added.unusedCredentialCount = unused
      added.credentialUse =
        credentials.length === 0
          ? 'No active credentials'
          : unused > 0
            ? `Unused credentials (${unused} of ${credentials.length})`
            : 'All used in 90 days'
    } else {
      added.credentialUse = 'Unknown (not collected)'
    }
    return { ...row, ...added }
  })
}

// Reads the CIPP DB caches of the Entra sign-in activity reports (Entra ID P1) for a single tenant
// and returns a dataTransform for an app list. With All Tenants it is disabled and rows pass as is.
export const useAppSignInActivity = (tenant) => {
  const enabled = Boolean(tenant) && tenant !== 'AllTenants'
  const request = ApiGetCall({
    url: '/api/ListAppSignInActivity',
    data: { tenantFilter: tenant },
    queryKey: `AppSignInActivity-${tenant}`,
    waiting: enabled,
  })
  const result = request.data?.Results

  const lookup = useMemo(() => (enabled ? buildAppSignInLookup(result) : null), [enabled, result])
  const dataTransform = useCallback((rows) => addAppSignInActivity(rows, lookup), [lookup])

  return { dataTransform, enabled, isLoading: enabled && request.isLoading }
}

export const appSignInActivityColumns = [
  'signInActivity',
  'lastSignInDateTime',
  'credentialUse',
  'lastCredentialSignInDateTime',
]

export const appSignInActivityFilters = [
  {
    filterName: 'Stale (no sign-in for 90+ days)',
    value: [{ id: 'signInActivity', value: 'Stale 90+ days' }],
    type: 'column',
  },
  {
    filterName: 'No sign-in recorded',
    value: [{ id: 'signInActivity', value: 'No sign-in recorded' }],
    type: 'column',
  },
  {
    filterName: 'Unused credentials (90+ days)',
    // The value carries the counts, such as 'Unused credentials (1 of 2)'.
    value: [{ id: 'credentialUse', value: 'Unused credentials', filterFn: 'contains' }],
    type: 'column',
  },
]
