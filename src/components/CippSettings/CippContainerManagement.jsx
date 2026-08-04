import { useEffect, useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import {
  CheckCircle,
  NewReleases,
  Schedule,
  Layers,
  Sell,
  HelpOutline,
  Refresh,
  CloudSync,
  RestartAlt,
  Save,
  SwapHoriz,
} from '@mui/icons-material'
import { Grid } from '@mui/system'
import { useForm, useWatch } from 'react-hook-form'
import CippFormComponent from '../CippComponents/CippFormComponent'
import CippButtonCard from '../CippCards/CippButtonCard'
import { CippInfoBar } from '../CippCards/CippInfoBar'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../CippComponents/CippApiResults'
import { useDialog } from '../../hooks/use-dialog'

const channelLabels = {
  latest: { label: 'Latest (Stable)', color: 'success' },
  dev: { label: 'Dev', color: 'warning' },
  nightly: { label: 'Nightly', color: 'info' },
  unknown: { label: 'Unknown', color: 'default' },
}

const intervalOptions = [
  { label: 'Disabled', value: '0' },
  { label: 'Every hour', value: '1h' },
  { label: 'Every 4 hours', value: '4h' },
  { label: 'Every 12 hours', value: '12h' },
  { label: 'Every day', value: '1d' },
]

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, '0')}:00`,
  value: String(i),
}))

// Build metadata is baked into the image at build time and is simply absent on locally built and
// dev images — COMMIT_SHA in particular arrives as "-unknown" from some build pipelines. Treat all
// of those as "not reported" so the UI shows only facts, rather than a column of the word unknown.
const isUnset = (value) =>
  value == null ||
  value === '' ||
  ['unknown', '-unknown', '0.0.0', '0.0.0-local'].includes(
    String(value).trim().toLowerCase()
  )

const shortCommit = (value) => {
  if (isUnset(value)) return null
  const sha = String(value).replace(/^-+/, '')
  return sha.length > 7 ? sha.slice(0, 7) : sha
}

const formatUtcDate = (value) => {
  if (isUnset(value)) return null
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

// Show algo prefix + first 12 hex chars; the full digest lives in the tooltip.
const truncateDigest = (digest) => {
  if (isUnset(digest)) return null
  if (digest.startsWith('sha256:')) return `sha256:${digest.slice(7, 19)}…`
  return digest.length > 20 ? `${digest.slice(0, 20)}…` : digest
}

const relativeTime = (epochSeconds) => {
  if (!epochSeconds) return null
  const diff = Date.now() - epochSeconds * 1000
  if (diff < 0) return 'just now'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Drops rows the running build doesn't report, so a dev image shows the two or three facts it
// actually has rather than a list of placeholders.
const knownProperties = (items) =>
  items
    .filter((item) => !isUnset(item.value))
    .map(({ label, value }) => ({ label, value }))

export const CippContainerManagement = () => {
  const channelForm = useForm({
    mode: 'onChange',
    defaultValues: { Channel: null },
  })

  const updateSettingsForm = useForm({
    mode: 'onChange',
    defaultValues: { CheckInterval: null, AutoUpdate: true, CheckTime: null },
  })

  const checkDialog = useDialog()
  const restartDialog = useDialog()

  const containerStatus = ApiGetCall({
    url: '/api/ExecContainerManagement',
    data: { Action: 'Status' },
    queryKey: 'containerStatus',
  })

  const channelAction = ApiPostCall({ relatedQueryKeys: ['containerStatus'] })
  const restartAction = ApiPostCall({ relatedQueryKeys: ['containerStatus'] })
  const updateCheckAction = ApiPostCall({
    relatedQueryKeys: ['containerStatus'],
  })
  const updateSettingsAction = ApiPostCall({
    relatedQueryKeys: ['containerStatus'],
  })

  const data = containerStatus.data?.Results
  const updateSettings = data?.UpdateSettings

  // Presentation for a channel value. Standard channels get their friendly name; a branch build
  // shows its tag, which is the thing that matches the branch it came from. Kept here rather
  // than server-side so channelLabels stays the single source of truth for both the picker and
  // the running-channel tile.
  //
  // The "pinned" arm only exists for immutable -<shortsha> tags left over from an earlier
  // version of preview-container.yml; it no longer creates them, and cleanup sweeps the
  // stragglers. Remove this once none remain.
  const prettyChannelLabel = (option) => {
    const value = option?.value ?? option
    if (channelLabels[value]) return channelLabels[value].label
    const pinned = /-([0-9a-f]{7})$/.exec(value ?? '')
    if (pinned)
      return `${value.replace(/-[0-9a-f]{7}$/, '')} — pinned ${pinned[1]}`
    return value
  }

  const buildChannelPattern = data?.BuildChannelPattern
    ? new RegExp(data.BuildChannelPattern)
    : null
  const isBuildChannel = (value) =>
    Boolean(value) &&
    !(data?.ValidChannels ?? []).includes(value) &&
    (buildChannelPattern ? buildChannelPattern.test(value) : false)

  const selectedChannel = channelForm.watch('Channel')
  const selectedChannelValue = selectedChannel?.value ?? selectedChannel
  const buildChannelSelected = isBuildChannel(selectedChannelValue)

  // Preferred check time and auto-restart only mean anything while periodic checks are on.
  const watchedInterval = useWatch({
    control: updateSettingsForm.control,
    name: 'CheckInterval',
  })
  const checksDisabled =
    (watchedInterval?.value ?? watchedInterval ?? '0') === '0'

  // A branch build has no entry in channelLabels — show the tag itself rather than "Unknown",
  // so it's obvious at a glance that the instance is running something off the supported track.
  const channelInfo =
    channelLabels[data?.CurrentChannel] ??
    (isBuildChannel(data?.CurrentChannel)
      ? {
          label: prettyChannelLabel({ value: data.CurrentChannel }),
          color: 'error',
        }
      : channelLabels.unknown)

  // The option list is loaded by the autocomplete itself (see the api prop below), so seed the
  // field from the running channel directly rather than looking it up in a local options array.
  useEffect(() => {
    if (containerStatus.isSuccess && data?.CurrentChannel) {
      channelForm.reset({
        Channel: {
          label: prettyChannelLabel({ value: data.CurrentChannel }),
          value: data.CurrentChannel,
        },
      })
    }
  }, [containerStatus.isSuccess, data?.CurrentChannel])

  useEffect(() => {
    if (containerStatus.isSuccess && updateSettings) {
      const interval = intervalOptions.find(
        (o) => o.value === (updateSettings.CheckInterval ?? '0')
      )
      const hour =
        updateSettings.CheckTime != null
          ? hourOptions.find(
              (o) => o.value === String(updateSettings.CheckTime)
            )
          : null
      updateSettingsForm.reset({
        CheckInterval: interval ?? intervalOptions[0],
        AutoUpdate: updateSettings.AutoUpdate ?? false,
        CheckTime: hour ?? null,
      })
    }
  }, [
    containerStatus.isSuccess,
    updateSettings?.CheckInterval,
    updateSettings?.AutoUpdate,
    updateSettings?.CheckTime,
  ])

  const handleUpdateChannel = () => {
    const selected = channelForm.getValues('Channel')
    const channel = selected?.value ?? selected
    channelAction.mutate({
      url: '/api/ExecContainerManagement',
      data: { Action: 'UpdateChannel', Channel: channel },
    })
  }

  const handleRestart = () => {
    restartAction.mutate({
      url: '/api/ExecContainerManagement',
      data: { Action: 'Restart' },
    })
  }

  const handleCheckUpdate = () => {
    updateCheckAction.mutate({
      url: '/api/ExecContainerManagement',
      data: { Action: 'CheckUpdate' },
    })
  }

  const handleSaveUpdateSettings = () => {
    const interval = updateSettingsForm.getValues('CheckInterval')
    const autoUpdate = updateSettingsForm.getValues('AutoUpdate')
    const checkTime = updateSettingsForm.getValues('CheckTime')
    updateSettingsAction.mutate({
      url: '/api/ExecContainerManagement',
      data: {
        Action: 'SaveUpdateSettings',
        CheckInterval: interval?.value ?? interval ?? '0',
        AutoUpdate: autoUpdate ?? false,
        CheckTime: checkTime?.value ?? checkTime ?? null,
      },
    })
  }

  const infoBarData = useMemo(() => {
    const commit = shortCommit(data?.CommitSha)
    const version = isUnset(data?.CurrentVersion) ? '—' : data.CurrentVersion

    const buildDetails = knownProperties([
      { label: 'Image Tag', value: data?.ImageTag },
      { label: 'Commit SHA', value: shortCommit(data?.CommitSha) },
      { label: 'Image Built (UTC)', value: formatUtcDate(data?.BuildDate) },
      { label: 'Container Image', value: data?.CurrentImage },
      { label: 'App Service', value: data?.SiteName },
    ])

    const remoteDetails = knownProperties([
      { label: 'Version', value: updateSettings?.RemoteVersion },
      {
        label: 'Built (UTC)',
        value: formatUtcDate(updateSettings?.RemoteBuildDate),
      },
      { label: 'Digest', value: truncateDigest(updateSettings?.RemoteDigest) },
    ])

    const updateState = !updateSettings?.LastCheck
      ? { label: 'Never checked', color: 'primary', icon: <HelpOutline /> }
      : updateSettings.UpdateAvailable
        ? { label: 'Update available', color: 'info', icon: <NewReleases /> }
        : { label: 'Up to date', color: 'success', icon: <CheckCircle /> }

    return [
      {
        icon: <Layers />,
        name: 'Release Channel',
        data: channelInfo.label,
        color: channelInfo.color === 'default' ? 'primary' : channelInfo.color,
        toolTip: `Running image tag: ${data?.ImageTag ?? 'unknown'}`,
      },
      {
        icon: <Sell />,
        name: 'App Version',
        data: commit ? `${version} @${commit}` : version,
        color: 'primary',
        offcanvas: buildDetails.length
          ? { title: 'Build Details', propertyItems: buildDetails }
          : undefined,
      },
      {
        icon: updateState.icon,
        name: 'Update Status',
        data: updateState.label,
        color: updateState.color,
        offcanvas: remoteDetails.length
          ? { title: 'Latest on this channel', propertyItems: remoteDetails }
          : undefined,
      },
      {
        icon: <Schedule />,
        name: 'Last Checked',
        data: relativeTime(updateSettings?.LastCheck) ?? 'Never',
        color: 'primary',
        toolTip: updateSettings?.LastCheck
          ? new Date(updateSettings.LastCheck * 1000).toLocaleString()
          : 'No update check has run on this instance yet',
      },
    ]
  }, [data, updateSettings, channelInfo.label, channelInfo.color])

  const channelChangePending =
    data?.ConfiguredChannel && data.ConfiguredChannel !== data.CurrentChannel

  // The saved setting, not the form value — the backend reads the stored table row when it
  // decides whether a manual check should also restart.
  const autoUpdateEnabled = updateSettings?.AutoUpdate === true

  const cardSx = { height: '100%', display: 'flex', flexDirection: 'column' }
  const helperText = { variant: 'body2', color: 'text.secondary' }

  return (
    <>
      <Stack spacing={3}>
        <CippInfoBar
          isFetching={containerStatus.isFetching}
          data={infoBarData}
        />

        {/* Page-level state. Static explanation lives on the cards as helper text; an Alert
            only appears when there is something to act on. */}
        {(channelChangePending || updateSettings?.UpdateAvailable) && (
          <Stack spacing={2}>
            {channelChangePending && (
              <Alert severity="warning">
                A channel change is pending. Running:{' '}
                <strong>{data.CurrentChannel}</strong>, configured:{' '}
                <strong>{data.ConfiguredChannel}</strong>. Restart the container
                to apply.
              </Alert>
            )}
            {updateSettings?.UpdateAvailable && (
              <Alert severity="info">
                A container update is available. Restart the container to pull
                the latest image.
              </Alert>
            )}
          </Stack>
        )}

        {/* Actions sit between the status strip they act on and the settings they apply to,
            rather than in a card of their own. Each opens a dialog that carries its own
            explanation and result, so the page itself stays free of standing copy. */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          flexWrap="wrap"
          useFlexGap
        >
          {/* Re-reads the Status endpoint only. Distinct from "Check for Updates", which hits the
              container registry and can trip auto-restart when an update is found. */}
          <Button
            variant="text"
            startIcon={<Refresh />}
            onClick={() => containerStatus.refetch()}
            disabled={containerStatus.isFetching}
          >
            {containerStatus.isFetching ? 'Refreshing...' : 'Refresh Status'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudSync />}
            onClick={() => checkDialog.handleOpen()}
            disabled={updateCheckAction.isPending}
          >
            {updateCheckAction.isPending ? 'Checking...' : 'Check for Updates'}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestartAlt />}
            onClick={() => restartDialog.handleOpen()}
            disabled={restartAction.isPending}
          >
            {restartAction.isPending ? 'Restarting...' : 'Restart Container'}
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippButtonCard
              title="Release Channel"
              cardSx={cardSx}
              CardButton={
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<SwapHoriz />}
                    onClick={handleUpdateChannel}
                    disabled={channelAction.isPending}
                  >
                    {channelAction.isPending ? 'Updating...' : 'Update Channel'}
                  </Button>
                </Box>
              }
            >
              <Stack spacing={2}>
                <Typography {...helperText}>
                  Which image tag this instance runs. The new image is pulled on
                  the next restart.
                </Typography>
                {/*
                  Options come from ListChannels rather than a static list so branch builds appear
                  as soon as their image is pushed. showRefresh gives the field a refresh button —
                  push a branch, wait for the build, refresh, select it, no page reload.
                  Free text stays enabled as a fallback if the registry lookup fails; the backend
                  validates both the tag pattern and that the image actually exists.
                */}
                <CippFormComponent
                  type="autoComplete"
                  name="Channel"
                  label="Release Channel"
                  formControl={channelForm}
                  api={{
                    url: '/api/ExecContainerManagement',
                    data: { Action: 'ListChannels' },
                    queryKey: 'containerChannels',
                    dataKey: 'Results',
                    labelField: prettyChannelLabel,
                    valueField: 'value',
                    excludeTenantFilter: true,
                    showRefresh: true,
                  }}
                  groupBy={(option) =>
                    option.rawData?.group ?? 'Standard channels'
                  }
                  creatable={true}
                  multiple={false}
                />
                {buildChannelSelected && (
                  <Alert severity="error">
                    <strong>{selectedChannelValue}</strong> is an unsupported
                    build from an unmerged branch. It does not receive updates,
                    and it is deleted when its branch is — after which this
                    instance cannot start until you switch back to a standard
                    channel. Use it for testing only.
                  </Alert>
                )}
                <CippApiResults apiObject={channelAction} />
              </Stack>
            </CippButtonCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CippButtonCard
              title="Update Checks"
              cardSx={cardSx}
              CardButton={
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveUpdateSettings}
                    disabled={updateSettingsAction.isPending}
                  >
                    {updateSettingsAction.isPending
                      ? 'Saving...'
                      : 'Save Settings'}
                  </Button>
                </Box>
              }
            >
              <Stack spacing={2}>
                <Typography {...helperText}>
                  How often CIPP asks the registry whether a newer image has
                  been published on your channel.
                </Typography>

                <CippFormComponent
                  type="autoComplete"
                  name="CheckInterval"
                  label="Check Interval"
                  options={intervalOptions}
                  formControl={updateSettingsForm}
                  creatable={false}
                  multiple={false}
                />

                <CippFormComponent
                  type="autoComplete"
                  name="CheckTime"
                  label="Preferred Check Time"
                  options={hourOptions}
                  formControl={updateSettingsForm}
                  creatable={false}
                  multiple={false}
                  disabled={checksDisabled}
                />

                <CippFormComponent
                  type="switch"
                  name="AutoUpdate"
                  label="Auto-restart when an update is detected"
                  formControl={updateSettingsForm}
                  disabled={checksDisabled}
                />

                {checksDisabled && (
                  <Typography variant="caption" color="text.secondary">
                    Checks are off, so the preferred time and auto-restart have
                    no effect. You can still check manually with Check for
                    Updates.
                  </Typography>
                )}

                <CippApiResults apiObject={updateSettingsAction} />
              </Stack>
            </CippButtonCard>
          </Grid>
        </Grid>
      </Stack>

      {/* Both dialogs stay open after firing so the result lands where the action was taken,
          rather than as a banner on the page behind them. */}
      <Dialog
        open={checkDialog.open}
        onClose={checkDialog.handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Check for updates?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            CIPP will ask the container registry whether a newer image has been
            published on the <strong>{channelInfo.label}</strong> channel.
          </DialogContentText>
          {/* A manual check is not read-only when auto-restart is on: the backend calls
              Request-CIPPRestart as soon as it finds a newer version. Say so before they click.
              Use "Refresh Status" instead to re-read state without touching the registry. */}
          {autoUpdateEnabled ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Auto-restart is enabled, so if a newer image is found the
              container will restart immediately to apply it, causing brief
              downtime.
            </Alert>
          ) : (
            <DialogContentText sx={{ mb: 2 }}>
              Auto-restart is off, so nothing is pulled or restarted — you will
              need to restart the container to apply anything found.
            </DialogContentText>
          )}
          <CippApiResults apiObject={updateCheckAction} />
        </DialogContent>
        <DialogActions>
          <Button onClick={checkDialog.handleClose}>Close</Button>
          <Button
            variant="contained"
            color={autoUpdateEnabled ? 'warning' : 'primary'}
            startIcon={autoUpdateEnabled ? <RestartAlt /> : <CloudSync />}
            onClick={handleCheckUpdate}
            disabled={updateCheckAction.isPending}
          >
            {updateCheckAction.isPending
              ? 'Checking...'
              : autoUpdateEnabled
                ? 'Check & Apply'
                : 'Check Now'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={restartDialog.open}
        onClose={restartDialog.handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Restart container?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            CIPP will be briefly unavailable while the container restarts. The
            newest image on the <strong>{channelInfo.label}</strong> channel is
            pulled as it comes back up — a restart always updates to the latest
            image on the channel, whatever the reason for it.
          </DialogContentText>
          <CippApiResults apiObject={restartAction} />
        </DialogContent>
        <DialogActions>
          <Button onClick={restartDialog.handleClose}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<RestartAlt />}
            onClick={handleRestart}
            disabled={restartAction.isPending}
          >
            {restartAction.isPending ? 'Restarting...' : 'Restart Container'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CippContainerManagement
