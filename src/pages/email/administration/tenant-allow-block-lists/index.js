import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Delete } from '@mui/icons-material'
import { CippAddTenantAllowBlockListDrawer } from '../../../../components/CippComponents/CippAddTenantAllowBlockListDrawer.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { Stack } from '@mui/system'

const Page = () => {
  const pageTitle = 'Tenant Allow/Block Lists'
  const cardButtonPermissions = ['Exchange.SpamFilter.ReadWrite']

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListTenantAllowBlockList',
    queryKey: 'ListTenantAllowBlockList',
    cacheName: 'ExoTenantAllowBlockList',
    syncTitle: 'Sync Tenant Allow/Block Lists',
    allowToggle: true,
    // Live by default: this is a management page, and a stale list right after an add or
    // remove reads as the action having failed.
    defaultCached: false,
    allowAllTenantSync: true,
  })

  const actions = [
    {
      label: 'Remove',
      type: 'POST',
      url: '/api/RemoveTenantAllowBlockList',
      data: {
        Entries: 'Value',
        ListType: 'ListType',
      },
      // Every row carries Tenant, which CippApiDialog uses as the tenantFilter in AllTenants mode.
      confirmText: 'Are you sure you want to delete this entry?',
      color: 'danger',
      icon: <Delete />,
    },
  ]

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'Value',
    'ListType',
    'Action',
    'Notes',
    'LastUsedDate',
    'LastModifiedDateTime',
    'ExpirationDate',
    'RemoveAfter',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        simpleColumns={simpleColumns}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippAddTenantAllowBlockListDrawer requiredPermissions={cardButtonPermissions} />
            {reportDB.controls}
          </Stack>
        }
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>

export default Page
