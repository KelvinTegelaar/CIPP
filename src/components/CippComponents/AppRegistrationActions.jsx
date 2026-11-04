
import { CippIcons } from '../../utils/icon-registry'
import isEqual from 'lodash/isEqual'
import { CippFormComponent } from './CippFormComponent.jsx'
import { CertificateCredentialRemovalForm } from './CertificateCredentialRemovalForm.jsx'

const headerLinkProps = { showInActionsMenu: true }

const entraLinkActions = (forHeaderMenu) => {
  const extra = forHeaderMenu ? headerLinkProps : {}
  return [
    {
      icon: <CippIcons.Launch />,
      label: 'View App Registration',
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/[appId]/isMSAApp/`,
      pinned: true,
      color: 'info',
      target: '_blank',
      multiPost: false,
      external: true,
      ...extra,
    },
    {
      icon: <CippIcons.Launch />,
      label: 'View API Permissions',
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/[appId]/isMSAApp/`,
      pinned: true,
      color: 'info',
      target: '_blank',
      multiPost: false,
      external: true,
      ...extra,
    },
  ]
}

const editInEntraAction = {
  icon: <CippIcons.Edit />,
  label: 'Edit App Registration',
  link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/AppRegSettings/appId/[appId]/isMSAApp/`,
  pinned: true,
  color: 'success',
  target: '_blank',
  multiPost: false,
  external: true,
  ...headerLinkProps,
}

// Shared client-secret fields (actions menu + inline card). "Custom date" reveals a date picker
// sent as a Unix ExpiryDate; otherwise the ExpiryMonths preset is used.
export const ADD_CLIENT_SECRET_FIELDS = [
  {
    type: 'textField',
    name: 'DisplayName',
    label: 'Description',
    placeholder: 'Secret description',
  },
  {
    type: 'autoComplete',
    name: 'ExpiryMonths',
    label: 'Expires In',
    multiple: false,
    creatable: false,
    defaultValue: { label: '12 months', value: 12 },
    options: [
      { label: '3 months', value: 3 },
      { label: '6 months', value: 6 },
      { label: '12 months', value: 12 },
      { label: '24 months', value: 24 },
      { label: 'Custom date', value: 'custom' },
    ],
  },
  {
    type: 'datePicker',
    name: 'ExpiryDate',
    label: 'Custom expiry date',
    dateTimeType: 'date',
    condition: { field: 'ExpiryMonths', compareType: 'valueEq', compareValue: 'custom' },
  },
]

export const getAppOwnerAction = (canWriteApplication, type, onOwnersChanged) => ({
  icon: <CippIcons.ManageAccounts />,
  label: 'Manage Owners',
  type: 'POST',
  color: 'info',
  multiPost: false,
  url: '/api/ExecApplication',
  data: {
    Id: 'id',
    Type: `!${type}`,
    Action: '!UpdateOwners',
    DisplayName: 'displayName',
  },
  children: ({ formHook, row }) => (
    <>
      <CippFormComponent
        name="AddOwnerIds"
        formControl={formHook}
        type="autoComplete"
        label="Add owners"
        multiple
        creatable={false}
        validators={{
          validate: (value, formValues) =>
            value?.length > 0 ||
            formValues?.RemoveOwnerIds?.length > 0 ||
            'Select at least one owner to add or remove',
          deps: ['RemoveOwnerIds'],
        }}
        api={{
          url: '/api/ListGraphRequest',
          tenantFilter: row?.Tenant,
          dataKey: 'Results',
          labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
          valueField: 'id',
          queryKey: 'AppOwnerCandidateUsers',
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
        name="RemoveOwnerIds"
        formControl={formHook}
        type="autoComplete"
        label="Remove owners"
        multiple
        creatable={false}
        api={{
          url: '/api/ListGraphRequest',
          tenantFilter: row?.Tenant,
          dataKey: 'Results',
          labelField: (owner) =>
            `${owner.displayName} (${owner.userPrincipalName ?? owner.appId ?? owner.id})`,
          valueField: 'id',
          queryKey: `AppOwners-${type}-${row?.id}`,
          data: { Endpoint: `${type}/${row?.id}/owners` },
        }}
      />
    </>
  ),
  relatedQueryKeys: ['AppOwners-*'],
  onSuccess: onOwnersChanged,
  confirmText: "Add or remove owners of '[displayName]'.",
  condition: () => canWriteApplication,
})

export const getAppRegistrationPostAndDestructiveActions = (canWriteApplication, onOwnersChanged) => [
  {
    icon: <CippIcons.ContentCopy />,
    label: 'Create Enterprise App Template (Multi-Tenant)',
    type: 'POST',
    color: 'info',
    multiPost: false,
    url: '/api/ExecCreateAppTemplate',
    data: {
      AppId: 'appId',
      DisplayName: 'displayName',
      Type: 'application',
    },
    fields: [
      {
        type: 'switch',
        name: 'Overwrite',
        label: 'Overwrite Existing Template',
      },
    ],
    confirmText:
      "'[displayName]' is a multi-tenant app, so a multi-tenant Enterprise App template will be created. This copies all permissions into a reusable template. If you run this from a customer tenant, the App Registration will first be copied to the partner tenant as a multi-tenant app.",
    condition: (row) =>
      canWriteApplication &&
      !row?.applicationTemplateId &&
      (row?.signInAudience === 'AzureADMultipleOrgs' ||
        row?.signInAudience === 'AzureADandPersonalMicrosoftAccount'),
  },
  {
    icon: <CippIcons.ContentCopy />,
    label: 'Create Manifest Template (Single-Tenant)',
    type: 'POST',
    color: 'success',
    multiPost: false,
    url: '/api/ExecAppApprovalTemplate',
    fields: [
      {
        label: 'Template Name',
        name: 'TemplateName',
        type: 'textField',
        placeholder: 'Enter a name for the template',
        required: true,
        validators: {
          required: { value: true, message: 'Template name is required' },
        },
      },
    ],
    customDataformatter: (row, action, formData) => {
      const propertiesToRemove = [
        'appId',
        'id',
        'createdDateTime',
        'deletedDateTime',
        'publisherDomain',
        'servicePrincipalLockConfiguration',
        'identifierUris',
        'applicationIdUris',
        'keyCredentials',
        'passwordCredentials',
        'Tenant',
        'CippStatus',
      ]

      const cleanManifest = { ...row }
      propertiesToRemove.forEach((prop) => {
        delete cleanManifest[prop]
      })

      return {
        Action: 'Save',
        TemplateName: formData.TemplateName,
        AppType: 'ApplicationManifest',
        AppName: row.displayName || row.appId,
        ApplicationManifest: cleanManifest,
      }
    },
    confirmText:
      "'[displayName]' is a single-tenant app, so a single-tenant Application Manifest template will be created. This captures the app manifest into a reusable template that can be deployed to any tenant.",
    condition: (row) =>
      canWriteApplication && row.signInAudience === 'AzureADMyOrg' && !row?.applicationTemplateId,
  },
  {
    icon: <CippIcons.Key />,
    label: 'Add Client Secret',
    type: 'POST',
    color: 'success',
    multiPost: false,
    allowResubmit: true,
    url: '/api/ExecManageAppCredentials',
    data: {
      Id: 'id',
      AppType: 'applications',
      Action: 'Add',
      CredentialType: 'password',
    },
    fields: ADD_CLIENT_SECRET_FIELDS,
    confirmText:
      "Add a new client secret to '[displayName]'? The secret value is shown only once after creation.",
    condition: () => canWriteApplication,
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
      Type: 'applications',
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
          validators={{ required: 'Please select at least one password credential' }}
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
    confirmText: 'Are you sure you want to remove the selected password credentials?',
    condition: (row) => canWriteApplication && row?.passwordCredentials?.length > 0,
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
      Type: 'applications',
      Action: 'RemoveKey',
    },
    children: ({ formHook, row }) => {
      return <CertificateCredentialRemovalForm formHook={formHook} row={row} />
    },
    confirmText: 'Are you sure you want to remove the selected certificate credentials?',
    condition: (row) => canWriteApplication && row?.keyCredentials?.length > 0,
  },
  getAppOwnerAction(canWriteApplication, 'applications', onOwnersChanged),
  {
    icon: <CippIcons.Delete />,
    label: 'Delete App Registration',
    type: 'POST',
    color: 'error',
    multiPost: false,
    url: '/api/ExecApplication',
    data: {
      Id: 'id',
      Type: 'applications',
      Action: 'Delete',
    },
    confirmText:
      'Are you sure you want to delete this application registration? It can be restored from Applications > Deleted Apps for 30 days. Its enterprise app in this tenant is deleted with it and restored separately.',
    condition: () => canWriteApplication,
  },
]

const SIGN_IN_AUDIENCE_OPTIONS = [
  { label: 'This organization only (AzureADMyOrg)', value: 'AzureADMyOrg' },
  { label: 'Any Entra ID directory - multitenant (AzureADMultipleOrgs)', value: 'AzureADMultipleOrgs' },
  {
    label: 'Any Entra ID directory + personal Microsoft accounts (AzureADandPersonalMicrosoftAccount)',
    value: 'AzureADandPersonalMicrosoftAccount',
  },
  { label: 'Personal Microsoft accounts only (PersonalMicrosoftAccount)', value: 'PersonalMicrosoftAccount' },
]

// Audiences that include personal Microsoft accounts only accept v2 access tokens, so
// api.requestedAccessTokenVersion must be 2 or Graph rejects the signInAudience change.
const AUDIENCES_REQUIRING_V2_TOKENS = ['AzureADandPersonalMicrosoftAccount', 'PersonalMicrosoftAccount']

const redirectUrisFromForm = (value) =>
  Array.isArray(value) ? value.map((item) => item?.value ?? item).filter(Boolean) : []

// customDataformatter builds the payload directly (bypassing the dialog's auto tenantFilter), so it
// must include tenantFilter from the detail page's actionsData.Tenant.
export const getAppRegistrationEditActions = (canWriteApplication) => [
  {
    icon: <CippIcons.Edit />,
    label: 'Edit Authentication',
    type: 'POST',
    color: 'info',
    multiPost: false,
    allowResubmit: true,
    setDefaultValues: true,
    url: '/api/ExecApplication',
    fields: [
      {
        type: 'autoComplete',
        name: 'signInAudience',
        label: 'Supported account types',
        multiple: false,
        creatable: false,
        options: SIGN_IN_AUDIENCE_OPTIONS,
      },
      {
        type: 'autoComplete',
        name: 'web.redirectUris',
        label: 'Web redirect URIs',
        multiple: true,
        freeSolo: true,
        creatable: true,
        options: [],
        placeholder: 'https://... (press enter to add)',
      },
      {
        type: 'autoComplete',
        name: 'spa.redirectUris',
        label: 'Single-page application (SPA) redirect URIs',
        multiple: true,
        freeSolo: true,
        creatable: true,
        options: [],
        placeholder: 'https://... (press enter to add)',
      },
      {
        type: 'autoComplete',
        name: 'publicClient.redirectUris',
        label: 'Public client / native redirect URIs',
        multiple: true,
        freeSolo: true,
        creatable: true,
        options: [],
        placeholder: 'https://... or custom scheme (press enter to add)',
      },
    ],
    customDataformatter: (row, action, formData) => {
      // Only send what actually changed, so audience and URI edits stay independent.
      const Payload = {}

      const signInAudience = formData?.signInAudience?.value ?? formData?.signInAudience
      if (signInAudience && signInAudience !== row.signInAudience) {
        Payload.signInAudience = signInAudience
        // Personal-account audiences require v2 access tokens; bump it in the same PATCH (merging the
        // existing api object so custom scopes and pre-authorized apps are not wiped).
        if (
          AUDIENCES_REQUIRING_V2_TOKENS.includes(signInAudience) &&
          row.api?.requestedAccessTokenVersion !== 2
        ) {
          Payload.api = { ...(row.api || {}), requestedAccessTokenVersion: 2 }
        }
      }

      // redirectUris and redirectUriSettings can't be sent together, so a changed platform sends the
      // existing object minus redirectUriSettings, with only redirectUris replaced.
      ;[['web', row.web], ['spa', row.spa], ['publicClient', row.publicClient]].forEach(
        ([key, existing]) => {
          const newUris = redirectUrisFromForm(formData?.[key]?.redirectUris)
          if (!isEqual([...newUris].sort(), [...(existing?.redirectUris || [])].sort())) {
            const base = { ...(existing || {}) }
            delete base.redirectUriSettings
            Payload[key] = { ...base, redirectUris: newUris }
          }
        }
      )

      return {
        tenantFilter: row.Tenant,
        Id: row.id,
        Type: 'applications',
        Action: 'Update',
        Payload,
      }
    },
    confirmText:
      "Update the authentication settings (supported account types and redirect URIs) for '[displayName]'?",
    condition: () => canWriteApplication,
  },
]

export const getAppRegistrationListActions = (canWriteApplication) => [
  {
    icon: <CippIcons.EyeIcon />,
    label: 'View in CIPP',
    link: '/tenant/administration/applications/app-registration?appId=[appId]&tenantFilter=[Tenant]',
    pinned: true,
    color: 'info',
    multiPost: false,
    external: false,
  },
  ...entraLinkActions(false),
  ...getAppRegistrationPostAndDestructiveActions(canWriteApplication),
]

export const getAppRegistrationDetailHeaderActions = (canWriteApplication, onOwnersChanged) => [
  ...entraLinkActions(true),
  editInEntraAction,
  ...getAppRegistrationEditActions(canWriteApplication),
  ...getAppRegistrationPostAndDestructiveActions(canWriteApplication, onOwnersChanged),
]
