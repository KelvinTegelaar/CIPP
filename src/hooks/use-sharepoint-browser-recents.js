import { useCallback, useEffect, useState } from 'react'
import {
  SHAREPOINT_BROWSER_RECENTS_CHANGE_EVENT,
  addRecentSharePointSite,
  getRecentSharePointSites,
} from '../utils/sharepoint-browser-recents'

/**
 * Browser-local recent SharePoint sites for the site-browser switcher (localStorage).
 * @param {string} tenantFilter
 */
export function useSharePointBrowserRecents(tenantFilter) {
  const [recent, setRecent] = useState([])

  const refresh = useCallback(() => {
    setRecent(getRecentSharePointSites(tenantFilter))
  }, [tenantFilter])

  useEffect(() => {
    refresh()

    const onStorage = (event) => {
      if (
        !event.key ||
        (typeof event.key === 'string' && event.key.startsWith('cipp:sp-browser:recents:'))
      ) {
        refresh()
      }
    }
    const onCustom = () => refresh()

    window.addEventListener('storage', onStorage)
    window.addEventListener(SHAREPOINT_BROWSER_RECENTS_CHANGE_EVENT, onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(SHAREPOINT_BROWSER_RECENTS_CHANGE_EVENT, onCustom)
    }
  }, [refresh])

  const trackRecent = useCallback(
    (site) => {
      addRecentSharePointSite(tenantFilter, site)
      refresh()
    },
    [tenantFilter, refresh]
  )

  return { recent, trackRecent, refresh }
}
