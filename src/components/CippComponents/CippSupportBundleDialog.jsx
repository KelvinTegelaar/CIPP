import { useEffect, useRef, useState } from 'react'
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
import { Download, PlayArrow } from '@mui/icons-material'
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
// itself requested.
const fetchJson = async (url) => {
  try {
    const response = await fetch(url, { credentials: 'include' })
    const parsed = await response.json().catch(() => null)
    return response.ok ? parsed : { unavailable: response.status, body: parsed }
  } catch (error) {
    return { unavailable: String(error?.message ?? error) }
  }
}

const CippSupportBundleDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient()
  const settings = useSettings()
  const [phase, setPhase] = useState('options')
  const [redact, setRedact] = useState(true)
  const [bundle, setBundle] = useState(null)
  const [redactionSummary, setRedactionSummary] = useState(null)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  // Invalidates a run when the dialog closes mid-collection, so a stale run cannot
  // finish later and overwrite the state of a newer one.
  const runToken = useRef(0)
  const pollRef = useRef(null)

  const stopCollecting = () => {
    disarmSupportRecorder()
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // Each open starts back at the options screen. State is adjusted during render on the
  // open transition (the React-sanctioned alternative to setState-in-effect); the close
  // effect below only cancels the run and disarms the recorder — external side effects,
  // no state updates.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setPhase('options')
      setBundle(null)
      setRedactionSummary(null)
      setErrorMessage(null)
      setProgress(0)
    }
  }

  useEffect(() => {
    if (!open) {
      runToken.current++
      stopCollecting()
    }
  }, [open])

  const handleStart = async () => {
    const token = ++runToken.current
    setPhase('collecting')
    setProgress(0)
    armSupportRecorder()
    pollRef.current = setInterval(
      () => setProgress(getSupportRecordingCount()),
      300
    )
    try {
      // Force every query mounted on the current page to hit the API again — the
      // recorder only sees axios traffic, so cache reads must become real requests.
      const refetchPromise = queryClient.refetchQueries({ type: 'active' })
      const localVersion = await fetchJson('/version.json')
      const [instance, me, authMe] = await Promise.all([
        fetchJson(
          `/api/GetVersion?LocalVersion=${encodeURIComponent(localVersion?.version ?? '')}`
        ),
        fetchJson('/api/me'),
        fetchJson('/.auth/me'),
      ])
      await refetchPromise
      if (token !== runToken.current) return
      stopCollecting()
      const network = getSupportRecording()
      let assembled = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        instanceHostname: window.location.hostname,
        redaction: { enabled: redact },
        client: {
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
        // tenant — support needs it, so it survives redaction.
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
    } catch (error) {
      if (token !== runToken.current) return
      stopCollecting()
      setErrorMessage(String(error?.message ?? error))
      setPhase('error')
    }
  }

  const failedCount =
    bundle?.network?.filter((call) => !call.success).length ?? 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Support File</DialogTitle>
      <DialogContent>
        {phase === 'options' && (
          <Stack spacing={2}>
            <DialogContentText>
              This refreshes the current page&apos;s data and captures the API
              requests behind it, together with the instance version, hosting
              and update details, and your signed-in identity and roles
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
        {phase === 'collecting' && (
          <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Refreshing the current page&apos;s data — {progress} request
              {progress === 1 ? '' : 's'} captured...
            </Typography>
          </Stack>
        )}
        {phase === 'ready' && (
          <Stack spacing={2}>
            <DialogContentText>
              Captured {bundle.network.length} request
              {bundle.network.length === 1 ? '' : 's'} from this page
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
        <Button onClick={onClose}>
          {phase === 'ready' ? 'Close' : 'Cancel'}
        </Button>
        {phase === 'options' && (
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleStart}
          >
            Start Capture
          </Button>
        )}
        {phase !== 'options' && (
          <Button
            variant="contained"
            startIcon={<Download />}
            disabled={phase !== 'ready'}
            onClick={() => downloadSupportBundle(bundle)}
          >
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CippSupportBundleDialog
