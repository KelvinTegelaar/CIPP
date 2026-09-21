const STORAGE_PREFIX = 'cipp:sp-browser:recents:'
const CHANGE_EVENT = 'cipp:sp-browser-recents'
const MAX_RECENT = 8

/**
 * @typedef {{ id: string, displayName: string, webUrl?: string, openedAt: number }} SharePointRecentSite
 */

/**
 * @param {string} tenantFilter
 */
function storageKey(tenantFilter) {
  return `${STORAGE_PREFIX}${tenantFilter || 'unknown'}`
}

/**
 * @param {string} tenantFilter
 * @returns {SharePointRecentSite[]}
 */
function readList(tenantFilter) {
  if (typeof window === 'undefined' || !tenantFilter || tenantFilter === 'AllTenants') {
    return []
  }
  try {
    const raw = localStorage.getItem(storageKey(tenantFilter))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) => item && typeof item.id === 'string' && item.id.length > 0 && item.displayName
    )
  } catch {
    return []
  }
}

/**
 * @param {string} tenantFilter
 * @param {SharePointRecentSite[]} list
 */
function writeList(tenantFilter, list) {
  if (typeof window === 'undefined' || !tenantFilter || tenantFilter === 'AllTenants') {
    return
  }
  try {
    localStorage.setItem(storageKey(tenantFilter), JSON.stringify(list))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch (error) {
    console.warn('Failed to write SharePoint browser recents to localStorage:', error)
  }
}

/**
 * @param {object} site
 * @returns {SharePointRecentSite | null}
 */
function normalizeSite(site) {
  if (!site?.id || typeof site.id !== 'string') return null
  const displayName = site.displayName || site.name || site.webUrl
  if (!displayName || displayName === '…') return null
  return {
    id: site.id,
    displayName: String(displayName),
    webUrl: typeof site.webUrl === 'string' ? site.webUrl : undefined,
    openedAt: Date.now(),
  }
}

/**
 * @param {string} tenantFilter
 * @returns {SharePointRecentSite[]}
 */
export function getRecentSharePointSites(tenantFilter) {
  return readList(tenantFilter)
}

/**
 * @param {string} tenantFilter
 * @param {object} site
 * @returns {SharePointRecentSite[]}
 */
export function addRecentSharePointSite(tenantFilter, site) {
  const normalized = normalizeSite(site)
  if (!normalized) {
    return getRecentSharePointSites(tenantFilter)
  }

  const next = [
    normalized,
    ...getRecentSharePointSites(tenantFilter).filter((item) => item.id !== normalized.id),
  ].slice(0, MAX_RECENT)

  writeList(tenantFilter, next)
  return next
}

export const SHAREPOINT_BROWSER_RECENTS_CHANGE_EVENT = CHANGE_EVENT
export const SHAREPOINT_BROWSER_RECENTS_MAX = MAX_RECENT
