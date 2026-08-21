import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  CleaningServices,
  Close,
  Refresh,
  RestoreFromTrash,
  Storage as StorageIcon,
} from '@mui/icons-material'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippApiDialog } from './CippApiDialog'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import { CippPropertyList } from './CippPropertyList'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { useDialog } from '../../hooks/use-dialog'
import { usePermissions } from '../../hooks/use-permissions'

const optionValue = (value) =>
  value && typeof value === 'object' && 'value' in value ? value.value : value

const TabPanel = ({ value, index, children }) =>
  value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null

TabPanel.propTypes = {
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
}

const VERSION_CLEANUP_LABELS = {
  Status: 'Status',
  BatchDeleteMode: 'Cleanup Mode',
  RequestTimeInUTC: 'Requested (UTC)',
  LastProcessTimeInUTC: 'Last Processed (UTC)',
  CompleteTimeInUTC: 'Completed (UTC)',
  ListsProcessed: 'Lists Processed',
  ListsUpdated: 'Lists Updated',
  ListsFailed: 'Lists Failed',
  FilesProcessed: 'Files Processed',
  VersionsProcessed: 'Versions Processed',
  VersionsDeleted: 'Versions Deleted',
  VersionsFailed: 'Versions Failed',
  StorageReleased: 'Storage Released (bytes)',
  ErrorMessage: 'Error Message',
  WorkItemId: 'Work Item ID',
  Message: 'Message',
}
const VERSION_CLEANUP_FIELDS = Object.keys(VERSION_CLEANUP_LABELS)
const TOP_LIBRARIES = 8

const formatBytes = (bytes) => {
  const num = Number(bytes)
  if (bytes === null || bytes === undefined || bytes === '' || Number.isNaN(num)) return null
  if (num < 1024) return `${num} B`
  const gb = num / (1024 * 1024 * 1024)
  if (gb >= 0.01) return `${gb.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`
  const mb = num / (1024 * 1024)
  return `${mb.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB`
}

const toBytesFromMb = (mb) => {
  if (mb === null || mb === undefined || mb === '') return null
  const num = Number(mb)
  if (Number.isNaN(num)) return null
  return num * 1024 * 1024
}

const formatVersionPolicy = (props) => {
  if (!props || typeof props !== 'object') return null
  if (props.InheritVersionPolicyFromTenant) return 'Tenant default'
  const major =
    props.MajorVersionLimit === null || props.MajorVersionLimit === undefined
      ? null
      : Number(props.MajorVersionLimit)
  const days =
    props.ExpireVersionsAfterDays === null || props.ExpireVersionsAfterDays === undefined
      ? null
      : Number(props.ExpireVersionsAfterDays)

  if (props.EnableAutoExpirationVersionTrim) {
    const parts = ['Auto trim']
    if (major !== null && !Number.isNaN(major) && major > 0) {
      parts.push(`${major.toLocaleString()} major`)
    }
    if (days !== null && !Number.isNaN(days) && days > 0) {
      parts.push(`${days.toLocaleString()} days`)
    }
    return parts.join(' · ')
  }

  if (major !== null && !Number.isNaN(major)) {
    if (major <= 0) return 'Unlimited / not set'
    const label = `${major.toLocaleString()} major versions`
    if (days !== null && !Number.isNaN(days) && days > 0) {
      return `${label} · expire after ${days.toLocaleString()} days`
    }
    return label
  }
  return null
}

const jobStatusChip = (progress) => {
  if (!progress || typeof progress === 'string') {
    return { label: 'No job', color: 'default' }
  }
  if (progress.Status === 'NoRequestFound' || progress.Status === 'NoJob') {
    return { label: 'No job', color: 'default' }
  }
  const status = String(progress.Status ?? '').toLowerCase()
  if (!status) return { label: 'Unknown', color: 'default' }
  if (status.includes('complete') || status.includes('success')) {
    return { label: progress.Status, color: 'success' }
  }
  if (status.includes('fail') || status.includes('error')) {
    return { label: progress.Status, color: 'error' }
  }
  if (status.includes('run') || status.includes('progress') || status.includes('pending')) {
    return { label: progress.Status, color: 'warning' }
  }
  return { label: progress.Status, color: 'info' }
}

