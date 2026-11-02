import { useEffect, useRef, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useSettings } from '../../hooks/use-settings'
import {
  armSupportRecorder,
  disarmSupportRecorder,
  downloadSupportBundle,
  getSupportRecording,
  getSupportRecordingCount,
  redactBundle,
  stripTokens,
} from '../../utils/support-bundle'

// The fixed sections go through fetch() rather than axios on purpose: the armed recorder
// captures all axios traffic, and the network section should contain only what the page
// (or the user's recorded actions) actually requested.
const fetchJson = async (url) => {
  try {
    const response = await fetch(url, { credentials: 'include' })
    const parsed = await response.json().catch(() => null)
    return response.ok ? parsed : { unavailable: response.status, body: parsed }
  } catch (error) {
    return { unavailable: String(error?.message ?? error) }
  }
}

const CippSupportBundleDialog = ({ open, onClose, onRecordingChange }) => {
  const queryClient = useQueryClient()
  const settings = useSettings()
  const [phase, setPhase] = useState('options')
  const [redact, setRedact] = useState(true)
  const [bundle, setBundle] = useState(null)
  const [redactionSummary, setRedactionSummary] = useState(null)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  // True while a manual recording is running. It deliberately survives the dialog being
  // closed - the user closes it, reproduces the issue, and comes back to stop. The
  // dialog stays mounted in _app, so this state outlives the close.
  const [recording, setRecording] = useState(false)
  // Invalidates a run when it is cancelled, so a stale run cannot finish later and
  // overwrite the state of a newer one.
  const runToken = useRef(0)
  const modeRef = useRef('page')

  // Reopening lands on the options screen - unless a manual recording is running, in
  // which case it lands back on the recording screen. Adjusted during render (the
  // React-sanctioned alternative to setState-in-effect).
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (recording) {
        setPhase('recording')
        setProgress(getSupportRecordingCount())
      } else {
        setPhase('options')
        setBundle(null)
        setRedactionSummary(null)
        setErrorMessage(null)
        setProgress(0)
      }
    }
  }

  // Closing cancels a page capture in flight; a manual recording keeps running.
  useEffect(() => {
    if (!open && !recording) {
      runToken.current++
      disarmSupportRecorder()
    }
  }, [open, recording])

  // Live request counter while the dialog is showing an armed recorder.
  useEffect(() => {
    if (!open || (phase !== 'collecting' && phase !== 'recording')) return
    const interval = setInterval(
      () => setProgress(getSupportRecordingCount()),
      300
    )
    return () => clearInterval(interval)
  }, [open, phase])

  const assemble = async (token) => {
    const localVersion = await fetchJson('/version.json')
    const [instance, me, authMe] = await Promise.all([
      fetchJson(
        `/api/GetVersion?LocalVersion=${encodeURIComponent(localVersion?.version ?? '')}`
      ),
      fetchJson('/api/me'),
      fetchJson('/.auth/me'),
    ])
    if (token !== runToken.current) return
    disarmSupportRecorder()
    const network = getSupportRecording()
    let assembled = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      instanceHostname: window.location.hostname,
      redaction: { enabled: redact },
      client: {
        captureMode: modeRef.current,
        path: window.location.pathname,
        tenant: settings.currentTenant ?? null,
        userAgent: navigator.userAgent,
        frontendVersion: localVersion?.version ?? null,
      },
      instance,
      user: { me, authMe },
      network,
    }
    // Tokens are live credentials and are stripped from every bundle, before and
    // independent of the optional identifier redaction.
    const stripped = stripTokens(assembled)
    assembled = stripped.bundle
    assembled.tokensRemoved = stripped.removed
    if (redact) {
      // The instance's own hostname identifies the installation, not a customer
      // tenant - support needs it, so it survives redaction.
      const redacted = redactBundle(assembled, {
        keepHostnames: [window.location.hostname],
      })
      assembled = redacted.bundle
      assembled.redaction = { enabled: true, ...redacted.summary }
      setRedactionSummary(redacted.summary)
    }
    setBundle(assembled)
    setProgress(network.length)
    setPhase('ready')
  }

  const failRun = (token, error) => {
    if (token !== runToken.current) return
    disarmSupportRecorder()
    setErrorMessage(String(error?.message ?? error))
    setPhase('error')
  }

  const handleCapturePage = async () => {
    const token = ++runToken.current
    modeRef.current = 'page'
    setPhase('collecting')
    setProgress(0)
    armSupportRecorder()
    try {
      // Force every query mounted on the current page to hit the API again - the
      // recorder only sees axios traffic, so cache reads must become real requests.
      await queryClient.refetchQueries({ type: 'active' })
      await assemble(token)
    } catch (error) {
      failRun(token, error)
    }
  }

  const handleStartRecording = () => {
    ++runToken.current
    modeRef.current = 'recording'
    setRecording(true)
    onRecordingChange?.(true)
    armSupportRecorder()
    onClose()
  }

  const handleStopRecording = async () => {
    const token = ++runToken.current
    setRecording(false)
    onRecordingChange?.(false)
    setPhase('collecting')
    try {
      await assemble(token)
    } catch (error) {
      failRun(token, error)
    }
  }

  const handleDiscardRecording = () => {
    ++runToken.current
    setRecording(false)
    onRecordingChange?.(false)
    disarmSupportRecorder()
    setPhase('options')
    setProgress(0)
  }

  const failedCount =
    bundle?.network?.filter((call) => !call.success).length ?? 0
  const capturedFrom =
    bundle?.client?.captureMode === 'recording'
      ? 'during the recording'
      : 'from this page'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Support File</DialogTitle>
      <DialogContent>
        {phase === 'options' && (
          <Stack spacing={2}>
            <DialogContentText>
              Capture this page&apos;s API requests now, or record while you
              reproduce an issue. Either way the file also includes the instance
              version, hosting and update details, and your signed-in identity
              and roles.
            </DialogContentText>
            <FormControlLabel
              control={
                <Switch
                  checked={redact}
                  onChange={(event) => setRedact(event.target.checked)}
                />
              }
              label="Redact tenant IDs, domains and email addresses"
            />
          </Stack>
        )}
        {phase === 'recording' && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{
              alignItems: "center"
            }}>
              <CippIcons.FiberManualRecord color="error" />
              <Typography variant="body2">
                Recording — {progress} request{progress === 1 ? '' : 's'}{' '}
                captured so far.
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              Close this dialog, reproduce the issue, then click the recording
              indicator to come back and stop. Reloading the browser discards
              the recording.
            </Typography>
          </Stack>
        )}
        {phase === 'collecting' && (
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              py: 2
            }}>
            <CircularProgress />
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Collecting — {progress} request{progress === 1 ? '' : 's'}{' '}
              captured...
            </Typography>
          </Stack>
        )}
        {phase === 'ready' && (
          <Stack spacing={2}>
            <DialogContentText>
              Captured {bundle.network.length} request
              {bundle.network.length === 1 ? '' : 's'} {capturedFrom}
              {failedCount > 0 ? `, of which ${failedCount} failed` : ''}, along
              with the instance version, hosting and update details, and your
              signed-in identity and roles.
            </DialogContentText>
            {redactionSummary ? (
              <Alert severity="success">
                Redacted {redactionSummary.emails} email address
                {redactionSummary.emails === 1 ? '' : 'es'},{' '}
                {redactionSummary.guids} GUID
                {redactionSummary.guids === 1 ? '' : 's'} and{' '}
                {redactionSummary.domains} domain
                {redactionSummary.domains === 1 ? '' : 's'}.
              </Alert>
            ) : (
              <Alert severity="info">
                The file contains unredacted data from the current page, your
                user identity, and instance details. Authentication tokens are
                always removed. Only share it with support.
              </Alert>
            )}
          </Stack>
        )}
        {phase === 'error' && (
          <Alert severity="error">
            Could not generate the support file: {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {phase === 'options' && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              startIcon={<CippIcons.FiberManualRecord />}
              onClick={handleStartRecording}
            >
              Record Actions
            </Button>
            <Button
              variant="contained"
              startIcon={<CippIcons.PlayArrow />}
              onClick={handleCapturePage}
            >
              Capture This Page
            </Button>
          </>
        )}
        {phase === 'recording' && (
          <>
            <Button onClick={handleDiscardRecording}>Discard</Button>
            <Button onClick={onClose}>Continue Recording</Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CippIcons.Stop />}
              onClick={handleStopRecording}
            >
              Stop &amp; Generate
            </Button>
          </>
        )}
        {(phase === 'collecting' || phase === 'ready' || phase === 'error') && (
          <>
            <Button onClick={onClose}>
              {phase === 'ready' ? 'Close' : 'Cancel'}
            </Button>
            <Button
              variant="contained"
              startIcon={<CippIcons.Download />}
              disabled={phase !== 'ready'}
              onClick={() => downloadSupportBundle(bundle)}
            >
              Download
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CippSupportBundleDialog
