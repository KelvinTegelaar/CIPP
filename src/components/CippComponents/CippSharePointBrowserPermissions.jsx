import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import PropTypes from 'prop-types'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { ApiGetCall } from '../../api/ApiCall'
import { CippApiDialog } from './CippApiDialog'
import CippFormComponent from './CippFormComponent'
import { useDialog } from '../../hooks/use-dialog'
import { usePermissions } from '../../hooks/use-permissions'

const EMPTY = []

const optionValue = (value) =>
  value && typeof value === 'object' && 'value' in value ? value.value : value

const TabPanel = ({ value, index, children }) =>
  value === index ? <Box sx={{ pt: 2, height: '100%' }}>{children}</Box> : null

TabPanel.propTypes = {
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
}

const SectionToolbar = ({
  title,
  count,
  actions = EMPTY,
}) => (
  <Stack
    direction="row"
    spacing={1}
    sx={{
      alignItems: "center",
      justifyContent: "space-between",
      mb: 1.5
    }}>
    <Stack direction="row" spacing={1} sx={{
      alignItems: "center"
    }}>
      <Typography variant="subtitle2">{title}</Typography>
      {typeof count === 'number' ? <Chip size="small" label={count} sx={{ height: 22 }} /> : null}
    </Stack>
    {actions.length ? (
      <Stack direction="row" spacing={1} sx={{
        alignItems: "center"
      }}>
        {actions.map((action) => (
          <Tooltip
            key={action.label}
            title={action.disabled ? action.disabledTitle || 'Coming soon' : action.label}
          >
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={action.icon ?? <CippIcons.Add />}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            </span>
          </Tooltip>
        ))}
      </Stack>
    ) : null}
  </Stack>
)

SectionToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      disabledTitle: PropTypes.string,
      icon: PropTypes.node,
    })
  ),
}

const RowActions = ({ onEdit, onRemove, disableActions = true, disabledTitle = 'Coming soon' }) => (
  <Stack direction="row" spacing={0.25} sx={{
    justifyContent: "flex-end"
  }}>
    {onEdit ? (
      <Tooltip title={disableActions ? disabledTitle : 'Modify'}>
        <span>
          <IconButton size="small" onClick={onEdit} disabled={disableActions} aria-label="Modify">
            <CippIcons.EditOutlined fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    ) : null}
    {onRemove ? (
      <Tooltip title={disableActions ? disabledTitle : 'Remove'}>
        <span>
          <IconButton size="small" onClick={onRemove} disabled={disableActions} aria-label="Remove">
            <CippIcons.DeleteOutlined fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    ) : null}
  </Stack>
)

RowActions.propTypes = {
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
  disableActions: PropTypes.bool,
  disabledTitle: PropTypes.string,
}

const PrincipalChips = ({ row }) => (
  <Stack direction="row" spacing={0.5} useFlexGap sx={{
    flexWrap: "wrap"
  }}>
    {row.isGuest ? <Chip size="small" color="warning" label="Guest" /> : null}
    {row.isSiteAdmin ? <Chip size="small" label="Admin" /> : null}
    {row.isSystemGroup ? <Chip size="small" color="info" label="Associated" /> : null}
    {row.isSystemManaged ? <Chip size="small" variant="outlined" label="System" /> : null}
  </Stack>
)

PrincipalChips.propTypes = {
  row: PropTypes.object.isRequired,
}

const EmptyState = ({ message = 'None' }) => (
  <Typography
    variant="body2"
    sx={{
      color: "text.secondary",
      py: 2
    }}>
    {message}
  </Typography>
)

EmptyState.propTypes = {
  message: PropTypes.string,
}

