import {
  Component,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CippIcons } from '../utils/icon-registry'
import {
  Box,
  ButtonBase,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import ReactMarkdown from 'react-markdown'
import { useHistoryDismiss } from '../hooks/use-history-dismiss'
import { CippBottomSheet } from './CippComponents/CippBottomSheet'
import { useIsMobileLayout } from '../hooks/use-breakpoint'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import rehypeRaw from 'rehype-raw'
import { unified } from 'unified'
import packageInfo from '../../public/version.json'
import { ApiGetCall } from '../api/ApiCall'
import { CippAutoComplete } from './CippComponents/CippAutocomplete'

const RELEASE_COOKIE_KEY = 'cipp_release_notice'
const RELEASE_PERMANENT_HIDE_KEY = 'cipp_release_notice_permanently_hidden'
const RELEASE_OWNER = 'CyberDrain'
const RELEASE_REPO = 'CIPP'

const secureFlag = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.protocol === 'https:' ? ' Secure' : ''
}

const getCookie = (name) => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookiePrefix = `${name}=`
  const cookies = document.cookie.split('; ')

  for (const cookie of cookies) {
    if (cookie.startsWith(cookiePrefix)) {
      return decodeURIComponent(cookie.slice(cookiePrefix.length))
    }
  }

  return null
}

const setCookie = (name, value, days = 365) => {
  if (typeof document === 'undefined') {
    return
  }

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax;${secureFlag()}`
}

const deleteCookie = (name) => {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;${secureFlag()}`
}

// Hotfix and maintenance builds publish their own GitHub release (v10.8.1, v10.8.2, ...), so the
// running build's exact tag is both what we show and what we remember as dismissed. Collapsing
// patch releases back to vX.Y.0 here left the dismissal cookie - which stores the tag that was
// actually released - permanently unmatchable, so the dialog reopened on every page load.
// baseTag (vX.Y.0) is what the dialog selects by default so the feature-release notes lead;
// hotfix notes stay reachable via the dropdown.
const buildReleaseMetadata = (version) => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(version ?? ''))
  const [major, minor, patch] = match ? match.slice(1) : ['0', '0', '0']
  const currentTag = `v${major}.${minor}.${patch}`

  return {
    currentTag,
    baseTag: `v${major}.${minor}.0`,
    releaseTag: currentTag,
    releaseUrl: `https://github.com/${RELEASE_OWNER}/${RELEASE_REPO}/releases/tag/${currentTag}`,
  }
}

const formatReleaseBody = (body) => {
  if (!body) {
    return ''
  }

  return body.replace(/(^|[^\w/])@([a-zA-Z0-9-]+)/g, (match, prefix, username) => {
    return `${prefix}[@${username}](https://github.com/${username})`
  });
}

class MarkdownErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Failed to render release notes', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error)
    }

    return this.props.children
  }
}

// Which release the dialog *shows*. Hotfix and maintenance builds (v10.8.1, v10.8.2) carry
// only the delta since the feature release, so opening on one tells the user almost nothing
// about what changed. Default to the newest vX.Y.0 instead; the picker still lists every
// release, and dismissal keeps tracking the exact running tag (see buildReleaseMetadata) so
// this can't reintroduce the dialog-reopens-forever bug.
const isFeatureRelease = (tag) => /^v?\d+\.\d+\.0$/.test(String(tag ?? ''))

const pickDisplayRelease = (catalog, releaseMeta) =>
  catalog.find((release) => isFeatureRelease(release.releaseTag)) ||
  catalog.find((release) => release.releaseTag === releaseMeta.releaseTag) ||
  catalog.find((release) => release.releaseTag === releaseMeta.baseTag) ||
  catalog[0]

