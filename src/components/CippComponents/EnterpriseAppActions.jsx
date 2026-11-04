import { useEffect, useState } from 'react'
import { Alert, Skeleton } from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall } from '../../api/ApiCall'
import { CippFormComponent } from './CippFormComponent.jsx'
import { CertificateCredentialRemovalForm } from './CertificateCredentialRemovalForm.jsx'
import { getAppOwnerAction } from './AppRegistrationActions.jsx'
import { getCippError } from '../../utils/get-cipp-error'

const headerLinkProps = { showInActionsMenu: true }

const DEFAULT_ACCESS_ROLE_ID = '00000000-0000-0000-0000-000000000000'

export const getAppRoleName = (appRoles, appRoleId) => {
  if (appRoleId === DEFAULT_ACCESS_ROLE_ID) return 'Default Access'
  const role = (appRoles ?? []).find((r) => r.id === appRoleId)
  return role?.displayName ?? role?.value ?? appRoleId
}

// Role choices and the current 'Assignment required' value come from the live service principal,
// so the dialog never submits a stale switch value from a cached list row.
const AppAssignmentFields = ({ formHook, row }) => {
  const tenantFilter = row?.Tenant
  const spRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `servicePrincipals/${row?.id}`,
      $select: 'id,appRoles,appRoleAssignmentRequired',
      tenantFilter,
    },
    queryKey: `AppAssignments-sp-${tenantFilter}-${row?.id}`,
    waiting: Boolean(row?.id),
  })
  const sp = spRequest.data?.Results?.[0]
  const userRoles = (sp?.appRoles ?? []).filter(
    (role) => role.isEnabled && role.allowedMemberTypes?.includes('User')
  )
  const roleOptions =
    userRoles.length > 0
      ? userRoles.map((role) => ({ label: role.displayName ?? role.value, value: role.id }))
      : [{ label: 'Default Access', value: DEFAULT_ACCESS_ROLE_ID }]

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Waits for `mounted` because CippApiDialog resets the form on open, after this child's first effects.
  useEffect(() => {
    if (!mounted || !sp) return
    formHook.setValue('AppRoleAssignmentRequired', Boolean(sp.appRoleAssignmentRequired))
    if (roleOptions.length === 1) formHook.setValue('AppRoleId', roleOptions[0])
  }, [mounted, sp?.id])

  return (
    <>
      <CippFormComponent
        name="AddUserIds"
        formControl={formHook}
        type="autoComplete"
        label="Assign users"
        multiple
        creatable={false}
        api={{
          url: '/api/ListGraphRequest',
          tenantFilter,
          dataKey: 'Results',
          labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
          valueField: 'id',
          queryKey: 'AppAssignmentCandidateUsers',
          data: {
            Endpoint: 'users',
            manualPagination: true,
            $select: 'id,userPrincipalName,displayName',
            $count: true,
            $orderby: 'displayName',
            $top: 999,
          },
        }}
      />
      <CippFormComponent
        name="AddGroupIds"
        formControl={formHook}
        type="autoComplete"
        label="Assign groups"
        helperText="Group assignment needs Entra ID P1 or P2. Only direct members get access; nested groups are not expanded."
        multiple
        creatable={false}
        api={{
          url: '/api/ListGraphRequest',
          tenantFilter,
          dataKey: 'Results',
          labelField: (group) =>
            `${group.displayName} (${
              group.groupTypes?.includes('Unified') ? 'Microsoft 365 group' : 'Security group'
            })`,
          valueField: 'id',
          queryKey: 'AppAssignmentCandidateGroups',
          data: {
            Endpoint: 'groups',
            manualPagination: true,
            $select: 'id,displayName,securityEnabled,groupTypes',
            $count: true,
            $orderby: 'displayName',
            $top: 999,
          },
          // Distribution lists can't be assigned to applications.
          dataFilter: (options) =>
            options.filter(
              (option) =>
                option.rawData?.securityEnabled ||
                option.rawData?.groupTypes?.includes('Unified')
            ),
        }}
      />
      {spRequest.isError && (
        <Alert severity="error">
          Could not load the application: {getCippError(spRequest.error)}
        </Alert>
      )}
      {!sp && !spRequest.isError && <Skeleton variant="rounded" height={56} />}
      {sp && (
        <>
          <CippFormComponent
            name="AppRoleId"
            formControl={formHook}
            type="autoComplete"
            label="Role for new assignments"
            multiple={false}
            creatable={false}
            options={roleOptions}
            validators={{
              validate: (value, values) =>
                (!values?.AddUserIds?.length && !values?.AddGroupIds?.length) ||
                Boolean(value) ||
                'Select a role for the new assignments',
              deps: ['AddUserIds', 'AddGroupIds'],
            }}
          />
          <CippFormComponent
            name="RemoveAssignmentIds"
            formControl={formHook}
            type="autoComplete"
            label="Remove assignments"
            multiple
            creatable={false}
            api={{
              url: '/api/ListGraphRequest',
              tenantFilter,
              dataKey: 'Results',
              labelField: (assignment) =>
                `${assignment.principalDisplayName} (${assignment.principalType}, ${getAppRoleName(
                  sp.appRoles,
                  assignment.appRoleId
                )})`,
              valueField: 'id',
              queryKey: `AppAssignments-${row?.id}`,
              data: { Endpoint: `servicePrincipals/${row?.id}/appRoleAssignedTo`, $top: 999 },
              // Service principals here hold application permissions on this app, not user access.
              dataFilter: (options) =>
                options.filter((option) => option.rawData?.principalType !== 'ServicePrincipal'),
            }}
          />
          <CippFormComponent
            name="AppRoleAssignmentRequired"
            formControl={formHook}
            type="switch"
            label="Assignment required (only assigned users and groups can sign in)"
          />
        </>
      )}
    </>
  )
}

