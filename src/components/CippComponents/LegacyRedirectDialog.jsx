import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

// The migration leaves the retired Static Web App serving a 301 to the new instance, and
// that redirect carries this marker. It is the only reliable signal: a browser following a
// 301 forwards the *original* referrer, so document.referrer is empty for the bookmark and
// typed-URL navigations these users actually arrive with.
const MARKER_PARAM = 'legacyredirect'
const SEEN_KEY = 'cipp_legacy_redirect'
const DISMISS_KEY = 'cipp_legacy_redirect_dismissed'
const MANAGEMENT_PORTAL_URL = 'https://management.cipp.app'

// sessionStorage throws in some privacy modes; a missing warning beats a crashed app.
const readSession = (key) => {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const writeSession = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // no-op
  }
}

// Returns the marker value, or null when this navigation didn't come through the redirect.
// The value doubles as the old hostname when the redirect was built with one; '1' otherwise.
//
// Both ?legacyredirect= and #legacyredirect= are accepted. The hash form is the sturdier of
// the two: browsers reattach a fragment across server-side redirects, so it survives the
// EasyAuth login round-trip even where a query string would be dropped.
const consumeMarker = () => {
  try {
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

    const fromQuery = query.get(MARKER_PARAM)
    const fromHash = hash.get(MARKER_PARAM)
    if (fromQuery === null && fromHash === null) {
      return null
    }

    // Drop the marker so a refresh, a bookmark, or a shared link doesn't re-open the dialog.
    query.delete(MARKER_PARAM)
    const nextQuery = query.toString()

    // Only rebuild the fragment when the marker was in it — re-serialising an ordinary
    // fragment such as #tab would turn it into #tab=.
    let nextHash = window.location.hash
    if (fromHash !== null) {
      hash.delete(MARKER_PARAM)
      const rebuilt = hash.toString()
      nextHash = rebuilt ? `#${rebuilt}` : ''
    }

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${nextHash}`
    )

    return (fromQuery ?? fromHash) || '1'
  } catch {
    return null
  }
}

export const LegacyRedirectDialog = () => {
  const [redirect, setRedirect] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Stash the marker before anything strips it — EasyAuth and client-side navigation both
    // rewrite the URL, and the dialog may not mount until after that has happened.
    const marker = consumeMarker()
    if (marker) {
      writeSession(SEEN_KEY, marker)
    }

    const seen = readSession(SEEN_KEY)
    if (!seen || readSession(DISMISS_KEY)) {
      return
    }

    // location and sessionStorage can't be read during render or in the static export, so
    // this necessarily lands after mount — opening a beat late is the intended behaviour.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirect({
      legacyHost: seen === '1' ? null : seen,
      currentHost: window.location.host,
    })
  }, [])

  const handleClose = useCallback(() => {
    // Session-scoped on purpose: this is an expiring-URL warning, so it should return on the
    // next visit that still comes in through the old address, and stop for good once their
    // DNS points at the new instance.
    writeSession(DISMISS_KEY, '1')
    setDismissed(true)
  }, [])

  const open = Boolean(redirect) && !dismissed
  const legacyHost = redirect?.legacyHost
  const currentHost = redirect?.currentHost

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>You came here from an old CIPP URL</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {legacyHost
            ? `You came here from an old forwarding URL (${legacyHost}). This URL will stop working soon.`
            : 'You came here from an old forwarding URL. This URL will stop working soon.'}
        </Alert>
        <Typography sx={{ mb: 2 }}>
          Your CIPP instance has moved. The address you used is being forwarded
          for now, but that forward is temporary and will be switched off.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Make sure to add your custom domain using your management portal so your own URL keeps working.
          Once done you will need to clear your cache to clear the old redirect from your browser.
        </Typography>
        {currentHost && (
          <Typography variant="body2" color="text.secondary">
            Until then, use <strong>https://{currentHost}</strong> and update
            any bookmarks.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Dismiss
        </Button>
        <Button
          onClick={() =>
            window.open(MANAGEMENT_PORTAL_URL, '_blank', 'noopener')
          }
          variant="contained"
          color="primary"
        >
          Open Management Portal
        </Button>
      </DialogActions>
    </Dialog>
  )
}
