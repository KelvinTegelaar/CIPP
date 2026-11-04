import { useState } from 'react'
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
import { ApiGetCall } from '../../api/ApiCall'
import { useDialog } from '../../hooks/use-dialog'
import { CippApiDialog } from './CippApiDialog'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import riskyPermissionsJson from '../../data/RiskyPermissions.json'

const ROLE_RISK = new Map(
  riskyPermissionsJson
    .filter((r) => r.type === 'ExchangeRole')
    .map((r) => [String(r.name).toLowerCase(), r])
)
const roleRisk = (name) => ROLE_RISK.get(String(name || '').toLowerCase()) || null

// Views of Exchange app access that a change here makes stale: the App Mailbox Access tabs and
// pickers, every app's Exchange tab and the permission exposure report.
export const exchangeAccessQueryKeys = [
  'ExoAppMailboxAccess-*',
  'EnterpriseApp-exchange-*',
  'AppPermissionExposure-*',
  'ListAppPermissionExposure',
]

const riskChipColor = (risk) =>
  ({ Critical: 'error', High: 'warning', Medium: 'info' })[risk] || 'default'

const scopeChipLabel = (a) => {
  if (a.customResourceScope) return `Scope: ${a.customResourceScope}`
  if (a.recipientAdministrativeUnitScope) return `Admin unit: ${a.recipientAdministrativeUnitScope}`
  return 'Organization'
}

const scopeDescription = (a) => {
  if (a.customResourceScope) {
    return a.customResourceScopeFilter
      ? `Mailboxes matching ${a.customResourceScopeFilter}`
      : `Mailboxes in the management scope ${a.customResourceScope}`
  }
  if (a.recipientAdministrativeUnitScope) {
    return `Mailboxes in the administrative unit ${a.recipientAdministrativeUnitScope}`
  }
  return 'Every mailbox in the organization'
}

const scopeOption = (s) => ({
  label: s.recipientFilter ? `${s.name} (${s.recipientFilter})` : s.name,
  value: s.name,
})

// Scope choice shared by adding a role and changing the scope of one. Without managementScopes the
// scopes are read from Exchange when the picker opens.
export const ScopeFields = ({ formHook, tenantFilter, managementScopes }) => (
  <Stack spacing={2}>
    <CippFormComponent
      type="radio"
      name="ScopeType"
      label="Mailboxes the role applies to"
      formControl={formHook}
      options={[
        { label: 'Every mailbox in the organization', value: 'Organization' },
        { label: 'A management scope', value: 'ManagementScope' },
        { label: 'An administrative unit', value: 'AdministrativeUnit' },
      ]}
    />
    <CippFormCondition
      field="ScopeType"
      compareType="is"
      compareValue="ManagementScope"
      formControl={formHook}
    >
      <CippFormComponent
        type="autoComplete"
        name="ManagementScope"
        label="Management scope"
        multiple={false}
        creatable={false}
        formControl={formHook}
        validators={{ required: 'Select a management scope' }}
        helperText="Create one with New management scope if none fits. Exclusive scopes do not restrict an app and are not listed."
        {...(managementScopes
          ? { options: managementScopes.filter((s) => !s.exclusive).map(scopeOption) }
          : {
              api: {
                tenantFilter,
                url: '/api/ListExoAppMailboxAccess',
                data: { Type: 'Scopes' },
                dataKey: 'Results',
                labelField: (s) => scopeOption(s).label,
                valueField: 'name',
                queryKey: 'ExoAppMailboxAccess-Scopes-picker',
                dataFilter: (options) => options.filter((o) => !o.rawData?.exclusive),
              },
            })}
      />
    </CippFormCondition>
    <CippFormCondition
      field="ScopeType"
      compareType="is"
      compareValue="AdministrativeUnit"
      formControl={formHook}
    >
      <CippFormComponent
        type="autoComplete"
        name="AdministrativeUnit"
        label="Administrative unit"
        multiple={false}
        creatable={false}
        formControl={formHook}
        validators={{ required: 'Select an administrative unit' }}
        api={{
          tenantFilter,
          url: '/api/ListGraphRequest',
          dataKey: 'Results',
          labelField: 'displayName',
          valueField: 'id',
          queryKey: 'AdministrativeUnits-picker',
          data: { Endpoint: 'directory/administrativeUnits', $select: 'id,displayName' },
        }}
      />
    </CippFormCondition>
  </Stack>
)