export const ReleaseNotesDialog = forwardRef((_props, ref) => {
  const releaseMeta = useMemo(() => buildReleaseMetadata(packageInfo.version), [])
  const [isEligible, setIsEligible] = useState(false)
  const [open, setOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [manualOpenRequested, setManualOpenRequested] = useState(false)
  const [moreActionsOpen, setMoreActionsOpen] = useState(false)
  const [releasePickerOpen, setReleasePickerOpen] = useState(false)
  // Left unset until the catalog loads so pickDisplayRelease chooses; seeding it with
  // the running tag meant a hotfix build always displayed its own thin release notes.
  const [selectedReleaseTag, setSelectedReleaseTag] = useState(null)
  const hasOpenedRef = useRef(false)
  const isMobile = useIsMobileLayout()

  useEffect(() => {
    hasOpenedRef.current = false
  }, [releaseMeta.releaseTag])

  useEffect(() => {
    // New build -> re-pick from the catalog rather than pinning to this build's tag
    setSelectedReleaseTag(null)
  }, [releaseMeta.releaseTag])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedValue = getCookie(RELEASE_COOKIE_KEY)
    if (storedValue === 'permanently_dismissed') {
      window.localStorage.setItem(RELEASE_PERMANENT_HIDE_KEY, 'true')
      deleteCookie(RELEASE_COOKIE_KEY)
      return
    }

    const permanentlyHidden = window.localStorage.getItem(RELEASE_PERMANENT_HIDE_KEY) === 'true'

    if (!permanentlyHidden && storedValue !== releaseMeta.releaseTag) {
      setIsEligible(true)
    }
  }, [releaseMeta.releaseTag])

  const shouldFetchReleaseList = isEligible || manualOpenRequested || open

  const releaseListQuery = ApiGetCall({
    url: '/api/ListGitHubReleaseNotes',
    queryKey: `list-github-release-options`,
    waiting: shouldFetchReleaseList,
    staleTime: 300000,
  })

  const isReleaseListLoading = releaseListQuery.isLoading || releaseListQuery.isFetching

  const releaseCatalog = useMemo(() => {
    return Array.isArray(releaseListQuery.data) ? releaseListQuery.data : []
  }, [releaseListQuery.data])

  useEffect(() => {
    if (!releaseCatalog.length) {
      return
    }

    if (!selectedReleaseTag) {
      setSelectedReleaseTag(pickDisplayRelease(releaseCatalog, releaseMeta)?.releaseTag)
      return
    }

    const hasSelected = releaseCatalog.some((release) => release.releaseTag === selectedReleaseTag)

    if (!hasSelected) {
      const fallbackRelease = pickDisplayRelease(releaseCatalog, releaseMeta)
      if (fallbackRelease) {
        setSelectedReleaseTag(fallbackRelease.releaseTag)
      }
    }
  }, [releaseCatalog, selectedReleaseTag, releaseMeta])

  const releaseOptions = useMemo(() => {
    const mapped = releaseCatalog.map((release) => {
      const tag = release.releaseTag ?? release.tagName
      // GitHub release names usually start with the tag ("v10.8.0 - Ramos Melon Fizz"),
      // so the parenthetical only earns its width when the name doesn't carry it.
      const label = release.name
        ? release.name.includes(tag)
          ? release.name
          : `${release.name} (${tag})`
        : tag
      return {
        label,
        value: tag,
        addedFields: {
          htmlUrl: release.htmlUrl,
          publishedAt: release.publishedAt,
        },
      }
    })

    if (selectedReleaseTag && !mapped.some((option) => option.value === selectedReleaseTag)) {
      mapped.push({
        label: selectedReleaseTag,
        value: selectedReleaseTag,
        addedFields: {
          htmlUrl: releaseMeta.releaseUrl,
          publishedAt: null,
        },
      })
    }

    return mapped
  }, [releaseCatalog, selectedReleaseTag, releaseMeta.releaseUrl])

  const selectedReleaseValue = useMemo(() => {
    if (!selectedReleaseTag) {
      return null
    }

    return (
      releaseOptions.find((option) => option.value === selectedReleaseTag) || {
        label: selectedReleaseTag,
        value: selectedReleaseTag,
      }
    )
  }, [releaseOptions, selectedReleaseTag])

  const handleReleaseChange = useCallback(
    (newValue) => {
      const nextValue = Array.isArray(newValue) ? newValue[0] : newValue
      if (nextValue?.value && nextValue.value !== selectedReleaseTag) {
        setSelectedReleaseTag(nextValue.value)
      }
    },
    [selectedReleaseTag]
  )

  useImperativeHandle(ref, () => ({
    open: () => {
      setManualOpenRequested(true)
      setOpen(true)
    },
  }))

  const selectedReleaseData = useMemo(() => {
    if (!selectedReleaseTag) {
      return null
    }

    return (
      releaseCatalog.find((release) => release.releaseTag === selectedReleaseTag) ||
      releaseCatalog.find((release) => release.releaseTag === releaseMeta.releaseTag) ||
      releaseCatalog.find((release) => release.releaseTag === releaseMeta.baseTag) ||
      null
    )
  }, [releaseCatalog, selectedReleaseTag, releaseMeta])

  const handleDismissUntilNextRelease = () => {
    // Store the same tag the eligibility check reads back - the tag of the build being run, not
    // the newest tag on GitHub. Those differ for anyone not on the very latest release, and a
    // cookie that can never match means "don't show until next release" never suppresses anything.
    window.localStorage.removeItem(RELEASE_PERMANENT_HIDE_KEY)
    setCookie(RELEASE_COOKIE_KEY, releaseMeta.releaseTag)
    setOpen(false)
    setIsExpanded(false)
    setManualOpenRequested(false)
    setIsEligible(false)
  }

  const handleDismissPermanently = () => {
    window.localStorage.setItem(RELEASE_PERMANENT_HIDE_KEY, 'true')
    deleteCookie(RELEASE_COOKIE_KEY)
    setOpen(false)
    setIsExpanded(false)
    setManualOpenRequested(false)
    setIsEligible(false)
  }

  const handleRemindLater = () => {
    window.localStorage.removeItem(RELEASE_PERMANENT_HIDE_KEY)
    setOpen(false)
    setIsExpanded(false)
    setManualOpenRequested(false)
  }

  // Phone back gesture dismisses the dialog instead of navigating the page away — same
  // remind-later semantics as the ✕, the backdrop and Esc.
  useHistoryDismiss(open, handleRemindLater, isMobile)

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  const requestedVersionLabel =
    selectedReleaseData?.releaseTag ?? selectedReleaseTag ?? releaseMeta.currentTag
  const releaseName =
    selectedReleaseData?.name || selectedReleaseValue?.label || `CIPP ${releaseMeta.currentTag}`
  const releaseHeading = releaseName || requestedVersionLabel
  const releaseBody = typeof selectedReleaseData?.body === 'string' ? selectedReleaseData.body : ''
  const releaseUrl =
    selectedReleaseData?.htmlUrl ??
    selectedReleaseValue?.addedFields?.htmlUrl ??
    releaseMeta.releaseUrl
  const formattedReleaseBody = useMemo(() => formatReleaseBody(releaseBody), [releaseBody])
  const gfmSupport = useMemo(() => {
    if (!formattedReleaseBody) {
      return { plugins: [remarkGfm], error: null }
    }

    try {
      unified().use(remarkParse).use(remarkGfm).parse(formattedReleaseBody)
      return { plugins: [remarkGfm], error: null }
    } catch (err) {
      return { plugins: [], error: err }
    }
  }, [formattedReleaseBody])

  useEffect(() => {
    if (!isEligible || hasOpenedRef.current) {
      return
    }

    if (releaseCatalog.length || releaseListQuery.error) {
      setOpen(true)
      hasOpenedRef.current = true
    }
  }, [isEligible, releaseCatalog.length, releaseListQuery.error])

  // Phones always go fullscreen — a centred md dialog wastes the viewport and
  // fights the bottom-sheet pickers. Desktop Expand still toggles fullScreen.
  const fullScreen = isExpanded || isMobile

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      maxWidth={fullScreen ? 'xl' : 'md'}
      onClose={handleRemindLater}
      open={open}
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            display: 'flex',
            flexDirection: 'column',
            ...(isExpanded && !isMobile
              ? {
                  m: { sm: 2 },
                  height: { sm: 'calc(100% - 32px)' },
                }
              : {}),
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          // The mobile title IS the release picker — one row, tight padding, so the notes
          // themselves get the height back.
          px: { xs: 2, md: 3 },
          py: { xs: 1, md: 2 },
        }}
      >
        {isMobile ? (
          <ButtonBase
            onClick={() => setReleasePickerOpen(true)}
            aria-haspopup="dialog"
            sx={{
              minWidth: 0,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              borderRadius: 1,
              textAlign: 'left',
              justifyContent: 'flex-start',
            }}
          >
            <Typography variant="h6" noWrap sx={{ minWidth: 0 }}>
              {selectedReleaseValue?.label ?? 'Release notes'}
            </Typography>
            <Box component="span" sx={visuallyHidden}>
              switch release
            </Box>
            <CippIcons.KeyboardArrowDown sx={{ flexShrink: 0, opacity: 0.7, fontSize: 20 }} />
          </ButtonBase>
        ) : (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              width: '100%'
            }}>
            <Typography sx={{ flexGrow: 1 }} variant="h6" component="div">
              {`Release notes for ${releaseHeading}`}
            </Typography>
            <CippAutoComplete
              creatable={false}
              disableClearable
              isFetching={isReleaseListLoading}
              label="Release"
              multiple={false}
              onChange={handleReleaseChange}
              options={releaseOptions}
              placeholder="Select a release"
              size="small"
              sx={{ minWidth: 260, maxWidth: 320 }}
              value={selectedReleaseValue}
            />
            <Button onClick={toggleExpanded} size="small" variant="outlined">
              {isExpanded ? 'Shrink' : 'Expand'}
            </Button>
          </Stack>
        )}
        {/* Phones drop the "Remind me next time" button — closing IS remind-later
            (onClose runs the same handler) — so the ✕ is the visible way to do it. */}
        <IconButton
          aria-label="Close"
          onClick={handleRemindLater}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, ml: 1 }}
        >
          <CippIcons.Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 1,
          pb: 0,
          flex: 1,
          display: 'flex',
          // Drop MUI's default side padding; prose padding lives on the scroll box /
          // banners instead. Theme hides the mobile gutter entirely below `lg`.
          px: 0,
        }}
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {releaseListQuery.error ? (
            <Typography color="error" variant="body2" sx={{ px: { xs: 2, md: 3 } }}>
              We couldn't load additional releases right now. The latest release notes are shown
              below.
              {releaseListQuery.error?.message ? ` (${releaseListQuery.error.message})` : ''}
            </Typography>
          ) : null}
          {gfmSupport.error ? (
            <Typography
              variant="body2"
              sx={{
                color: "warning.main",
                px: { xs: 2, md: 3 }
              }}>
              Displaying these release notes without GitHub-flavoured markdown enhancements due to a
              parsing issue. Formatting may look different.
            </Typography>
          ) : null}
          {isReleaseListLoading && !selectedReleaseData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : releaseListQuery.error ? (
            <Typography color="error" variant="body2" sx={{ px: { xs: 2, md: 3 } }}>
              We couldn't load the release notes right now. You can view them on GitHub instead.
              {releaseListQuery.error?.message ? ` (${releaseListQuery.error.message})` : ''}
            </Typography>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                // dvh tracks the visible viewport; 100vh over-reports it on mobile browsers
                // with collapsing chrome, so the notes ran past the bottom of the screen.
                maxHeight: fullScreen
                  ? { xs: 'calc(100dvh - 200px)', md: 'calc(100vh - 260px)' }
                  : 600,
                overflowY: 'auto',
                // Padding is on the scroll box so the markdown stays clear of any track.
                px: { xs: 2, md: 3 },
                // Release notes are GitHub markdown: long URLs, commit SHAs and fenced code
                // are single unbreakable tokens that otherwise widen the dialog and push the
                // text off the right edge. Wrap prose; let code and tables scroll themselves.
                overflowX: 'hidden',
                overflowWrap: 'anywhere',
                '& pre': {
                  maxWidth: '100%',
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                  overflowWrap: 'normal',
                },
                '& table': { display: 'block', maxWidth: '100%', overflowX: 'auto' },
                '& img': { maxWidth: '100%', height: 'auto' },
              }}
            >
              <MarkdownErrorBoundary
                fallback={(error) => (
                  <Stack spacing={1.5}>
                    <Typography color="error" variant="body2">
                      We couldn't format these release notes
                      {error?.message ? ` (${error.message})` : ''}. A plain-text version is shown
                      below.
                    </Typography>
                    <Box
                      component="pre"
                      sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0 }}
                    >
                      {releaseBody}
                    </Box>
                  </Stack>
                )}
              >
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <Link {...props} rel="noopener" target="_blank" underline="hover" />
                    ),
                    img: ({ node, ...props }) => (
                      <Box
                        alt={props.alt}
                        component="img"
                        loading="lazy"
                        sx={{ borderRadius: 1, display: 'block', height: 'auto', maxWidth: '100%' }}
                        {...props}
                      />
                    ),
                  }}
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={gfmSupport.plugins}
                >
                  {formattedReleaseBody}
                </ReactMarkdown>
              </MarkdownErrorBoundary>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          display: 'flex',
          // Stacked on phones with the primary dismissal last, so it sits in thumb reach.
          // Four stacked rows ate ~240px of a phone screen, so the two low-emphasis actions
          // (GitHub, permanent dismiss) share one small row there — and on desktop that row
          // dissolves (display: contents) back into this flex row, unchanged.
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: 'wrap',
          gap: 1,
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
        }}
      >
        {/* Desktop-only: on phones these two live in the bottom sheet behind the kebab,
            the same actions treatment as the rest of the mobile surface. */}
        <Box
          sx={{
            display: { xs: 'none', md: 'contents' },
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            href={releaseUrl}
            rel="noopener"
            target="_blank"
            variant="text"
            size="small"
            startIcon={<CippIcons.GitHub />}
            sx={{ mr: { md: 'auto' } }}
          >
            View release notes on GitHub
          </Button>
          <Button
            onClick={handleDismissPermanently}
            size="small"
            sx={{ color: 'text.secondary', minWidth: 'auto', px: 1 }}
            variant="text"
          >
            Don't show again
          </Button>
        </Box>
        <Button
          onClick={handleRemindLater}
          variant="outlined"
          // Redundant on phones: the ✕, the back gesture and the backdrop all run this
          // same handler. Desktop keeps the labelled button.
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
        >
          Remind me next time
        </Button>
        <Box sx={{ display: { xs: 'flex', md: 'contents' }, gap: 1 }}>
          <Button
            onClick={handleDismissUntilNextRelease}
            variant="contained"
            // small keeps the 44px tap target but drops the chunky medium padding
            size="small"
            sx={{ minHeight: { xs: 44, md: 'auto' }, flex: { xs: 1, md: '0 0 auto' } }}
          >
            Don't show until next release
          </Button>
          <IconButton
            aria-label="More options"
            onClick={() => setMoreActionsOpen(true)}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              minWidth: 44,
              minHeight: 44,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <CippIcons.MoreHoriz />
          </IconButton>
        </Box>
      </DialogActions>
      <CippBottomSheet
        open={releasePickerOpen}
        onClose={() => setReleasePickerOpen(false)}
        title="Release"
      >
        <List sx={{ py: 0 }}>
          {releaseOptions.map((option) => {
            const selected = option.value === selectedReleaseTag
            return (
              <ListItemButton
                key={option.value}
                selected={selected}
                sx={{ minHeight: 48 }}
                onClick={() => {
                  setReleasePickerOpen(false)
                  if (!selected) handleReleaseChange(option)
                }}
              >
                <ListItemText primary={option.label} slotProps={{
                  primary: { noWrap: true }
                }} />
                {selected && <CippIcons.Check fontSize="small" color="primary" />}
              </ListItemButton>
            );
          })}
        </List>
      </CippBottomSheet>
      <CippBottomSheet
        open={moreActionsOpen}
        onClose={() => setMoreActionsOpen(false)}
        title="Release notes"
      >
        <List sx={{ py: 0 }}>
          <ListItemButton
            component="a"
            href={releaseUrl}
            rel="noopener"
            target="_blank"
            onClick={() => setMoreActionsOpen(false)}
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CippIcons.GitHub fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="View release notes on GitHub" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              setMoreActionsOpen(false)
              handleDismissPermanently()
            }}
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CippIcons.Close fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Don't show again" />
          </ListItemButton>
        </List>
      </CippBottomSheet>
    </Dialog>
  );
})

ReleaseNotesDialog.displayName = 'ReleaseNotesDialog'
