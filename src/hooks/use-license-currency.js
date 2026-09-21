import { useCallback, useState } from 'react'

// Remembers the currency chosen on the license report tabs (Pricing + Optimization) so switching
// it on one tab carries to the other. Persisted in localStorage; falls back gracefully when it is
// unavailable (private windows, blocked site data).
const STORAGE_KEY = 'licenseReportCurrency'

export const useLicenseCurrency = (fallback = 'USD') => {
  const [currency, setCurrencyState] = useState(() => {
    if (typeof window === 'undefined') return fallback
    try {
      return window.localStorage.getItem(STORAGE_KEY) || fallback
    } catch {
      return fallback
    }
  })

  const setCurrency = useCallback((next) => {
    setCurrencyState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore - non-persistent is fine */
    }
  }, [])

  return [currency, setCurrency]
}
