import { useMemo } from 'react'
import { Button, Stack } from '@mui/material'
import { CippIcons } from '../../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippTablePage } from '../../../../../components/CippComponents/CippTablePage'
import { TabbedLayout } from '../../../../../layouts/TabbedLayout'
import { CippApiDialog } from '../../../../../components/CippComponents/CippApiDialog'
import CippFormComponent from '../../../../../components/CippComponents/CippFormComponent'
import {
  ScopeFields,
  exchangeAccessQueryKeys,
} from '../../../../../components/CippComponents/CippEnterpriseAppExchangeRbac'
import { useSettings } from '../../../../../hooks/use-settings'
import { useDialog } from '../../../../../hooks/use-dialog'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import tabOptions from '../tabOptions'

const asRows = (rows) => (Array.isArray(rows) ? rows : [rows])

const scopeData = (formData) => ({
  ScopeType: formData.ScopeType || 'Organization',
  ManagementScope: formData.ManagementScope,
  AdministrativeUnit: formData.AdministrativeUnit,
})

// The scope fields as table action fields: the dialog renders these declaratively.
const scopeActionFields = [
  {
    type: 'radio',
    name: 'ScopeType',
    label: 'Mailboxes the role applies to',
    options: [
      { label: 'Every mailbox in the organization', value: 'Organization' },
      { label: 'A management scope', value: 'ManagementScope' },
      { label: 'An administrative unit', value: 'AdministrativeUnit' },
    ],
  },
  {
    type: 'autoComplete',
    name: 'ManagementScope',
    label: 'Management scope',
    multiple: false,
    creatable: false,
    validators: { required: 'Select a management scope' },
    helperText: 'Exclusive scopes do not restrict an app and are not listed.',
    condition: { field: 'ScopeType', compareType: 'is', compareValue: 'ManagementScope' },
    api: {
      url: '/api/ListExoAppMailboxAccess',
      data: { Type: 'Scopes' },
      dataKey: 'Results',
      labelField: (s) => (s.recipientFilter ? `${s.name} (${s.recipientFilter})` : s.name),
      valueField: 'name',
      queryKey: 'ExoAppMailboxAccess-Scopes-picker',
      dataFilter: (options) => options.filter((o) => !o.rawData?.exclusive),
    },
  },
  {
    type: 'autoComplete',
    name: 'AdministrativeUnit',
    label: 'Administrative unit',
    multiple: false,
    creatable: false,
    validators: { required: 'Select an administrative unit' },
    condition: { field: 'ScopeType', compareType: 'is', compareValue: 'AdministrativeUnit' },
    api: {
      url: '/api/ListGraphRequest',
      data: { Endpoint: 'directory/administrativeUnits', $select: 'id,displayName' },
      dataKey: 'Results',
      labelField: 'displayName',
      valueField: 'id',
      queryKey: 'AdministrativeUnits-picker',
    },
  },
]

