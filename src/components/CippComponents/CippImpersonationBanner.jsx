import { useEffect, useRef } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { Logout, TheaterComedy } from '@mui/icons-material'
import { useQueryClient } from '@tanstack/react-query'
import {
  exitImpersonation,
  getImpersonatedRole,
  subscribeImpersonation,
} from '../../utils/impersonation'
import { useSyncExternalStore } from 'react'

/**
 * Full-width impersonation notice, rendered above the top nav (same slot and height
 * contract as CippMaintenanceBanner: publishes --cipp-banner-h so the fixed chrome
 * offsets itself). Source of truth is the localStorage store, NOT /api/me - the banner
 * and its Exit button must work even when the impersonated role can't load /me.
 * Known limitation shared with the maintenance banner: --cipp-banner-h is a single
 * global slot, so if both banners show at once the last writer wins.
 */
export const CippImpersonationBanner = () => {
  const theme = useTheme()
  const rootRef = useRef(null)
  const queryClient = useQueryClient()

  const role = useSyncExternalStore(subscribeImpersonation, getImpersonatedRole, () => null)
  const visible = Boolean(role)

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

    if (typeof ResizeObserver === 'undefined') return clear

    const observer = new ResizeObserver(publish)
    observer.observe(element)
    return () => {
      observer.disconnect()
      clear()
    }
  }, [visible])

  if (!visible) return null

  // Tinted like CippMaintenanceBanner's non-solid style: warning tint over an opaque
  // surface with an accent bar, so text keeps normal contrast in both themes instead
  // of white-on-orange.
  const palette = theme.palette.warning
  const isDark = theme.palette.mode === 'dark'
  const tint = alpha(palette.main, isDark ? 0.16 : 0.12)
  const foreground = palette[isDark ? 'light' : 'dark']

  return (
    <Box
      ref={rootRef}
      component="aside"
      role="status"
      aria-label="Role impersonation active"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: theme.zIndex.appBar + 1,
        color: foreground,
        background: `linear-gradient(${tint}, ${tint}), ${theme.palette.background.paper}`,
        borderBottom: `1px solid ${alpha(palette.main, 0.42)}`,
        boxShadow: `inset 0 3px 0 0 ${palette.main}`,
        px: { xs: 2, md: 3 },
        // the 3px inset accent bar eats into the top, so give it a bit more than the bottom
        pt: 1.875,
        pb: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <TheaterComedy fontSize="small" sx={{ color: palette.main }} />
        <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }}>
          Impersonating <strong>{role}</strong> — you are seeing CIPP as this role sees it. API
          access is enforced under this role until you exit.
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<Logout fontSize="small" />}
          onClick={() => exitImpersonation(queryClient)}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Exit impersonation
        </Button>
      </Stack>
    </Box>
  )
}
