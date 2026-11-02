import { useMemo } from 'react'
import { ApiGetCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'

// One shared reference for the empty case, so callers can put it in a dependency array.
const EMPTY = {}

/**
 * Resolved values of every CIPP variable, for substitution into report footers and watermarks by
 * `applyReportVariables`. A PDF renders in the browser and never passes through
 * Get-CIPPTextReplacement, so the values are read from ListCustomVariables instead.
 *
 * Fetched by the caller rather than inside the document: react-pdf renders through its own
 * reconciler, outside the React tree, where there is no query client.
 */
export const useReportVariables = (tenantFilter) => {
  const currentTenant = useSettings()?.currentTenant
  const tenant = tenantFilter ?? currentTenant

  // AllTenants has no single answer for %tenantname% and the endpoint declines to guess one.
  const enabled = Boolean(tenant) && tenant !== 'AllTenants'

  const variables = ApiGetCall({
    url: '/api/ListCustomVariables',
    data: { tenantFilter: tenant },
    queryKey: `ReportVariables-${tenant}`,
    waiting: enabled,
    staleTime: Infinity,
  })

  return useMemo(() => {
    const results = variables.data?.Results
    if (!Array.isArray(results)) return EMPTY

    const resolved = {}
    for (const variable of results) {
      // Valueless variables (mostly system tokens, expanded on an endpoint) are left out, so the
      // token stays written in the footer rather than resolving to nothing.
      if (variable?.Name && variable.Value !== null && variable.Value !== undefined && variable.Value !== '') {
        resolved[variable.Name] = variable.Value
      }
    }
    return resolved
  }, [variables.data])
}

export default useReportVariables
