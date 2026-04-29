import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useState } from 'react'
import { Tooltip, Chip } from '@mui/material'
import { Stack } from '@mui/system'
import { Person, Inbox } from '@mui/icons-material'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'

const Page = () => {
  const [byUser, setByUser] = useState(true)

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListMailboxPermissions',
    queryKey: 'mailbox-permissions',
    cacheName: 'Mailboxes',
    syncTitle: 'Sync Mailbox Permissions Cache',
    syncData: { Types: 'Permissions' },
    allowToggle: false,
    defaultCached: true,
    cacheColumns: ['MailboxCacheTimestamp', 'PermissionCacheTimestamp'],
  })

  const columns = byUser
    ? [
        ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
        'User',
        'UserMailboxType',
        'Permissions',
        ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
      ]
    : [
        ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
        'MailboxUPN',
        'MailboxDisplayName',
        'MailboxType',
        'Permissions',
        ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
      ]

  const pageActions = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip
        title={
          byUser
            ? 'Grouped by user — click to group by mailbox'
            : 'Grouped by mailbox — click to group by user'
        }
      >
        <Chip
          icon={byUser ? <Person /> : <Inbox />}
          label={byUser ? 'By User' : 'By Mailbox'}
          color="primary"
          size="small"
          onClick={() => setByUser((prev) => !prev)}
          clickable
          variant="outlined"
        />
      </Tooltip>
      {reportDB.controls}
    </Stack>
  )

  return (
    <>
      <CippTablePage
        key={`mailbox-permissions-${byUser}`}
        title="Mailbox Permissions Report"
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={`${reportDB.resolvedQueryKey}-${byUser}`}
        apiData={{ ...reportDB.resolvedApiData, ByUser: byUser }}
        simpleColumns={columns}
        cardButton={pageActions}
        offCanvas={null}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