const CippEnterpriseAppExchangeRbac = ({ servicePrincipalId, tenantFilter, canEdit = false }) => {
  const queryKey = `EnterpriseApp-exchange-${servicePrincipalId}`
  const request = ApiGetCall({
    url: '/api/ListEnterpriseAppExchangeRbac',
    data: { tenantFilter, ServicePrincipalId: servicePrincipalId },
    queryKey,
    waiting: !!servicePrincipalId && !!tenantFilter,
  })
  const actionDialog = useDialog()
  const [dialogAction, setDialogAction] = useState(null)

  const data = request.data?.Results
  const loaded = request.isSuccess && data && typeof data === 'object'
  const assignments = loaded ? data.assignments || [] : []
  const policies = loaded ? data.accessPolicies || [] : []
  const availableRoles = loaded ? data.availableRoles || [] : []
  const managementScopes = loaded ? data.managementScopes || [] : []
  const loadError = request.isError
    ? request.error?.response?.data?.Results || 'Could not read the Exchange access of this application.'
    : null

  const openAction = (action) => {
    setDialogAction({ ...action, key: Date.now() })
    actionDialog.handleOpen()
  }

  const scopeData = (formData) => ({
    ScopeType: formData.ScopeType,
    ManagementScope: formData.ManagementScope,
    AdministrativeUnit: formData.AdministrativeUnit,
  })

  const openAddRoles = () =>
    openAction({
      title: 'Add Exchange application roles',
      confirmText:
        'The roles apply to the selected mailboxes in addition to any mailbox permission the app holds in Entra. Changes can take up to two hours to reach an app that is in use.',
      action: 'AddRoles',
      defaultvalues: { ScopeType: 'Organization' },
      buildData: (formData) => ({
        Roles: (formData.Roles || []).map((r) => r.value),
        ...scopeData(formData),
      }),
      fields: ({ formHook }) => (
        <Stack spacing={2}>
          <CippFormComponent
            type="autoComplete"
            name="Roles"
            label="Application roles"
            multiple
            creatable={false}
            formControl={formHook}
            validators={{
              validate: (value) => value?.length > 0 || 'Select at least one role',
            }}
            options={availableRoles.map((r) => {
              const risk = roleRisk(r.name)
              return { label: risk ? `${r.name} - impact ${risk.impact}` : r.name, value: r.name }
            })}
          />
          <ScopeFields
            formHook={formHook}
            tenantFilter={tenantFilter}
            managementScopes={managementScopes}
          />
        </Stack>
      ),
    })

  const openChangeScope = (a) =>
    openAction({
      title: `Change the scope of ${a.role}`,
      confirmText:
        'The role is assigned with the new scope before the current assignment is removed, so the app keeps access throughout.',
      action: 'ChangeScope',
      defaultvalues: { ScopeType: 'Organization' },
      buildData: (formData) => ({ AssignmentIds: [a.id], ...scopeData(formData) }),
      fields: ({ formHook }) => (
        <ScopeFields
          formHook={formHook}
          tenantFilter={tenantFilter}
          managementScopes={managementScopes}
        />
      ),
    })

  const openRemoveRoles = (title, toRemove, label) =>
    openAction({
      title,
      confirmText: `Remove ${label}? The app loses this mailbox access within two hours.`,
      action: 'RemoveRoles',
      buildData: () => ({ AssignmentIds: toRemove.map((a) => a.id) }),
    })

  const openNewScope = () =>
    openAction({
      title: 'New management scope',
      confirmText:
        'The scope is created for the whole tenant and can then be used for any role assignment.',
      action: 'NewScope',
      buildData: (formData) => ({
        ScopeName: formData.ScopeName,
        RecipientFilter: formData.RecipientFilter,
      }),
      fields: ({ formHook }) => (
        <Stack spacing={2}>
          <CippFormComponent
            type="textField"
            name="ScopeName"
            label="Name"
            formControl={formHook}
            validators={{ required: 'A name is required' }}
          />
          <CippFormComponent
            type="textField"
            name="RecipientFilter"
            label="Recipient filter"
            formControl={formHook}
            validators={{ required: 'A recipient filter is required' }}
            helperText="An OPATH filter on mailbox properties, for example: Department -eq 'Sales' or CustomAttribute1 -eq 'Finance'"
          />
        </Stack>
      ),
    })

  const openRemovePolicy = (p) =>
    openAction({
      title: 'Remove application access policy',
      confirmText:
        p.accessRight === 'RestrictAccess'
          ? `Remove the policy limiting this app to the members of ${p.scopeName}? Its Entra mailbox permissions then reach every mailbox.`
          : `Remove the policy keeping this app from the members of ${p.scopeName}? Its Entra mailbox permissions then reach them too.`,
      action: 'RemovePolicies',
      buildData: () => ({ PolicyIds: [p.policyIdentity] }),
    })

  const loading = request.isLoading || request.isFetching

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h6">Exchange application roles</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Mailbox access Exchange gives this app through RBAC for Applications. It does not
              show as a permission in Entra and adds to whatever the app holds there.
            </Typography>
          </Box>
          {canEdit && (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CippIcons.Add />}
                disabled={!loaded}
                onClick={openNewScope}
              >
                New management scope
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CippIcons.DeleteSweep />}
                disabled={!loaded || assignments.length === 0}
                onClick={() =>
                  openRemoveRoles(
                    'Remove all Exchange application roles',
                    assignments,
                    `all ${assignments.length} Exchange application role(s) from this app`
                  )
                }
              >
                Remove all
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CippIcons.Add />}
                disabled={!loaded}
                onClick={openAddRoles}
              >
                Add role
              </Button>
            </Stack>
          )}
        </Stack>

        {loading && !loaded && <Skeleton variant="rectangular" height={80} />}
        {loadError && <Alert severity="error">{String(loadError)}</Alert>}
        {loaded && !data.registered && (
          <Alert severity="info">
            This app is not registered in Exchange, so it holds no Exchange application roles.
            Adding a role registers it.
          </Alert>
        )}
        {loaded && data.registered && assignments.length === 0 && (
          <Alert severity="info">This app holds no Exchange application roles.</Alert>
        )}
        {assignments.length > 0 && (
          <Card variant="outlined">
            <List dense disablePadding>
              {assignments.map((a) => {
                const risk = roleRisk(a.role)
                return (
                  <ListItem key={a.id} divider sx={{ py: 1 }}>
                    <ListItemText
                      primary={a.role}
                      secondary={scopeDescription(a)}
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
                              <Typography variant="body2" component="p" sx={{ m: 0 }}>
                                {risk.reason}
                              </Typography>
                            </Box>
                          }
                        >
                          <Chip
                            size="small"
                            label={`Impact ${risk.impact}`}
                            color={riskChipColor(risk.impact)}
                            variant={risk.impact === 'Low' ? 'outlined' : 'filled'}
                            sx={{ cursor: 'help' }}
                          />
                        </Tooltip>
                      )}
                      {a.enabled === false && (
                        <Chip size="small" label="Disabled" variant="outlined" />
                      )}
                      <Chip size="small" label={scopeChipLabel(a)} variant="outlined" />
                      {canEdit && (
                        <>
                          <Tooltip title="Change scope">
                            <IconButton size="small" onClick={() => openChangeScope(a)}>
                              <CippIcons.Tune fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={`Remove ${a.role}`}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                openRemoveRoles(
                                  'Remove Exchange application role',
                                  [a],
                                  `${a.role} from this app`
                                )
                              }
                            >
                              <CippIcons.Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </ListItem>
                )
              })}
            </List>
          </Card>
        )}
      </Stack>

      {loaded && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Application access policies</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Limit which mailboxes the mailbox permissions this app holds in Entra reach. They do
              not limit Exchange application roles. Microsoft is replacing them with application
              roles scoped to a management scope or administrative unit, so new ones are not
              created here.
            </Typography>
          </Box>
          {policies.length === 0 ? (
            <Alert severity="info">
              No application access policy applies to this app: its Entra mailbox permissions
              reach every mailbox.
            </Alert>
          ) : (
            <Card variant="outlined">
              <List dense disablePadding>
                {policies.map((p) => (
                  <ListItem key={p.id} divider sx={{ py: 1 }}>
                    <ListItemText
                      primary={p.scopeName || p.scopeIdentity}
                      secondary={
                        p.accessRight === 'RestrictAccess'
                          ? 'Only the members of this group are reachable'
                          : 'The members of this group are not reachable'
                      }
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
                      <Chip
                        size="small"
                        label={p.accessRight}
                        color={p.accessRight === 'RestrictAccess' ? 'success' : 'default'}
                        variant="outlined"
                      />
                      {p.appliesToEveryApp && (
                        <Chip size="small" label="Every app" variant="outlined" />
                      )}
                      {p.isValid === false && (
                        <Tooltip title="Exchange marks this policy invalid; its group may have been deleted.">
                          <Chip size="small" label="Invalid" color="warning" variant="outlined" />
                        </Tooltip>
                      )}
                      {canEdit && !p.appliesToEveryApp && (
                        <Tooltip title="Remove policy">
                          <IconButton size="small" color="error" onClick={() => openRemovePolicy(p)}>
                            <CippIcons.Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Card>
          )}
        </Stack>
      )}

      {dialogAction && (
        <CippApiDialog
          key={dialogAction.key}
          createDialog={actionDialog}
          title={dialogAction.title}
          defaultvalues={dialogAction.defaultvalues}
          relatedQueryKeys={[queryKey, ...exchangeAccessQueryKeys]}
          dialogAfterEffect={() => request.refetch()}
          api={{
            type: 'POST',
            url: '/api/ExecEnterpriseAppExchangeRbac',
            confirmText: dialogAction.confirmText,
            customDataformatter: (row, action, formData) => ({
              tenantFilter,
              ServicePrincipalId: servicePrincipalId,
              Action: dialogAction.action,
              ...dialogAction.buildData(formData),
            }),
          }}
        >
          {dialogAction.fields}
        </CippApiDialog>
      )}
    </Stack>
  )
}

export default CippEnterpriseAppExchangeRbac
