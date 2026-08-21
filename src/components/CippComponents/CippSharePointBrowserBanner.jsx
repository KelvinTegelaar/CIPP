import PropTypes from 'prop-types'
import { Box, Button, Card, Skeleton, Stack, Typography } from '@mui/material'
import { Add, Edit, Security, Storage as StorageIcon } from '@mui/icons-material'
import { ActionsMenu } from '../actions-menu'

/**
 * Top chrome for the SharePoint site browser: selection title on the left,
 * bulk Actions + Storage + Permissions + contextual New / Edit Site on the right.
 *
 * Title rules:
 * - site only → "SiteName"
 * - site + library → "SiteName / LibraryName" (slash subdued)
 * - nothing selected → placeholder
 *
 * Storage: when a site context is available (site-scoped reclaim).
 * Permissions: only when a site or library row is selected.
 * New button:
 * - root → "New Site"
 * - inside a site → "New Library"
 * Edit Site: when a site is selected or drilled into a site (stub).
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
  showEditSite = false,
  onEditSiteClick,
}) => {
  const siteName = site?.displayName ?? null
  const libraryName = library?.displayName ?? null
  const hasTitle = Boolean(siteName || libraryName)
  const showActions = selectedRows.length > 0 && bulkActions.length > 0
  const newLabel = atRoot ? 'New Site' : 'New Library'

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ minHeight: 40 }}
      >
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
          <Button variant="contained" startIcon={<Add />}>
            {newLabel}
          </Button>
          {showEditSite ? (
            <Button variant="outlined" startIcon={<Edit />} onClick={onEditSiteClick}>
              Edit Site
            </Button>
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
  showEditSite: PropTypes.bool,
  onEditSiteClick: PropTypes.func,
}
