import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useState } from 'react'
import { Tooltip, Chip } from '@mui/material'
import { Stack } from '@mui/system'
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
    serverPagination: true,
  })

  // Refetch both views after a removal — the endpoint syncs the cached report
  const relatedQueryKeys = [
    `${reportDB.resolvedQueryKey}-true`,
    `${reportDB.resolvedQueryKey}-false`,
  ]

  // Distinct `keyOf|AccessRights` options across the selected rows' grants
  const grantOptions = (keyOf) => (rows) => {
    const rowArray = Array.isArray(rows) ? rows : [rows]
    const seen = new Set()
    const options = []
    rowArray.forEach((row) =>
      (row?.Permissions ?? []).forEach((p) => {
        const key = `${keyOf(p)}|${p.AccessRights}`
        if (!seen.has(key)) {
          seen.add(key)
          options.push({ label: `${keyOf(p)} — ${p.AccessRights}`, value: key })
        }
      })
    )
    return options
  }

  // Group per tenant; only remove grants each row actually has.
  // Array return => one POST per tenant, so AllTenants selections work
  const bulkRemove = (keyOf, toRequest) => (rows, action, formData) => {
    const rowArray = Array.isArray(rows) ? rows : [rows]
    const selected = new Set((formData.permissionsToRemove ?? []).map((o) => o.value))
    const byTenant = {}
    rowArray.forEach((row) =>
      (row.Permissions ?? [])
        .filter((p) => selected.has(`${keyOf(p)}|${p.AccessRights}`))
        .forEach((p) => (byTenant[row.Tenant] ??= []).push(toRequest(row, p)))
    )
    return Object.entries(byTenant).map(([tenantFilter, mailboxRequests]) => ({
      mailboxRequests,
      tenantFilter,
    }))
  }

  const removePermission = (userID, p) => ({
    UserID: userID,
    PermissionLevel: p.AccessRights,
    // Localized calendars aren't named "Calendar"
    FolderName: p.FolderName,
    Modification: 'Remove',
  })

  const bulkRemoveAction = ({ confirmText, label, keyOf, toRequest }) => ({
    label: 'Bulk Remove Calendar Permissions',
    type: 'POST',
    url: '/api/ExecModifyCalPerms',
    icon: <CippIcons.Delete />,
    confirmText,
    multiPost: false,
    relatedQueryKeys,
    fields: [
      {
        type: 'autoComplete',
        name: 'permissionsToRemove',
        label,
        multiple: true,
        creatable: false,
        required: true,
        options: grantOptions(keyOf),
      },
    ],
    customDataformatter: bulkRemove(keyOf, toRequest),
  })

  const byCalendarActions = [
    bulkRemoveAction({
      confirmText: 'Remove the selected permissions from the selected calendars?',
      label: 'Permissions to remove',
      keyOf: (p) => p.User,
      toRequest: (calendar, p) => ({
        userID: calendar.CalendarUPN,
        permissions: [removePermission(p.User, p)],
      }),
    }),
  ]

  const byUserActions = [
    bulkRemoveAction({
      confirmText: "Remove the selected users' permissions from the selected calendars?",
      label: 'Calendar permissions to remove',
      keyOf: (p) => p.CalendarUPN,
      toRequest: (user, p) => ({
        userID: p.CalendarUPN,
        permissions: [removePermission(user.User, p)],
      }),
    }),
  ]

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
    <Stack direction="row" spacing={1} sx={{
      alignItems: "center"
    }}>
      <Tooltip
        title={
          byUser
            ? 'Grouped by user — click to group by calendar'
            : 'Grouped by calendar — click to group by user'
        }
      >
        <Chip
          icon={byUser ? <CippIcons.Person /> : <CippIcons.CalendarMonth />}
          label={byUser ? 'By User' : 'By Calendar'}
          color="primary"
          size="small"
          onClick={() => setByUser((prev) => !prev)}
          clickable
          variant="outlined"
        />
      </Tooltip>
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
        apiDataKey={reportDB.apiDataKey}
        simpleColumns={columns}
        actions={byUser ? byUserActions : byCalendarActions}
        cardButton={pageActions}
        dataSourceControls={reportDB.controls}
        offCanvas={null}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
