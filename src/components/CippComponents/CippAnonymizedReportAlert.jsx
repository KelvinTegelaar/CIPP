import { Alert, Link } from '@mui/material'
import { ApiGetCallWithPagination } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'

// When M365 "conceal user/site names in reports" is enabled, Graph usage reports return
// 32-char hex hashes (e.g. 85926F73B5A9FA60D166E6057BA76F4A) instead of names/UPNs.
const HASHED_NAME = /^[0-9A-F]{32}$/i
const DEFAULT_FIELDS = [
  'userPrincipalName',
  'displayName',
  'ownerPrincipalName',
  'ownerDisplayName',
  'UPN',
  'userId',
  'UserId',
  'siteUrl',
]

/**
 * True when report rows look anonymized: for at least one of the given fields, every
 * populated value across all rows is a 32-char hex hash.
 */
export const isReportAnonymized = (rows, fields = DEFAULT_FIELDS) => {
  if (!Array.isArray(rows) || rows.length === 0) return false
  return fields.some((field) => {
    const values = rows
      .map((row) => row?.[field])
      .filter((value) => typeof value === 'string' && value !== '')
    return values.length > 0 && values.every((value) => HASHED_NAME.test(value))
  })
}

/**
 * Hook for CippTablePage-based report pages. Subscribes to the same React Query cache entry
 * as the page's table (same url/data/queryKey → one shared request) and returns whether the
 * loaded rows look anonymized.
 *
 * @param {string} url        - Same apiUrl the table uses.
 * @param {Object} [data]     - Same extra apiData the table uses (tenantFilter is added here).
 * @param {string} queryKey   - Same queryKey the table uses (must match exactly).
 * @param {string} [dataKey]  - Same apiDataKey the table uses (e.g. "Results").
 * @param {string[]} [fields] - Name fields to test for hashes.
 * @param {Function} [check]  - Optional custom predicate (rows) => bool, replaces the hash test.
 */
export const useReportAnonymized = ({ url, data, queryKey, dataKey, fields, check }) => {
  const tenant = useSettings().currentTenant
  const query = ApiGetCallWithPagination({
    url,
    data: { tenantFilter: tenant, ...data },
    queryKey,
  })
  if (!query.isSuccess || query.isFetching) return false
  const rows = (query.data?.pages ?? []).flatMap((page) => {
    const pageData = dataKey ? page?.[dataKey] : page
    return Array.isArray(pageData) ? pageData : []
  })
  if (check) return rows.length > 0 && check(rows)
  return isReportAnonymized(rows, fields)
}

/**
 * Warning banner shown when report data is anonymized. Renders nothing unless `show`.
 * Pass `children` to override only the lead-in sentence (e.g. the all-zero-storage variant);
 * the standard link and guidance are always appended.
 */
export const CippAnonymizedReportAlert = ({ show, children }) => {
  if (!show) return null
  return (
    <Alert severity="warning">
      {children ??
        'Names in this report appear pseudo-anonymised because Microsoft 365 report anonymization is enabled for this tenant.'}{' '}
      The{' '}
      <Link
        href="https://standards.cipp.app/standards/anonreportdisable"
        target="_blank"
        rel="noopener"
      >
        Enable Usernames instead of pseudo anonymised names in reports
      </Link>{' '}
      standard might need to be enabled to have the data populate correctly. Re-run the report sync
      after changing the setting.
    </Alert>
  )
}
