import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippApiResults } from './CippApiResults'

const impactColor = (impact) =>
  impact === 'Critical'
    ? 'error'
    : impact === 'High'
      ? 'warning'
      : impact === 'Medium'
        ? 'info'
        : 'default'

const IMPACT_ORDER = ['Critical', 'High', 'Medium', 'Low']

/**
 * Selectable BEC containment. Every action in the catalog is a switch grouped by impact; the
 * actions that take targets get a picker fed from the run's findings (flagged items preselected).
 * A Critical action needs the user's UPN typed before the run button enables.
 */
export const CippBecContainmentDrawer = ({
  userPrincipalName,
  userId,
  tenantFilter,
  caseId,
  becData,
  buttonText = 'Contain user',
  disabled = false,
  relatedQueryKeys = [],
}) => {
  const [visible, setVisible] = useState(false)
  const catalogCall = ApiGetCall({
    url: '/api/ListBECRemediationActions',
    queryKey: 'ListBECRemediationActions',
  })
  const catalog = useMemo(
    () => (Array.isArray(catalogCall.data) ? catalogCall.data : []),
    [catalogCall.data]
  )

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { actions: {}, Confirmation: '' },
  })
  const watched = useWatch({ control: formControl.control })

  // Every target picker's choices, from the run's findings. The reset below preselects the flagged ones.
  const options = useMemo(
    () => ({
      MfaMethodIds: (becData?.MFADevices || []).map((m) => ({
        label:
          `${(m['@odata.type'] || '').replace('#microsoft.graph.', '').replace('AuthenticationMethod', '')} ${m.displayName || ''}`.trim(),
        value: m.id,
      })),
      GrantIds: (becData?.UserGrants || []).map((g) => ({
        label: `${g.ClientDisplayName || g.ClientAppId} (${g.Type}${g.Flagged ? ', flagged' : ''})`,
        value: `${g.Type}|${g.Id}`,
      })),
      ServicePrincipalIds: Array.from(
        new Map(
          (becData?.UserGrants || [])
            .filter(
              (g) => g.Risk === 'CatalogMatch' && g.ClientServicePrincipalId
            )
            .map((g) => [
              g.ClientServicePrincipalId,
              {
                label: g.ClientDisplayName || g.ClientServicePrincipalId,
                value: g.ClientServicePrincipalId,
              },
            ])
        ).values()
      ),
      RuleIds: (becData?.NewRules || []).map((r) => ({
        label: r.Name,
        value: r.Identity || r.Name,
      })),
      Delegations: (becData?.Delegations || []).map((d, index) => ({
        label: `${d.PermissionType}: ${d.Trustee} (${d.Resource})${d.Flagged ? ' - flagged' : ''}`,
        value: String(index),
      })),
      TransportRuleIds: (becData?.TransportRulesFlagged || []).map((r) => ({
        label: `${r.Name}${r.ChangedInWindow ? ' - changed in window' : ''}`,
        value: r.Guid || r.Identity || r.Name,
      })),
      AddInIds: (becData?.MailboxAddIns || []).map((a) => ({
        label: `${a.DisplayName} (${a.ProviderName || 'unknown provider'})`,
        value: a.Identity || a.AppId,
      })),
      Protocols: [
        'EWS',
        'IMAP',
        'POP',
        'ActiveSync',
        'OWA',
        'MAPI',
        'ECP',
        'SmtpAuth',
      ].map((p) => ({ label: p, value: p })),
      MobileDeviceIds: (becData?.SuspectUserDevices || []).map((d) => ({
        label: `${d.DeviceModel || d.DeviceType || 'device'} (${d.DeviceID})`,
        value: d.DeviceID,
      })),
      RegisteredDeviceIds: (becData?.RegisteredDevices || []).map((d) => ({
        label: `${d.displayName || d.deviceId} (${d.operatingSystem || 'unknown OS'}${d.RegisteredInWindow ? ', registered in window' : ''})`,
        value: d.id,
      })),
      BlockSenders: Array.from(
        new Set(
          (becData?.ReceivedMailFindings || [])
            .map((f) => f.SenderAddress)
            .filter(Boolean)
        )
      ).map((s) => ({ label: s, value: s })),
      SharingLinkUrls: Array.from(
        new Map(
          (becData?.SharingChanges || [])
            .filter((c) => c.ItemUrl)
            .map((c) => [
              c.ItemUrl,
              { label: c.FileName || c.ItemUrl, value: c.ItemUrl },
            ])
        ).values()
      ),
    }),
    [becData]
  )

  // Default selection: the catalog's default set, plus the targeted actions that have flagged findings.
  // Re-applied on every open so the drawer always starts from the run's findings.
  useEffect(() => {
    if (!catalog.length) return
    const actions = {}
    catalog.forEach((action) => {
      actions[action.Id] = !!action.DefaultSelected
    })
    formControl.reset({
      actions,
      Confirmation: '',
      MfaMethodIds: [],
      GrantIds: (becData?.UserGrants || [])
        .filter((g) => g.Flagged)
        .map((g) => ({
          label: `${g.ClientDisplayName || g.ClientAppId} (${g.Type})`,
          value: `${g.Type}|${g.Id}`,
        })),
      ServicePrincipalIds: [],
      RuleIds: [],
      Delegations: (becData?.Delegations || [])
        .map((d, index) => ({ ...d, index }))
        .filter((d) => d.Flagged)
        .map((d) => ({
          label: `${d.PermissionType}: ${d.Trustee} (${d.Resource})`,
          value: String(d.index),
        })),
      TransportRuleIds: (becData?.TransportRulesFlagged || [])
        .filter((r) => r.ChangedInWindow)
        .map((r) => ({ label: r.Name, value: r.Guid || r.Identity || r.Name })),
      AddInIds: (becData?.MailboxAddIns || [])
        .filter((a) => a.Flagged)
        .map((a) => ({ label: a.DisplayName, value: a.Identity || a.AppId })),
      Protocols: ['EWS', 'IMAP', 'POP', 'ActiveSync', 'SmtpAuth'].map((p) => ({
        label: p,
        value: p,
      })),
      MobileDeviceIds: [],
      RegisteredDeviceIds: (becData?.RegisteredDevices || [])
        .filter((d) => d.RegisteredInWindow)
        .map((d) => ({
          label: `${d.displayName || d.deviceId} (${d.operatingSystem || 'unknown OS'})`,
          value: d.id,
        })),
      BlockSenders: options.BlockSenders,
      SharingLinkUrls: options.SharingLinkUrls,
      CAState: { label: 'Enabled', value: 'enabled' },
      CAControls: { label: 'Require MFA', value: 'mfa' },
      CAExpiresHours: 24,
    })
  }, [catalog, becData, options, visible, formControl])

  const selectedIds = useMemo(
    () => catalog.filter((a) => watched?.actions?.[a.Id]).map((a) => a.Id),
    [catalog, watched?.actions]
  )
  const criticalSelected = useMemo(
    () =>
      catalog.filter(
        (a) => selectedIds.includes(a.Id) && a.Impact === 'Critical'
      ),
    [catalog, selectedIds]
  )
  const confirmationOk =
    criticalSelected.length === 0 ||
    (watched?.Confirmation || '').trim().toLowerCase() ===
      (userPrincipalName || '').trim().toLowerCase()

  const runCall = ApiPostCall({
    relatedQueryKeys: [`execBECCheck-polling-${caseId}`, ...relatedQueryKeys],
  })

  // The run is a background task reporting per-action progress like offboarding does; once it finishes, refresh
  // the case so the remediation history picks up the result. Memoized so CippApiResults does not
  // re-arm the poll on every render.
  const queryClient = useQueryClient()
  const relatedKeysJoined = relatedQueryKeys.join('|')
  const jobProgress = useMemo(
    () => ({
      idField: 'DeploymentId',
      title: 'Remediation progress',
      url: (id) => `/api/ListOffboardingProgress?DeploymentId=${id}`,
      onComplete: () =>
        [`execBECCheck-polling-${caseId}`, ...relatedKeysJoined.split('|')]
          .filter(Boolean)
          .forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    }),
    [caseId, relatedKeysJoined, queryClient]
  )

  const values = (field) =>
    (watched?.[field] || []).map((o) =>
      o && o.value !== undefined ? o.value : o
    )

  const buildPayload = () => {
    const grantValues = values('GrantIds')
    const delegationIndexes = values('Delegations')
    return {
      tenantFilter,
      userid: userId,
      username: userPrincipalName,
      CaseId: caseId,
      Confirmation: watched?.Confirmation || '',
      // always a background run: progress streams into the drawer like offboarding
      Async: true,
      Actions: selectedIds,
      Parameters: {
        MfaMethodIds: values('MfaMethodIds'),
        GrantIds: grantValues
          .filter((v) => String(v).startsWith('DelegatedGrant|'))
          .map((v) => String(v).split('|')[1]),
        AppRoleAssignmentIds: grantValues
          .filter((v) => String(v).startsWith('AppRoleAssignment|'))
          .map((v) => String(v).split('|')[1]),
        ServicePrincipalIds: values('ServicePrincipalIds'),
        RuleIds: values('RuleIds'),
        Delegations: delegationIndexes
          .map((i) => (becData?.Delegations || [])[Number(i)])
          .filter(Boolean),
        TransportRuleIds: values('TransportRuleIds'),
        AddInIds: values('AddInIds'),
        Protocols: values('Protocols'),
        MobileDeviceIds: values('MobileDeviceIds'),
        RegisteredDeviceIds: values('RegisteredDeviceIds'),
        BlockSenders: values('BlockSenders'),
        SharingLinkUrls: values('SharingLinkUrls'),
        CAPolicy: {
          State: watched?.CAState?.value || 'enabled',
          Controls: watched?.CAControls?.value || 'mfa',
          ExpiresHours: Number(watched?.CAExpiresHours) || 24,
        },
      },
    }
  }

  const handleRun = () => {
    runCall.mutate({ url: '/api/ExecBECRemediate', data: buildPayload() })
  }

  // The catalog names the parameter each targeted action reads its targets from.
  const pickerFor = (action) => {
    const name = action.ParameterName
    if (name === 'CAPolicy') {
      return (
        <Grid container spacing={1} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="select"
              name="CAState"
              label="State"
              formControl={formControl}
              options={[
                { label: 'Enabled', value: 'enabled' },
                { label: 'Report-only', value: 'reportOnly' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="select"
              name="CAControls"
              label="Grant controls"
              formControl={formControl}
              options={[
                { label: 'Require MFA', value: 'mfa' },
                {
                  label: 'Require MFA and a compliant device',
                  value: 'mfaAndCompliantDevice',
                },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="number"
              name="CAExpiresHours"
              label="Expires after (hours, 1-168)"
              formControl={formControl}
            />
          </Grid>
        </Grid>
      )
    }
    if (!name) return null
    const available = options[name] || []
    if (available.length === 0 && name !== 'Protocols') {
      return (
        <Typography variant="caption" color="text.secondary">
          Nothing of this kind was found in the run; nothing will be changed.
        </Typography>
      )
    }
    return (
      <Box sx={{ mt: 0.5 }}>
        <CippFormComponent
          type="autoComplete"
          name={name}
          label="Targets (empty = the defaults described above)"
          formControl={formControl}
          multiple={true}
          creatable={false}
          options={available}
        />
      </Box>
    )
  }

  return (
    <>
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={() => setVisible(true)}
        disabled={disabled}
        startIcon={<CippIcons.ShieldCheckIcon width={20} />}
      >
        {buttonText}
      </Button>
      <CippOffCanvas
        title={`Contain ${userPrincipalName}`}
        visible={visible}
        onClose={() => setVisible(false)}
        size="xl"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={runCall} jobProgress={jobProgress} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                color="error"
                startIcon={<CippIcons.PlayArrow />}
                onClick={handleRun}
                disabled={
                  selectedIds.length === 0 ||
                  !confirmationOk ||
                  runCall.isPending
                }
              >
                Run containment
              </Button>
            </Stack>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Alert severity="info">
            Pick the actions and their targets, then run. Targets default to the
            flagged findings of the{' '}
            {caseId ? `run (case ${caseId})` : 'live tenant'}. Actions marked
            Critical need the user&apos;s UPN typed below before they run.
          </Alert>
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
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1">{impact}</Typography>
                  <Chip
                    size="small"
                    color={impactColor(impact)}
                    label={`${group.length}`}
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
                      {watched?.actions?.[action.Id] && (
                        <Box sx={{ ml: 6 }}>{pickerFor(action)}</Box>
                      )}
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
              </Box>
            )
          })}
          {criticalSelected.length > 0 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 1 }}>
                Critical actions selected:{' '}
                {criticalSelected.map((a) => a.Label).join(', ')}. Type{' '}
                <strong>{userPrincipalName}</strong> to confirm.
              </Alert>
              <CippFormComponent
                type="textField"
                name="Confirmation"
                label="Type the user's UPN to confirm"
                formControl={formControl}
                validators={{
                  validate: (value) =>
                    (value || '').trim().toLowerCase() ===
                      (userPrincipalName || '').trim().toLowerCase() ||
                    `Must match ${userPrincipalName}`,
                }}
              />
            </Box>
          )}
        </Stack>
      </CippOffCanvas>
    </>
  )
}

export default CippBecContainmentDrawer
