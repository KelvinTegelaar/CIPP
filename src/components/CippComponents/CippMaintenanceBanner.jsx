import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import NextLink from 'next/link'
import { Box, Button, Chip, IconButton, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { Close, ErrorOutline, InfoOutlined, WarningAmber } from '@mui/icons-material'
import { formatDistanceStrict } from 'date-fns'

// Dismissal is keyed on the notice id so that re-issuing an edited notice brings the banner back
// for everyone instead of staying hidden behind a stale dismissal.
const DISMISS_KEY_PREFIX = 'cipp_maintenance_dismissed:'
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000 // 1 day, matching FailedPaymentDialog

const SEVERITIES = ['info', 'warning', 'error']

const ICONS = {
  info: InfoOutlined,
  warning: WarningAmber,
  error: ErrorOutline,
}

// localStorage throws in locked-down browsers - never let that break the layout.
const readDismissedAt = (key) => {
  try {
    return Number(window.localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

const writeDismissedAt = (key, value) => {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    /* dismissal simply won't persist */
  }
}

// localStorage is external state, so it's read through useSyncExternalStore rather than an effect.
// That also gives correct SSR behaviour: the server snapshot is always "not dismissed", and React
// re-reads the real value after hydration instead of mismatching.
const dismissalListeners = new Set()
const subscribeToDismissals = (listener) => {
  dismissalListeners.add(listener)
  return () => dismissalListeners.delete(listener)
}
const notifyDismissalChanged = () => dismissalListeners.forEach((listener) => listener())

const toDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatMoment = (date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)

const buildWindowText = (start, end, active, now) => {
  if (active && end) {
    return `Ends ${formatMoment(end)} · in ${formatDistanceStrict(end, now)}`
  }
  if (active && start) return `In progress since ${formatMoment(start)}`
  if (active) return ''
  if (start && end) {
    return `${formatMoment(start)} → ${formatMoment(end)} · starts in ${formatDistanceStrict(start, now)}`
  }
  if (start) return `Starts ${formatMoment(start)} · in ${formatDistanceStrict(start, now)}`
  if (end) return `Until ${formatMoment(end)}`
  return ''
}

/**
 * Full-width maintenance notice, rendered above the top nav.
 *
 * Driven by the CIPP_MAINTENANCE_NOTICE environment variable on the backend and delivered through
 * GetCippAlerts. Publishes its own height as the --cipp-banner-h custom property so the fixed
 * chrome (top nav, side nav, content offset) can push itself down by exactly the right amount.
 */
export const CippMaintenanceBanner = ({ alert }) => {
  const theme = useTheme()
  const rootRef = useRef(null)

  const noticeId = alert?.noticeId
  const dismissible = alert?.dismissible !== false
  const dismissKey = noticeId ? `${DISMISS_KEY_PREFIX}${noticeId}` : null

  const getDismissedAt = useCallback(
    () => (dismissKey ? readDismissedAt(dismissKey) : 0),
    [dismissKey]
  )
  const dismissedAt = useSyncExternalStore(subscribeToDismissals, getDismissedAt, () => 0)

  const severity = SEVERITIES.includes(alert?.type) ? alert.type : 'info'

  // Everything time-dependent is derived from a single "now" so the dismissal window and the
  // countdown can't disagree, and so re-renders don't produce a moving answer.
  const { active, windowText, dismissed } = useMemo(() => {
    const now = new Date()
    const startDate = toDate(alert?.startTime)
    const endDate = toDate(alert?.endTime)
    // Recompute rather than trusting the server's snapshot - a long-lived tab can cross the start.
    const isActive = startDate ? startDate <= now : Boolean(alert?.active)
    return {
      active: isActive,
      windowText: buildWindowText(startDate, endDate, isActive, now),
      dismissed:
        dismissible &&
        Boolean(dismissedAt) &&
        now.getTime() - dismissedAt < DISMISS_DURATION_MS,
    }
  }, [alert?.startTime, alert?.endTime, alert?.active, dismissedAt, dismissible])

  const visible = Boolean(alert) && !dismissed

  // Publish the rendered height so the fixed chrome can offset itself. Reset to 0px on unmount so
  // a dismissed banner leaves the layout exactly as it found it.
  useEffect(() => {
    const root = document.documentElement
    const clear = () => root.style.setProperty('--cipp-banner-h', '0px')

    if (!visible || !rootRef.current) {
      clear()
      return undefined
    }

    const element = rootRef.current
    const publish = () => root.style.setProperty('--cipp-banner-h', `${element.offsetHeight}px`)
    publish()

    // Not available under jsdom - the one-shot measurement above still gives a correct layout,
    // it just won't track reflows from wrapping.
    if (typeof ResizeObserver === 'undefined') return clear

    const observer = new ResizeObserver(publish)
    observer.observe(element)
    return () => {
      observer.disconnect()
      clear()
    }
  }, [visible])

  const handleDismiss = useCallback(() => {
    if (dismissKey) writeDismissedAt(dismissKey, Date.now())
    notifyDismissalChanged()
  }, [dismissKey])

  if (!visible) return null

  // Solid for an outage so it can't be skimmed past; tinted for info/warning so routine notices
  // read as part of the app chrome rather than an advertisement.
  const solid = severity === 'error'
  const palette = theme.palette[severity]
  const isDark = theme.palette.mode === 'dark'
  const tint = alpha(palette.main, isDark ? 0.16 : 0.12)
  const foreground = solid ? palette.contrastText : palette[isDark ? 'light' : 'dark']

  const Icon = ICONS[severity]
  const link = alert.link
  const isExternalLink = typeof link === 'string' && /^https?:\/\//i.test(link)

  return (
    <Box
      ref={rootRef}
      component="aside"
      role="status"
      aria-label="Maintenance notice"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        // Above the top nav, which sits at zIndex.appBar and is offset downward by this banner.
        zIndex: theme.zIndex.appBar + 1,
        color: foreground,
        // The gradient layer composites the tint over an opaque surface, since nothing sits behind
        // a fixed element at the top of the page.
        background: solid
          ? palette.main
          : `linear-gradient(${tint}, ${tint}), ${theme.palette.background.paper}`,
        borderBottom: `1px solid ${solid ? alpha('#000000', 0.18) : alpha(palette.main, 0.42)}`,
        boxShadow: solid ? 'none' : `inset 0 3px 0 0 ${palette.main}`,
        px: { xs: 2, md: 3 },
        py: 1.25,
      }}
    >
      {/* Top-aligned so the icon and actions sit level with the title when the message wraps. */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Icon fontSize="small" sx={{ color: solid ? 'inherit' : palette.main, mt: 0.25 }} />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 0.25, md: 1.5 }}
          alignItems={{ xs: 'flex-start', md: 'baseline' }}
          sx={{ flexGrow: 1, minWidth: 0, flexWrap: 'wrap' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {alert.title}
            </Typography>
            {active && (
              <Chip
                size="small"
                label="Live"
                sx={{
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  backgroundColor: solid ? alpha('#FFFFFF', 0.24) : palette.main,
                  color: solid ? 'inherit' : palette.contrastText,
                }}
              />
            )}
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.primary', opacity: solid ? 0.9 : 0.86 }}>
            {alert.Alert}
          </Typography>

          {windowText && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.primary',
                opacity: solid ? 0.85 : 0.62,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {windowText}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          {link && (
            <Button
              size="small"
              variant={solid ? 'outlined' : 'text'}
              {...(isExternalLink
                ? { href: link, target: '_blank', rel: 'noopener noreferrer' }
                : { component: NextLink, href: link })}
              sx={{
                color: 'inherit',
                borderColor: solid ? alpha('#FFFFFF', 0.42) : undefined,
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: alpha(solid ? '#FFFFFF' : palette.main, 0.16),
                  borderColor: solid ? alpha('#FFFFFF', 0.6) : undefined,
                },
              }}
            >
              {alert.linkText || 'Details'}
            </Button>
          )}
          {dismissible && (
            <IconButton
              size="small"
              onClick={handleDismiss}
              aria-label="Dismiss maintenance notice for 24 hours"
              sx={{
                color: 'inherit',
                '&:hover': { backgroundColor: alpha(solid ? '#FFFFFF' : palette.main, 0.16) },
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
