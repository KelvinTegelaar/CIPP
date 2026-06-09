import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { PersonAdd, PersonRemove } from '@mui/icons-material'
import { useCippReportDB } from '../../../components/CippComponents/CippReportDBControls'

const Page = () => {
  const pageTitle = 'OneDrive'
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListSites?type=OneDriveUsageAccount',
    queryKey: 'ListSites-OneDriveUsageAccount',
    cacheName: 'Sites',
    syncTitle: 'Sync OneDrive Report',
    syncData: { Types: 'OneDriveUsageAccount' },
    allowToggle: true,
    defaultCached: false,
    allowAllTenantSync: true,
  })

  const actions = [
    {
      label: 'Add permissions to OneDrive',
      icon: <PersonAdd />,
      type: 'POST',
      url: '/api/ExecSharePointPerms',
      data: {
        UPN: 'ownerPrincipalName',
        URL: 'webUrl',
        RemovePermission: false,
      },
      confirmText: "Select the User to add to this user's OneDrive permissions",
      fields: [
        {
          type: 'autoComplete',
          name: 'onedriveAccessUser',
          label: 'Select User',
          multiple: false,
          creatable: false,
          api: {
            url: '/api/ListGraphRequest',
            data: {
              Endpoint: 'users',
              $select: 'id,displayName,userPrincipalName',
              $top: 999,
              $count: true,
            },
            queryKey: 'ListUsersAutoComplete',
            dataKey: 'Results',
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: 'userPrincipalName',
            addedField: {
              id: 'id',
            },
            showRefresh: true,
          },
        },
      ],
    },
    {
      label: 'Remove permissions from OneDrive',
      icon: <PersonRemove />,
      type: 'POST',
      url: '/api/ExecSharePointPerms',
      data: {
        UPN: 'ownerPrincipalName',
        URL: 'webUrl',
        RemovePermission: true,
      },
      confirmText: "Select the User to remove from this user's OneDrive permissions",
      fields: [
        {
          type: 'autoComplete',
          name: 'onedriveAccessUser',
          label: 'Select User',
          multiple: false,
          creatable: false,
          api: {
            url: '/api/listUsers',
            labelField: (onedriveAccessUser) =>
              `${onedriveAccessUser.displayName} (${onedriveAccessUser.userPrincipalName})`,
            valueField: 'userPrincipalName',
            addedField: {
              displayName: 'displayName',
            },
          },
        },
      ],
    },
  ]

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'displayName',
    'createdDateTime',
    'ownerPrincipalName',
    'lastActivityDate',
    'fileCount',
    'storageUsedInGigabytes',
    'storageAllocatedInGigabytes',
    'reportRefreshDate',
    'webUrl',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        simpleColumns={simpleColumns}
        cardButton={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>

export default Page
