import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import PropTypes from 'prop-types'
import axios from 'axios'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { usePermissions } from '../../hooks/use-permissions'
import { buildVersionedHeaders } from '../../utils/cippVersion'
import { filterEligibleCopyLibraries } from '../../utils/sharepoint-library-copy-eligible'

const POLL_MS = 20000

const LIBRARY_COPY_STATUS = {
  Processing: { label: 'In progress', alertSeverity: 'info', progressColor: 'primary', chipColor: 'info' },
  Completed: { label: 'Completed', alertSeverity: 'success', progressColor: 'success', chipColor: 'success' },
  CompletedWithErrors: {
    label: 'Completed with errors',
    alertSeverity: 'warning',
    progressColor: 'warning',
    chipColor: 'warning',
  },
  Failed: { label: 'Failed', alertSeverity: 'error', progressColor: 'error', chipColor: 'error' },
}

const formatCopyBytes = (bytes) => {
  const num = Number(bytes)
  if (bytes === null || bytes === undefined || bytes === '' || Number.isNaN(num)) return null
  if (num === 0) return '0 B'
  if (num < 1024) return `${num} B`
  const gb = num / (1024 * 1024 * 1024)
  if (gb >= 0.01) return `${gb.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`
  const mb = num / (1024 * 1024)
  return `${mb.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB`
}

const formatMetric = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  return Number(value).toLocaleString()
}

const formatLastUpdated = (iso) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString()
}