const VersionCleanupFields = ({ formHook }) => (
  <>
    <CippFormComponent
      type="radio"
      name="BatchDeleteMode"
      label="Cleanup Mode"
      formControl={formHook}
      options={[
        { label: 'Sync Policy — apply site version policy to existing versions', value: '2' },
        {
          label: 'Delete Older Than Days — remove versions older than a set number of days',
          value: '0',
        },
        { label: 'Count Limits — keep a maximum number of major versions', value: '1' },
      ]}
    />
    <CippFormCondition
      field="BatchDeleteMode"
      compareType="is"
      compareValue="0"
      formControl={formHook}
    >
      <CippFormComponent
        type="number"
        name="DeleteOlderThanDays"
        label="Delete Versions Older Than (days)"
        formControl={formHook}
        validators={{
          required: 'Please enter the number of days',
          min: { value: 30, message: 'SharePoint requires at least 30 days' },
        }}
      />
    </CippFormCondition>
    <CippFormCondition
      field="BatchDeleteMode"
      compareType="is"
      compareValue="1"
      formControl={formHook}
    >
      <CippFormComponent
        type="number"
        name="MajorVersionLimit"
        label="Maximum Major Versions to Keep"
        formControl={formHook}
        validators={{ required: 'Please enter the version limit' }}
      />
      <CippFormComponent
        type="number"
        name="MajorWithMinorVersionsLimit"
        label="Major Versions That Keep Their Minor Versions"
        formControl={formHook}
        validators={{ required: 'Please enter the major-with-minor version limit' }}
      />
    </CippFormCondition>
  </>
)

VersionCleanupFields.propTypes = {
  formHook: PropTypes.object.isRequired,
}

/**
 * Site-scoped Storage sheet for cleanup.
 * Overview (cheap live): used/quota, version policy, top libraries.
 * Recycle / Versions tabs: cleanup actions — no file-level scans.
 */
