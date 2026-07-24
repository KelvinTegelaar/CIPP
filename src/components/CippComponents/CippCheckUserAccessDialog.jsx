import { useMemo, useState } from 'react'
import {
  Alert,
  AlertTitle,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import CippFormComponent from './CippFormComponent'
import { CippDataTable } from '../CippTable/CippDataTable'
import { ApiGetCall } from '../../api/ApiCall'

const SITE_ROOT = '__siteRoot__'
const SITE_ROOT_OPTION = { label: 'Site root (whole site)', value: SITE_ROOT }

// Stable empty fallback: CippDataTable syncs its `data` prop by reference.
const NO_PATHS = []

const optionValue = (x) => (x && typeof x === 'object' && 'value' in x ? x.value : x)

// Explains how one user ends up with access to a site or library, rather than listing who holds
// permissions. Answers the question the permission lists cannot: a group holding Edit says
// nothing about whether this particular person is in it.
export const CippCheckUserAccessDialog = ({
  row,
  tenantFilter,
  drawerVisible,
  setDrawerVisible,
}) => {
  const siteRow = Array.isArray(row) ? row[0] : row
  const siteUrl = siteRow?.webUrl
  const siteId = siteRow?.siteId
  const tenant = siteRow?.Tenant ?? tenantFilter
  const isOpen = !!drawerVisible

  const formControl = useForm({ defaultValues: { user: null, scope: SITE_ROOT_OPTION } })
  const selectedUser = formControl.watch('user')
  const selectedScope = formControl.watch('scope')

  // The check only runs once asked for, so changing the user does not fire a request per keystroke.
  const [query, setQuery] = useState(null)

  const libraries = ApiGetCall({
    url: '/api/ListSiteLibraries',
    data: { SiteId: siteId, SiteUrl: siteUrl, tenantFilter: tenant },
    queryKey: `SiteLibraries-${siteId ?? siteUrl}`,
    waiting: isOpen && !!siteUrl,
  })

  const scopeOptions = useMemo(() => {
    const libs = Array.isArray(libraries.data?.Results) ? libraries.data.Results : []
    return [
      SITE_ROOT_OPTION,
      ...libs.map((library) => ({ label: library.Title, value: library.Id })),
    ]
  }, [libraries.data])

  const access = ApiGetCall({
    url: '/api/ListSiteUserAccess',
    data: query ?? {},
    queryKey: `SiteUserAccess-${siteUrl}-${query?.ListId || 'root'}-${query?.UserPrincipalName}`,
    waiting: isOpen && !!query,
  })

  const runCheck = () => {
    const upn = optionValue(selectedUser)
    if (!upn) return
    const scopeId = optionValue(selectedScope)
    setQuery({
      tenantFilter: tenant,
      SiteUrl: siteUrl,
      ListId: !scopeId || scopeId === SITE_ROOT ? '' : scopeId,
      UserPrincipalName: upn,
    })
  }

  const result = access.data?.Results
  const data = typeof result === 'object' && result !== null ? result : null
  const loadError = typeof result === 'string' ? result : null
  const paths = data?.Paths ?? NO_PATHS
  const realPaths = paths.filter((p) => p.GrantsRealAccess)
  const limitedOnly = paths.length > 0 && realPaths.length === 0

  return (
    <Dialog fullWidth maxWidth="md" open={isOpen} onClose={() => setDrawerVisible(false)}>
      <DialogTitle>
        Check User Access{siteRow?.displayName ? ` — ${siteRow.displayName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Shows every route by which a user can reach this site or one of its libraries, and what
            each route grants. Group memberships are resolved, including nested groups, so this
            answers whether someone actually has access rather than who holds the permissions.
          </Typography>

          <CippFormComponent
            type="autoComplete"
            name="user"
            label="User"
            multiple={false}
            creatable={false}
            formControl={formControl}
            api={{
              url: '/api/ListGraphRequest',
              data: {
                Endpoint: 'users',
                $select: 'id,displayName,userPrincipalName',
                $top: 999,
                $count: true,
              },
              queryKey: 'ListUsersAutoComplete',
              dataKey: 'Results',
              labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
              valueField: 'userPrincipalName',
              showRefresh: true,
            }}
          />

          <CippFormComponent
            type="autoComplete"
            name="scope"
            label="Document Library"
            multiple={false}
            creatable={false}
            formControl={formControl}
            options={scopeOptions}
            isFetching={libraries.isFetching}
          />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              size="small"
              startIcon={<Search />}
              disabled={!optionValue(selectedUser) || access.isFetching}
              onClick={runCheck}
            >
              Check Access
            </Button>
          </Stack>

          {loadError && <Alert severity="error">{loadError}</Alert>}

          {access.isFetching && <Skeleton variant="rounded" height={120} />}

          {!access.isFetching && data && (
            <>
              <Divider />
              {data.HasAccess ? (
                <Alert severity="warning">
                  <AlertTitle>
                    {data.DisplayName} has access via {data.AccessPathCount}{' '}
                    {data.AccessPathCount === 1 ? 'route' : 'routes'}
                  </AlertTitle>
                  Removing one route does not remove the others — every route below has to go for
                  access to stop.
                </Alert>
              ) : (
                <Alert severity="success">
                  <AlertTitle>{data.DisplayName} has no access</AlertTitle>
                  {limitedOnly
                    ? 'The only entry found is Limited Access, which SharePoint adds so a user can traverse to a specific item. It does not let them open or list anything here.'
                    : 'No permission, group membership or sharing link grants this user access to this scope.'}
                </Alert>
              )}

              {data.LibraryInherits && (
                <Alert severity="info">
                  This library inherits its permissions from the site, so the site&apos;s
                  permissions were evaluated.
                </Alert>
              )}

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" variant="outlined" label={`Scope: ${data.TargetLabel}`} />
                {data.IsGuest && (
                  <Chip size="small" variant="outlined" color="warning" label="Guest account" />
                )}
                {!data.SharingLinksChecked && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="info"
                    label="Sharing links not checked — no cached data"
                  />
                )}
              </Stack>

              <CippDataTable
                noCard={true}
                isInDialog={true}
                title="Access Routes"
                queryKey={`SiteUserAccessPaths-${query?.UserPrincipalName}-${query?.ListId || 'root'}`}
                data={paths}
                simpleColumns={['Route', 'Via', 'PermissionLevel', 'AppliesTo', 'IsSystemManaged']}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setDrawerVisible(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CippCheckUserAccessDialog
