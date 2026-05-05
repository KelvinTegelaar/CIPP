import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippExchangeActions from '../../../../components/CippComponents/CippExchangeActions'
import { CippHVEUserDrawer } from '../../../../components/CippComponents/CippHVEUserDrawer.jsx'
import { CippSharedMailboxDrawer } from '../../../../components/CippComponents/CippSharedMailboxDrawer.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { Stack } from '@mui/system'

const Page = () => {
  const pageTitle = 'Mailboxes'

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListMailboxes',
    queryKey: 'ListMailboxes',
    cacheName: 'Mailboxes',
    syncTitle: 'Sync Mailboxes',
    allowToggle: true,
    defaultCached: true,
  })

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: ['displayName', 'UPN', 'AdditionalEmailAddresses', 'recipientTypeDetails'],
    actions: CippExchangeActions(),
  }

  const filterList = [
    {
      filterName: 'View User Mailboxes',
      value: [{ id: 'recipientTypeDetails', value: 'UserMailbox' }],
      type: 'column',
    },
    {
      filterName: 'View Shared Mailboxes',
      value: [{ id: 'recipientTypeDetails', value: 'SharedMailbox' }],
      type: 'column',
    },
    {
      filterName: 'View Room Mailboxes',
      value: [{ id: 'recipientTypeDetails', value: 'RoomMailbox' }],
      type: 'column',
    },
    {
      filterName: 'View Equipment Mailboxes',
      value: [{ id: 'recipientTypeDetails', value: 'EquipmentMailbox' }],
      type: 'column',
    },
  ]

  // Simplified columns for the table
  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'displayName',
    'recipientTypeDetails',
    'UPN',
    'primarySmtpAddress',
    'AdditionalEmailAddresses',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={CippExchangeActions()}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filterList}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippSharedMailboxDrawer />
            <CippHVEUserDrawer />
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
