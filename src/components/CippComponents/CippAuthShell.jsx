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
    sx={{ display: 'block', width: 'auto', height: { xs: 46, md: 96 } }}
  />
)

// public/cippy-auth.png is the source artwork with its flat background flood-filled away
// from the corners — the mug body, the eyes and the little icon interiors are all
// legitimately white and had to survive, so a plain white-to-alpha knockout was not
// an option. Decorative only: aria-hidden, and never a link or control.
const Cippy = () => (
  <Box
    component="img"
    src="/cippy-auth.png"
    alt=""
    aria-hidden="true"
    sx={{
      position: 'absolute',
      // Sits on the panel's own content box rather than bleeding off the corner: these
      // track the panel's px/py, so his right edge lines up with the logo and tagline
      // above him. Cropping him only lopped off his feet, which reads as a mistake
      // rather than a peek.
      right: { xs: 20, md: 48, lg: 64 },
      // md+: anchored to the bottom corner. Stacked: centred in the header strip, which
      // is only as tall as its content — bottom-anchoring there pushed his head out
      // through the top of the panel.
      top: { xs: '50%', md: 'auto' },
      bottom: { xs: 'auto', md: 48, lg: 64 },
      transform: { xs: 'translateY(-50%)', md: 'none' },
      // Constrained by height on the stacked layout, not width: the strip is sized by
      // the logo and the tagline's wrap, so a fixed width lets him outgrow it at some
      // viewports. Capping the height keeps him inside whatever the strip turns out
      // to be, and auto width preserves his aspect.
      height: { xs: 46, sm: 60, md: 'auto' },
      width: { xs: 'auto', md: 132, lg: 168 },
      zIndex: 0,
      opacity: 0.95,
      pointerEvents: 'none',
      userSelect: 'none',
    }}
  />
)

export const CippAuthShell = ({
  title,
  titleIcon,
  description,
  actionText,
  actionHref,
  actionIcon,
  onActionClick,
  actionDisabled = false,
  secondaryText,
  secondaryHref,
  onSecondaryClick,
  busy = false,
  children,
  tagline = 'CyberDrain Improved Partner Portal',
}) => {
  // href wins over onClick so a caller passing both gets one control, not two
  const hasPrimary = Boolean(actionText) && Boolean(actionHref || onActionClick)
  const hasSecondary = Boolean(secondaryText) && Boolean(secondaryHref || onSecondaryClick)

  return (
    <Box sx={{ ...fullHeight, bgcolor: 'background.default' }}>
      {/* alignItems stretch is what makes the two halves equal on the split layout. Once
          they stack it also hands the navy panel an equal share of the viewport, which on
          a phone is half the screen of empty brand colour above the sign-in card — so on
          xs the panel sizes to its own content instead. The gap below it is the same
          background.default the right half sits on, so the seam is invisible. */}
      <Grid container sx={{ ...fullHeight, alignItems: { xs: 'flex-start', md: 'stretch' } }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            // On the stacked layout the panel turns into a row: the logo and tagline sit
            // side by side as one lockup. The mark is only ~70px wide at 46px tall, so
            // the tagline still gets ~168px even with Cippy's corner reserved.
            //
            // md+ centres the tagline on the panel's own vertical midpoint, which lines it
            // up with the sign-in card opposite: both halves have symmetric padding, so
            // their content boxes share a centre line. The mark and Cippy are both out of
            // the flow, so the tagline is the only thing being centred.
            flexDirection: { xs: 'row', md: 'column' },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            alignItems: { xs: 'center', md: 'stretch' },
            justifyContent: { xs: 'flex-start', md: 'center' },
            columnGap: { xs: 2, md: 0 },
            rowGap: { xs: 1, md: 4 },
            bgcolor: blue.main,
            color: 'common.white',
            px: { xs: 3, md: 8 },
            py: { xs: 2.5, md: 8 },
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
          {/* On md+ the mark leaves the flow and pins to the panel's top-left corner, so
              the tagline can centre against the panel's full height rather than against
              the leftover space beneath the mark — the latter left it sitting half the
              mark's height below the sign-in card opposite. Offsets equal the panel's
              own px/py. In the stacked row it stays in flow beside the tagline. */}
          <Box
            sx={{
              position: { xs: 'relative', md: 'absolute' },
              top: { md: 64 },
              left: { md: 64 },
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <CippBrandLockup />
          </Box>

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              // xs: takes the rest of the first line next to the mark; minWidth 0 lets it
              // actually wrap instead of forcing the row wider than the panel.
              // md+: the panel centres it, and the mark is out of the flow, so this is
              // the panel's true vertical centre — level with the sign-in card.
              flex: { xs: '1 1 0', md: '0 1 auto' },
              minWidth: 0,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: 'common.white',
                maxWidth: 520,
                // h3 is 32px, which swallows the header strip on a phone — scale it
                // down rather than dropping the tagline entirely. 16px keeps it to two
                // lines in the ~168px left beside the mark.
                fontSize: { xs: 16, sm: 24, md: 32 },
                // 1.5 leaves the wrapped lines floating apart at phone sizes; tighten
                // them so the tagline reads as one block beside the mark
                lineHeight: { xs: 1.25, md: 1.5 },
                // keep the text clear of Cippy, who shares the strip on the stacked
                // layout; on md+ he sits in the bottom corner and never collides.
                // ~50px wide at xs and ~65px at sm, plus his 20px offset.
                pr: { xs: 9, sm: 11, md: 0 },
                textWrap: 'balance',
              }}
            >
              {tagline}
            </Typography>
          </Box>

          {/* absolute, so he never enters the panel's flow, and sits at zIndex 0
              beneath the logo and tagline */}
          <Cippy />
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
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    mb: 2
                  }}>
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
                  <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    sx={{
                      flexWrap: "wrap",
                      mt: 4
                    }}>
                    {hasPrimary &&
                      (actionHref ? (
                        <Button
                          component={NextLink}
                          href={actionHref}
                          variant="contained"
                          size="large"
                          startIcon={actionIcon}
                          disabled={actionDisabled}
                        >
                          {actionText}
                        </Button>
                      ) : (
                        <Button
                          onClick={onActionClick}
                          variant="contained"
                          size="large"
                          startIcon={actionIcon}
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
  );
}

CippAuthShell.propTypes = {
  title: PropTypes.node.isRequired,
  titleIcon: PropTypes.node,
  description: PropTypes.node,
  actionText: PropTypes.string,
  actionHref: PropTypes.string,
  actionIcon: PropTypes.node,
  onActionClick: PropTypes.func,
  actionDisabled: PropTypes.bool,
  secondaryText: PropTypes.string,
  secondaryHref: PropTypes.string,
  onSecondaryClick: PropTypes.func,
  busy: PropTypes.bool,
  children: PropTypes.node,
  tagline: PropTypes.string,
}
