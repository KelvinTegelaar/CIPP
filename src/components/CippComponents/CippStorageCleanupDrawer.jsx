import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { Close, CleaningServices, DeleteSweep } from '@mui/icons-material'
import { CippApiDialog } from './CippApiDialog'
import { CippSharePointVersionCleanupFields } from './CippSharePointVersionCleanupFields'
import CippFormComponent from './CippFormComponent'
import { ApiGetCall, ApiGetCallWithPagination, ApiPostCall } from '../../api/ApiCall'
import { useDialog } from '../../hooks/use-dialog'
import { usePermissions } from '../../hooks/use-permissions'
import { formatCleanupBytes } from '../../utils/storage-cleanup-opportunities'
import { tenantScope } from '../../utils/tenant-selection'

const optionValue = (value) =>
  value && typeof value === 'object' && 'value' in value ? value.value : value

const RECYCLE_SUM_FIELDS = [
  'totalBytes',
  'firstStageCount',
  'firstStageBytes',
  'secondStageCount',
  'secondStageBytes',
  'scannedItems',
]

const LabelValueRow = ({ label, value }) => (
  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ textAlign: 'right' }}>
      {value}
    </Typography>
  </Stack>
)

const TYPE_LABEL = {
  versions: 'Versions',
  recycle: 'Recycle',
  largeLibrary: 'Large library',
}

/**
 * Discover → preview → action drawer for Storage Report cleanup (library ceiling).
 */
