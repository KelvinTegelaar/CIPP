import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Chip, SvgIcon, Tooltip } from '@mui/material'
import { Stack } from '@mui/system'
import { Sync, CloudDone, Bolt } from '@mui/icons-material'
import { useSettings } from '../../hooks/use-settings'
import { useDialog } from '../../hooks/use-dialog'
import { CippApiDialog } from './CippApiDialog'
import { CippQueueTracker } from '../CippTable/CippQueueTracker'

/**
 * Hook + UI component that encapsulates all CIPP Reporting DB cache/live mode logic.
 *
 * @param {Object} config
 * @param {string} config.apiUrl          - Base API URL without query params (e.g. "/api/ListMailboxes")
 * @param {string} config.queryKey        - Base query key (e.g. "ListMailboxes")
 * @param {string} config.cacheName       - Cache type name for sync (e.g. "Mailboxes", "IntunePolicies")
 * @param {string} config.syncTitle       - Title for the sync dialog (e.g. "Sync Mailboxes")
 * @param {string} [config.syncConfirmText] - Custom confirm text. Default auto-generated from cacheName + tenant.
 * @param {Object} [config.syncData]      - Extra data to pass to ExecCIPPDBCache. Merged with { Name: cacheName }.
 * @param {boolean} [config.allowToggle=true] - Whether the user can toggle between cached and live. False = always cached.
 * @param {boolean} [config.defaultCached=true] - Initial cached state (when toggle is allowed).
 * @param {string[]} [config.cacheColumns=["CacheTimestamp"]] - Extra columns to show when in cached mode.
 * @param {string} [config.tenantColumn="Tenant"] - Column name for tenant (shown in AllTenants mode).
 * @param {Object} [config.apiData]       - Additional static API data to merge (e.g. extra params).
 *
 * @returns {Object}
 *   - useReportDB {boolean}          - Current cache mode
 *   - setUseReportDB {Function}      - Manual override (rarely needed)
 *   - isAllTenants {boolean}         - Whether AllTenants is selected
 *   - resolvedApiUrl {string}        - API URL with ?UseReportDB=true appended when needed
 *   - resolvedApiData {Object|undefined} - Merged apiData (for pages that use apiData instead of URL params)
 *   - resolvedQueryKey {string}      - Query key including tenant and cache mode
 *   - cacheColumns {string[]}        - Columns to prepend/append when cached (includes Tenant for AllTenants)
 *   - controls {JSX.Element}         - Ready-to-render JSX for the cache toggle, sync button, and queue tracker
 *   - syncDialog {JSX.Element}       - The CippApiDialog element to render alongside CippTablePage
 */
export function useCippReportDB(config) {
  const {
    apiUrl,
    queryKey,
    cacheName,
    syncTitle,
    syncConfirmText,
    syncData,
    allowToggle = true,
    defaultCached = true,
    cacheColumns = ['CacheTimestamp'],
    tenantColumn = 'Tenant',
    apiData: extraApiData,
  } = config

  const currentTenant = useSettings().currentTenant
  const isAllTenants = currentTenant === 'AllTenants'
  const dialog = useDialog()
  const [syncQueueId, setSyncQueueId] = useState(null)
  const [useReportDB, setUseReportDB] = useState(defaultCached)

  // Reset to default whenever tenant changes; AllTenants always forces cached
  useEffect(() => {
    if (isAllTenants) {
      setUseReportDB(true)
    } else {
      setUseReportDB(defaultCached)
    }
  }, [currentTenant, isAllTenants, defaultCached])

  // Whether the toggle is actually clickable
  const canToggle = allowToggle && !isAllTenants

  // Resolved API URL — append UseReportDB param when cached
  const resolvedApiUrl = useMemo(() => {
    if (!useReportDB) return apiUrl
    const sep = apiUrl.includes('?') ? '&' : '?'
    return `${apiUrl}${sep}UseReportDB=true`
  }, [apiUrl, useReportDB])

  // Keep mode flag in the URL only; CippTablePage merges apiData into query params.
  const resolvedApiData = useMemo(() => {
    if (!extraApiData) return undefined
    return {
      ...extraApiData,
    }
  }, [extraApiData])

  // Query key that includes tenant + mode for proper cache separation
  const resolvedQueryKey = useMemo(() => {
    return `${queryKey}-${currentTenant}-${useReportDB}`
  }, [queryKey, currentTenant, useReportDB])

  // Extra columns to show when in cached mode
  const extraColumns = useMemo(() => {
    const cols = []
    if (useReportDB && isAllTenants) {
      cols.push(tenantColumn)
    }
    if (useReportDB) {
      cols.push(...cacheColumns)
    }
    return cols
  }, [useReportDB, isAllTenants, tenantColumn, cacheColumns])

  const handleSyncSuccess = useCallback((result) => {
    if (result?.Metadata?.QueueId) {
      setSyncQueueId(result.Metadata.QueueId)
    }
  }, [])

  // Tooltip text
  const tooltipText = !allowToggle
    ? 'This page always uses cached data from the CIPP reporting database.'
    : isAllTenants
      ? 'AllTenants always uses cached data'
      : useReportDB
        ? 'Showing cached data — click to switch to live'
        : 'Showing live data — click to switch to cache'

  const confirmText =
    syncConfirmText ||
    `Run ${cacheName} cache sync for ${currentTenant}? This will update data immediately.`

  // The controls JSX
  const controls = (
    <Stack direction="row" spacing={1} alignItems="center">
      {useReportDB && (
        <>
          <CippQueueTracker
            queueId={syncQueueId}
            queryKey={resolvedQueryKey}
            title={syncTitle}
          />
          <Button
            startIcon={
              <SvgIcon fontSize="small">
                <Sync />
              </SvgIcon>
            }
            size="xs"
            onClick={dialog.handleOpen}
            disabled={isAllTenants}
          >
            Sync
          </Button>
        </>
      )}
      <Tooltip title={tooltipText}>
        <span>
          <Chip
            icon={useReportDB ? <CloudDone /> : <Bolt />}
            label={useReportDB ? 'Cached' : 'Live'}
            color="primary"
            size="small"
            onClick={canToggle ? () => setUseReportDB((prev) => !prev) : undefined}
            clickable={canToggle}
            disabled={!canToggle}
            variant="outlined"
          />
        </span>
      </Tooltip>
    </Stack>
  )

  // The sync dialog JSX — render alongside the table page
  const syncDialogElement = (
    <CippApiDialog
      createDialog={dialog}
      title={syncTitle}
      fields={[]}
      api={{
        type: 'GET',
        url: '/api/ExecCIPPDBCache',
        confirmText,
        relatedQueryKeys: [`${queryKey}-${currentTenant}-true`],
        data: {
          Name: cacheName,
          ...(syncData || {}),
        },
        onSuccess: handleSyncSuccess,
      }}
    />
  )

  return {
    useReportDB,
    setUseReportDB,
    isAllTenants,
    resolvedApiUrl,
    resolvedApiData,
    resolvedQueryKey,
    cacheColumns: extraColumns,
    controls,
    syncDialog: syncDialogElement,
  }
}
