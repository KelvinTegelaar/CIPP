/**
 * Role impersonation state (superadmin-only feature).
 *
 * Lives in its own localStorage key - NOT app.settings, which round-trips to the server
 * via ExecUserSettings and races on init - so it is readable synchronously from
 * non-React code (buildVersionedHeaders) and via useSyncExternalStore in components.
 * The backend only honors the header for real superadmins, so this state can never
 * grant privileges; it only narrows them.
 */

const KEY = 'cipp_impersonate_role'
const listeners = new Set()
const notify = () => listeners.forEach((listener) => listener())

// localStorage throws in locked-down browsers - never let that break the app.
export const getImpersonatedRole = () => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(KEY) || null
  } catch {
    return null
  }
}

export const subscribeImpersonation = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Everything except authmecipp is persisted to localStorage (REACT_QUERY_OFFLINE_CACHE*),
// so both transitions must clear the persisted cache and hard-reload or role-scoped data
// from the other identity survives. Mirrors the "Clear Cache and Reload" speed-dial in
// _app.js. Never use queryClient.cancelQueries() here (permanent-abort race).
const clearCachesAndReload = (queryClient) => {
  try {
    queryClient?.clear()
  } catch {
    /* reload still gives a clean slate */
  }
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('REACT_QUERY_OFFLINE_CACHE'))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    /* worst case: stale cache entries expire on their own */
  }
  window.location.reload()
}

export const enterImpersonation = (role, queryClient) => {
  try {
    window.localStorage.setItem(KEY, String(role).toLowerCase())
  } catch {
    return
  }
  notify()
  clearCachesAndReload(queryClient)
}

export const exitImpersonation = (queryClient) => {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* fall through - reload clears in-memory state regardless */
  }
  notify()
  clearCachesAndReload(queryClient)
}

// The Craft response cache keys on URL + params, not headers - impersonated GETs carry
// this param so the two identities can never share a cached response.
export const impersonationCacheParams = () => {
  const role = getImpersonatedRole()
  return role ? { _imp: role } : {}
}
