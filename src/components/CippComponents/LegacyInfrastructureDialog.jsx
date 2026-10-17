import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'

// Keyed on the notice id, like the banner, so a re-issued notice comes back for everyone.
const SNOOZE_KEY_PREFIX = 'cipp_legacy_infrastructure_snoozed:'

// Before the cutoff the dialog can be waved through after a short wait and stays away for a
// working shift. Once the legacy infrastructure has stopped receiving updates it comes back every
// hour and makes people sit through a longer wait, since at that point there is nothing left to
// weigh up.
const BEFORE_CUTOFF = { waitSeconds: 10, snoozeMs: 8 * 60 * 60 * 1000 }
const AFTER_CUTOFF = { waitSeconds: 30, snoozeMs: 60 * 60 * 1000 }

const readSnoozedAt = (key) => {
  try {
    return Number(window.localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

const writeSnoozedAt = (key, value) => {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    /* the dialog simply comes back on the next load */
  }
}

// localStorage is external state, read through useSyncExternalStore like the banner does, so the
// open/closed decision is derived during render instead of set from an effect.
const snoozeListeners = new Set()
const subscribeToSnoozes = (listener) => {
  snoozeListeners.add(listener)
  return () => snoozeListeners.delete(listener)
}
const notifySnoozeChanged = () => snoozeListeners.forEach((listener) => listener())

const toDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatCutoff = (date) =>
  new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    date
  )

/**
 * Blocking migration dialog for instances still on the legacy Function App infrastructure.
 *
 * Raised by the same GetCippAlerts entry that drives the maintenance banner, when that entry is
 * flagged "blocking". The backdrop and Escape do nothing; the only way past it is the migration
 * guide or a "continue" button that unlocks after a countdown and snoozes the dialog for a while.
 */
export const LegacyInfrastructureDialog = ({ alert }) => {
  const blocking = alert?.blocking === true
  const noticeId = alert?.noticeId
  const snoozeKey = noticeId ? `${SNOOZE_KEY_PREFIX}${noticeId}` : null
  // Clock reads live in a memo and in the store snapshot rather than in render itself, so the
  // component stays pure and re-renders cannot flip the answer on their own.
  const { cutoffDate, pastCutoff } = useMemo(() => {
    const date = toDate(alert?.cutoff)
    return { cutoffDate: date, pastCutoff: Boolean(date) && date <= new Date() }
  }, [alert?.cutoff])
  const { waitSeconds, snoozeMs } = pastCutoff ? AFTER_CUTOFF : BEFORE_CUTOFF

  const getSnoozed = useCallback(() => {
    const snoozedAt = snoozeKey ? readSnoozedAt(snoozeKey) : 0
    return Boolean(snoozedAt) && Date.now() - snoozedAt < snoozeMs
  }, [snoozeKey, snoozeMs])
  const snoozed = useSyncExternalStore(subscribeToSnoozes, getSnoozed, () => false)
  const open = blocking && !snoozed

  const [secondsLeft, setSecondsLeft] = useState(waitSeconds)

  // One interval for the whole countdown, torn down when it reaches zero or the dialog closes.
  useEffect(() => {
    if (!open || secondsLeft <= 0) return undefined
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [open, secondsLeft])

  const handleContinue = useCallback(() => {
    if (snoozeKey) writeSnoozedAt(snoozeKey, Date.now())
    notifySnoozeChanged()
    // Re-arm the countdown so the dialog is not instantly skippable when the snooze runs out.
    setSecondsLeft(waitSeconds)
  }, [snoozeKey, waitSeconds])

  if (!blocking) return null

  const link = alert.link
  const canContinue = secondsLeft === 0
  const snoozeHours = Math.round(snoozeMs / (60 * 60 * 1000))

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      slotProps={{ backdrop: { onClick: (e) => e.stopPropagation() } }}
      aria-labelledby="legacy-infrastructure-dialog-title"
    >
      <DialogTitle id="legacy-infrastructure-dialog-title">
        This CIPP instance must be migrated
      </DialogTitle>
      <DialogContent>
        <Alert severity={pastCutoff ? 'error' : 'warning'} sx={{ mb: 2 }}>
          {pastCutoff
            ? 'This instance runs on the legacy Function App infrastructure and no longer receives updates. Every release since the cutoff, including security fixes, is missing here.'
            : `This instance runs on the legacy Function App infrastructure, which no longer receives updates starting ${
                cutoffDate ? formatCutoff(cutoffDate) : 'December 2026'
              }. After that date no new features or security fixes will reach it.`}
        </Alert>

        <Typography sx={{ mb: 2 }}>
          CIPP now ships as a single Linux container. The new infrastructure is faster, more
          reliable and cheaper to run, and it keeps itself up to date so you never fall behind on
          releases again.
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          What you get after migrating
        </Typography>
        <Typography component="ul" variant="body2" sx={{ pl: 3, mb: 2 }}>
          <li>Faster page loads and API responses, with no cold starts.</li>
          <li>
            Automatic updates at a restart time you choose, so new features and fixes arrive on
            their own.
          </li>
          <li>Lower Azure running costs than the Function App and Static Web App pair.</li>
          <li>Simpler troubleshooting, with one app to look at instead of two.</li>
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          What the migration keeps
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Your storage account and Key Vault stay where they are, so your tenants, standards,
          settings and secrets all carry across. The migration guide walks through it step by step.
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
          }}
        >
          This reminder returns every {snoozeHours} {snoozeHours === 1 ? 'hour' : 'hours'} until
          the instance is migrated. Questions? See the{' '}
          <Link href={link} target="_blank" rel="noopener noreferrer">
            migration guide
          </Link>
          .
        </Typography>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1}>
          <Button onClick={handleContinue} disabled={!canContinue} color="inherit">
            {canContinue
              ? 'Continue without migrating'
              : `Continue without migrating (${secondsLeft})`}
          </Button>
          <Button
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="primary"
            startIcon={<CippIcons.OpenInNew />}
          >
            {alert.linkText || 'Open the migration guide'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
