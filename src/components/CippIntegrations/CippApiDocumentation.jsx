import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ApiGetCall } from '../../api/ApiCall'
import 'swagger-ui-dist/swagger-ui.css'

// swagger-ui-dist rather than swagger-ui-react: the React wrapper reaches OpenAPI 3.1
// through apidom, and apidom does not survive Turbopack's bundling - it throws
// "OpenApi3_1Element.refract is not a function" and every operation renders as a bare
// summary with no parameters, responses or Try it out. The dist package is a prebuilt
// self-contained bundle, so the bundler never has to resolve apidom's module graph.
// It is the same Swagger UI, mounted imperatively instead of as a component.
const CippApiDocumentation = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const container = useRef(null)
  const [mountError, setMountError] = useState(null)
  // Mount progress has to live in state, not in the ref: assigning container.current does
  // not re-render, so a spinner gated on the ref would never clear once Swagger UI mounted.
  const [isMounted, setIsMounted] = useState(false)

  // The spec is generated from the entrypoint sources at build time, so it always
  // describes the running version rather than a separately maintained document.
  //
  // Served as a static asset rather than through the API: it is a ~2MB build artefact
  // that cannot change at runtime, so fetching it over /api would tie up one of the
  // PowerShell HTTP workers per page load and re-send the whole body every time. As a
  // static file it is precompressed at build time and revalidates with an ETag, so a
  // repeat load costs a 304.
  const spec = ApiGetCall({
    url: '/openapi.json',
    queryKey: 'OpenApiSpec',
  })

  useEffect(() => {
    if (!spec.data || !container.current) return
    let cancelled = false

    // Imported here rather than at module scope so the ~1MB bundle is fetched only when
    // this tab is opened, and never during the static export's prerender.
    import('swagger-ui-dist/swagger-ui-es-bundle.js')
      .then((module) => {
        if (cancelled || !container.current) return
        const SwaggerUIBundle = module.default || module
        SwaggerUIBundle({
          domNode: container.current,
          spec: spec.data,
          docExpansion: 'none',
          defaultModelsExpandDepth: -1,
          filter: true,
          persistAuthorization: false,
          tryItOutEnabled: true,
          // Same-origin and already authenticated, so "Try it out" executes against this
          // deployment with the signed-in user's own permissions - no key to paste in.
          requestInterceptor: (req) => {
            req.credentials = 'include'
            return req
          },
        })
        setIsMounted(true)
      })
      .catch((error) => {
        if (!cancelled) setMountError(error?.message || String(error))
      })

    return () => {
      cancelled = true
    }
  }, [spec.data])

  if (spec.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    )
  }

  if (spec.isError || !spec.data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Could not load the API specification. It is generated during the
          build, so a deployment that predates it will not have one.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Beta.</strong> This documentation is generated automatically
        from the CIPP source. Request and response schemas are inferred, so some
        fields may be missing, loosely typed, or described only in part — treat
        it as a strong guide rather than a guarantee, and report anything that
        looks wrong.
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        Every endpoint below is generated from this deployment's source, so it
        matches the version you are running. <strong>Try it out</strong>{' '}
        executes against this instance as the signed-in user — the same
        permissions apply, and write operations really do write.
      </Alert>

      {mountError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          The API documentation viewer failed to load: {mountError}
        </Alert>
      )}

      {!mountError && !isMounted && (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading API documentation…
          </Typography>
        </Stack>
      )}

      {/* Swagger UI ships a light-only stylesheet; these overrides keep it legible in dark
          mode without restyling the component wholesale. */}
      <Box
        ref={container}
        sx={{
          '& .swagger-ui .info': { margin: '16px 0' },
          '& .swagger-ui .scheme-container': {
            background: 'transparent',
            boxShadow: 'none',
          },
          ...(isDark && {
            '& .swagger-ui, & .swagger-ui .info .title, & .swagger-ui .info li, & .swagger-ui .info p, & .swagger-ui .info table, & .swagger-ui label, & .swagger-ui .opblock-tag, & .swagger-ui .opblock .opblock-summary-operation-id, & .swagger-ui .opblock .opblock-summary-path, & .swagger-ui .opblock .opblock-summary-description, & .swagger-ui .opblock-description-wrapper p, & .swagger-ui .parameter__name, & .swagger-ui .parameter__type, & .swagger-ui table thead tr td, & .swagger-ui table thead tr th, & .swagger-ui .response-col_status, & .swagger-ui .response-col_description, & .swagger-ui .tab li, & .swagger-ui .model-title, & .swagger-ui .model':
              {
                color: theme.palette.text.primary,
              },
            '& .swagger-ui .opblock .opblock-section-header': {
              background: theme.palette.background.default,
            },
            '& .swagger-ui section.models, & .swagger-ui .opblock': {
              borderColor: theme.palette.divider,
            },
            '& .swagger-ui select, & .swagger-ui input[type=text], & .swagger-ui textarea':
              {
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
              },
            '& .swagger-ui svg:not(:root)': {
              fill: theme.palette.text.primary,
            },
          }),
        }}
      />
    </Box>
  )
}

export default CippApiDocumentation
