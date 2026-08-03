import NextLink from 'next/link'
import PropTypes from 'prop-types'
import { Box, Button, Card, LinearProgress, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Grid } from '@mui/system'
import { blue } from '../../theme/colors'

// Full-viewport shell for the screens a signed-out user can land on: sign-in,
// access denied, logging in, api offline. PrivateRoute renders those pages as
// components, so this never sits inside DashboardLayout and owns its own ground.
//
// The left panel is deliberately mode-invariant — brand navy and white in both
// light and dark — the same trick CippImageCard uses with neutral.900. Only the
// right half flips, and it does so purely through palette tokens.

// 100vh includes the area under iOS Safari's collapsing url bar, which clips the
// bottom of the stacked mobile layout. An sx array would mean responsive
// breakpoints rather than a fallback, so the override goes through @supports.
const fullHeight = {
  minHeight: '100vh',
  '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
}

// public/logo.png carries its own white keyline, so it reads on the navy panel
// untouched — no mask, no plate, no light/dark variant. Do not swap this for
// src/components/logo.js: that file throws if its inlined payload is altered.
const CippBrandLockup = () => (
  <Box
    component="img"
    src="/logo.png"
    alt="CIPP"
    sx={{ display: 'block', width: 'auto', height: { xs: 58, md: 96 } }}
  />
)

export const CippAuthShell = ({
  title,
  titleIcon,
  description,
  actionText,
  actionHref,
  onActionClick,
  actionDisabled = false,
  secondaryText,
  secondaryHref,
  onSecondaryClick,
  busy = false,
  children,
  version,
  tagline = 'CyberDrain Improved Partner Portal',
}) => {
  // href wins over onClick so a caller passing both gets one control, not two
  const hasPrimary = Boolean(actionText) && Boolean(actionHref || onActionClick)
  const hasSecondary = Boolean(secondaryText) && Boolean(secondaryHref || onSecondaryClick)

  return (
    <Box sx={{ ...fullHeight, bgcolor: 'background.default' }}>
      <Grid container sx={{ ...fullHeight, alignItems: 'stretch' }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: { xs: 2.5, md: 4 },
            bgcolor: blue.main,
            color: 'common.white',
            px: { xs: 3, md: 8 },
            py: { xs: 3.5, md: 8 },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              // one concatenated string: an array here would mean breakpoints
              background: (theme) =>
                `radial-gradient(90% 65% at 8% -12%, ${alpha(
                  theme.palette.primary.main,
                  0.32
                )} 0%, transparent 70%),` +
                `radial-gradient(60% 55% at 105% 108%, ${alpha(
                  theme.palette.primary.main,
                  0.14
                )} 0%, transparent 70%)`,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <CippBrandLockup />
          </Box>

          {/* hidden on the stacked layout, where the panel is just a header strip */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Typography variant="h3" sx={{ color: 'common.white', maxWidth: 520 }}>
              {tagline}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              position: 'relative',
              zIndex: 1,
              color: alpha('#FFFFFF', 0.72),
            }}
          >
            {version ? `v${version}` : ' '}
          </Typography>
        </Grid>

        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'center' },
            px: { xs: 2, sm: 3, md: 6 },
            pt: { xs: 4, md: 6 },
            // _app.js mounts CippSpeedDial outside PrivateRoute, so the help fab
            // overlays these pages — clear it on the stacked layout
            pb: { xs: 10, md: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 520 }}>
            <Card aria-busy={busy || undefined} sx={{ overflow: 'hidden' }}>
              <Box sx={{ height: 4 }}>{busy && <LinearProgress sx={{ height: 4 }} />}</Box>
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                {/* icon is a sibling of the title, never nested inside it, so the
                    heading stays a single unambiguous text node */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  {titleIcon}
                  <Typography variant="h4" component="h1">
                    {title}
                  </Typography>
                </Stack>

                {description &&
                  (typeof description === 'string' ? (
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {description}
                    </Typography>
                  ) : (
                    <Box sx={{ color: 'text.secondary' }}>{description}</Box>
                  ))}

                {(hasPrimary || hasSecondary) && (
                  <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 4 }}>
                    {hasPrimary &&
                      (actionHref ? (
                        <Button
                          component={NextLink}
                          href={actionHref}
                          variant="contained"
                          size="large"
                          disabled={actionDisabled}
                        >
                          {actionText}
                        </Button>
                      ) : (
                        <Button
                          onClick={onActionClick}
                          variant="contained"
                          size="large"
                          disabled={actionDisabled}
                        >
                          {actionText}
                        </Button>
                      ))}

                    {hasSecondary &&
                      (secondaryHref ? (
                        <Button
                          component={NextLink}
                          href={secondaryHref}
                          variant="outlined"
                          size="large"
                        >
                          {secondaryText}
                        </Button>
                      ) : (
                        <Button onClick={onSecondaryClick} variant="outlined" size="large">
                          {secondaryText}
                        </Button>
                      ))}
                  </Stack>
                )}
              </Box>
            </Card>

            {children && <Box sx={{ mt: 3 }}>{children}</Box>}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

CippAuthShell.propTypes = {
  title: PropTypes.node.isRequired,
  titleIcon: PropTypes.node,
  description: PropTypes.node,
  actionText: PropTypes.string,
  actionHref: PropTypes.string,
  onActionClick: PropTypes.func,
  actionDisabled: PropTypes.bool,
  secondaryText: PropTypes.string,
  secondaryHref: PropTypes.string,
  onSecondaryClick: PropTypes.func,
  busy: PropTypes.bool,
  children: PropTypes.node,
  version: PropTypes.string,
  tagline: PropTypes.string,
}