export const CippSharePointBrowserStorage = ({
  open = false,
  onClose,
  item,
  tenantFilter,
}) => {
  const [tab, setTab] = useState(0)
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])
  const canReadRecycleBin = checkPermissions([
    'Sharepoint.SiteRecycleBin.Read',
    'Sharepoint.SiteRecycleBin.ReadWrite',
  ])
  const canRestore = checkPermissions(['Sharepoint.SiteRecycleBin.ReadWrite'])
  const startCleanupDialog = useDialog()

  const siteUrl = item?.webUrl
  const siteId = item?.id
  const siteName = item?.displayName || item?.name || 'Site'
  const tenant = item?.Tenant ?? tenantFilter
  const sitePropsApi = ApiPostCall({})
  const jobStatusApi = ApiPostCall({})

  const librariesApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: {
      tenantFilter: tenant,
      SiteId: siteId,
      SiteUrl: siteUrl,
    },
    queryKey: `SiteBrowserStorageLibs-${tenant}-${siteId || siteUrl}`,
    waiting: open && !!tenant && !!(siteId || siteUrl),
  })

  const fetchSiteProps = () => {
    if (!tenant || (!siteUrl && !siteId)) return
    sitePropsApi.mutate({
      url: '/api/ExecSiteBrowserActions',
      data: {
        Action: 'GetSiteProperties',
        tenantFilter: tenant,
        SiteUrl: siteUrl,
        SiteId: siteId,
      },
    })
  }

  const fetchJobStatus = () => {
    if (!tenant || (!siteUrl && !siteId)) return
    jobStatusApi.mutate({
      url: '/api/ExecSiteBrowserActions',
      data: {
        Action: 'GetVersionCleanupStatus',
        tenantFilter: tenant,
        SiteUrl: siteUrl,
        SiteId: siteId,
      },
    })
  }

  const refreshAll = () => {
    fetchSiteProps()
    librariesApi.refetch?.()
    if (tab === 2) fetchJobStatus()
  }

  useEffect(() => {
    if (!open) return
    setTab(0)
    fetchSiteProps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, siteUrl, siteId, tenant])

  useEffect(() => {
    if (!open || tab !== 2) return
    fetchJobStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, siteUrl, siteId, tenant])

  const siteProps =
    typeof sitePropsApi.data?.data?.Results === 'object' &&
    sitePropsApi.data?.data?.Results !== null &&
    !Array.isArray(sitePropsApi.data?.data?.Results)
      ? sitePropsApi.data.data.Results
      : null

  const jobProgress = jobStatusApi.data?.data?.Results
  const versionsLabel = formatVersionPolicy(siteProps)
  const chip = useMemo(() => jobStatusChip(jobProgress), [jobProgress])

  const usedBytes = useMemo(() => {
    const fromItem = Number(item?.storageUsedInBytes)
    if (!Number.isNaN(fromItem) && fromItem > 0) return fromItem
    return toBytesFromMb(siteProps?.StorageUsage)
  }, [item?.storageUsedInBytes, siteProps?.StorageUsage])

  const quotaBytes = toBytesFromMb(siteProps?.StorageMaximumLevel)
  const warningBytes = toBytesFromMb(siteProps?.StorageWarningLevel)
  const usedLabel = formatBytes(usedBytes) || '—'
  const quotaLabel = formatBytes(quotaBytes)
  const usedPct =
    quotaBytes && usedBytes !== null && quotaBytes > 0
      ? Math.min(100, Math.round((usedBytes / quotaBytes) * 1000) / 10)
      : null
  const nearWarning =
    warningBytes && usedBytes !== null ? usedBytes >= warningBytes : usedPct !== null && usedPct >= 85
  const quotaBarColor = nearWarning ? 'warning' : 'primary'

  const libraryRows = useMemo(() => {
    const raw = librariesApi.data?.Results
    if (!Array.isArray(raw)) return []
    return [...raw]
      .map((lib) => ({
        ...lib,
        _bytes: Number(lib.storageUsedInBytes),
      }))
      .sort((a, b) => {
        const aOk = !Number.isNaN(a._bytes) ? a._bytes : -1
        const bOk = !Number.isNaN(b._bytes) ? b._bytes : -1
        return bOk - aOk
      })
  }, [librariesApi.data])

  const topLibraries = libraryRows.slice(0, TOP_LIBRARIES)
  const librariesMeasuredBytes = useMemo(
    () =>
      libraryRows.reduce((sum, lib) => {
        if (Number.isNaN(lib._bytes) || lib._bytes < 0) return sum
        return sum + lib._bytes
      }, 0),
    [libraryRows]
  )
  const librariesMeasuredLabel = formatBytes(librariesMeasuredBytes)
  const maxLibBytes = topLibraries[0]?._bytes > 0 ? topLibraries[0]._bytes : 0

  const glanceLoading = sitePropsApi.isPending && !siteProps
  const libsLoading = librariesApi.isFetching && !libraryRows.length

  const handleClose = () => {
    setTab(0)
    onClose?.()
  }

  const recycleBinQueryKey = `SiteBrowserRecycleBin-${siteUrl}`

  const recycleActions = [
    {
      label: 'Restore Item',
      type: 'POST',
      icon: <RestoreFromTrash />,
      url: '/api/ExecRestoreRecycleBinItems',
      data: {
        Ids: 'Id',
        ItemNames: 'LeafName',
        SiteUrl: siteUrl,
        tenantFilter: tenant,
      },
      confirmText: 'Restore [LeafName] from the recycle bin?',
      condition: () => canRestore,
      multiPost: false,
    },
  ]

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pr: 12 }}>
          <Typography variant="h6" component="span">
            Storage — {siteName}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  aria-label="Refresh"
                  onClick={refreshAll}
                  disabled={!siteUrl || glanceLoading}
                >
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton aria-label="Close" onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: 520 }}>
          {!siteUrl ? (
            <Alert severity="warning">No site URL available for this selection.</Alert>
          ) : (
            <Stack spacing={1.5}>
              <Tabs
                value={tab}
                onChange={(_, next) => setTab(next)}
                variant="scrollable"
                allowScrollButtonsMobile
              >
                <Tab label="Overview" />
                <Tab label="Recycle bin" />
                <Tab label="Versions" />
              </Tabs>
              <Divider />

              <TabPanel value={tab} index={0}>
                <Stack spacing={2}>
                  {glanceLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : (
                    <Stack spacing={1.25}>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="center"
                      >
                        <Chip
                          size="small"
                          icon={<StorageIcon />}
                          color={nearWarning ? 'warning' : 'default'}
                          label={
                            quotaLabel
                              ? `Used ${usedLabel} / ${quotaLabel}${
                                  usedPct !== null ? ` (${usedPct}%)` : ''
                                }`
                              : `Used ${usedLabel}`
                          }
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={versionsLabel ? `Policy: ${versionsLabel}` : 'Policy: —'}
                        />
                        {librariesMeasuredLabel ? (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Libraries ${librariesMeasuredLabel}`}
                          />
                        ) : null}
                      </Stack>

                      {quotaBytes ? (
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={usedPct ?? 0}
                            color={quotaBarColor}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {nearWarning
                              ? 'Near quota warning — reclaim recycle or trim versions before the site locks writes.'
                              : 'Quota usage from site properties (live).'}
                          </Typography>
                        </Box>
                      ) : null}

                      <Alert severity="info">
                        <strong>Cleanup path:</strong> check largest libraries → Recycle bin
                        (1st/2nd stage) → Versions if history looks like the gap. Version bytes are
                        not measured live (that would scan files).
                      </Alert>
                    </Stack>
                  )}

                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="subtitle2">Largest libraries</Typography>
                      {libsLoading ? <CircularProgress size={18} /> : null}
                    </Stack>
                    {librariesApi.isError ? (
                      <Alert severity="warning">
                        Could not load library sizes. You can still use Recycle and Versions.
                      </Alert>
                    ) : !libsLoading && !topLibraries.length ? (
                      <Typography variant="body2" color="text.secondary">
                        No document libraries returned for this site.
                      </Typography>
                    ) : (
                      <TableContainer
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 320 }}
                      >
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Library</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell align="right">Files</TableCell>
                              <TableCell align="right" sx={{ minWidth: 140 }}>
                                Size
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topLibraries.map((lib) => {
                              const pct =
                                maxLibBytes > 0 && !Number.isNaN(lib._bytes) && lib._bytes > 0
                                  ? Math.min(100, (lib._bytes / maxLibBytes) * 100)
                                  : 0
                              return (
                                <TableRow key={lib.id}>
                                  <TableCell>
                                    <Typography variant="body2" noWrap title={lib.displayName}>
                                      {lib.displayName || lib.name || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                      {lib.siteType || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" color="text.secondary">
                                      {lib.fileCount != null
                                        ? Number(lib.fileCount).toLocaleString()
                                        : '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Stack spacing={0.5} alignItems="flex-end">
                                      <Typography variant="body2">
                                        {formatBytes(lib.storageUsedInBytes) || '—'}
                                      </Typography>
                                      {pct > 0 ? (
                                        <LinearProgress
                                          variant="determinate"
                                          value={pct}
                                          sx={{ width: 96, height: 4, borderRadius: 1 }}
                                        />
                                      ) : null}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.75 }}
                    >
                      Library size = root folder StorageMetrics (live). Site used may be higher —
                      recycle, versions, and other lists are not in this table.
                      {libraryRows.length > TOP_LIBRARIES
                        ? ` Showing top ${TOP_LIBRARIES} of ${libraryRows.length}.`
                        : ''}
                    </Typography>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel value={tab} index={1}>
                {!canReadRecycleBin ? (
                  <Alert severity="info">
                    Recycle bin requires SharePoint recycle bin read permission.
                  </Alert>
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 1.5 }}>
                      First and second stage together (newest first, capped by the API). Filter on
                      Item State. Sizes are per item — totals are not fully summed live.
                    </Alert>
                    <CippDataTable
                      noCard={true}
                      title="Deleted items"
                      queryKey={recycleBinQueryKey}
                      api={{
                        url: '/api/ListSiteRecycleBin',
                        data: {
                          SiteUrl: siteUrl,
                          tenantFilter: tenant,
                        },
                        dataKey: 'Results',
                      }}
                      actions={recycleActions}
                      simpleColumns={[
                        'LeafName',
                        'DirName',
                        'ItemType',
                        'ItemState',
                        'Size',
                        'DeletedByName',
                        'DeletedDate',
                      ]}
                    />
                  </>
                )}
              </TabPanel>

              <TabPanel value={tab} index={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">Version history trim</Typography>
                    <Chip size="small" color={chip.color} label={chip.label} />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchJobStatus}
                      disabled={jobStatusApi.isPending}
                    >
                      Refresh status
                    </Button>
                    <Tooltip
                      title={
                        canWriteSite
                          ? 'Start version cleanup'
                          : 'Requires SharePoint write permission'
                      }
                    >
                      <span>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CleaningServices />}
                          disabled={!canWriteSite}
                          onClick={() => startCleanupDialog.handleOpen()}
                        >
                          Start cleanup
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Site policy: {versionsLabel || '—'}. A cleanup job trims existing file versions; it
                  does not change the policy. Use when libraries look smaller than site used and
                  recycle is already thin — classic version bloat.
                </Alert>

                {jobStatusApi.isError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {typeof jobStatusApi.error?.response?.data?.Results === 'string'
                      ? jobStatusApi.error.response.data.Results
                      : 'Failed to load cleanup job status.'}
                  </Alert>
                ) : null}

                {jobStatusApi.isPending && !jobProgress ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : !jobProgress ||
                  (typeof jobProgress === 'string' && !jobProgress.trim()) ||
                  jobProgress?.Status === 'NoRequestFound' ||
                  jobProgress?.Status === 'NoJob' ? (
                  <Alert severity="info">
                    {jobProgress?.Message || 'No cleanup job found for this site.'}
                  </Alert>
                ) : typeof jobProgress === 'string' ? (
                  <Alert severity="info">{jobProgress}</Alert>
                ) : (
                  <CippPropertyList
                    isFetching={jobStatusApi.isPending}
                    layout="two"
                    propertyItems={VERSION_CLEANUP_FIELDS.filter(
                      (key) => jobProgress?.[key] !== undefined && jobProgress?.[key] !== ''
                    ).map((key) => ({
                      label: VERSION_CLEANUP_LABELS[key],
                      value: String(jobProgress[key]),
                    }))}
                  />
                )}
              </TabPanel>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <CippApiDialog
        createDialog={startCleanupDialog}
        title="Start Version Cleanup"
        relatedQueryKeys={[]}
        allowResubmit
        defaultvalues={{ BatchDeleteMode: '2' }}
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserActions',
          confirmText: `Start a file version cleanup job for ${siteName}. This will trim old file versions based on the selected mode.`,
          customDataformatter: (row, action, formData) => {
            const mode = parseInt(optionValue(formData.BatchDeleteMode) ?? '2', 10)
            return {
              tenantFilter: tenant,
              SiteUrl: siteUrl,
              SiteId: siteId,
              Action: 'StartVersionCleanup',
              BatchDeleteMode: mode,
              DeleteOlderThanDays: mode === 0 ? parseInt(formData.DeleteOlderThanDays, 10) : -1,
              MajorVersionLimit: mode === 1 ? parseInt(formData.MajorVersionLimit, 10) : -1,
              MajorWithMinorVersionsLimit:
                mode === 1 ? parseInt(formData.MajorWithMinorVersionsLimit, 10) : -1,
            }
          },
          multiPost: false,
          onSuccess: () => {
            fetchJobStatus()
          },
        }}
        row={item ?? {}}
      >
        {({ formHook }) => <VersionCleanupFields formHook={formHook} />}
      </CippApiDialog>
    </>
  )
}

CippSharePointBrowserStorage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  item: PropTypes.object,
  tenantFilter: PropTypes.string,
}
