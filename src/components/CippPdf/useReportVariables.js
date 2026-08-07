import { useMemo } from 'react'
import { ApiGetCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'

// One shared reference for the empty case, so callers can put it in a dependency array.
const EMPTY = {}

/**
 * The resolved values of every CIPP variable, for substitution into report footers and watermarks.
 *
 * A report's footer is written by an operator on the branding page, where the `%` picker offers the
 * whole CIPP variable vocabulary — `%cippurl%`, `%tenantid%`, custom variables, all of it. Those are
 * normally filled in by Get-CIPPTextReplacement on the server, but a PDF is rendered in the browser
 * and never passes through it, so a footer that used anything beyond the report's own tokens shipped
 * with the token still written in it.
 *
 * This is the missing half: the values come from ListCustomVariables, which resolves them for the
 * tenant, and `applyReportVariables` does the substitution at render time.
 *
 * Fetched here rather than inside the document because a report is rendered by react-pdf's own
 * reconciler, outside the React tree — there is no query client in there to hook into. The values
 * have to arrive as data.
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
      // A variable with no value is one CIPP cannot fill — the system tokens expanded on an
      // endpoint, mainly. Leaving it out means the token stays written in the footer, which is what
      // tells whoever configured it that it does not resolve here.
      if (variable?.Name && variable.Value !== null && variable.Value !== undefined && variable.Value !== '') {
        resolved[variable.Name] = variable.Value
      }
    }
    return resolved
  }, [variables.data])
}

export default useReportVariables
