import { useState } from 'react'
import NextLink from 'next/link'
import PropTypes from 'prop-types'
import { Box, Button, Card, Collapse, Stack, Typography } from '@mui/material'
import { ExpandMoreOutlined } from '@mui/icons-material'

// Shared card for the in-app error routes (404, 401, 500). Unlike CippImageCard,
// which paints a hardcoded neutral.900 slab in both modes, this is built from
// palette tokens so it reads as a normal CIPP card in light and dark alike.
//
// It centres inside a band rather than chasing the viewport: DashboardLayout puts
// children in a plain Stack with a Footer after them, so there is no flex fill to
// claim and a height of 100vh just overflows past the nav and breadcrumb.

const MONO = '"Roboto Mono", Consolas, Monaco, "Andale Mono", monospace'

export const CippErrorState = ({
  code,
  title,
  description,
  detail,
  imageUrl,
  actionText,
  actionHref,
  onActionClick,
  secondaryText,
  onSecondaryClick,
}) => {
  const [detailOpen, setDetailOpen] = useState(false)
  const hasPrimary = Boolean(actionText) && Boolean(actionHref || onActionClick)
  const hasSecondary = Boolean(secondaryText) && Boolean(onSecondaryClick)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { md: '60vh' },
        px: { xs: 2, md: 3 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 880 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 5 }}
          alignItems="center"
          sx={{ p: { xs: 3, md: 5 } }}
        >
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt=""
              aria-hidden="true"
              sx={{
                flex: 'none',
                display: 'block',
                width: { xs: 180, md: 260 },
                height: 'auto',
              }}
            />
          )}

          <Box sx={{ minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
            {code && (
              <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
                Error {code}
              </Typography>
            )}

            <Typography variant="h4" component="h1">
              {title}
            </Typography>

            {description && (
              <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>{description}</Typography>
            )}

            {detail && (
              <Box sx={{ mt: 2.5 }}>
                {/* raw error text is noise for most users but exactly what a bug
                    report needs, so it is one click away rather than up front */}
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setDetailOpen((open) => !open)}
                  endIcon={
                    <ExpandMoreOutlined
                      sx={{
                        transform: detailOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 150ms',
                      }}
                    />
                  }
                  sx={{ color: 'text.secondary' }}
                >
                  {detailOpen ? 'Hide details' : 'Show details'}
                </Button>
                <Collapse in={detailOpen} unmountOnExit>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      mb: 0,
                      p: 1.5,
                      textAlign: 'left',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                      fontFamily: MONO,
                      fontSize: 13,
                      lineHeight: 1.5,
                      // long stack traces used to blow the card out sideways
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: 180,
                      overflow: 'auto',
                    }}
                  >
                    {detail}
                  </Box>
                </Collapse>
              </Box>
            )}

            {(hasPrimary || hasSecondary) && (
              <Stack
                direction="row"
                spacing={1.5}
                useFlexGap
                flexWrap="wrap"
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mt: 4 }}
              >
                {hasPrimary &&
                  (actionHref ? (
                    <Button component={NextLink} href={actionHref} variant="contained">
                      {actionText}
                    </Button>
                  ) : (
                    <Button onClick={onActionClick} variant="contained">
                      {actionText}
                    </Button>
                  ))}
                {hasSecondary && (
                  <Button onClick={onSecondaryClick} variant="outlined">
                    {secondaryText}
                  </Button>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Card>
    </Box>
  )
}

CippErrorState.propTypes = {
  code: PropTypes.string,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  detail: PropTypes.node,
  imageUrl: PropTypes.string,
  actionText: PropTypes.string,
  actionHref: PropTypes.string,
  onActionClick: PropTypes.func,
  secondaryText: PropTypes.string,
  onSecondaryClick: PropTypes.func,
}
