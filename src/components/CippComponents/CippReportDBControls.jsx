import { useState, useMemo, useCallback } from "react";
import { CippIcons } from "../../utils/icon-registry";
import { Button, Chip, SvgIcon, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useSettings } from "../../hooks/use-settings";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "./CippApiDialog";
import { CippQueueTracker } from "../CippTable/CippQueueTracker";

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
 * @param {boolean} [config.allowAllTenantSync=false] - Allow syncing when AllTenants is selected (fans out to all tenants).
 * @param {string[]} [config.cacheColumns=["CacheTimestamp"]] - Extra columns to show when in cached mode.
 * @param {string} [config.tenantColumn="Tenant"] - Column name for tenant (shown in AllTenants mode).
 * @param {Object} [config.apiData]       - Additional static API data to merge (e.g. extra params).
 * @param {boolean} [config.serverPagination=false] - Server-side paging for cached reads; the
 *   endpoint must support manualPagination and the page must pass apiDataKey={reportDB.apiDataKey}.
 *
 * @returns {Object}
 *   - useReportDB {boolean}          - Current cache mode
 *   - setUseReportDB {Function}      - Manual override (rarely needed)
 *   - isAllTenants {boolean}         - Whether AllTenants is selected
 *   - resolvedApiUrl {string}        - API URL with ?UseReportDB=true appended when needed
 *   - resolvedApiData {Object|undefined} - Merged apiData (for pages that use apiData instead of URL params)
 *   - resolvedQueryKey {string}      - Query key including tenant and cache mode
 *   - apiDataKey {string|undefined}  - Pass as apiDataKey when serverPagination is set ('Results' in cached mode)
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
    allowAllTenantSync = false,
    cacheColumns = ['CacheTimestamp'],
    tenantColumn = 'Tenant',
    apiData: extraApiData,
    serverPagination = false,
  } = config

  const currentTenant = useSettings().currentTenant;
  const isAllTenants = currentTenant === "AllTenants";
  const dialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);
  const [cacheOverride, setCacheOverride] = useState({ tenant: null, value: null });
  const useReportDB = isAllTenants
    ? true
    : cacheOverride.tenant === currentTenant
      ? cacheOverride.value
      : defaultCached;
  const setUseReportDB = useCallback(
    (valueOrUpdater) => {
      setCacheOverride((prev) => {
        const previousValue = prev.tenant === currentTenant ? prev.value : defaultCached;
        const nextValue =
          typeof valueOrUpdater === "function" ? valueOrUpdater(previousValue) : valueOrUpdater;

        return { tenant: currentTenant, value: nextValue };
      });
    },
    [currentTenant, defaultCached],
  );

  // Whether the toggle is actually clickable
  const canToggle = allowToggle && !isAllTenants

  // Resolved API URL — append UseReportDB param when cached
  const resolvedApiUrl = useMemo(() => {
    if (!useReportDB) return apiUrl
    const sep = apiUrl.includes('?') ? '&' : '?'
    return `${apiUrl}${sep}UseReportDB=true`
  }, [apiUrl, useReportDB])

  // Keep mode flag in the URL only; CippTablePage merges apiData into query params.
  // serverPagination adds manualPagination on cached reads.
  const resolvedApiData = useMemo(() => {
    const paging = serverPagination && useReportDB ? { manualPagination: true } : {}
    if (!extraApiData && !serverPagination) return undefined
    return {
      ...paging,
      ...extraApiData,
    }
  }, [extraApiData, serverPagination, useReportDB])

  // Paged responses nest rows under Results; the legacy bare array needs no dataKey.
  const apiDataKey = serverPagination && useReportDB ? 'Results' : undefined

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
    <Stack direction="row" spacing={1} sx={{
      alignItems: "center"
    }}>
      {useReportDB && (
        <>
          <CippQueueTracker queueId={syncQueueId} queryKey={resolvedQueryKey} title={syncTitle} />
          <Button
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.Sync />
              </SvgIcon>
            }
            size="xs"
            onClick={dialog.handleOpen}
            disabled={isAllTenants && !allowAllTenantSync}
          >
            Sync
          </Button>
        </>
      )}
      {/* Not `disabled` when it cannot be toggled: this is a status badge, and MUI's disabled
          fade drops the label to ~2:1. Not clickable and without onClick it is already inert. */}
      <Tooltip title={tooltipText}>
        <span>
          <Chip
            icon={useReportDB ? <CippIcons.CloudDone /> : <CippIcons.Bolt />}
            label={useReportDB ? 'Cached' : 'Live'}
            color="primary"
            size="small"
            onClick={canToggle ? () => setUseReportDB((prev) => !prev) : undefined}
            clickable={canToggle}
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
          ...(cacheName === "Mailboxes" ? { Types: "None" } : {}),
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
    apiDataKey,
    cacheColumns: extraColumns,
    controls,
    syncDialog: syncDialogElement,
  }
}