export const CippStorageCleanupDrawer = ({
  open,
  onClose,
  tenantFilter,
  sites = [],
  focusItem = null,
  initialAction = null,
}) => {
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])
  const canReadRecycle = checkPermissions([
    'Sharepoint.SiteRecycleBin.Read',
    'Sharepoint.SiteRecycleBin.ReadWrite',
  ])
  const canEmptyRecycle = checkPermissions(['Sharepoint.SiteRecycleBin.ReadWrite'])

  const [tab, setTab] = useState(0)
  const [activeSiteUrl, setActiveSiteUrl] = useState('')
  const versionDialog = useDialog()
  const recycleDialog = useDialog()
  const jobStatusApi = ApiPostCall({})

  const siteList = useMemo(() => {
    const map = new Map()
    for (const s of sites) {
      if (s?.webUrl) map.set(s.webUrl.replace(/\/+$/, ''), s)
    }
    if (focusItem?.siteUrl) {
      const key = focusItem.siteUrl.replace(/\/+$/, '')
      if (!map.has(key) && focusItem.site) map.set(key, focusItem.site)
    }
    return [...map.values()]
  }, [sites, focusItem])

  useEffect(() => {
    if (!open) return
    const preferred =
      focusItem?.siteUrl ||
      siteList[0]?.webUrl ||
      ''
    setActiveSiteUrl(preferred)
    if (initialAction === 'emptyRecycle' || focusItem?.type === 'recycle') setTab(1)
    else setTab(0)
  }, [open, focusItem, siteList, initialAction])

  const activeSite = siteList.find(
    (s) => s.webUrl?.replace(/\/+$/, '') === activeSiteUrl?.replace(/\/+$/, '')
  ) || siteList[0]

  const siteUrl = activeSite?.webUrl
  const siteName = activeSite?.displayName || siteUrl || 'Site'

  const librariesApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: { ...tenantScope(tenantFilter), SiteUrl: siteUrl },
    queryKey: `CleanupLibs-${tenantFilter}-${siteUrl}`,
    waiting: open && !!tenantFilter && !!siteUrl,
  })

  const compositionApi = ApiGetCall({
    url: '/api/ListSiteStorageComposition',
    data: { ...tenantScope(tenantFilter), SiteUrl: siteUrl },
    queryKey: `CleanupComposition-${tenantFilter}-${siteUrl}`,
    waiting: open && !!tenantFilter && !!siteUrl,
  })

  const recycleApi = ApiGetCallWithPagination({
    url: '/api/ListSiteRecycleBinSummary',
    data: { ...tenantScope(tenantFilter), SiteUrl: siteUrl },
    queryKey: `CleanupRecycle-${tenantFilter}-${siteUrl}`,
    waiting: open && canReadRecycle && !!tenantFilter && !!siteUrl,
  })

  const libraries = useMemo(() => {
    const rows = Array.isArray(librariesApi.data?.Results) ? librariesApi.data.Results : []
    return [...rows].sort(
      (a, b) => (Number(b.versionEstimateBytes) || 0) - (Number(a.versionEstimateBytes) || 0)
    )
  }, [librariesApi.data])

  const composition = compositionApi.data?.Results
  // Each summary page counts its own slice of the bin; add the slices loaded so far.
  const recycle = useMemo(() => {
    const pages = (recycleApi.data?.pages ?? []).map((page) => page?.Results)
    if (!pages[0] || typeof pages[0] !== 'object') return pages[0]
    return Object.fromEntries(
      RECYCLE_SUM_FIELDS.map((field) => [
        field,
        pages.reduce((total, page) => total + (Number(page?.[field]) || 0), 0),
      ])
    )
  }, [recycleApi.data])
  const recycleLoading = recycleApi.isFetching && !recycleApi.isFetchingNextPage
  const jobStatus = jobStatusApi.data?.data?.Results
  const jobStatusText =
    typeof jobStatus === 'string'
      ? jobStatus
      : ['NoJob', 'NoRequestFound'].includes(jobStatus?.Status)
        ? 'No version cleanup job has run on this site.'
        : jobStatus?.Status

  const tipBytes = Number(composition?.tipBytes) || 0
  const versionBytes = Number(composition?.versionEstimateBytes) || 0
  const recycleBytes = Number(recycle?.totalBytes ?? composition?.recycleEstimateBytes) || 0
  const compositionTotal = tipBytes + versionBytes + recycleBytes || 1

  useEffect(() => {
    if (!open || tab !== 0 || !siteUrl || !tenantFilter) return
    jobStatusApi.mutate({
      url: '/api/ListSPOVersionCleanup',
      data: { ...tenantScope(tenantFilter), SiteUrl: siteUrl },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, siteUrl, tenantFilter])

  const refreshPreview = () => {
    librariesApi.refetch?.()
    compositionApi.refetch?.()
    recycleApi.refetch?.()
    if (siteUrl) {
      jobStatusApi.mutate({
        url: '/api/ListSPOVersionCleanup',
        data: { ...tenantScope(tenantFilter), SiteUrl: siteUrl },
      })
    }
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480, md: 560 } } } }}
      >
        <Stack spacing={2.5} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CleaningServices fontSize="small" />
              <Typography variant="h6">Storage cleanup</Typography>
            </Stack>
            <IconButton onClick={onClose} aria-label="Close" sx={{ mr: -1 }}>
              <Close />
            </IconButton>
          </Stack>

          {focusItem ? (
            <Chip
              size="small"
              color={focusItem.severity === 'high' ? 'warning' : 'default'}
              sx={{ alignSelf: 'flex-start' }}
              label={`${TYPE_LABEL[focusItem.type] || focusItem.type}${
                focusItem.estimatedBytes != null
                  ? `: ~${formatCleanupBytes(focusItem.estimatedBytes)}`
                  : ''
              }${focusItem.libraryName ? ` · ${focusItem.libraryName}` : ''}`}
            />
          ) : null}

          {siteList.length > 1 ? (
            <TextField
              select
              size="small"
              label="Site"
              value={siteUrl || ''}
              onChange={(e) => setActiveSiteUrl(e.target.value)}
              fullWidth
            >
              {siteList.map((s) => (
                <MenuItem key={s.webUrl} value={s.webUrl}>
                  {s.displayName || s.webUrl}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Typography variant="subtitle2">{siteName}</Typography>
          )}

          <Alert severity="info">
            Estimates from StorageMetrics (tip / versions) and recycle aggregates. No file names.
            Version trim reclaim may differ until the job reports Storage Released.
          </Alert>

          {(compositionApi.isFetching || librariesApi.isFetching) && <LinearProgress />}

          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Composition (estimate)
            </Typography>
            {[
              { label: 'Current files (tip)', bytes: tipBytes },
              { label: 'Previous versions', bytes: versionBytes },
              { label: 'Recycle bin', bytes: recycleBytes },
            ].map((row) => (
              <Stack key={row.label} spacing={0.75}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{row.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCleanupBytes(row.bytes)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (row.bytes / compositionTotal) * 100)}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Stack>
            ))}
          </Stack>

          <Divider />

          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="fullWidth">
            <Tab label="Versions" disabled={!canWriteSite} />
            <Tab label="Recycle" disabled={!canReadRecycle} />
          </Tabs>

          {tab === 0 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Top libraries by version estimate
              </Typography>
              {librariesApi.isFetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Library</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Versions (est.)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {libraries.slice(0, 12).map((lib) => (
                      <TableRow key={lib.id || lib.webUrl}>
                        <TableCell>{lib.displayName || lib.name}</TableCell>
                        <TableCell align="right">
                          {formatCleanupBytes(lib.storageUsedInBytes)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCleanupBytes(lib.versionEstimateBytes)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {libraries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>No libraries loaded</TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              )}
              {canWriteSite ? (
                <Button
                  variant="contained"
                  startIcon={<CleaningServices />}
                  onClick={versionDialog.handleOpen}
                >
                  Configure version cleanup…
                </Button>
              ) : null}
              {jobStatusText ? (
                <Typography variant="body2" color="text.secondary">
                  Job status: {jobStatusText}
                </Typography>
              ) : null}
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              {recycleLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : recycle && typeof recycle === 'object' ? (
                <>
                  <Stack spacing={1}>
                    <LabelValueRow
                      label="Recycle bin total"
                      value={<strong>{formatCleanupBytes(recycle.totalBytes)}</strong>}
                    />
                    <LabelValueRow
                      label="First stage"
                      value={`${recycle.firstStageCount.toLocaleString()} items · ${formatCleanupBytes(recycle.firstStageBytes)}`}
                    />
                    <LabelValueRow
                      label="Second stage"
                      value={`${recycle.secondStageCount.toLocaleString()} items · ${formatCleanupBytes(recycle.secondStageBytes)}`}
                    />
                  </Stack>
                  {recycleApi.hasNextPage ? (
                    <Alert
                      severity="info"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => recycleApi.fetchNextPage()}
                          disabled={recycleApi.isFetchingNextPage}
                        >
                          {recycleApi.isFetchingNextPage ? 'Counting…' : 'Load more'}
                        </Button>
                      }
                    >
                      Counted the newest {recycle.scannedItems.toLocaleString()} items. The bin holds
                      more.
                    </Alert>
                  ) : null}
                </>
              ) : (
                <Alert severity="warning">
                  {typeof recycle === 'string' ? recycle : 'Could not load recycle summary.'}
                </Alert>
              )}
              {canEmptyRecycle ? (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<DeleteSweep />}
                  onClick={recycleDialog.handleOpen}
                  disabled={!recycle?.totalBytes}
                >
                  Empty recycle bin
                </Button>
              ) : (
                <Alert severity="info">You need Recycle Bin write permission to empty.</Alert>
              )}
            </Stack>
          )}

          <Box sx={{ flexGrow: 1 }} />
          <Button size="small" onClick={refreshPreview} sx={{ alignSelf: 'center' }}>
            Refresh preview
          </Button>
        </Stack>
      </Drawer>

      <CippApiDialog
        createDialog={versionDialog}
        title="Configure Version Cleanup"
        relatedQueryKeys={[`CleanupLibs-${tenantFilter}-${siteUrl}`]}
        allowResubmit
        defaultvalues={{
          BatchDeleteMode: '2',
          DeleteOlderThanDays: 90,
          MajorVersionLimit: 50,
          MajorWithMinorVersionsLimit: 0,
        }}
        api={{
          type: 'POST',
          url: '/api/ExecSPOVersionCleanup',
          confirmText: `Start a file version cleanup job for ${siteName}.`,
          customDataformatter: (_row, _action, formData) => {
            const mode = parseInt(optionValue(formData.BatchDeleteMode) ?? '2', 10)
            return {
              ...tenantScope(tenantFilter),
              SiteUrl: siteUrl,
              BatchDeleteMode: mode,
              DeleteOlderThanDays: mode === 0 ? parseInt(formData.DeleteOlderThanDays, 10) : -1,
              MajorVersionLimit: mode === 1 ? parseInt(formData.MajorVersionLimit, 10) : -1,
              MajorWithMinorVersionsLimit:
                mode === 1 ? parseInt(formData.MajorWithMinorVersionsLimit, 10) : -1,
            }
          },
          multiPost: false,
          onSuccess: () => {
            jobStatusApi.mutate({
              url: '/api/ListSPOVersionCleanup',
              data: { ...tenantScope(tenantFilter), SiteUrl: siteUrl },
            })
          },
        }}
        row={activeSite ?? {}}
      >
        {({ formHook }) => (
          <CippSharePointVersionCleanupFields
            formHook={formHook}
            tenantFilter={tenantFilter}
            siteUrl={siteUrl}
          />
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={recycleDialog}
        title="Empty Recycle Bin"
        relatedQueryKeys={[`CleanupRecycle-${tenantFilter}-${siteUrl}`]}
        allowResubmit
        defaultvalues={{ Stage: 'Both' }}
        api={{
          type: 'POST',
          url: '/api/ExecEmptySiteRecycleBin',
          confirmText: `Permanently empty the recycle bin for ${siteName}? This cannot be undone.`,
          customDataformatter: (_row, _action, formData) => ({
            ...tenantScope(tenantFilter),
            SiteUrl: siteUrl,
            Stage: optionValue(formData.Stage) || 'Both',
          }),
          multiPost: false,
          onSuccess: () => {
            recycleApi.refetch?.()
            compositionApi.refetch?.()
          },
        }}
        row={activeSite ?? {}}
      >
        {({ formHook }) => (
          <CippFormComponent
            type="radio"
            name="Stage"
            label="Stage"
            formControl={formHook}
            options={[
              { label: 'Both stages', value: 'Both' },
              { label: 'First stage only', value: 'First' },
              { label: 'Second stage only', value: 'Second' },
            ]}
          />
        )}
      </CippApiDialog>
    </>
  )
}

CippStorageCleanupDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  tenantFilter: PropTypes.string,
  sites: PropTypes.array,
  focusItem: PropTypes.object,
  initialAction: PropTypes.string,
}

export default CippStorageCleanupDrawer
