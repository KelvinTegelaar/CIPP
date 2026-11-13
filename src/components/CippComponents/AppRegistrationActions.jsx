
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
export const ADD_CLIENT_SECRET_DEFAULTS = { ExpiryMonths: { label: '12 months', value: 12 } }

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

const scenarioIs = (value) => ({ field: 'Scenario', compareType: 'is', compareValue: value })

// Federated credentials let tokens from another identity provider sign in as the app without a
// secret. The backend builds the issuer and subject from the scenario's fields.
export const ADD_FEDERATED_CREDENTIAL_FIELDS = [
  {
    type: 'radio',
    name: 'Scenario',
    label: 'Whose tokens sign in as this app',
    options: [
      { label: 'GitHub Actions', value: 'GitHub' },
      { label: 'Kubernetes service account', value: 'Kubernetes' },
      { label: 'Managed identity in this tenant', value: 'ManagedIdentity' },
      { label: 'Other OpenID Connect issuer', value: 'Other' },
    ],
    validators: { required: 'Select a scenario' },
  },
  {
    type: 'textField',
    name: 'Name',
    label: 'Name',
    helperText: 'Unique on this app and cannot be changed later.',
    validators: {
      required: 'A name is required',
      maxLength: { value: 120, message: 'At most 120 characters' },
    },
  },
  {
    type: 'textField',
    name: 'GitHubOrganization',
    label: 'GitHub organization or user',
    condition: scenarioIs('GitHub'),
    validators: { required: 'The organization is required' },
  },
  {
    type: 'textField',
    name: 'GitHubRepository',
    label: 'Repository',
    condition: scenarioIs('GitHub'),
    validators: { required: 'The repository is required' },
  },
  {
    type: 'radio',
    name: 'GitHubEntityType',
    label: 'Workflows that may sign in',
    condition: scenarioIs('GitHub'),
    options: [
      { label: 'Deployment environment', value: 'Environment' },
      { label: 'Branch', value: 'Branch' },
      { label: 'Tag', value: 'Tag' },
      { label: 'Pull requests', value: 'PullRequest' },
    ],
    validators: { required: 'Select which workflows may sign in' },
  },
  {
    type: 'textField',
    name: 'GitHubEntityValue',
    label: 'Environment, branch or tag name',
    helperText: 'Not used for pull requests.',
    condition: scenarioIs('GitHub'),
  },
  {
    type: 'textField',
    name: 'KubernetesIssuer',
    label: 'Cluster issuer URL',
    helperText: 'The OIDC issuer URL of the cluster, such as the AKS OIDC issuer.',
    condition: scenarioIs('Kubernetes'),
    validators: { required: 'The issuer URL is required' },
  },
  {
    type: 'textField',
    name: 'KubernetesNamespace',
    label: 'Namespace',
    condition: scenarioIs('Kubernetes'),
    validators: { required: 'The namespace is required' },
  },
  {
    type: 'textField',
    name: 'KubernetesServiceAccount',
    label: 'Service account',
    condition: scenarioIs('Kubernetes'),
    validators: { required: 'The service account is required' },
  },
  {
    type: 'autoComplete',
    name: 'ManagedIdentity',
    label: 'Managed identity',
    multiple: false,
    creatable: false,
    condition: scenarioIs('ManagedIdentity'),
    validators: { required: 'Select a managed identity' },
    api: {
      url: '/api/ListGraphRequest',
      dataKey: 'Results',
      labelField: (sp) => `${sp.displayName} (${sp.id})`,
      valueField: 'id',
      queryKey: 'ManagedIdentities-picker',
      data: {
        Endpoint: 'servicePrincipals',
        $filter: "servicePrincipalType eq 'ManagedIdentity'",
        $select: 'id,displayName',
        $count: true,
        $top: 999,
      },
    },
  },
  {
    type: 'textField',
    name: 'Issuer',
    label: 'Issuer URL',
    condition: scenarioIs('Other'),
    validators: { required: 'The issuer URL is required' },
  },
  {
    type: 'textField',
    name: 'Subject',
    label: 'Subject',
    helperText: 'The exact sub claim of the tokens that may sign in.',
    condition: scenarioIs('Other'),
    validators: { required: 'The subject is required' },
  },
  {
    type: 'textField',
    name: 'Audience',
    label: 'Audience',
    helperText: 'Leave empty for api://AzureADTokenExchange, which almost every issuer uses.',
    condition: scenarioIs('Other'),
  },
  {
    type: 'textField',
    name: 'Description',
    label: 'Description (optional)',
  },
]

export const getFederatedCredentialActions = (canWriteApplication, onChanged) => [
  {
    icon: <CippIcons.Link />,
    label: 'Add Federated Credential',
    type: 'POST',
    color: 'success',
    multiPost: false,
    url: '/api/ExecManageAppCredentials',
    data: {
      Id: 'id',
      AppType: '!applications',
      Action: '!Add',
      CredentialType: '!federated',
    },
    fields: ADD_FEDERATED_CREDENTIAL_FIELDS,
    defaultvalues: { Scenario: 'GitHub', GitHubEntityType: 'Environment' },
    relatedQueryKeys: ['AppFederatedCredentials-*'],
    onSuccess: onChanged,
    confirmText:
      "Let tokens from another identity provider sign in as '[displayName]', with no secret or certificate. Only add issuers and subjects you control.",
    condition: () => canWriteApplication,
  },
  {
    icon: <CippIcons.LinkOff />,
    label: 'Remove Federated Credentials',
    type: 'POST',
    color: 'warning',
    multiPost: false,
    url: '/api/ExecManageAppCredentials',
    children: ({ formHook, row }) => (
      <CippFormComponent
        name="FederatedCredentials"
        formControl={formHook}
        type="autoComplete"
        label="Federated credentials to remove"
        multiple
        creatable={false}
        validators={{
          validate: (value) => value?.length > 0 || 'Select at least one federated credential',
        }}
        api={{
          url: '/api/ListGraphRequest',
          tenantFilter: row?.Tenant,
          dataKey: 'Results',
          labelField: (fic) => `${fic.name} (${fic.issuer} | ${fic.subject ?? 'claims expression'})`,
          valueField: 'id',
          queryKey: `AppFederatedCredentials-${row?.id}`,
          data: { Endpoint: `applications/${row?.id}/federatedIdentityCredentials` },
        }}
      />
    ),
    // One request per credential, so each gets its own result.
    customDataformatter: (row, action, formData) =>
      (formData.FederatedCredentials ?? []).map((fic) => ({
        tenantFilter: row?.Tenant,
        Id: row?.id,
        AppType: 'applications',
        Action: 'Remove',
        CredentialType: 'federated',
        KeyId: fic.value,
        DisplayName: fic.rawData?.name ?? fic.label,
      })),
    relatedQueryKeys: ['AppFederatedCredentials-*'],
    onSuccess: onChanged,
    confirmText:
      "Remove the selected federated credentials from '[displayName]'? Workloads using them can no longer sign in as the app.",
    condition: () => canWriteApplication,
  },
]

export const getAppOwnerAction =(canWriteApplication, type, onOwnersChanged) => ({
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
    defaultvalues: ADD_CLIENT_SECRET_DEFAULTS,
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
  ...getFederatedCredentialActions(canWriteApplication, onOwnersChanged),
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