const LibraryCopyStatusPanel = ({ status, operationId, refreshing, onRefresh }) => {
  const statusKey = status?.Status ?? 'Processing'
  const statusMeta = LIBRARY_COPY_STATUS[statusKey] ?? LIBRARY_COPY_STATUS.Processing
  const isTerminal = ['Completed', 'CompletedWithErrors', 'Failed'].includes(statusKey)
  const progressValue =
    status?.ProgressPercent != null ? Math.min(100, Math.max(0, Number(status.ProgressPercent))) : null

  const objectsLabel =
    status?.TotalExpectedObjects != null
      ? `${formatMetric(status.ObjectsProcessed)} / ${formatMetric(status.TotalExpectedObjects)}`
      : formatMetric(status?.ObjectsProcessed)

  const metrics = [
    { label: 'Jobs complete', value: `${formatMetric(status?.JobsComplete)} / ${formatMetric(status?.JobsTotal)}` },
    { label: 'Objects processed', value: objectsLabel },
    { label: 'Files created', value: formatMetric(status?.FilesCreated) },
    { label: 'Data copied', value: formatCopyBytes(status?.BytesProcessed) ?? '—' },
    {
      label: 'Errors',
      value: formatMetric(status?.TotalErrors),
      emphasis: (status?.TotalErrors ?? 0) > 0 ? 'error.main' : undefined,
    },
    {
      label: 'Warnings',
      value: formatMetric(status?.TotalWarnings),
      emphasis: (status?.TotalWarnings ?? 0) > 0 ? 'warning.main' : undefined,
    },
  ]

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          alignItems: "center",
          flexWrap: "wrap"
        }}>
        <Chip
          size="small"
          color={statusMeta.chipColor}
          icon={
            statusKey === 'CompletedWithErrors' ? (
              <CippIcons.WarningAmber />
            ) : statusKey === 'Failed' ? (
              <CippIcons.ErrorOutlined />
            ) : isTerminal ? (
              <CippIcons.TaskAlt />
            ) : undefined
          }
          label={statusMeta.label}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<CippIcons.Refresh />}
          disabled={refreshing}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </Stack>

      {status?.Message ? (
        <Alert severity={statusMeta.alertSeverity}>{status.Message}</Alert>
      ) : (
        <Alert severity="info">Waiting for the first status update…</Alert>
      )}

      {(status?.Errors?.length ?? 0) > 0 ? (
        <Alert severity="error">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Error details
          </Typography>
          <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
            {status.Errors.map((entry, index) => (
              <Typography key={`${entry.Message}-${index}`} component="li" variant="body2">
                {entry.Message}
              </Typography>
            ))}
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mt: 1
            }}>
            Paths and filenames are redacted from SharePoint logs.
          </Typography>
        </Alert>
      ) : null}

      {(status?.Warnings?.length ?? 0) > 0 ? (
        <Alert severity="warning">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Warnings
          </Typography>
          <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
            {status.Warnings.map((entry, index) => (
              <Typography key={`${entry.Message}-${index}`} component="li" variant="body2">
                {entry.Message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : null}

      <Card variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{
          alignItems: "center"
        }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="overline" sx={{
              color: "text.secondary"
            }}>
              Source
            </Typography>
            <Typography variant="body1">{status?.SourceSiteName ?? '—'}</Typography>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              {status?.SourceLibraryName ?? '—'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
            <CippIcons.ArrowForward color="action" />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="overline" sx={{
              color: "text.secondary"
            }}>
              Destination
            </Typography>
            <Typography variant="body1">{status?.DestSiteName ?? '—'}</Typography>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              {status?.DestLibraryName ?? '—'}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {progressValue != null ? (
        <Box>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              mb: 0.5
            }}>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              Overall progress
            </Typography>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {progressValue}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color={statusMeta.progressColor}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      ) : (
        !isTerminal && <LinearProgress sx={{ height: 8, borderRadius: 1 }} />
      )}

      {status ? (
        <Card variant="outlined">
          <Grid container>
            {metrics.map((metric) => (
              <Grid key={metric.label} size={{ xs: 12, sm: 4 }} sx={{ p: 2 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "text.secondary",
                    display: "block"
                  }}>
                  {metric.label}
                </Typography>
                <Typography variant="h6" color={metric.emphasis}>
                  {metric.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Card>
      ) : null}

      <Stack spacing={0.5}>
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          Operation ID:{' '}
          <Box component="span" sx={{ fontFamily: 'monospace' }}>
            {operationId}
          </Box>
        </Typography>
        {status?.LastUpdatedUtc ? (
          <Typography variant="caption" sx={{
            color: "text.secondary"
          }}>
            Last updated: {formatLastUpdated(status.LastUpdatedUtc)}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}

LibraryCopyStatusPanel.propTypes = {
  status: PropTypes.object,
  operationId: PropTypes.string.isRequired,
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
}

const LibraryCopyPane = ({
  label,
  tenantFilter,
  initialSite,
  initialLibrary,
  selectedSite,
  selectedLibrary,
  onSelectSite,
  onSelectLibrary,
  onClearLibrary,
  otherSiteId,
  otherListId,
}) => {
  const [view, setView] = useState(initialSite && initialLibrary ? 'libraries' : 'sites')

  useEffect(() => {
    if (initialSite && initialLibrary && !selectedSite) {
      onSelectSite(initialSite)
      onSelectLibrary(initialLibrary)
      setView('libraries')
    }
  }, [initialSite, initialLibrary, onSelectLibrary, onSelectSite, selectedSite])

  const sitesApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: { tenantFilter },
    queryKey: `LibraryCopySites-${tenantFilter}-${label}`,
    waiting: !!tenantFilter,
  })

  const librariesApi = ApiGetCall({
    url: '/api/ListSiteLibraries',
    data: {
      tenantFilter,
      SiteId: selectedSite?.id,
      SiteUrl: selectedSite?.webUrl,
    },
    queryKey: `LibraryCopyLibs-${tenantFilter}-${label}-${selectedSite?.id ?? 'none'}`,
    waiting: !!tenantFilter && view === 'libraries' && !!selectedSite?.id,
  })

  const sites = useMemo(() => {
    const raw = sitesApi.data?.Results
    return Array.isArray(raw) ? raw.filter((row) => row.type === 'site') : []
  }, [sitesApi.data])

  const libraries = useMemo(() => {
    const raw = librariesApi.data?.Results
    return filterEligibleCopyLibraries(Array.isArray(raw) ? raw : [])
  }, [librariesApi.data])

  const isBlockedLibrary = (lib) =>
    selectedSite?.id === otherSiteId && lib.Id === otherListId

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      {view === 'libraries' && selectedSite ? (
        <>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              mb: 1
            }}>
            <Button size="small" startIcon={<CippIcons.ArrowBack />} onClick={() => setView('sites')}>
              Sites
            </Button>
            <Typography variant="body2" noWrap sx={{
              color: "text.secondary"
            }}>
              {selectedSite.displayName ?? selectedSite.name}
            </Typography>
          </Stack>
          {librariesApi.isFetching ? (
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Loading libraries…
            </Typography>
          ) : (
            <List dense sx={{ overflow: 'auto', flex: 1 }}>
              {libraries.map((lib) => {
                const blocked = isBlockedLibrary(lib)
                const selected = selectedLibrary?.Id === lib.Id
                return (
                  <ListItemButton
                    key={lib.Id}
                    selected={selected}
                    disabled={blocked}
                    onClick={() => {
                      if (blocked) return
                      onSelectLibrary({
                        id: lib.Id,
                        Id: lib.Id,
                        displayName: lib.Title,
                        template: lib.Template,
                      })
                    }}
                  >
                    <ListItemText
                      primary={lib.Title}
                      secondary={blocked ? 'Cannot match the other pane' : null}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          )}
        </>
      ) : (
        <>
          {sitesApi.isFetching ? (
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Loading sites…
            </Typography>
          ) : (
            <List dense sx={{ overflow: 'auto', flex: 1 }}>
              {sites.map((site) => (
                <ListItemButton
                  key={site.id}
                  onClick={() => {
                    onSelectSite(site)
                    onClearLibrary()
                    setView('libraries')
                  }}
                >
                  <ListItemText primary={site.displayName ?? site.name} />
                </ListItemButton>
              ))}
            </List>
          )}
        </>
      )}
    </Box>
  );
}

LibraryCopyPane.propTypes = {
  label: PropTypes.string.isRequired,
  tenantFilter: PropTypes.string,
  initialSite: PropTypes.object,
  initialLibrary: PropTypes.object,
  selectedSite: PropTypes.object,
  selectedLibrary: PropTypes.object,
  onSelectSite: PropTypes.func.isRequired,
  onSelectLibrary: PropTypes.func.isRequired,
  onClearLibrary: PropTypes.func.isRequired,
  otherSiteId: PropTypes.string,
  otherListId: PropTypes.string,
}

export const CippSharePointLibraryCopyDialog = ({
  open,
  onClose,
  tenantFilter,
  sourceSite,
  sourceLibrary,
}) => {
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Sharepoint.Site.ReadWrite'])

  const [sourceSelectedSite, setSourceSelectedSite] = useState(null)
  const [sourceSelectedLibrary, setSourceSelectedLibrary] = useState(null)
  const [destSelectedSite, setDestSelectedSite] = useState(null)
  const [destSelectedLibrary, setDestSelectedLibrary] = useState(null)
  const [conflictBehavior, setConflictBehavior] = useState('Replace')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preflight, setPreflight] = useState(null)
  const [operationId, setOperationId] = useState(null)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [statusRefreshing, setStatusRefreshing] = useState(false)

  const execApi = ApiPostCall({})
  const pollTimerRef = useRef(null)
  const pollInFlightRef = useRef(false)
  const pollStoppedRef = useRef(false)

  const resetSession = useCallback(() => {
    setConfirmOpen(false)
    setPreflight(null)
    setOperationId(null)
    setStatus(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetSession()
      return
    }
    if (sourceSite) setSourceSelectedSite(sourceSite)
    if (sourceLibrary) {
      setSourceSelectedLibrary({
        id: sourceLibrary.id,
        Id: sourceLibrary.id,
        displayName: sourceLibrary.displayName,
        template: sourceLibrary.template,
      })
    }
  }, [open, resetSession, sourceLibrary, sourceSite])

  const selectionPayload = useMemo(
    () => ({
      tenantFilter,
      SourceSiteId: sourceSelectedSite?.id,
      SourceSiteUrl: sourceSelectedSite?.webUrl,
      SourceListId: sourceSelectedLibrary?.Id ?? sourceSelectedLibrary?.id,
      SourceSiteName: sourceSelectedSite?.displayName,
      SourceLibraryName: sourceSelectedLibrary?.displayName,
      DestSiteId: destSelectedSite?.id,
      DestSiteUrl: destSelectedSite?.webUrl,
      DestListId: destSelectedLibrary?.Id ?? destSelectedLibrary?.id,
      DestSiteName: destSelectedSite?.displayName,
      DestLibraryName: destSelectedLibrary?.displayName,
      NameConflictBehavior: conflictBehavior,
    }),
    [
      conflictBehavior,
      destSelectedLibrary,
      destSelectedSite,
      sourceSelectedLibrary,
      sourceSelectedSite,
      tenantFilter,
    ]
  )

  const readyForReview =
    !!selectionPayload.SourceListId &&
    !!selectionPayload.DestListId &&
    !!selectionPayload.SourceSiteId &&
    !!selectionPayload.DestSiteId

  const handleReview = async () => {
    setError(null)
    try {
      const res = await execApi.mutateAsync({
        url: '/api/ExecSiteBrowserLibraryCopy',
        data: { ...selectionPayload, Action: 'PreflightLibraryCopy' },
      })
      const result = res?.data?.Results
      if (typeof result === 'string') {
        setError(result)
        return
      }
      setPreflight(result)
      setConfirmOpen(true)
    } catch (e) {
      setError(e?.message ?? 'Preflight failed.')
    }
  }

  const handleStart = async () => {
    setError(null)
    setConfirmOpen(false)
    try {
      const res = await execApi.mutateAsync({
        url: '/api/ExecSiteBrowserLibraryCopy',
        data: { ...selectionPayload, Action: 'StartLibraryCopy' },
      })
      const result = res?.data?.Results
      if (typeof result === 'string') {
        setError(result)
        return
      }
      setOperationId(result.OperationId)
    } catch (e) {
      setError(e?.message ?? 'Failed to start copy.')
    }
  }

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const stopPolling = useCallback(() => {
    pollStoppedRef.current = true
    clearPollTimer()
  }, [clearPollTimer])

  const fetchStatus = useCallback(
    async ({ manual = false } = {}) => {
      if (!operationId || !tenantFilter) return
      if (!manual && pollStoppedRef.current) return
      if (pollInFlightRef.current) return

      pollInFlightRef.current = true
      if (manual) setStatusRefreshing(true)

      try {
        const response = await axios.post(
          '/api/ListSiteBrowserLibraryCopy',
          { tenantFilter, OperationId: operationId },
          { headers: await buildVersionedHeaders() },
        )
        if (!manual && pollStoppedRef.current) return

        const result = response?.data?.Results
        if (typeof result === 'string') {
          setError(result)
          if (!manual) stopPolling()
          return
        }

        setError(null)
        setStatus(result)
        if (['Completed', 'CompletedWithErrors', 'Failed'].includes(result?.Status)) {
          stopPolling()
        }
      } catch (e) {
        if (manual || !pollStoppedRef.current) {
          setError(e?.message ?? 'Status poll failed.')
          if (!manual) stopPolling()
        }
      } finally {
        pollInFlightRef.current = false
        if (manual) setStatusRefreshing(false)
      }
    },
    [operationId, stopPolling, tenantFilter],
  )

  useEffect(() => {
    if (!operationId || !tenantFilter) return undefined

    pollStoppedRef.current = false
    pollInFlightRef.current = false

    fetchStatus()
    pollTimerRef.current = setInterval(() => fetchStatus(), POLL_MS)

    return () => stopPolling()
  }, [fetchStatus, operationId, stopPolling, tenantFilter])

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
        <DialogTitle>Copy library contents</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {!operationId ? (
              <>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{
                    flex: 1
                  }}>
                    <LibraryCopyPane
                      label="Source"
                      tenantFilter={tenantFilter}
                      initialSite={sourceSite}
                      initialLibrary={sourceLibrary}
                      selectedSite={sourceSelectedSite}
                      selectedLibrary={sourceSelectedLibrary}
                      onSelectSite={setSourceSelectedSite}
                      onSelectLibrary={setSourceSelectedLibrary}
                      onClearLibrary={() => setSourceSelectedLibrary(null)}
                      otherSiteId={destSelectedSite?.id}
                      otherListId={destSelectedLibrary?.Id ?? destSelectedLibrary?.id}
                    />
                  </Box>
                  <Box sx={{
                    flex: 1
                  }}>
                    <LibraryCopyPane
                      label="Destination"
                      tenantFilter={tenantFilter}
                      selectedSite={destSelectedSite}
                      selectedLibrary={destSelectedLibrary}
                      onSelectSite={setDestSelectedSite}
                      onSelectLibrary={setDestSelectedLibrary}
                      onClearLibrary={() => setDestSelectedLibrary(null)}
                      otherSiteId={sourceSelectedSite?.id}
                      otherListId={sourceSelectedLibrary?.Id ?? sourceSelectedLibrary?.id}
                    />
                  </Box>
                </Stack>
                <TextField
                  select
                  size="small"
                  label="Conflict handling"
                  value={conflictBehavior}
                  onChange={(e) => setConflictBehavior(e.target.value)}
                  sx={{ maxWidth: 280 }}
                >
                  <MenuItem value="Replace">Replace existing items</MenuItem>
                  <MenuItem value="Fail">Fail on conflict</MenuItem>
                </TextField>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block"
                  }}>
                  Metadata and versions are preserved via MoveButKeepSource. Custom column values require
                  matching columns on the destination. File-level progress is not shown to protect tenant
                  content.
                </Typography>
              </>
            ) : (
              <LibraryCopyStatusPanel
                status={status}
                operationId={operationId}
                refreshing={statusRefreshing}
                onRefresh={() => fetchStatus({ manual: true })}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {!operationId && canWrite ? (
            <Button
              variant="contained"
              color={conflictBehavior === 'Replace' ? 'warning' : 'primary'}
              startIcon={<CippIcons.ContentCopy />}
              disabled={!readyForReview || execApi.isPending}
              onClick={handleReview}
            >
              Review copy…
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm library copy</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              <strong>From:</strong> {sourceSelectedSite?.displayName} / {sourceSelectedLibrary?.displayName}
            </Typography>
            <Typography variant="body2">
              <strong>To:</strong> {destSelectedSite?.displayName} / {destSelectedLibrary?.displayName}
            </Typography>
            <Typography variant="body2">
              <strong>Conflict:</strong> {conflictBehavior}
            </Typography>
            <Typography variant="body2">
              <strong>Estimated jobs:</strong> {preflight?.EligibleRootCount ?? '—'}
            </Typography>
            {preflight?.WarnLevel === 'strong' ? (
              <Alert severity="warning">
                This library has many root items ({preflight.EligibleRootCount}). Copy may be slow.
              </Alert>
            ) : null}
            {preflight?.WarnLevel === 'soft' ? (
              <Alert severity="info">
                Estimated {preflight.EligibleRootCount} SharePoint jobs will be queued.
              </Alert>
            ) : null}
            {conflictBehavior === 'Replace' ? (
              <Alert severity="warning">
                Existing same-name items in the destination will be overwritten. This cannot be undone from
                CIPP.
              </Alert>
            ) : null}
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              Contents merge into the destination library. Source is not deleted. Missing custom columns on
              the destination drop those field values.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleStart} disabled={execApi.isPending}>
            Start copy
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CippSharePointLibraryCopyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tenantFilter: PropTypes.string,
  sourceSite: PropTypes.shape({
    id: PropTypes.string,
    webUrl: PropTypes.string,
    displayName: PropTypes.string,
  }),
  sourceLibrary: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    template: PropTypes.string,
  }),
}
