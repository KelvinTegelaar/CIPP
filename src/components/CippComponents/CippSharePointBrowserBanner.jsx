import PropTypes from 'prop-types'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add,
  Edit,
  Refresh,
  Security,
  Storage as StorageIcon,
} from '@mui/icons-material'
import { ActionsMenu } from '../actions-menu'

/**
 * Top chrome for the SharePoint site browser: path/title on the left,
 * Actions + Storage + Permissions + contextual New + Refresh on the right.
 *
 * Location vs selection: Storage / Permissions act on current focus (opened site
 * or selected library). Edit Site is primary only at the root site list; when
 * drilled into a site it belongs in Actions (content mode, not site-object mode).
 *
 * When `path` is provided, breadcrumbs replace the simple site/library title
 * (Sites → site → recycle crumbs, etc.).
 */
export const CippSharePointBrowserBanner = ({
  site,
  library,
  bulkActions = [],
  selectedRows = [],
  isFetching = false,
  queryKeys,
  atRoot = true,
  showStorage = false,
  onStorageClick,
  showPermissions = false,
  onPermissionsClick,
  showNew = false,
  showEditSite = false,
  onEditSiteClick,
  onRefresh,
  refreshDisabled = false,
  path = null,
  onNavigate,
}) => {
  const siteName = site?.displayName ?? null
  const libraryName = library?.displayName ?? null
  const hasTitle = Boolean(siteName || libraryName)
  const showActions = selectedRows.length > 0 && bulkActions.length > 0
  const newLabel = atRoot ? 'New Site' : 'New Library'
  const usePath = Array.isArray(path)

  const handleCrumbClick = (index) => {
    if (!onNavigate) return
    if (index < 0) {
      onNavigate([])
    } else {
      onNavigate(path.slice(0, index + 1))
    }
  }

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ minHeight: 40 }}
      >
        {usePath ? (
          <Breadcrumbs
            aria-label="SharePoint browser path"
            sx={{ flex: 1, minWidth: 0, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
          >
            <Link
              component="button"
              type="button"
              underline="hover"
              color="inherit"
              onClick={() => handleCrumbClick(-1)}
              sx={{ cursor: 'pointer', typography: 'h6', fontSize: '1.125rem' }}
            >
              Sites
            </Link>
            {path.map((crumb, index) => {
              const isLast = index === path.length - 1
              const label = crumb.displayName ?? crumb.name
              if (isLast) {
                return (
                  <Typography
                    key={crumb.id ?? index}
                    color="text.primary"
                    sx={{ typography: 'h6', fontSize: '1.125rem' }}
                    noWrap
                  >
                    {isFetching && !label ? <Skeleton width={120} /> : label}
                  </Typography>
                )
              }
              return (
                <Link
                  key={crumb.id ?? index}
                  component="button"
                  type="button"
                  underline="hover"
                  color="inherit"
                  onClick={() => handleCrumbClick(index)}
                  sx={{ cursor: 'pointer', typography: 'h6', fontSize: '1.125rem' }}
                >
                  {label}
                </Link>
              )
            })}
          </Breadcrumbs>
        ) : (
          <Typography variant="h6" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {isFetching && !hasTitle ? (
              <Skeleton width={240} />
            ) : hasTitle ? (
              <>
                <Box component="span">{siteName ?? 'Site'}</Box>
                {libraryName ? (
                  <>
                    <Box
                      component="span"
                      sx={{ color: 'text.disabled', mx: 0.75, fontWeight: 400 }}
                    >
                      /
                    </Box>
                    <Box component="span">{libraryName}</Box>
                  </>
                ) : null}
              </>
            ) : (
              <Typography component="span" color="text.secondary" variant="h6">
                Select a site
              </Typography>
            )}
          </Typography>
        )}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {showActions ? (
            <ActionsMenu
              label={selectedRows.length > 1 ? 'Bulk Actions' : 'Actions'}
              actions={bulkActions}
              data={selectedRows}
              queryKeys={queryKeys}
            />
          ) : null}
          {showStorage ? (
            <Button variant="outlined" startIcon={<StorageIcon />} onClick={onStorageClick}>
              Storage
            </Button>
          ) : null}
          {showPermissions ? (
            <Button variant="outlined" startIcon={<Security />} onClick={onPermissionsClick}>
              Permissions
            </Button>
          ) : null}
          {showNew ? (
            <Button variant="contained" startIcon={<Add />}>
              {newLabel}
            </Button>
          ) : null}
          {showEditSite ? (
            <Button variant="outlined" startIcon={<Edit />} onClick={onEditSiteClick}>
              Edit Site
            </Button>
          ) : null}
          {onRefresh ? (
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  size="small"
                  aria-label="Refresh"
                  onClick={onRefresh}
                  disabled={refreshDisabled}
                >
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  )
}

CippSharePointBrowserBanner.propTypes = {
  site: PropTypes.object,
  library: PropTypes.object,
  bulkActions: PropTypes.array,
  selectedRows: PropTypes.array,
  isFetching: PropTypes.bool,
  queryKeys: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  atRoot: PropTypes.bool,
  showStorage: PropTypes.bool,
  onStorageClick: PropTypes.func,
  showPermissions: PropTypes.bool,
  onPermissionsClick: PropTypes.func,
  showNew: PropTypes.bool,
  showEditSite: PropTypes.bool,
  onEditSiteClick: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshDisabled: PropTypes.bool,
  path: PropTypes.array,
  onNavigate: PropTypes.func,
}
