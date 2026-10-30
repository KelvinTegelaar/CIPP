import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { ApiPostCall } from '../../api/ApiCall'
import { getListGraphBulkRequestRows } from '../../utils/getListGraphBulkRequestRows.js'
import { useDialog } from '../../hooks/use-dialog'
import { CippApiDialog } from './CippApiDialog'
import CippFormComponent from './CippFormComponent'
import riskyPermissionsJson from '../../data/RiskyPermissions.json'

// Built-in role definitions use the template id as their id.
const ROLE_RISK = new Map(
  riskyPermissionsJson
    .filter((r) => r.type === 'DirectoryRole')
    .map((r) => [String(r.id).toLowerCase(), r])
)
const roleRisk = (id) => ROLE_RISK.get(String(id || '').toLowerCase()) || null

const riskChipColor = (risk) =>
  ({ Critical: 'error', High: 'warning', Medium: 'info' })[risk] || 'default'

const scopeLabel = (directoryScopeId) =>
  !directoryScopeId || directoryScopeId === '/' ? 'Directory' : directoryScopeId

const CippEnterpriseAppRoles = ({
  servicePrincipalId,
  tenantFilter,
  canEdit = false,
}) => {
  const rolesBulk = ApiPostCall({ urlFromData: true })
  const actionDialog = useDialog()
  const [dialogAction, setDialogAction] = useState(null)

  const loadRoles = () => {
    if (!servicePrincipalId || !tenantFilter) {
      return
    }
    rolesBulk.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        tenantFilter,
        Requests: [
          {
            id: 'roleAssignments',
            url: `/roleManagement/directory/roleAssignments?$filter=principalId eq '${servicePrincipalId}'&$expand=roleDefinition($select=id,templateId,displayName,description,isBuiltIn)`,
            method: 'GET',
          },
        ],
      },
    })
  }

  useEffect(() => {
    loadRoles()
  }, [servicePrincipalId, tenantFilter])

  const rows = getListGraphBulkRequestRows(rolesBulk)
  const roleRow = rows.find((r) => r.id === 'roleAssignments')
  const assignments = useMemo(
    () =>
      [...(roleRow?.body?.value || [])].sort((a, b) =>
        String(
          a.roleDefinition?.displayName || a.roleDefinitionId
        ).localeCompare(
          String(b.roleDefinition?.displayName || b.roleDefinitionId),
          undefined,
          { sensitivity: 'base' }
        )
      ),
    [roleRow]
  )
  const loadError =
    roleRow && roleRow.status >= 400 ? roleRow.body?.error?.message : null
  const loading = rolesBulk.isPending || rolesBulk.isIdle

  const openAction = (action) => {
    setDialogAction({ ...action, key: Date.now() })
    actionDialog.handleOpen()
  }

  const openRemove = (title, toRemove, label) =>
    openAction({
      title,
      confirmText: `Remove ${label}? The application loses these privileges immediately.`,
      action: 'Remove',
      buildData: () => ({ RoleAssignmentIds: toRemove.map((a) => a.id) }),
    })

  const roleName = (a) => a.roleDefinition?.displayName || a.roleDefinitionId

  return (
    <Stack spacing={2} sx={{ py: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h6">Directory roles</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Entra roles held by this enterprise application. A role lets the app
            act as that administrator through any application permission it
            uses.
          </Typography>
        </Box>
        {canEdit && (
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CippIcons.DeleteSweep />}
              disabled={loading || assignments.length === 0}
              onClick={() =>
                openRemove(
                  'Remove all directory roles',
                  assignments,
                  `all ${assignments.length} directory role(s) from this application`
                )
              }
            >
              Remove all
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CippIcons.Add />}
              disabled={loading}
              onClick={() =>
                openAction({
                  title: 'Add directory roles',
                  confirmText:
                    'The selected roles are assigned tenant-wide and apply immediately. Privileged roles such as Global Administrator give the application full control of the tenant.',
                  action: 'Add',
                  buildData: (formData) => ({
                    RoleDefinitionIds: (formData.Roles || []).map(
                      (r) => r.value
                    ),
                  }),
                })
              }
            >
              Add role
            </Button>
          </Stack>
        )}
      </Stack>

      {loading && <Skeleton variant="rectangular" height={80} />}
      {!loading && rolesBulk.isError && (
        <Alert severity="error">
          Could not load the directory roles of this application.
        </Alert>
      )}
      {!loading && loadError && <Alert severity="error">{loadError}</Alert>}
      {!loading &&
        rolesBulk.isSuccess &&
        !loadError &&
        assignments.length === 0 && (
          <Alert severity="info">
            This application holds no directory roles.
          </Alert>
        )}
      {!loading && assignments.length > 0 && (
        <Card variant="outlined">
          <List dense disablePadding>
            {assignments.map((a) => {
              const risk = roleRisk(
                a.roleDefinition?.templateId || a.roleDefinitionId
              )
              return (
                <ListItem key={a.id} divider sx={{ py: 1 }}>
                  <ListItemText
                    primary={roleName(a)}
                    secondary={a.roleDefinition?.description || undefined}
                    slotProps={{
                      primary: { variant: 'body2', fontWeight: 'medium' },
                      secondary: { variant: 'caption' },
                    }}
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexShrink: 0, ml: 1 }}
                  >
                    {risk && (
                      <Tooltip
                        arrow
                        placement="left"
                        title={
                          <Box sx={{ maxWidth: 380, py: 0.25 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                              {`Suspicion ${risk.suspicion}, impact ${risk.impact}`}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="p"
                              sx={{ m: 0 }}
                            >
                              {risk.reason}
                            </Typography>
                          </Box>
                        }
                      >
                        <Chip
                          size="small"
                          label={`Impact ${risk.impact}`}
                          color={riskChipColor(risk.impact)}
                          variant={
                            risk.impact === 'Low' ? 'outlined' : 'filled'
                          }
                          sx={{ cursor: 'help' }}
                        />
                      </Tooltip>
                    )}
                    {a.roleDefinition &&
                      a.roleDefinition.isBuiltIn === false && (
                        <Chip size="small" label="Custom" variant="outlined" />
                      )}
                    <Chip
                      size="small"
                      label={scopeLabel(a.directoryScopeId)}
                      variant="outlined"
                    />
                    {canEdit && (
                      <Tooltip title={`Remove ${roleName(a)}`}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            openRemove(
                              'Remove directory role',
                              [a],
                              `the ${roleName(a)} role from this application`
                            )
                          }
                        >
                          <CippIcons.Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </ListItem>
              )
            })}
          </List>
        </Card>
      )}

      {dialogAction && (
        <CippApiDialog
          key={dialogAction.key}
          createDialog={actionDialog}
          title={dialogAction.title}
          relatedQueryKeys={[`EnterpriseApp-roles-${servicePrincipalId}`]}
          dialogAfterEffect={loadRoles}
          api={{
            type: 'POST',
            url: '/api/ExecEnterpriseAppRole',
            confirmText: dialogAction.confirmText,
            customDataformatter: (row, action, formData) => ({
              tenantFilter,
              ServicePrincipalId: servicePrincipalId,
              Action: dialogAction.action,
              ...dialogAction.buildData(formData),
            }),
          }}
        >
          {dialogAction.action === 'Add'
            ? ({ formHook }) => (
                <CippFormComponent
                  type="autoComplete"
                  name="Roles"
                  label="Directory roles"
                  multiple
                  creatable={false}
                  formControl={formHook}
                  validators={{
                    validate: (value) =>
                      value?.length > 0 || 'Select at least one role',
                  }}
                  api={{
                    tenantFilter,
                    url: '/api/ListGraphRequest',
                    dataKey: 'Results',
                    labelField: (option) => {
                      const risk = roleRisk(option.templateId || option.id)
                      const name =
                        option.isBuiltIn === false
                          ? `${option.displayName} (custom)`
                          : option.displayName
                      return risk ? `${name} - impact ${risk.impact}` : name
                    },
                    valueField: 'id',
                    queryKey: `EnterpriseApp-roleDefinitions-${tenantFilter}`,
                    dataFilter: (options) =>
                      options
                        .filter(
                          (o) =>
                            !assignments.some(
                              (a) =>
                                a.roleDefinitionId === o.value &&
                                scopeLabel(a.directoryScopeId) === 'Directory'
                            )
                        )
                        .sort((a, b) =>
                          String(a.label).localeCompare(
                            String(b.label),
                            undefined,
                            {
                              sensitivity: 'base',
                            }
                          )
                        ),
                    data: {
                      Endpoint: 'roleManagement/directory/roleDefinitions',
                      $select: 'id,templateId,displayName,isBuiltIn',
                    },
                  }}
                />
              )
            : undefined}
        </CippApiDialog>
      )}
    </Stack>
  )
}

export default CippEnterpriseAppRoles
