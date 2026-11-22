import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ApiGetCall } from '../../api/ApiCall'
import { CippIcons } from '../../utils/icon-registry'
import 'swagger-ui-dist/swagger-ui.css'

export const SEARCH_GROUPS = [
  'Matching endpoint names',
  'Matching descriptions',
  'Matching groups and roles',
]

// Every word must match. An endpoint lands in the first group whose fields (cumulatively:
// name, then description, then group and role) contain all of them; within a group an exact
// name beats a name that starts with the search, then shorter (closer) names come first.
export const rankOperations = (entries, phrase) => {
  const query = phrase.toLowerCase().trim()
  const words = query.split(/\s+/).filter(Boolean)
  const groups = SEARCH_GROUPS.map(() => [])
  for (const entry of entries) {
    const name = entry.name.toLowerCase()
    const fields = [
      name,
      entry.description.toLowerCase(),
      entry.other.toLowerCase(),
    ]
    const group = fields.findIndex((_, i) => {
      const text = fields.slice(0, i + 1).join(' ')
      return words.every((word) => text.includes(word))
    })
    if (group === -1) {
      continue
    }
    const rank = name === query ? 0 : name.startsWith(query) ? 1 : 2
    groups[group].push({ entry, name, rank })
  }
  return groups.map((group) =>
    group
      .sort(
        (a, b) =>
          a.rank - b.rank ||
          a.name.length - b.name.length ||
          a.name.localeCompare(b.name)
      )
      .map(({ entry }) => entry)
  )
}

// Swagger's own filter matches tag names only, case-sensitively. This replaces its tags with
// the ranked groups above while searching, and opens them.
const searchPlugin = () => ({
  fn: {
    opsFilter: (taggedOps, phrase) => {
      const template = taggedOps.first()
      if (!template) {
        return taggedOps
      }
      const entries = []
      taggedOps.forEach((tag, tagName) =>
        tag.get('operations').forEach((op) => {
          const o = op.get('operation')
          entries.push({
            op,
            name: op.get('path').replace(/^\/api\//, ''),
            description: `${o.get('summary') ?? ''} ${o.get('description') ?? ''}`,
            other: `${tagName} ${o.get('x-cipp-role') ?? ''}`,
          })
        })
      )
      const emptyOps = template.get('operations').clear()
      let result = taggedOps.clear()
      rankOperations(entries, phrase).forEach((group, i) => {
        if (group.length) {
          result = result.set(
            `${SEARCH_GROUPS[i]} (${group.length})`,
            template
              .delete('tagDetails')
              .set('operations', emptyOps.push(...group.map((e) => e.op)))
          )
        }
      })
      return result
    },
  },
  statePlugins: {
    layout: {
      wrapSelectors: {
        // ori is already bound to the layout state, so it takes the selector's own arguments only
        isShown: (ori) => (state, key, def) =>
          ori(
            key,
            def ||
              (key?.[0] === 'operations-tag' &&
                typeof state.get('filter') === 'string' &&
                state.get('filter') !== '')
          ),
      },
    },
  },
})

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
  const ui = useRef(null)

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
        ui.current = SwaggerUIBundle({
          domNode: container.current,
          // The spec uses nothing 3.1-only, and Swagger's 3.1 path (apidom) freezes the page for seconds on it.
          spec: { ...spec.data, openapi: '3.0.3' },
          plugins: [searchPlugin],
          docExpansion: 'none',
          defaultModelsExpandDepth: -1,
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
        permissions apply, and write operations really do write. A field typed
        as <strong>LabelValue</strong> must be sent as an object such as{' '}
        <code>{'{ "label": "…", "value": "…" }'}</code>: the backend reads its{' '}
        <code>value</code>, so a bare string is ignored.
      </Alert>

      {mountError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          The API documentation viewer failed to load: {mountError}
        </Alert>
      )}

      {!mountError && !isMounted && (
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            py: 6,
          }}
        >
          <CircularProgress />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            Loading API documentation…
          </Typography>
        </Stack>
      )}

      {isMounted && (
        <TextField
          fullWidth
          placeholder="Search endpoints by name, path, description or role"
          onChange={(event) =>
            ui.current?.layoutActions.updateFilter(event.target.value)
          }
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CippIcons.Search color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {/* Swagger UI ships a light-only stylesheet with hard-coded colours; in dark mode
          every rule that sets one is pointed at the theme instead. */}
      <Box
        ref={container}
        sx={{
          // Title, server picker and Authorize repeat the alerts above or do nothing here:
          // Try it out already runs as the signed-in user.
          '& .swagger-ui :is(.information-container, .scheme-container, .filter-container, .authorization__btn)':
            { display: 'none' },
          ...(isDark && {
            '& .swagger-ui, & .swagger-ui :is(.opblock-tag, .opblock-tag small, .parameter__name, .parameter__type, .opblock-section-header > label, .opblock-section-header h4, .opblock-summary-path, .opblock-summary-operation-id, .opblock-summary-description, .tab li, .opblock-description-wrapper, .opblock-description-wrapper h4, .opblock-description-wrapper p, .opblock-title_normal, .opblock-title_normal p, .responses-inner h4, .responses-inner h5, .response-col_status, .response-col_links, .response-col_description, section h3, label, .checkbox p, .model, .model-title, section.models h4, .prop-format, table.headers td, table thead tr td, table thead tr th, .errors-wrapper h4, .loading-container .loading:after)':
              {
                color: theme.palette.text.primary,
              },
            '& .swagger-ui .btn:not(.execute):not(.cancel)': {
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
            },
            '& .swagger-ui .prop-type': { color: theme.palette.info.light },
            '& .swagger-ui .opblock .opblock-section-header': {
              background: theme.palette.background.default,
            },
            '& .swagger-ui :is(section.models, section.models.is-open h4, .opblock, .opblock-tag, table thead tr td, table thead tr th)':
              {
                borderColor: theme.palette.divider,
              },
            // backgroundColor, not background: select draws its arrow with a background image
            '& .swagger-ui :is(select, input, textarea:not([disabled]))': {
              backgroundColor: theme.palette.background.paper,
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