const Page = () => {
  const tenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Tenant.Application.ReadWrite'])
  const assignDialog = useDialog()
  const queryKey = `ExoAppMailboxAccess-Roles-${tenant}`

  const actions = useMemo(
    () => [
      {
        label: "View app's Exchange access",
        link: `/tenant/administration/applications/enterprise-app/exchange?spId=[servicePrincipalId]&tenantFilter=${tenant}`,
        icon: <CippIcons.Launch />,
        multiPost: false,
        condition: (row) => !!row.servicePrincipalId,
      },
      ...(canWrite
        ? [
            {
              label: 'Change Scope',
              type: 'POST',
              url: '/api/ExecEnterpriseAppExchangeRbac',
              icon: <CippIcons.Tune />,
              confirmText:
                'Assign [role] with the new scope? The current assignment is removed only after the new one is in place, so the app keeps access throughout.',
              multiPost: false,
              relatedQueryKeys: exchangeAccessQueryKeys,
              condition: (row) => !!row.servicePrincipalId,
              fields: scopeActionFields,
              customDataformatter: (rows, action, formData) =>
                asRows(rows).map((row) => ({
                  tenantFilter: tenant,
                  ServicePrincipalId: row.servicePrincipalId,
                  Action: 'ChangeScope',
                  AssignmentIds: [row.id],
                  ...scopeData(formData),
                })),
            },
            {
              label: 'Remove Role',
              type: 'POST',
              url: '/api/ExecEnterpriseAppExchangeRbac',
              icon: <CippIcons.Delete />,
              color: 'danger',
              confirmText:
                'Remove [role] from [appDisplayName]? The app loses this mailbox access within two hours.',
              multiPost: false,
              relatedQueryKeys: exchangeAccessQueryKeys,
              condition: (row) => !!row.servicePrincipalId,
              customDataformatter: (rows) =>
                asRows(rows).map((row) => ({
                  tenantFilter: tenant,
                  ServicePrincipalId: row.servicePrincipalId,
                  Action: 'RemoveRoles',
                  AssignmentIds: [row.id],
                })),
            },
          ]
        : []),
    ],
    [tenant, canWrite]
  )

  const simpleColumns = useMemo(
    () => [
      'appDisplayName',
      'roleAssignee',
      'role',
      'delegating',
      'impact',
      'suspicion',
      'scope',
      'scopeName',
      'customResourceScopeFilter',
      'enabled',
      'whenCreatedUTC',
      'appId',
    ],
    []
  )

  const cardButton = canWrite ? (
    <Button startIcon={<CippIcons.Add />} onClick={assignDialog.handleOpen}>
      Assign Role
    </Button>
  ) : null

  return (
    <>
      <CippTablePage
        title="Exchange Application Roles"
        apiUrl="/api/ListExoAppMailboxAccess"
        apiData={{ Type: 'Roles' }}
        apiDataKey="Results"
        queryKey={queryKey}
        actions={actions}
        simpleColumns={simpleColumns}
        cardButton={cardButton}
      />
      {canWrite && (
        <CippApiDialog
          createDialog={assignDialog}
          title="Assign Exchange application roles"
          defaultvalues={{ ScopeType: 'Organization' }}
          relatedQueryKeys={exchangeAccessQueryKeys}
          api={{
            type: 'POST',
            url: '/api/ExecEnterpriseAppExchangeRbac',
            confirmText:
              'The roles apply to the selected mailboxes in addition to any mailbox permission the app holds in Entra. Changes can take up to two hours to reach an app that is in use.',
            customDataformatter: (row, action, formData) => ({
              tenantFilter: tenant,
              ServicePrincipalId: formData.App?.value,
              Action: 'AddRoles',
              Roles: (formData.Roles || []).map((r) => r.value),
              ...scopeData(formData),
            }),
          }}
        >
          {({ formHook }) => (
            <Stack spacing={2}>
              <CippFormComponent
                type="autoComplete"
                name="App"
                label="Enterprise application"
                multiple={false}
                creatable={false}
                formControl={formHook}
                validators={{ required: 'Select an application' }}
                api={{
                  tenantFilter: tenant,
                  url: '/api/ListGraphRequest',
                  data: {
                    Endpoint: 'servicePrincipals',
                    $select: 'id,appId,displayName',
                    $top: 999,
                  },
                  dataKey: 'Results',
                  labelField: (sp) => `${sp.displayName} (${sp.appId})`,
                  valueField: 'id',
                  queryKey: `ServicePrincipals-picker-${tenant}`,
                }}
              />
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
                api={{
                  tenantFilter: tenant,
                  url: '/api/ListExoAppMailboxAccess',
                  data: { Type: 'AvailableRoles' },
                  dataKey: 'Results',
                  labelField: (r) => (r.impact ? `${r.name} - impact ${r.impact}` : r.name),
                  valueField: 'name',
                  queryKey: `ExoAppMailboxAccess-AvailableRoles-${tenant}`,
                }}
              />
              <ScopeFields formHook={formHook} tenantFilter={tenant} />
            </Stack>
          )}
        </CippApiDialog>
      )}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
