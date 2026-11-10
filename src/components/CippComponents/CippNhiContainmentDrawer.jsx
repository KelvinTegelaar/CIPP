import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippApiResults } from './CippApiResults'

const IMPACT_ORDER = ['Critical', 'High', 'Medium', 'Low']
const impactColor = (impact) =>
  ({ Critical: 'error', High: 'warning', Medium: 'info' })[impact] || 'default'

/**
 * Selectable containment for the app of an NHI case. Each action in the catalog is a switch grouped by
 * impact; the actions that take targets get a picker fed from the case (flagged items preselected). A
 * Critical action needs the app's display name or application id typed before the run button enables.
 */
export const CippNhiContainmentDrawer = ({
  caseData,
  tenantFilter,
  relatedQueryKeys = [],
}) => {
  const [visible, setVisible] = useState(false)
  const catalogCall = ApiGetCall({
    url: '/api/ListNHIContainmentActions',
    queryKey: 'ListNHIContainmentActions',
  })
  const catalog = useMemo(
    () => (Array.isArray(catalogCall.data) ? catalogCall.data : []),
    [catalogCall.data]
  )
  const appName = caseData?.DisplayName || ''
  const appId = caseData?.AppId || ''
  const flagged = useMemo(
    () => new Set(caseData?.FlaggedKeyIds || []),
    [caseData]
  )

  const credentials = caseData?.Exposure?.CredentialDetails || []
  const options = useMemo(
    () => ({
      CredentialKeyIds: credentials
        .filter(
          (c) => c.Type !== 'Federated' && c.Purpose === 'Sign-in' && !c.Expired
        )
        .map((c) => ({
          label: `${c.Type} ${c.DisplayName || c.KeyId} on the ${(c.Location || '').toLowerCase()}${flagged.has(c.KeyId) ? ' - flagged' : ''}`,
          value: c.KeyId,
        })),
      FederatedCredentialIds: credentials
        .filter((c) => c.Type === 'Federated')
        .map((c) => ({
          label: `${c.DisplayName} (${c.Issuer})${(c.Flags || []).includes('UntrustedIssuer') ? ' - untrusted issuer' : ''}`,
          value: c.KeyId,
        })),
      OwnerIds: (caseData?.Owners || []).map((o) => ({
        label: `${o.UserPrincipalName || o.DisplayName} (${o.OwnerOf})`,
        value: o.Id,
      })),
      AppRoleAssignmentIds: (caseData?.AppRoleAssignments || []).map((a) => ({
        label: `${a.ResourceDisplayName} ${a.Permission}${a.InWindow ? ' - granted in the window' : ''}`,
        value: a.Id,
      })),
      GrantIds: (caseData?.DelegatedGrants || []).map((g) => ({
        label: `${g.ConsentType === 'AllPrincipals' ? 'Admin consent' : 'User consent'}: ${g.Scope}`,
        value: g.Id,
      })),
      PersistenceServicePrincipalIds: Array.from(
        new Map(
          (caseData?.DirectoryActions || [])
            .filter(
              (a) =>
                a.Kind === 'AppPersistence' &&
                a.TargetServicePrincipalId &&
                !a.TargetProtected &&
                a.TargetServicePrincipalId !== caseData?.ServicePrincipalId
            )
            .map((a) => [
              a.TargetServicePrincipalId,
              {
                label: `${a.TargetDisplayName} (${a.CreatedApp ? 'created by this app' : 'credential or owner added'}${a.InWindow ? ', in the window' : ''})`,
                value: a.TargetServicePrincipalId,
              },
            ])
        ).values()
      ),
      ElevationIds: (caseData?.DirectoryActions || [])
        .filter((a) => a.Kind === 'Elevation' && a.ElevationId && a.RecipientId)
        .map((a) => ({
          label: `${a.Permission} for ${a.RecipientName || a.RecipientId} (${a.Recipient === 'Self' ? 'itself' : a.Recipient === 'User' ? 'a user' : 'another app'}, ${a.Impact} impact${a.InWindow ? ', in the window' : ''})`,
          value: a.ElevationId,
          impact: a.Impact,
          inWindow: a.InWindow,
        })),
      RoleAssignmentIds: (caseData?.DirectoryRoles || []).map((r) => ({
        label: `${r.RoleName}${r.DirectoryScopeId && r.DirectoryScopeId !== '/' ? ` (${r.DirectoryScopeId})` : ''}`,
        value: r.Id,
      })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caseData, flagged]
  )

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { actions: {}, Confirmation: '' },
  })
  const watched = useWatch({ control: formControl.control })

  // Re-applied on every open: the catalog's defaults, and the case's flagged targets preselected.
  useEffect(() => {
    if (!catalog.length) return
    const actions = {}
    catalog.forEach((action) => {
      actions[action.Id] = !!action.DefaultSelected
    })
    if (caseData?.Subject?.IsManagedIdentity)
      actions.DisableServicePrincipal = false
    formControl.reset({
      actions,
      Confirmation: '',
      CredentialKeyIds: options.CredentialKeyIds.filter((o) =>
        flagged.has(o.value)
      ),
      FederatedCredentialIds: options.FederatedCredentialIds.filter((o) =>
        o.label.endsWith('untrusted issuer')
      ),
      OwnerIds: [],
      AppRoleAssignmentIds: options.AppRoleAssignmentIds.filter((o) =>
        o.label.endsWith('granted in the window')
      ),
      GrantIds: [],
      RoleAssignmentIds: [],
      ElevationIds: options.ElevationIds.filter(
        (o) => o.inWindow && ['High', 'Critical'].includes(o.impact)
      ),
      PersistenceServicePrincipalIds:
        options.PersistenceServicePrincipalIds.filter((o) =>
          o.label.endsWith('in the window)')
        ),
    })
  }, [catalog, caseData, options, flagged, visible, formControl])

  const selected = catalog.filter((a) => watched?.actions?.[a.Id])
  const critical = selected.filter((a) => a.Impact === 'Critical')
  const typed = (watched?.Confirmation || '').trim()
  const confirmationOk =
    critical.length === 0 || typed === appName || (appId && typed === appId)

  const runCall = ApiPostCall({
    relatedQueryKeys: [`ExecNHICheck-${caseData?.CaseId}`, ...relatedQueryKeys],
  })
  const values = (field) =>
    (watched?.[field] || []).map((o) => (o?.value !== undefined ? o.value : o))
  const handleRun = () =>
    runCall.mutate({
      url: '/api/ExecNHIContainment',
      data: {
        tenantFilter,
        caseId: caseData?.CaseId,
        Confirmation: typed,
        Actions: selected.map((a) => a.Id),
        Parameters: Object.fromEntries(
          Object.keys(options).map((name) => [name, values(name)])
        ),
      },
    })

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={() => setVisible(true)}
        startIcon={<CippIcons.ShieldCheckIcon width={20} />}
      >
        Contain app
      </Button>
      <CippOffCanvas
        title={`Contain ${appName}`}
        visible={visible}
        onClose={() => setVisible(false)}
        size="xl"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={runCall} />
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button
                variant="contained"
                color="error"
                startIcon={<CippIcons.PlayArrow />}
                onClick={handleRun}
                disabled={
                  selected.length === 0 || !confirmationOk || runCall.isPending
                }
              >
                {runCall.isPending ? 'Running...' : 'Run containment'}
              </Button>
            </Stack>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Alert severity="info">
            Targets default to what the case flagged. Nothing the app may depend
            on is removed unless you pick it. Disabling stops new tokens; tokens
            already issued stay valid for about an hour, so remove the
            credentials too.
          </Alert>
          {caseData?.Subject?.IsManagedIdentity && (
            <Alert severity="warning">
              This is a managed identity: Azure manages its credentials and it
              is disabled on its Azure resource
              {caseData?.Subject?.AzureResourceId
                ? ` (${caseData.Subject.AzureResourceId})`
                : ''}
              , not here. Its permissions and roles can still be removed.
            </Alert>
          )}
          {catalogCall.isLoading && (
            <Typography variant="body2">Loading actions...</Typography>
          )}
          {IMPACT_ORDER.map((impact) => {
            const group = catalog.filter((a) => a.Impact === impact)
            if (group.length === 0) return null
            return (
              <Box key={impact}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', mb: 1 }}
                >
                  <Typography variant="subtitle1">{impact}</Typography>
                  <Chip
                    size="small"
                    color={impactColor(impact)}
                    label={group.length}
                  />
                </Stack>
                <Stack spacing={1.5}>
                  {group.map((action) => (
                    <Box key={action.Id}>
                      <CippFormComponent
                        type="switch"
                        name={`actions.${action.Id}`}
                        label={`${action.Label}${action.Reversible ? '' : ' (not reversible)'}`}
                        formControl={formControl}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', ml: 6 }}
                      >
                        {action.Description}
                      </Typography>
                      {watched?.actions?.[action.Id] &&
                        action.ParameterName && (
                          <Box sx={{ ml: 6, mt: 0.5 }}>
                            {(options[action.ParameterName] || []).length ===
                            0 ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                The case found nothing of this kind; nothing
                                will be changed.
                              </Typography>
                            ) : (
                              <CippFormComponent
                                type="autoComplete"
                                name={action.ParameterName}
                                label="Targets"
                                formControl={formControl}
                                multiple={true}
                                creatable={false}
                                options={options[action.ParameterName]}
                              />
                            )}
                          </Box>
                        )}
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
              </Box>
            )
          })}
          {critical.length > 0 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 1 }}>
                Critical actions selected:{' '}
                {critical.map((a) => a.Label).join(', ')}. Type{' '}
                <strong>{appName}</strong> (or its application id) to confirm.
              </Alert>
              <CippFormComponent
                type="textField"
                name="Confirmation"
                label="Type the app's display name to confirm"
                formControl={formControl}
              />
            </Box>
          )}
        </Stack>
      </CippOffCanvas>
    </>
  )
}

export default CippNhiContainmentDrawer
