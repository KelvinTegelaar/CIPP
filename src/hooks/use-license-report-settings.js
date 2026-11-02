import { useCallback, useState } from 'react'

// Remembers the analysis settings chosen on the License Optimization tab (which recommendation
// sets to run and their thresholds) so a reload keeps them. Persisted in localStorage; falls back
// gracefully when it is unavailable (private windows, blocked site data).
const STORAGE_KEY = 'licenseReportSettings'

export const DEFAULT_LICENSE_REPORT_SETTINGS = {
  recommendDowngrades: true,
  recommendUpgrades: true,
  recommendTerms: true,
  protectSecurityFeatures: true,
  inactiveDays: 90,
  tenureMonths: 6,
}

export const useLicenseReportSettings = () => {
  const [settings, setSettingsState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LICENSE_REPORT_SETTINGS
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return DEFAULT_LICENSE_REPORT_SETTINGS
      return { ...DEFAULT_LICENSE_REPORT_SETTINGS, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_LICENSE_REPORT_SETTINGS
    }
  })

  const setSettings = useCallback((patch) => {
    setSettingsState((current) => {
      const next = {
        ...current,
        ...(typeof patch === 'function' ? patch(current) : patch),
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore - non-persistent is fine */
      }
      return next
    })
  }, [])

  return [settings, setSettings]
}