// Signing certs come from ExecApplication Action=ListSigningCertificates (the detail page
// merges them into the row) because the SHA-1 thumbprint has to be derived from the key bytes.
export const getSigningCertificates = (row) => row?.signingCertificates ?? []

const isSamlApp = (row) =>
  row?.preferredSingleSignOnMode === 'saml' || getSigningCertificates(row).length > 0

const viewInEntraAction = {
  icon: <CippIcons.Launch />,
  label: 'View Application',
  link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/[id]/appId/[appId]`,
  pinned: true,
  color: 'info',
  target: '_blank',
  multiPost: false,
  external: true,
}

export const getEnterpriseAppPostActions = (canWriteApplication, onChanged) => [
  {
    icon: <CippIcons.ContentCopy />,
    label: 'Create Template from App',
    type: 'POST',
    color: 'info',
    multiPost: false,
    url: '/api/ExecCreateAppTemplate',
    data: {
      AppId: 'appId',
      DisplayName: 'displayName',
      Type: 'servicePrincipal',
    },
    fields: [
      {
        type: 'switch',
        name: 'Overwrite',
        label: 'Overwrite Existing Template',
      },
    ],
    confirmText:
      "'[displayName]' is a multi-tenant app, so a multi-tenant Enterprise App template will be created. This copies all permissions into a reusable template.",
    condition: (row) =>
      canWriteApplication && row?.signInAudience === 'AzureADMultipleOrgs',
  },
  {
    icon: <CippIcons.Key />,
    label: 'Remove Password Credentials',
    type: 'POST',
    color: 'warning',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'RemovePassword',
    },
    children: ({ formHook, row }) => {
      return (
        <CippFormComponent
          name="KeyIds"
          formControl={formHook}
          type="autoComplete"
          label="Select Password Credentials to Remove"
          multiple
          creatable={false}
          validators={{
            required: 'Please select at least one password credential',
          }}
          options={
            row?.passwordCredentials?.map((cred) => ({
              label: `${cred.displayName || 'Unnamed'} (Expiration: ${new Date(
                cred.endDateTime
              ).toLocaleDateString()})`,
              value: cred.keyId,
            })) || []
          }
        />
      )
    },
    confirmText:
      'Are you sure you want to remove the selected password credentials?',
    condition: (row) =>
      canWriteApplication && row?.passwordCredentials?.length > 0,
  },
  {
    icon: <CippIcons.Security />,
    label: 'Remove Certificate Credentials',
    type: 'POST',
    color: 'warning',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'RemoveKey',
    },
    children: ({ formHook, row }) => {
      return <CertificateCredentialRemovalForm formHook={formHook} row={row} />
    },
    confirmText:
      'Are you sure you want to remove the selected certificate credentials?',
    condition: (row) => canWriteApplication && row?.keyCredentials?.length > 0,
  },
  {
    icon: <CippIcons.Block />,
    label: 'Disable Service Principal',
    type: 'POST',
    color: 'warning',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'Update',
      Payload: {
        accountEnabled: false,
      },
    },
    confirmText:
      'Are you sure you want to disable this service principal? Users will not be able to sign in to this application.',
    condition: (row) => canWriteApplication && row?.accountEnabled === true,
  },
  {
    icon: <CippIcons.CheckCircle />,
    label: 'Enable Service Principal',
    type: 'POST',
    color: 'success',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'Update',
      Payload: {
        accountEnabled: true,
      },
    },
    confirmText: 'Are you sure you want to enable this service principal?',
    condition: (row) => canWriteApplication && row?.accountEnabled === false,
  },
  {
    icon: <CippIcons.VisibilityOff />,
    label: 'Hide from MyApps portal',
    type: 'POST',
    color: 'warning',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'Hide',
    },
    confirmText:
      "Hide '[displayName]' from the MyApps portal? Users will no longer see it at myapps.microsoft.com.",
    condition: (row) =>
      canWriteApplication && !(row?.tags ?? []).includes('HideApp'),
  },
  {
    icon: <CippIcons.EyeIcon />,
    label: 'Show in MyApps portal',
    type: 'POST',
    color: 'success',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'Show',
    },
    confirmText: "Make '[displayName]' visible to users in the MyApps portal?",
    condition: (row) =>
      canWriteApplication && (row?.tags ?? []).includes('HideApp'),
  },
  getAppOwnerAction(canWriteApplication, 'servicePrincipals', onChanged),
  {
    icon: <CippIcons.Group />,
    label: 'Manage Assignments',
    type: 'POST',
    color: 'info',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: '!servicePrincipals',
      Action: '!UpdateAssignments',
    },
    children: ({ formHook, row }) => <AppAssignmentFields formHook={formHook} row={row} />,
    relatedQueryKeys: ['AppAssignments-*', 'EnterpriseApp-spId-*'],
    onSuccess: onChanged,
    confirmText: "Assign users and groups to '[displayName]', or remove their access.",
    condition: () => canWriteApplication,
  },
  {
    icon: <CippIcons.Delete />,
    label: 'Delete Service Principal',
    type: 'POST',
    color: 'error',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'Delete',
    },
    confirmText:
      'Are you sure you want to delete this service principal? This will remove the application from this tenant but will not affect the app registration.',
    condition: () => canWriteApplication,
  },
]

// SAML signing-certificate actions need preferredSingleSignOnMode and the per-app
// ListSigningCertificates result, which only the detail page fetches, so they are
// detail-only: on the list they could never enable.
export const getEnterpriseAppSigningActions = (canWriteApplication) => [
  {
    icon: <CippIcons.Autorenew />,
    label: 'Add Token Signing Certificate',
    type: 'POST',
    color: 'info',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'AddSigningCertificate',
    },
    fields: [
      {
        type: 'textField',
        name: 'DisplayName',
        label: 'Certificate subject (optional; CN= is added if missing)',
        placeholder: 'Microsoft Azure Federated SSO Certificate',
      },
      {
        type: 'datePicker',
        name: 'EndDateTime',
        label: 'Expiry (optional, up to 3 years; default 3 years)',
        dateFormat: 'yyyy-MM-dd',
      },
    ],
    confirmText:
      "Add a new SAML token signing certificate to '[displayName]'? Entra generates the key pair. The current certificate keeps signing until you set the new one as preferred.",
    condition: (row) => canWriteApplication && isSamlApp(row),
  },
  {
    icon: <CippIcons.ShieldCheckIcon />,
    label: 'Set Preferred Signing Certificate',
    type: 'POST',
    color: 'warning',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'SetPreferredSigningKey',
    },
    children: ({ formHook, row }) => (
      <CippFormComponent
        name="Thumbprint"
        formControl={formHook}
        type="autoComplete"
        label="Signing certificate to activate"
        multiple={false}
        creatable={false}
        validators={{ required: 'Select a signing certificate' }}
        options={getSigningCertificates(row).map((cert) => ({
          label: `${cert.displayName || 'Unnamed'} ${cert.thumbprint} (expires ${new Date(
            cert.endDateTime
          ).toLocaleDateString()})${cert.preferred ? ' - current' : ''}`,
          value: cert.thumbprint,
        }))}
      />
    ),
    confirmText:
      "Switch '[displayName]' to sign tokens with the selected certificate? Relying parties that trust the current certificate will reject sign-ins until they trust the new one.",
    condition: (row) =>
      canWriteApplication && getSigningCertificates(row).length > 1,
  },
  {
    icon: <CippIcons.Delete />,
    label: 'Remove Signing Certificate',
    type: 'POST',
    color: 'error',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'servicePrincipals',
      Action: 'RemoveSigningCertificate',
    },
    children: ({ formHook, row }) => (
      <CippFormComponent
        name="Thumbprint"
        formControl={formHook}
        type="autoComplete"
        label="Signing certificate to remove (the preferred one cannot be removed)"
        multiple={false}
        creatable={false}
        validators={{ required: 'Select a signing certificate' }}
        options={getSigningCertificates(row)
          .filter((cert) => !cert.preferred)
          .map((cert) => ({
            label: `${cert.displayName || 'Unnamed'} ${cert.thumbprint} (expires ${new Date(
              cert.endDateTime
            ).toLocaleDateString()})`,
            value: cert.thumbprint,
          }))}
      />
    ),
    confirmText:
      "Remove the selected signing certificate from '[displayName]'? Any relying party still trusting it will reject sign-ins.",
    condition: (row) =>
      canWriteApplication && getSigningCertificates(row).some((cert) => !cert.preferred),
  },
]

export const getEnterpriseAppListActions = (canWriteApplication, isHomeTenantApp) => [
  {
    icon: <CippIcons.EyeIcon />,
    label: 'View in CIPP',
    link: '/tenant/administration/applications/enterprise-app?spId=[id]&tenantFilter=[Tenant]',
    pinned: true,
    color: 'info',
    multiPost: false,
    external: false,
  },
  { ...viewInEntraAction, condition: isHomeTenantApp },
  ...getEnterpriseAppPostActions(canWriteApplication),
]

export const getEnterpriseAppDetailHeaderActions = (canWriteApplication, onChanged) => [
  { ...viewInEntraAction, ...headerLinkProps },
  ...getEnterpriseAppPostActions(canWriteApplication, onChanged),
  ...getEnterpriseAppSigningActions(canWriteApplication),
]
