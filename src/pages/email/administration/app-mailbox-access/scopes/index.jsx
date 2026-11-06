import { useMemo } from 'react'
import { Button } from '@mui/material'
import { CippIcons } from '../../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippTablePage } from '../../../../../components/CippComponents/CippTablePage'
import { TabbedLayout } from '../../../../../layouts/TabbedLayout'
import { CippApiDialog } from '../../../../../components/CippComponents/CippApiDialog'
import { useSettings } from '../../../../../hooks/use-settings'
import { useDialog } from '../../../../../hooks/use-dialog'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import tabOptions from '../tabOptions'

const Page = () => {
  const tenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Tenant.Application.ReadWrite'])
  const newScopeDialog = useDialog()
  const queryKey = `ExoAppMailboxAccess-Scopes-${tenant}`

  const actions = useMemo(
    () =>
      canWrite
        ? [
            {
              label: 'Delete Scope',
              type: 'POST',
              url: '/api/ExecEnterpriseAppExchangeRbac',
              icon: <CippIcons.Delete />,
              color: 'danger',
              confirmText: 'Delete the management scope [name]? This cannot be undone.',
              multiPost: false,
              relatedQueryKeys: ['ExoAppMailboxAccess-Scopes-*', 'EnterpriseApp-exchange-*'],
              // A scope in use by any role assignment cannot be deleted.
              condition: (row) => !row.appAssignmentCount && !row.otherAssignmentCount,
              customDataformatter: (rows) => ({
                tenantFilter: tenant,
                Action: 'RemoveScope',
                ScopeNames: (Array.isArray(rows) ? rows : [rows]).map((row) => row.name),
              }),
            },
          ]
        : [],
    [tenant, canWrite]
  )

  const simpleColumns = useMemo(
    () => [
      'name',
      'recipientFilter',
      'scopeRestrictionType',
      'exclusive',
      'appAssignmentCount',
      'otherAssignmentCount',
      'whenCreatedUTC',
    ],
    []
  )

  const cardButton = canWrite ? (
    <Button startIcon={<CippIcons.Add />} onClick={newScopeDialog.handleOpen}>
      New Management Scope
    </Button>
  ) : null

  return (
    <>
      <CippTablePage
        title="Management Scopes"
        apiUrl="/api/ListExoAppMailboxAccess"
        apiData={{ Type: 'Scopes' }}
        apiDataKey="Results"
        queryKey={queryKey}
        actions={actions}
        simpleColumns={simpleColumns}
        cardButton={cardButton}
      />
      {canWrite && (
        <CippApiDialog
          createDialog={newScopeDialog}
          title="New management scope"
          relatedQueryKeys={['ExoAppMailboxAccess-Scopes-*', 'EnterpriseApp-exchange-*']}
          fields={[
            {
              type: 'textField',
              name: 'ScopeName',
              label: 'Name',
              validators: { required: 'A name is required' },
            },
            {
              type: 'textField',
              name: 'RecipientFilter',
              label: 'Recipient filter',
              validators: { required: 'A recipient filter is required' },
              helperText:
                "An OPATH filter on mailbox properties, for example: Department -eq 'Sales' or CustomAttribute1 -eq 'Finance'",
            },
          ]}
          api={{
            type: 'POST',
            url: '/api/ExecEnterpriseAppExchangeRbac',
            confirmText:
              'The scope is created for the whole tenant and can then be used for any role assignment.',
            customDataformatter: (row, action, formData) => ({
              tenantFilter: tenant,
              Action: 'NewScope',
              ScopeName: formData.ScopeName,
              RecipientFilter: formData.RecipientFilter,
            }),
          }}
        />
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
