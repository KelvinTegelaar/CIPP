import { Alert } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { usePermissions } from '../../../../hooks/use-permissions.js'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from './tabOptions'

const Page = () => {
  const pageTitle = 'Deleted Applications'
  const tenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])
  const queryKey = `DeletedApplications-${tenant}`
  // A restored app shows up in the app lists again.
  const relatedQueryKeys = [queryKey, 'Enterprise Applications*', 'App Registrations*']

  const actions = canWriteApplication
    ? [
        {
          label: 'Restore',
          type: 'POST',
          url: '/api/ExecDeletedApplication',
          icon: <CippIcons.RestoreFromTrash />,
          data: { ID: 'id', Action: '!Restore' },
          confirmText:
            "Restore the [type] '[displayName]'? An app registration and its enterprise app are restored separately.",
          multiPost: false,
          relatedQueryKeys,
        },
        {
          label: 'Permanently Delete',
          type: 'POST',
          url: '/api/ExecDeletedApplication',
          icon: <CippIcons.Delete />,
          color: 'danger',
          data: { ID: 'id', Action: '!Delete' },
          confirmText:
            "Permanently delete the [type] '[displayName]'? It can no longer be restored. This cannot be undone.",
          multiPost: false,
          relatedQueryKeys,
        },
      ]
    : []

  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'type',
      'appId',
      'publisher',
      'createdDateTime',
      'deletedDateTime',
      'daysLeft',
      'relatedDeleted',
      'id',
    ],
    actions,
  }

  const simpleColumns = [
    'displayName',
    'type',
    'appId',
    'publisher',
    'deletedDateTime',
    'daysLeft',
    'relatedDeleted',
  ]

  const filters = [
    { filterName: 'App registrations', value: [{ id: 'type', value: 'App registration' }], type: 'column' },
    { filterName: 'Enterprise apps', value: [{ id: 'type', value: 'Enterprise app' }], type: 'column' },
  ]

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Entra keeps deleted app registrations and enterprise apps for 30 days. Restoring one does not
        restore the other: Related Deleted shows when both were deleted.
      </Alert>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListDeletedApplications"
        apiDataKey="Results"
        queryKey={queryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filters}
      />
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
