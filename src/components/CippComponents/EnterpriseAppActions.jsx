import {
  Launch,
  Delete,
  Key,
  Security,
  Block,
  CheckCircle,
  ContentCopy,
  Visibility,
} from '@mui/icons-material'
import { CippFormComponent } from './CippFormComponent.jsx'
import { CertificateCredentialRemovalForm } from './CertificateCredentialRemovalForm.jsx'

const headerLinkProps = { showInActionsMenu: true }

const viewInEntraAction = {
  icon: <Launch />,
  label: 'View Application',
  link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/[id]/appId/[appId]`,
  color: 'info',
  target: '_blank',
  multiPost: false,
  external: true,
}

export const getEnterpriseAppPostActions = (canWriteApplication) => [
  {
    icon: <ContentCopy />,
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
      "Create a deployment template from '[displayName]'? This will copy all permissions and create a reusable template.",
    condition: (row) => canWriteApplication && row?.signInAudience === 'AzureADMultipleOrgs',
  },
  {
    icon: <Key />,
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
    icon: <Security />,
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
    confirmText: 'Are you sure you want to remove the selected certificate credentials?',
    condition: (row) => canWriteApplication && row?.keyCredentials?.length > 0,
  },
  {
    icon: <Block />,
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
    icon: <CheckCircle />,
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
    icon: <Delete />,
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

export const getEnterpriseAppListActions = (canWriteApplication) => [
  {
    icon: <Visibility />,
    label: 'View in CIPP',
    link: '/tenant/administration/applications/enterprise-app?spId=[id]&tenantFilter=[Tenant]',
    color: 'info',
    multiPost: false,
    external: false,
  },
  { ...viewInEntraAction },
  ...getEnterpriseAppPostActions(canWriteApplication),
]

export const getEnterpriseAppDetailHeaderActions = (canWriteApplication) => [
  { ...viewInEntraAction, ...headerLinkProps },
  ...getEnterpriseAppPostActions(canWriteApplication),
]
