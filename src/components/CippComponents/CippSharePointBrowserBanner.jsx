import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import PropTypes from 'prop-types'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  ListSubheader,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { ActionsMenu } from '../actions-menu'

const siteSearchText = (site) =>
  [site?.displayName, site?.name, site?.webUrl, site?.siteType]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

/**
 * Site crumb as a switcher: Recent (local) + searchable site catalog + All sites.
 */
const SiteCrumbSwitcher = ({
  label,
  isCurrent,
  isFetching,
  currentSiteId,
  recentSites = [],
  siteOptions = [],
  onSiteSwitch,
  onAllSites,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [query, setQuery] = useState('')
  const open = Boolean(anchorEl)

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const q = query.trim().toLowerCase()

  const recentFiltered = useMemo(() => {
    const list = recentSites.filter((site) => site.id !== currentSiteId)
    if (!q) return list
    return list.filter((site) => siteSearchText(site).includes(q))
  }, [recentSites, currentSiteId, q])

  const catalogFiltered = useMemo(() => {
    const recentIds = new Set(recentSites.map((s) => s.id))
    // Keep Recent and Sites sections disjoint; search still covers both.
    const list = (siteOptions || []).filter((site) => {
      if (!site?.id || site.id === currentSiteId) return false
      if (recentIds.has(site.id)) return false
      return true
    })
    if (!q) return list.slice(0, 12)
    return list.filter((site) => siteSearchText(site).includes(q)).slice(0, 20)
  }, [siteOptions, recentSites, currentSiteId, q])

  const handlePick = (site) => {
    setAnchorEl(null)
    onSiteSwitch?.(site)
  }

  const triggerSx = {
    cursor: 'pointer',
    typography: 'h6',
    fontSize: '1.125rem',
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    minWidth: 0,
    border: 0,
    background: 'none',
    padding: 0,
    color: isCurrent ? 'text.primary' : 'inherit',
    fontWeight: isCurrent ? 500 : 400,
    '&:hover': { textDecoration: 'underline' },
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        aria-label={`Switch site, current: ${label || 'Site'}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={triggerSx}
      >
        <Typography
          component="span"
          noWrap
          sx={{ typography: 'h6', fontSize: '1.125rem', maxWidth: 280 }}
        >
          {isFetching && !label ? <Skeleton width={120} /> : label}
        </Typography>
        <CippIcons.ArrowDropDown fontSize="small" sx={{ flexShrink: 0, opacity: 0.7 }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { width: 320, maxHeight: 420, mt: 0.5 },
          },
          list: {
            dense: true,
            subheader: (
              <ListSubheader
                sx={{
                  bgcolor: 'background.paper',
                  lineHeight: 1,
                  py: 1,
                  px: 1.5,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder="Search sites…"
                  aria-label="Search sites"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 36,
                      boxSizing: 'border-box',
                    },
                    '& .MuiInputAdornment-root': {
                      height: 'auto',
                      maxHeight: 'none',
                      marginTop: '0 !important',
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ ml: 0.25, mr: 0 }}>
                          <CippIcons.Search sx={{ fontSize: 18, color: 'action.active' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </ListSubheader>
            ),
          },
        }}
      >
        {recentFiltered.length > 0 ? (
          <ListSubheader
            disableSticky
            sx={{ lineHeight: '32px', bgcolor: 'background.paper' }}
          >
            Recent
          </ListSubheader>
        ) : null}
        {recentFiltered.map((site) => (
          <MenuItem key={`recent-${site.id}`} onClick={() => handlePick(site)}>
            <Typography variant="body2" noWrap title={site.displayName}>
              {site.displayName}
            </Typography>
          </MenuItem>
        ))}

        {catalogFiltered.length > 0 ? (
          <ListSubheader
            disableSticky
            sx={{ lineHeight: '32px', bgcolor: 'background.paper' }}
          >
            {q ? 'Matching sites' : 'Sites'}
          </ListSubheader>
        ) : null}
        {catalogFiltered.map((site) => (
          <MenuItem key={`site-${site.id}`} onClick={() => handlePick(site)}>
            <Stack sx={{ minWidth: 0, width: '100%' }}>
              <Typography variant="body2" noWrap title={site.displayName ?? site.name}>
                {site.displayName ?? site.name}
              </Typography>
              {site.siteType ? (
                <Typography variant="caption" noWrap sx={{
                  color: "text.secondary"
                }}>
                  {site.siteType}
                </Typography>
              ) : null}
            </Stack>
          </MenuItem>
        ))}

        {q && recentFiltered.length === 0 && catalogFiltered.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              No matching sites
            </Typography>
          </MenuItem>
        ) : null}

        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onAllSites?.()
          }}
        >
          <Typography variant="body2">All sites</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

SiteCrumbSwitcher.propTypes = {
  label: PropTypes.string,
  isCurrent: PropTypes.bool,
  isFetching: PropTypes.bool,
  currentSiteId: PropTypes.string,
  recentSites: PropTypes.array,
  siteOptions: PropTypes.array,
  onSiteSwitch: PropTypes.func,
  onAllSites: PropTypes.func,
}

/**
 * Top chrome for the SharePoint site browser: path/title on the left,
 * Actions + Storage + Permissions + contextual New + Refresh on the right.
 *
 * Location vs selection: Storage / Permissions act on current focus (opened site
 * or selected library). Edit Site is primary only at the root site list; when
 * drilled into a site it belongs in Actions (content mode, not site-object mode).
 *
 * When `path` is provided, breadcrumbs replace the simple site/library title
 * (Sites → site → recycle crumbs, etc.). The site crumb is a switcher when
 * `onSiteSwitch` is provided.
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
  siteOptions = [],
  recentSites = [],
  onSiteSwitch,
}) => {
  const siteName = site?.displayName ?? null
  const libraryName = library?.displayName ?? null
  const hasTitle = Boolean(siteName || libraryName)
  const showActions = selectedRows.length > 0 && bulkActions.length > 0
  const newLabel = atRoot ? 'New Site' : 'New Library'
  const usePath = Array.isArray(path)
  const canSwitchSites = typeof onSiteSwitch === 'function'

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
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 40
        }}>
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
              const isSiteCrumb = index === 0 && crumb?.type === 'site'

              if (isSiteCrumb && canSwitchSites) {
                return (
                  <SiteCrumbSwitcher
                    key={crumb.id ?? index}
                    label={label}
                    isCurrent={isLast}
                    isFetching={isFetching}
                    currentSiteId={crumb.id}
                    recentSites={recentSites}
                    siteOptions={siteOptions}
                    onSiteSwitch={onSiteSwitch}
                    onAllSites={() => handleCrumbClick(-1)}
                  />
                )
              }

              if (isLast) {
                return (
                  <Typography
                    key={crumb.id ?? index}
                    noWrap
                    sx={{
                      color: "text.primary",
                      typography: 'h6',
                      fontSize: '1.125rem'
                    }}>
                    {isFetching && !label ? <Skeleton width={120} /> : label}
                  </Typography>
                );
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
              <Typography component="span" variant="h6" sx={{
                color: "text.secondary"
              }}>
                Select a site
              </Typography>
            )}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            flexShrink: 0
          }}>
          {showActions ? (
            <ActionsMenu
              label={selectedRows.length > 1 ? 'Bulk Actions' : 'Actions'}
              actions={bulkActions}
              data={selectedRows}
              queryKeys={queryKeys}
            />
          ) : null}
          {showStorage ? (
            <Button variant="outlined" startIcon={<CippIcons.Storage />} onClick={onStorageClick}>
              Storage
            </Button>
          ) : null}
          {showPermissions ? (
            <Button variant="outlined" startIcon={<CippIcons.Security />} onClick={onPermissionsClick}>
              Permissions
            </Button>
          ) : null}
          {showNew ? (
            <Button variant="contained" startIcon={<CippIcons.Add />}>
              {newLabel}
            </Button>
          ) : null}
          {showEditSite ? (
            <Button variant="outlined" startIcon={<CippIcons.Edit />} onClick={onEditSiteClick}>
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
                  <CippIcons.Refresh />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
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
  siteOptions: PropTypes.array,
  recentSites: PropTypes.array,
  onSiteSwitch: PropTypes.func,
}
