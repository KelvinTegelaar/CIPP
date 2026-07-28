import { useMemo } from 'react'
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { Add, Delete, LinkOff, Link as LinkIcon, Tune } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippApiDialog } from './CippApiDialog'
import CippFormComponent from './CippFormComponent'
import { ApiGetCall } from '../../api/ApiCall'
import { useDialog } from '../../hooks/use-dialog'
import { usePermissions } from '../../hooks/use-permissions'

// Sentinel for "the site itself" in the scope picker. A site collection root web always holds its
// own permissions, so it has no inheritance to manage - only assignments.
const SITE_ROOT = '__siteRoot__'
const SITE_ROOT_OPTION = { label: 'Site root (whole site)', value: SITE_ROOT }

// Stable empty fallback: CippDataTable syncs its `data` prop by reference, so handing it a fresh
// [] on every render would re-trigger that sync in a loop.
const NO_ASSIGNMENTS = []

// Unwraps the { label, value } shape the select controls persist.
const optionValue = (x) => (x && typeof x === 'object' && 'value' in x ? x.value : x)

// Custom-component action dialog: shows the permissions of a site's document library (or of the
// site root), and lets them be added, changed, removed, and detached from or reattached to the
// site's own permissions.
export const CippLibraryPermissionsDialog = ({
  row,
  tenantFilter,
  drawerVisible,
  setDrawerVisible,
}) => {
  const siteRow = Array.isArray(row) ? row[0] : row
  const siteUrl = siteRow?.webUrl
  const siteId = siteRow?.siteId
  const tenant = siteRow?.Tenant ?? tenantFilter
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Sharepoint.Site.ReadWrite'])

  const addDialog = useDialog()
  const breakDialog = useDialog()
  const resetDialog = useDialog()

  const scopeForm = useForm({ defaultValues: { scope: SITE_ROOT_OPTION } })
  const selectedScope = scopeForm.watch('scope')
  const selectedScopeId = optionValue(selectedScope)
  const isSiteRoot = !selectedScopeId || selectedScopeId === SITE_ROOT
  // The backend treats an empty ListId as "the site root", so it is safe to send either way.
  const listId = isSiteRoot ? '' : selectedScopeId
  const libraryName = isSiteRoot ? '' : (selectedScope?.label ?? '')
  const scopeLabel = isSiteRoot ? 'the site root' : `the ${libraryName} library`

  const isOpen = !!drawerVisible
  const permissionsQueryKey = `SitePermissions-${siteUrl}-${listId || 'root'}`
  // CippDataTable always spins up an infinite query on the queryKey it is given, even with no api
  // url. Sharing our key would point that infinite query at this plain query's cached object and
  // it would blow up looking for data.pages, so the table gets a key of its own.
  const tableQueryKey = `${permissionsQueryKey}-table`

  const libraries = ApiGetCall({
    url: '/api/ListSiteLibraries',
    data: { SiteId: siteId, SiteUrl: siteUrl, tenantFilter: tenant },
    queryKey: `SiteLibraries-${siteId ?? siteUrl}`,
    waiting: isOpen && !!siteUrl,
  })

  const permissions = ApiGetCall({
    url: '/api/ListSitePermissions',
    data: { SiteUrl: siteUrl, ListId: listId, tenantFilter: tenant },
    queryKey: permissionsQueryKey,
    waiting: isOpen && !!siteUrl,
  })

  const roleDefinitions = ApiGetCall({
    url: '/api/ListSiteRoleDefinitions',
    data: { SiteUrl: siteUrl, tenantFilter: tenant },
    queryKey: `SiteRoleDefinitions-${siteUrl}`,
    waiting: isOpen && !!siteUrl,
  })

  const scopeOptions = useMemo(() => {
    const libs = Array.isArray(libraries.data?.Results) ? libraries.data.Results : []
    return [
      SITE_ROOT_OPTION,
      ...libs.map((library) => ({ label: library.Title, value: library.Id })),
    ]
  }, [libraries.data])

  const levelOptions = useMemo(() => {
    const definitions = Array.isArray(roleDefinitions.data?.Results)
      ? roleDefinitions.data.Results
      : []
    return definitions.map((definition) => ({
      label: definition.IsCustom ? `${definition.Name} (custom)` : definition.Name,
      value: definition.Id,
    }))
  }, [roleDefinitions.data])

  // The endpoint returns an error string in Results instead of the permission object.
  const result = permissions.data?.Results
  const permissionData = typeof result === 'object' && result !== null ? result : null
  const loadError = typeof result === 'string' ? result : null
  const assignments = permissionData?.Assignments ?? NO_ASSIGNMENTS
  const hasUnique = permissionData?.HasUniqueRoleAssignments === true

  // Payload shared by every action on the current scope.
  const scopePayload = {
    tenantFilter: tenant,
    SiteUrl: siteUrl,
    ListId: listId,
    LibraryName: libraryName,
  }

  // Changing permissions requires the library to hold its own set, so an inheriting library is
  // detached first. Say so up front rather than surprising the admin with it afterwards.
  const inheritanceWarning =
    !isSiteRoot && !hasUnique
      ? ` ${libraryName} currently inherits its permissions from the site, so this will stop it inheriting and copy the current permissions across first.`
      : ''

  const actions = [
    {
      label: 'Change Permission Level',
      type: 'POST',
      icon: <Tune />,
      url: '/api/ExecSetLibraryPermission',
      confirmText: `Set the permission level [Title] holds on ${scopeLabel}. Any other level they hold here is removed.${inheritanceWarning}`,
      condition: (assignment) => canWrite && !assignment.IsSystemManaged,
      relatedQueryKeys: [permissionsQueryKey],
      children: ({ formHook }) => (
        <CippFormComponent
          type="autoComplete"
          name="RoleDefinitionId"
          label="Permission Level"
          multiple={false}
          creatable={false}
          formControl={formHook}
          options={levelOptions}
          validators={{ required: 'Select a permission level' }}
        />
      ),
      customDataformatter: (actionRow, action, formData) => {
        const assignment = Array.isArray(actionRow) ? actionRow[0] : actionRow
        return {
          ...scopePayload,
          PrincipalId: assignment.PrincipalId,
          PrincipalName: assignment.Title,
          RoleDefinitionId: optionValue(formData.RoleDefinitionId),
          Mode: 'Replace',
        }
      },
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Remove Permission',
      type: 'POST',
      icon: <Delete />,
      url: '/api/ExecRemoveLibraryPermission',
      confirmText: `Remove [PermissionLevel] from [Title] on ${scopeLabel}?${inheritanceWarning}`,
      color: 'error',
      condition: (assignment) => canWrite && !assignment.IsSystemManaged,
      relatedQueryKeys: [permissionsQueryKey],
      customDataformatter: (actionRow) => {
        const assignment = Array.isArray(actionRow) ? actionRow[0] : actionRow
        return {
          ...scopePayload,
          PrincipalId: assignment.PrincipalId,
          PrincipalName: assignment.Title,
          RoleDefinitionId: assignment.RoleDefinitionId,
        }
      },
      multiPost: false,
    },
  ]

  return (
    <Dialog fullWidth maxWidth="lg" open={isOpen} onClose={() => setDrawerVisible(false)}>
      <DialogTitle>
        Permissions{siteRow?.displayName ? ` — ${siteRow.displayName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <CippFormComponent
            type="autoComplete"
            name="scope"
            label="Document Library"
            multiple={false}
            creatable={false}
            formControl={scopeForm}
            options={scopeOptions}
            isFetching={libraries.isFetching}
          />

          {loadError && <Alert severity="error">{loadError}</Alert>}

          {!loadError && !isSiteRoot && !permissions.isFetching && permissionData && (
            <Alert severity={hasUnique ? 'warning' : 'info'}>
              <AlertTitle>
                {hasUnique ? 'Unique permissions' : 'Inheriting from the site'}
              </AlertTitle>
              {hasUnique
                ? `${libraryName} has its own permissions and no longer follows the site. Restoring inheritance discards the permissions listed below.`
                : `${libraryName} follows the site's permissions. Granting or changing a permission here stops it inheriting and copies the current permissions across.`}
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                {hasUnique ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<LinkIcon />}
                    disabled={!canWrite}
                    onClick={resetDialog.handleOpen}
                  >
                    Restore Inheritance
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LinkOff />}
                    disabled={!canWrite}
                    onClick={breakDialog.handleOpen}
                  >
                    Stop Inheriting
                  </Button>
                )}
              </Stack>
            </Alert>
          )}

          {isSiteRoot && (
            <Typography variant="body2" color="text.secondary">
              These are the permissions on the site itself. Every library that still inherits gets
              its permissions from here.
            </Typography>
          )}

          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              startIcon={<Add />}
              disabled={!canWrite}
              onClick={addDialog.handleOpen}
            >
              Add Permission
            </Button>
          </Stack>

          <CippDataTable
            noCard={true}
            isInDialog={true}
            title="Permissions"
            queryKey={tableQueryKey}
            data={assignments}
            isFetching={permissions.isFetching}
            refreshFunction={permissions}
            actions={actions}
            simpleColumns={[
              'Title',
              'PermissionLevel',
              'PrincipalType',
              'Email',
              'UserPrincipalName',
              'IsGuest',
              'IsSystemManaged',
            ]}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setDrawerVisible(false)}>
          Close
        </Button>
      </DialogActions>

      <CippApiDialog
        createDialog={addDialog}
        title="Add Permission"
        relatedQueryKeys={[permissionsQueryKey]}
        allowResubmit={true}
        api={{
          type: 'POST',
          url: '/api/ExecSetLibraryPermission',
          confirmText: `Grant users or groups a permission level on ${scopeLabel}.${inheritanceWarning}`,
          customDataformatter: (actionRow, action, formData) => ({
            ...scopePayload,
            RoleDefinitionId: optionValue(formData.RoleDefinitionId),
            Users: formData.Users ?? [],
            Groups: formData.Groups ?? [],
            Mode: 'Add',
          }),
          multiPost: false,
        }}
        row={siteRow ?? {}}
      >
        {({ formHook }) => (
          <>
            <CippFormComponent
              type="autoComplete"
              name="Users"
              label="Users"
              multiple={true}
              creatable={false}
              formControl={formHook}
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
                addedField: {
                  id: 'id',
                },
                showRefresh: true,
              }}
            />
            <CippFormComponent
              type="autoComplete"
              name="Groups"
              label="Groups"
              multiple={true}
              creatable={false}
              formControl={formHook}
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
              validators={{ required: 'Select a permission level' }}
            />
          </>
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={breakDialog}
        title="Stop Inheriting Permissions"
        relatedQueryKeys={[permissionsQueryKey]}
        api={{
          type: 'POST',
          url: '/api/ExecSetLibraryInheritance',
          confirmText: `Stop ${libraryName} inheriting its permissions from the site? From then on its permissions are managed here and site-level changes no longer reach it.`,
          customDataformatter: (actionRow, action, formData) => ({
            ...scopePayload,
            Action: 'Break',
            CopyRoleAssignments: formData.CopyRoleAssignments !== false,
            ClearSubscopes: formData.ClearSubscopes === true,
          }),
          multiPost: false,
        }}
        row={siteRow ?? {}}
        defaultvalues={{ CopyRoleAssignments: true, ClearSubscopes: false }}
      >
        {({ formHook }) => (
          <>
            <CippFormComponent
              type="switch"
              name="CopyRoleAssignments"
              label="Keep the permissions it currently inherits"
              formControl={formHook}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Turn this off to start from an empty permission set. Nobody but site collection admins
              will reach the library until permissions are granted.
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
        createDialog={resetDialog}
        title="Restore Inheritance"
        relatedQueryKeys={[permissionsQueryKey]}
        api={{
          type: 'POST',
          url: '/api/ExecSetLibraryInheritance',
          confirmText: `Make ${libraryName} follow the site's permissions again? Every permission unique to this library is discarded and cannot be recovered other than by granting it again.`,
          customDataformatter: () => ({ ...scopePayload, Action: 'Reset' }),
          multiPost: false,
        }}
        row={siteRow ?? {}}
      />
    </Dialog>
  )
}

export default CippLibraryPermissionsDialog
