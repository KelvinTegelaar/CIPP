import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useState } from 'react'
import { Tooltip, Chip } from '@mui/material'
import { Stack } from '@mui/system'
import { Person, CalendarMonth } from '@mui/icons-material'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'

const Page = () => {
  const [byUser, setByUser] = useState(true)

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListCalendarPermissions',
    queryKey: 'calendar-permissions',
    cacheName: 'Mailboxes',
    syncTitle: 'Sync Calendar Permissions Cache',
    syncData: { Types: 'CalendarPermissions' },
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
        'CalendarUPN',
        'CalendarDisplayName',
        'CalendarType',
        'Permissions',
        ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
      ]

  const pageActions = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip
        title={
          byUser
            ? 'Grouped by user — click to group by calendar'
            : 'Grouped by calendar — click to group by user'
        }
      >
        <Chip
          icon={byUser ? <Person /> : <CalendarMonth />}
          label={byUser ? 'By User' : 'By Calendar'}
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
        key={`calendar-permissions-${byUser}`}
        title="Calendar Permissions Report"
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