const AccessTable = ({ rows = EMPTY, canWrite = false, systemGroupIds = EMPTY, onEdit, onRemove }) => {
  const systemIds = useMemo(() => {
    const set = new Set()
    ;(Array.isArray(systemGroupIds) ? systemGroupIds : []).forEach((id) => {
      if (id !== null && id !== undefined && `${id}`.length) set.add(`${id}`)
    })
    return set
  }, [systemGroupIds])

  if (!rows.length) return <EmptyState message="No role assignments." />

  return (
    <TableContainer sx={{ maxHeight: 420, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Principal</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Permission</TableCell>
            <TableCell>Email / UPN</TableCell>
            <TableCell align="right" sx={{ width: 96 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const levels =
              Array.isArray(row.permissionLevels) && row.permissionLevels.length
                ? row.permissionLevels
                : row.permissionLevel
                  ? [
                      {
                        name: row.permissionLevel,
                        isSystemManaged: row.isSystemManaged,
                        roleDefinitionId: row.roleDefinitionId,
                      },
                    ]
                  : []
            const onlySystem = levels.length > 0 && levels.every((level) => level.isSystemManaged)
            const isSystemGroup =
              Boolean(row.isSystemGroup) ||
              (row.principalId != null && systemIds.has(`${row.principalId}`))
            const canAct = canWrite && !onlySystem && !isSystemGroup && !!row.principalId

            return (
              <TableRow
                key={`${row.principalId}-${index}`}
                hover
                sx={onlySystem || isSystemGroup ? { opacity: 0.7 } : undefined}
              >
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{
                      fontWeight: 500
                    }}>
                      {row.title || '—'}
                    </Typography>
                    <PrincipalChips row={{ ...row, isSystemGroup }} />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.principalType || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} useFlexGap sx={{
                    flexWrap: "wrap"
                  }}>
                    {levels.length
                      ? levels.map((level) => (
                          <Chip
                            key={level.roleDefinitionId || level.name}
                            size="small"
                            icon={level.isSystemManaged ? undefined : <CippIcons.Security fontSize="small" />}
                            variant={level.isSystemManaged ? 'outlined' : 'filled'}
                            label={level.name || '—'}
                            title={
                              level.isSystemManaged
                                ? 'System-managed (e.g. Limited Access)'
                                : undefined
                            }
                          />
                        ))
                      : '—'}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    noWrap
                    title={row.userPrincipalName || row.email || row.loginName}
                    sx={{
                      color: "text.secondary",
                      maxWidth: 220
                    }}>
                    {row.userPrincipalName || row.email || row.loginName || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <RowActions
                    disableActions={!canAct}
                    disabledTitle={
                      isSystemGroup
                        ? 'Associated Owners/Members/Visitors cannot be changed here'
                        : onlySystem
                          ? 'Limited Access is system-managed'
                          : !canWrite
                            ? 'Requires SharePoint write permission'
                            : 'Unavailable'
                    }
                    onEdit={canAct && onEdit ? () => onEdit(row) : undefined}
                    onRemove={canAct && onRemove ? () => onRemove(row) : undefined}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

AccessTable.propTypes = {
  rows: PropTypes.array,
  canWrite: PropTypes.bool,
  systemGroupIds: PropTypes.array,
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
}

const MembersTable = ({
  rows = EMPTY,
  canWrite = false,
  onRemoveMember,
  disableRemove = false,
  disableRemoveTitle = 'Remove unavailable',
}) => {
  if (!rows.length) return <EmptyState message="No members in this group." />

  return (
    <TableContainer sx={{ maxHeight: 380, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Email / UPN</TableCell>
            <TableCell align="right" sx={{ width: 56 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const canRemove =
              canWrite &&
              !disableRemove &&
              typeof onRemoveMember === 'function' &&
              !!row.principalId

            return (
              <TableRow key={`${row.principalId}-${index}`} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{
                      fontWeight: 500
                    }}>
                      {row.title || '—'}
                    </Typography>
                    <PrincipalChips row={row} />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.principalType || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    noWrap
                    title={row.userPrincipalName || row.email || row.loginName}
                    sx={{
                      color: "text.secondary",
                      maxWidth: 240
                    }}>
                    {row.userPrincipalName || row.email || row.loginName || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <RowActions
                    disableActions={!canRemove}
                    disabledTitle={
                      disableRemove
                        ? disableRemoveTitle
                        : !canWrite
                          ? 'Requires SharePoint write permission'
                          : 'Unavailable'
                    }
                    onRemove={
                      canWrite && typeof onRemoveMember === 'function' && row.principalId
                        ? () => onRemoveMember(row)
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

MembersTable.propTypes = {
  rows: PropTypes.array,
  canWrite: PropTypes.bool,
  onRemoveMember: PropTypes.func,
  disableRemove: PropTypes.bool,
  disableRemoveTitle: PropTypes.string,
}

const GraphSitePermissionsTable = ({ rows = EMPTY, canWrite = false, onRemove }) => {
  if (!rows.length) {
    return <EmptyState message="No Graph site permissions (app grants) on this site." />
  }

  return (
    <TableContainer sx={{ maxHeight: 420, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Principal</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Id</TableCell>
            <TableCell align="right" sx={{ width: 56 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const canRemove = canWrite && !!row.permissionId && typeof onRemove === 'function'
            return (
              <TableRow key={`${row.permissionId}-${index}`} hover>
                <TableCell>
                  <Typography variant="body2" sx={{
                    fontWeight: 500
                  }}>
                    {row.title || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {row.identityType || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} useFlexGap sx={{
                    flexWrap: "wrap"
                  }}>
                    {(row.roles ?? []).length
                      ? row.roles.map((role) => (
                          <Chip key={role} size="small" icon={<CippIcons.Security fontSize="small" />} label={role} />
                        ))
                      : '—'}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    noWrap
                    title={row.identityId}
                    sx={{
                      color: "text.secondary",
                      maxWidth: 260,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem'
                    }}>
                    {row.identityId || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <RowActions
                    disableActions={!canRemove}
                    disabledTitle={
                      !canWrite ? 'Requires SharePoint write permission' : 'Unavailable'
                    }
                    onRemove={canRemove ? () => onRemove(row) : undefined}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

GraphSitePermissionsTable.propTypes = {
  rows: PropTypes.array,
  canWrite: PropTypes.bool,
  onRemove: PropTypes.func,
}

const SITE_ROOT = '__siteRoot__'
const SITE_ROOT_OPTION = { label: 'Site root (whole site)', value: SITE_ROOT }

/**
 * Effective-access check: one user × this site/library, with every route explained.
 * Lives inline in Permissions (not a stacked dialog). Reuses ListSiteUserAccess.
 */
const CheckAccessPanel = ({
  open,
  tenantFilter,
  siteUrl,
  siteId,
  defaultListId,
  defaultListLabel,
}) => {
  const defaultScope = useMemo(() => {
    if (defaultListId) {
      return {
        label: defaultListLabel || 'Current library',
        value: defaultListId,
      }
    }
    return SITE_ROOT_OPTION
  }, [defaultListId, defaultListLabel])

  const formControl = useForm({
    defaultValues: { user: null, scope: defaultScope },
  })
  const selectedUser = formControl.watch('user')
  const selectedScope = formControl.watch('scope')
  const [query, setQuery] = useState(null)

  useEffect(() => {
    if (!open) {
      setQuery(null)
      formControl.reset({ user: null, scope: defaultScope })
      return
    }
    formControl.setValue('scope', defaultScope)
  }, [open, defaultScope, formControl])

  const libraries = ApiGetCall({
    url: '/api/ListSiteLibraries',
    data: { SiteId: siteId, SiteUrl: siteUrl, tenantFilter },
    queryKey: `SiteLibraries-${siteId ?? siteUrl}`,
    waiting: open && !!siteUrl,
  })

  const scopeOptions = useMemo(() => {
    const libs = Array.isArray(libraries.data?.Results) ? libraries.data.Results : []
    const fromApi = libs.map((library) => ({
      label: library.Title,
      value: library.Id,
    }))
    // Keep the current library visible even if ListSiteLibraries is still loading.
    if (
      defaultListId &&
      !fromApi.some((option) => String(option.value) === String(defaultListId))
    ) {
      fromApi.unshift({
        label: defaultListLabel || 'Current library',
        value: defaultListId,
      })
    }
    return [SITE_ROOT_OPTION, ...fromApi]
  }, [libraries.data, defaultListId, defaultListLabel])

  const access = ApiGetCall({
    url: '/api/ListSiteUserAccess',
    data: query ?? {},
    queryKey: `SiteUserAccess-${siteUrl}-${query?.ListId || 'root'}-${query?.UserPrincipalName}`,
    waiting: open && !!query,
  })

  const runCheck = () => {
    const upn = optionValue(selectedUser)
    if (!upn) return
    const scopeId = optionValue(selectedScope)
    setQuery({
      tenantFilter,
      SiteUrl: siteUrl,
      ListId: !scopeId || scopeId === SITE_ROOT ? '' : scopeId,
      UserPrincipalName: upn,
    })
  }

  const result = access.data?.Results
  const data = typeof result === 'object' && result !== null ? result : null
  const loadError = typeof result === 'string' ? result : null
  const paths = Array.isArray(data?.Paths) ? data.Paths : EMPTY
  const realPaths = paths.filter((path) => path.GrantsRealAccess)
  const limitedOnly = paths.length > 0 && realPaths.length === 0

  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{
        color: "text.secondary"
      }}>
        Pick a user to see every route that grants them access here — direct grants, SharePoint
        groups, nested Entra groups, tenant-wide claims, and (when cached) sharing links. This is
        the inverse of the Access tab: who can reach this place, and how.
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { md: 'flex-start' }
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
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
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CippFormComponent
            type="autoComplete"
            name="scope"
            label="Scope"
            multiple={false}
            creatable={false}
            formControl={formControl}
            options={scopeOptions}
            isFetching={libraries.isFetching}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<CippIcons.PersonSearch />}
          disabled={!optionValue(selectedUser) || access.isFetching}
          onClick={runCheck}
          sx={{ mt: { md: 1 }, flexShrink: 0 }}
        >
          Check
        </Button>
      </Stack>

      {loadError ? <Alert severity="error">{loadError}</Alert> : null}

      {access.isFetching ? <Skeleton variant="rounded" height={140} /> : null}

      {!access.isFetching && data ? (
        <Stack spacing={1.5}>
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

          {data.LibraryInherits ? (
            <Alert severity="info">
              This library inherits permissions from the site, so the site&apos;s permissions were
              evaluated.
            </Alert>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap sx={{
            flexWrap: "wrap"
          }}>
            <Chip size="small" variant="outlined" label={`Scope: ${data.TargetLabel}`} />
            {data.IsGuest ? (
              <Chip size="small" variant="outlined" color="warning" label="Guest account" />
            ) : null}
            {!data.SharingLinksChecked ? (
              <Chip
                size="small"
                variant="outlined"
                color="info"
                label="Sharing links not checked — no cached data"
              />
            ) : null}
          </Stack>

          {!paths.length ? (
            <EmptyState message="No access routes returned." />
          ) : (
            <TableContainer sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Route</TableCell>
                    <TableCell>Via</TableCell>
                    <TableCell>Permission</TableCell>
                    <TableCell>Applies to</TableCell>
                    <TableCell>Flags</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paths.map((path, index) => (
                    <TableRow key={`${path.Route}-${path.Via}-${index}`}>
                      <TableCell>{path.Route || '—'}</TableCell>
                      <TableCell>{path.Via || '—'}</TableCell>
                      <TableCell>{path.PermissionLevel || '—'}</TableCell>
                      <TableCell>{path.AppliesTo || '—'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} useFlexGap sx={{
                          flexWrap: "wrap"
                        }}>
                          {path.IsSystemManaged ? (
                            <Chip size="small" label="System" sx={{ height: 22 }} />
                          ) : null}
                          {path.GrantsRealAccess === false ? (
                            <Chip
                              size="small"
                              color="default"
                              variant="outlined"
                              label="Limited Access"
                              sx={{ height: 22 }}
                            />
                          ) : null}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      ) : null}
    </Stack>
  );
}

CheckAccessPanel.propTypes = {
  open: PropTypes.bool,
  tenantFilter: PropTypes.string,
  siteUrl: PropTypes.string,
  siteId: PropTypes.string,
  defaultListId: PropTypes.string,
  defaultListLabel: PropTypes.string,
}

/**
 * Permissions dialog for the SharePoint site browser.
 * Access / Groups / Admins / Apps / Check access.
 * Sharing links are out of scope (handled elsewhere).
 */
export const CippSharePointBrowserPermissions = ({
  open = false,
  onClose,
  item,
  tenantFilter,
  siteUrl: siteUrlProp,
  siteId: siteIdProp,
}) => {
  const [tab, setTab] = useState(0)
  const [selectedGroupKey, setSelectedGroupKey] = useState(null)
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Sharepoint.Site.ReadWrite'])

  const addUserDialog = useDialog()
  const addGroupDialog = useDialog()
  const removeMemberDialog = useDialog()
  const grantUserDialog = useDialog()
  const grantGroupDialog = useDialog()
  const replaceAccessDialog = useDialog()
  const removeAccessDialog = useDialog()
  const addAdminDialog = useDialog()
  const removeAdminDialog = useDialog()
  const breakInheritanceDialog = useDialog()
  const restoreInheritanceDialog = useDialog()
  const removeGraphPermissionDialog = useDialog()

  const isLibrary = item?.type === 'library'
  const siteUrl = siteUrlProp ?? (isLibrary ? null : item?.webUrl)
  const siteId = siteIdProp ?? (isLibrary ? null : item?.id)
  const listId = isLibrary ? item?.id : null
  const effectiveSiteUrl = siteUrl ?? item?.webUrl
  const effectiveSiteId = siteId ?? item?.siteId ?? item?.id
  const permissionsQueryKey = `ListSiteBrowserPermissions-${tenantFilter}-${effectiveSiteUrl}-${listId || 'site'}`

  const api = ApiGetCall({
    url: '/api/ListSiteBrowserPermissions',
    data: {
      tenantFilter,
      SiteUrl: effectiveSiteUrl,
      SiteId: effectiveSiteId,
      ...(listId ? { ListId: listId } : {}),
    },
    queryKey: permissionsQueryKey,
    waiting: open && !!tenantFilter && !!effectiveSiteUrl,
  })

  const roleDefinitions = ApiGetCall({
    url: '/api/ListSiteRoleDefinitions',
    data: { SiteUrl: effectiveSiteUrl, tenantFilter },
    queryKey: `SiteRoleDefinitions-${effectiveSiteUrl}`,
    waiting: open && !!tenantFilter && !!effectiveSiteUrl,
  })

  const result = api.data?.Results
  const loadError =
    typeof result === 'string'
      ? result
      : api.isError
        ? (api.error?.message ?? 'Failed to load permissions.')
        : null
  const data = typeof result === 'object' && result !== null ? result : null

  const titleName = data?.target?.title || item?.displayName || item?.name || 'Permissions'
  const targetType = data?.target?.type || (isLibrary ? 'library' : 'site')
  const inherits = Boolean(data?.target?.inheritsFromSite)
  const hasUnique = Boolean(data?.target?.hasUniqueRoleAssignments)
  const canMutateAccess = canWrite && !(targetType === 'library' && inherits)
  const writeDisabledTitle = !canWrite
    ? 'Requires SharePoint write permission'
    : inherits
      ? 'Break inheritance to change library access'
      : 'Unavailable'

  const levelOptions = useMemo(() => {
    const definitions = Array.isArray(roleDefinitions.data?.Results)
      ? roleDefinitions.data.Results
      : []
    return definitions.map((definition) => ({
      label: definition.IsCustom ? `${definition.Name} (custom)` : definition.Name,
      value: definition.Id,
    }))
  }, [roleDefinitions.data])

  const scopePayload = {
    tenantFilter,
    SiteUrl: effectiveSiteUrl,
    ListId: targetType === 'library' ? listId : '',
    LibraryName: targetType === 'library' ? titleName : '',
  }

  const accessRows = useMemo(() => {
    if (!data) return []
    if (targetType === 'library' && !inherits) {
      return data.libraryRoleAssignments ?? []
    }
    return data.webRoleAssignments ?? []
  }, [data, targetType, inherits])

  const systemGroupIds = useMemo(
    () =>
      (data?.associatedGroups ?? [])
        .map((group) => group.groupId)
        .filter((id) => id !== null && id !== undefined && `${id}`.length),
    [data]
  )
  const groupList = useMemo(() => {
    if (!data) return []
    const associated = (data.associatedGroups ?? []).map((group) => ({
      key: `assoc-${group.role}`,
      kind: 'associated',
      label: group.role,
      subtitle: group.title || '',
      memberCount: group.memberCount ?? group.members?.length ?? 0,
      members: group.members ?? [],
      groupId: group.groupId,
      isSystemGroup: true,
    }))
    const associatedIds = new Set(associated.map((g) => g.groupId).filter(Boolean))
    const custom = (data.sharePointGroups ?? [])
      .filter((group) => !associatedIds.has(group.groupId))
      .map((group) => ({
        key: `sp-${group.groupId}`,
        kind: 'sharepoint',
        label: group.title || group.loginName || group.groupId,
        subtitle: group.description || 'SharePoint group',
        memberCount: group.memberCount ?? group.members?.length ?? 0,
        members: group.members ?? [],
        groupId: group.groupId,
        isSystemGroup: Boolean(group.isSystemGroup),
      }))
    return [...associated, ...custom]
  }, [data])

  const activeGroup =
    groupList.find((group) => group.key === selectedGroupKey) || groupList[0] || null
  const canNestIntoActiveGroup = canWrite && !!activeGroup?.groupId

  const handleClose = () => {
    setTab(0)
    setSelectedGroupKey(null)
    onClose?.()
  }

  const removeMember = removeMemberDialog.data
  const accessRow = replaceAccessDialog.data || removeAccessDialog.data
  const adminRow = removeAdminDialog.data
  const graphPermissionRow = removeGraphPermissionDialog.data
  const graphSitePermissions = data?.graphSitePermissions ?? []
  const accessScopeLabel =
    targetType === 'library' && !inherits ? `library ${titleName}` : 'the site'

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pr: 12 }}>
        <Stack spacing={0.75}>
          <Typography variant="h6" component="span">
            Permissions — {titleName}
          </Typography>
          <Stack
            direction="row"
            spacing={0.75}
            useFlexGap
            sx={{
              flexWrap: "wrap",
              alignItems: "center"
            }}>
            <Chip size="small" label={targetType === 'library' ? 'Library' : 'Site'} />
            {inherits ? <Chip size="small" color="info" label="Inherits from site" /> : null}
            {hasUnique && targetType === 'library' ? (
              <Chip size="small" color="warning" label="Broken inheritance" />
            ) : null}
            {data?.collectedAt ? (
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                Collected {new Date(data.collectedAt).toLocaleString()}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Tooltip title="Refresh">
            <span>
              <IconButton
                aria-label="Refresh"
                onClick={() => api.refetch()}
                disabled={!effectiveSiteUrl || api.isFetching}
              >
                <CippIcons.Refresh />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton aria-label="Close" onClick={handleClose}>
            <CippIcons.Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: { xs: 360, md: 520 } }}>
        {!effectiveSiteUrl ? (
          <Alert severity="warning">No site URL available for this selection.</Alert>
        ) : api.isFetching && !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : loadError ? (
          <Alert severity="error">{loadError}</Alert>
        ) : data ? (
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            {data.errors?.length ? (
              <Alert severity="warning">
                Some sections failed to load ({data.errors.length}). Showing what was collected.
              </Alert>
            ) : null}

            {targetType === 'library' && inherits ? (
              <Alert
                severity="info"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<CippIcons.LinkOff />}
                    disabled={!canWrite}
                    onClick={() => breakInheritanceDialog.handleOpen()}
                  >
                    Stop inheriting
                  </Button>
                }
              >
                This library inherits permissions from the site. Showing site role assignments;
                stop inheriting to manage library-specific access.
              </Alert>
            ) : null}

            {targetType === 'library' && hasUnique && !inherits ? (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<CippIcons.Link />}
                    disabled={!canWrite}
                    onClick={() => restoreInheritanceDialog.handleOpen()}
                  >
                    Fix inheritance
                  </Button>
                }
              >
                This library has broken inheritance (unique permissions). Fixing inheritance
                discards them and follows the site again.
              </Alert>
            ) : null}

            <Tabs
              value={tab}
              onChange={(_, next) => setTab(next)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              <Tab label={`Access (${accessRows.length})`} />
              <Tab label={`Groups (${groupList.length})`} />
              <Tab label={`Admins (${data.siteAdmins?.length ?? 0})`} />
              <Tab label={`Apps (${graphSitePermissions.length})`} />
              <Tab label="Check access" />
            </Tabs>
            <Divider />

            <TabPanel value={tab} index={0}>
              <SectionToolbar
                title={
                  targetType === 'library' && !inherits
                    ? 'Library role assignments'
                    : 'Site role assignments'
                }
                count={accessRows.length}
                actions={[
                  ...(targetType === 'library' && hasUnique && !inherits
                    ? [
                        {
                          label: 'Fix inheritance',
                          icon: <CippIcons.Link />,
                          onClick: () => restoreInheritanceDialog.handleOpen(),
                          disabled: !canWrite,
                          disabledTitle: writeDisabledTitle,
                        },
                      ]
                    : []),
                  {
                    label: 'Grant user',
                    onClick: () => grantUserDialog.handleOpen(),
                    disabled: !canMutateAccess,
                    disabledTitle: writeDisabledTitle,
                  },
                  {
                    label: 'Grant group',
                    onClick: () => grantGroupDialog.handleOpen(),
                    disabled: !canMutateAccess,
                    disabledTitle: writeDisabledTitle,
                  },
                ]}
              />
              <AccessTable
                rows={accessRows}
                canWrite={canMutateAccess}
                systemGroupIds={systemGroupIds}
                onEdit={(row) => replaceAccessDialog.handleOpen(row)}
                onRemove={(row) => removeAccessDialog.handleOpen(row)}
              />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              {!groupList.length ? (
                <EmptyState message="No SharePoint groups found." />
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
                    gap: 2,
                    minHeight: 400,
                  }}
                >
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2">Groups</Typography>
                    </Box>
                    <List dense disablePadding sx={{ overflow: 'auto', flex: 1 }}>
                      {groupList.map((group) => (
                        <ListItemButton
                          key={group.key}
                          selected={(activeGroup?.key || null) === group.key}
                          onClick={() => setSelectedGroupKey(group.key)}
                        >
                          <ListItemText
                            primary={group.label}
                            secondary={`${group.memberCount} member${group.memberCount === 1 ? '' : 's'}${
                              group.subtitle ? ` · ${group.subtitle}` : ''
                            }`}
                            slotProps={{
                              primary: { variant: 'body2', fontWeight: 500 },
                              secondary: { variant: 'caption' }
                            }} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>

                  <Box>
                    <SectionToolbar
                      title={activeGroup?.label || 'Members'}
                      count={activeGroup?.members?.length ?? 0}
                      actions={[
                        {
                          label: 'Add User',
                          onClick: () => addUserDialog.handleOpen(),
                          disabled: !canNestIntoActiveGroup,
                          disabledTitle: !canWrite
                            ? 'Requires SharePoint write permission'
                            : !activeGroup?.groupId
                              ? 'Select a SharePoint group'
                              : 'Unavailable',
                        },
                        {
                          label: 'Add Group',
                          onClick: () => addGroupDialog.handleOpen(),
                          disabled: !canNestIntoActiveGroup,
                          disabledTitle: !canWrite
                            ? 'Requires SharePoint write permission'
                            : !activeGroup?.groupId
                              ? 'Select a SharePoint group'
                              : 'Unavailable',
                        },
                      ]}
                    />
                    {activeGroup?.subtitle ? (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: 'block',
                          mb: 1
                        }}>
                        {activeGroup.subtitle}
                        {activeGroup.kind === 'associated' ? ' · Associated group' : ''}
                      </Typography>
                    ) : null}
                    <MembersTable
                      rows={activeGroup?.members ?? []}
                      canWrite={canNestIntoActiveGroup}
                      onRemoveMember={(row) => removeMemberDialog.handleOpen(row)}
                    />
                  </Box>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <SectionToolbar
                title="Site collection admins"
                count={data.siteAdmins?.length ?? 0}
                actions={[
                  {
                    label: 'Add admin',
                    onClick: () => addAdminDialog.handleOpen(),
                    disabled: !canWrite,
                    disabledTitle: 'Requires SharePoint write permission',
                  },
                ]}
              />
              <MembersTable
                rows={data.siteAdmins}
                canWrite={canWrite}
                disableRemove={(data.siteAdmins?.length ?? 0) <= 1}
                disableRemoveTitle="Cannot remove the last site collection admin"
                onRemoveMember={(row) => removeAdminDialog.handleOpen(row)}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: 'block',
                  mt: 1
                }}>
                Site collection admins are separate from Owners group membership.
              </Typography>
            </TabPanel>

            <TabPanel value={tab} index={3}>
              <SectionToolbar
                title="Graph site permissions"
                count={graphSitePermissions.length}
              />
              <GraphSitePermissionsTable
                rows={graphSitePermissions}
                canWrite={canWrite}
                onRemove={(row) => removeGraphPermissionDialog.handleOpen(row)}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: 'block',
                  mt: 1
                }}>
                Site-scoped Graph grants (typically Sites.Selected app access). Separate from
                SharePoint role assignments and sharing links.
              </Typography>
            </TabPanel>

            <TabPanel value={tab} index={4}>
              <CheckAccessPanel
                open={open}
                tenantFilter={tenantFilter}
                siteUrl={effectiveSiteUrl}
                siteId={data?.target?.siteId || effectiveSiteId}
                defaultListId={targetType === 'library' ? listId : null}
                defaultListLabel={targetType === 'library' ? titleName : null}
              />
            </TabPanel>
          </Stack>
        ) : null}
      </DialogContent>

      <CippApiDialog
        createDialog={grantUserDialog}
        title="Grant user access"
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Grant the selected user(s) a permission level on ${accessScopeLabel}.`,
          customDataformatter: (actionRow, action, formData) => ({
            ...scopePayload,
            Action: 'GrantAccess',
            RoleDefinitionId: optionValue(formData.RoleDefinitionId),
            Users: formData.Users ?? [],
          }),
          multiPost: false,
        }}
        row={item ?? {}}
      >
        {({ formHook }) => (
          <>
            <CippFormComponent
              type="autoComplete"
              name="Users"
              label="Users"
              multiple
              creatable={false}
              formControl={formHook}
              validators={{ required: 'Select at least one user' }}
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
                addedField: { id: 'id' },
                showRefresh: true,
              }}
            />
            <CippFormComponent
              type="autoComplete"
              name="RoleDefinitionId"
              label="Permission Level"
              multiple={false}
              creatable={false}
              formControl={formHook}
              options={levelOptions}
              isFetching={roleDefinitions.isFetching}
              validators={{ required: 'Select a permission level' }}
            />
          </>
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={grantGroupDialog}
        title="Grant group access"
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Grant the selected group(s) a permission level on ${accessScopeLabel}.`,
          customDataformatter: (actionRow, action, formData) => ({
            ...scopePayload,
            Action: 'GrantAccess',
            RoleDefinitionId: optionValue(formData.RoleDefinitionId),
            Groups: formData.Groups ?? [],
          }),
          multiPost: false,
        }}
        row={item ?? {}}
      >
        {({ formHook }) => (
          <>
            <CippFormComponent
              type="autoComplete"
              name="Groups"
              label="Groups"
              multiple
              creatable={false}
              formControl={formHook}
              validators={{ required: 'Select at least one group' }}
              api={{
                url: '/api/ListGraphRequest',
                data: {
                  Endpoint: 'groups',
                  $select: 'id,displayName,mail,securityEnabled,groupTypes',
                  $top: 999,
                  $count: true,
                },
                queryKey: 'ListGroupsAutoComplete',
                dataKey: 'Results',
                labelField: (group) =>
                  group.mail ? `${group.displayName} (${group.mail})` : group.displayName,
                valueField: 'id',
                addedField: {
                  securityEnabled: 'securityEnabled',
                  groupTypes: 'groupTypes',
                },
                showRefresh: true,
              }}
            />
            <CippFormComponent
              type="autoComplete"
              name="RoleDefinitionId"
              label="Permission Level"
              multiple={false}
              creatable={false}
              formControl={formHook}
              options={levelOptions}
              isFetching={roleDefinitions.isFetching}
              validators={{ required: 'Select a permission level' }}
            />
          </>
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={replaceAccessDialog}
        title="Change permission level"
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Set the permission level for ${accessRow?.title || 'this principal'} on ${accessScopeLabel}. Other non-system levels they hold here are removed.`,
          customDataformatter: (actionRow, action, formData) => ({
            ...scopePayload,
            Action: 'ReplaceAccess',
            PrincipalId: accessRow?.principalId,
            PrincipalName: accessRow?.title,
            RoleDefinitionId: optionValue(formData.RoleDefinitionId),
          }),
          multiPost: false,
        }}
        row={accessRow ?? {}}
      >
        {({ formHook }) => (
          <CippFormComponent
            type="autoComplete"
            name="RoleDefinitionId"
            label="Permission Level"
            multiple={false}
            creatable={false}
            formControl={formHook}
            options={levelOptions}
            isFetching={roleDefinitions.isFetching}
            validators={{ required: 'Select a permission level' }}
          />
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={removeAccessDialog}
        title="Remove access"
        relatedQueryKeys={[permissionsQueryKey]}
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Remove access for ${accessRow?.title || 'this principal'} on ${accessScopeLabel}? Limited Access is left alone.`,
          customDataformatter: () => ({
            ...scopePayload,
            Action: 'RemoveAccess',
            PrincipalId: accessRow?.principalId,
            PrincipalName: accessRow?.title,
          }),
          multiPost: false,
        }}
        row={accessRow ?? {}}
      />

      <CippApiDialog
        createDialog={addUserDialog}
        title={`Add user to ${activeGroup?.label || 'SharePoint group'}`}
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Add the selected user(s) to ${
            activeGroup?.subtitle || activeGroup?.label || 'this SharePoint group'
          }.`,
          customDataformatter: (actionRow, action, formData) => ({
            tenantFilter,
            SiteUrl: effectiveSiteUrl,
            Action: 'AddGroupMember',
            GroupId: activeGroup?.groupId,
            GroupName: activeGroup?.subtitle || activeGroup?.label,
            Users: formData.Users ?? [],
          }),
          multiPost: false,
        }}
        row={activeGroup ?? {}}
      >
        {({ formHook }) => (
          <CippFormComponent
            type="autoComplete"
            name="Users"
            label="Users"
            multiple
            creatable={false}
            formControl={formHook}
            validators={{ required: 'Select at least one user' }}
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
              addedField: { id: 'id' },
              showRefresh: true,
            }}
          />
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={addGroupDialog}
        title={`Add group to ${activeGroup?.label || 'SharePoint group'}`}
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Nest the selected group(s) inside ${
            activeGroup?.subtitle || activeGroup?.label || 'this SharePoint group'
          }.`,
          customDataformatter: (actionRow, action, formData) => ({
            tenantFilter,
            SiteUrl: effectiveSiteUrl,
            Action: 'AddGroupMember',
            GroupId: activeGroup?.groupId,
            GroupName: activeGroup?.subtitle || activeGroup?.label,
            Groups: formData.Groups ?? [],
          }),
          multiPost: false,
        }}
        row={activeGroup ?? {}}
      >
        {({ formHook }) => (
          <CippFormComponent
            type="autoComplete"
            name="Groups"
            label="Groups"
            multiple
            creatable={false}
            formControl={formHook}
            validators={{ required: 'Select at least one group' }}
            api={{
              url: '/api/ListGraphRequest',
              data: {
                Endpoint: 'groups',
                $select: 'id,displayName,mail,securityEnabled,groupTypes',
                $top: 999,
                $count: true,
              },
              queryKey: 'ListGroupsAutoComplete',
              dataKey: 'Results',
              labelField: (group) =>
                group.mail ? `${group.displayName} (${group.mail})` : group.displayName,
              valueField: 'id',
              addedField: {
                securityEnabled: 'securityEnabled',
                groupTypes: 'groupTypes',
              },
              showRefresh: true,
            }}
          />
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={removeMemberDialog}
        title="Remove member"
        relatedQueryKeys={[permissionsQueryKey]}
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Remove ${removeMember?.title || 'this member'} from ${
            activeGroup?.subtitle || activeGroup?.label || 'the SharePoint group'
          }?`,
          customDataformatter: () => ({
            tenantFilter,
            SiteUrl: effectiveSiteUrl,
            Action: 'RemoveGroupMember',
            GroupId: activeGroup?.groupId,
            GroupName: activeGroup?.subtitle || activeGroup?.label,
            PrincipalId: removeMember?.principalId,
            PrincipalName: removeMember?.title,
          }),
          multiPost: false,
        }}
        row={removeMember ?? {}}
      />

      <CippApiDialog
        createDialog={addAdminDialog}
        title="Add site collection admin"
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: 'Add the selected user(s) as site collection admins.',
          customDataformatter: (actionRow, action, formData) => ({
            tenantFilter,
            SiteUrl: effectiveSiteUrl,
            Action: 'AddSiteAdmin',
            Users: formData.Users ?? [],
          }),
          multiPost: false,
        }}
        row={item ?? {}}
      >
        {({ formHook }) => (
          <CippFormComponent
            type="autoComplete"
            name="Users"
            label="Users"
            multiple
            creatable={false}
            formControl={formHook}
            validators={{ required: 'Select at least one user' }}
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
              addedField: { id: 'id' },
              showRefresh: true,
            }}
          />
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={removeAdminDialog}
        title="Remove site collection admin"
        relatedQueryKeys={[permissionsQueryKey]}
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Remove ${adminRow?.title || 'this user'} as a site collection admin?`,
          customDataformatter: () => ({
            tenantFilter,
            SiteUrl: effectiveSiteUrl,
            Action: 'RemoveSiteAdmin',
            Users: [
              {
                value: adminRow?.userPrincipalName || adminRow?.email || adminRow?.title,
                label: adminRow?.title,
              },
            ],
            PrincipalName: adminRow?.title,
            userPrincipalName: adminRow?.userPrincipalName,
          }),
          multiPost: false,
        }}
        row={adminRow ?? {}}
      />

      <CippApiDialog
        createDialog={breakInheritanceDialog}
        title="Stop inheriting permissions"
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        defaultvalues={{ CopyRoleAssignments: true, ClearSubscopes: false }}
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Stop ${titleName} inheriting its permissions from the site?`,
          customDataformatter: (actionRow, action, formData) => ({
            ...scopePayload,
            Action: 'BreakInheritance',
            CopyRoleAssignments: formData.CopyRoleAssignments !== false,
            ClearSubscopes: formData.ClearSubscopes === true,
          }),
          multiPost: false,
        }}
        row={item ?? {}}
      >
        {({ formHook }) => (
          <>
            <CippFormComponent
              type="switch"
              name="CopyRoleAssignments"
              label="Keep the permissions it currently inherits"
              formControl={formHook}
            />
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 1
              }}>
              Turn this off to start from an empty permission set. Only site collection admins can
              reach the library until permissions are granted.
            </Typography>
            <CippFormComponent
              type="switch"
              name="ClearSubscopes"
              label="Reset unique permissions on folders and files inside it"
              formControl={formHook}
            />
          </>
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={restoreInheritanceDialog}
        title="Fix inheritance"
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Make ${titleName} follow the site's permissions again? Unique library permissions are discarded.`,
          customDataformatter: () => ({
            ...scopePayload,
            Action: 'RestoreInheritance',
          }),
          multiPost: false,
        }}
        row={item ?? {}}
      />

      <CippApiDialog
        createDialog={removeGraphPermissionDialog}
        title="Remove Graph site permission"
        relatedQueryKeys={[permissionsQueryKey]}
        api={{
          type: 'POST',
          url: '/api/ExecSiteBrowserPermissions',
          confirmText: `Remove Graph site permission for ${
            graphPermissionRow?.title || graphPermissionRow?.identityId || 'this principal'
          }?`,
          customDataformatter: () => ({
            tenantFilter,
            SiteUrl: effectiveSiteUrl,
            SiteId: data?.target?.siteId || effectiveSiteId,
            Action: 'RemoveGraphSitePermission',
            PermissionId: graphPermissionRow?.permissionId,
            PrincipalName: graphPermissionRow?.title || graphPermissionRow?.identityId,
          }),
          multiPost: false,
        }}
        row={graphPermissionRow ?? {}}
      />
    </Dialog>
  );
}

CippSharePointBrowserPermissions.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  item: PropTypes.object,
  tenantFilter: PropTypes.string,
  siteUrl: PropTypes.string,
  siteId: PropTypes.string,
}
