import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useState } from 'react'
import { Tooltip, Chip } from '@mui/material'
import { Stack } from '@mui/system'
import { Person, Inbox, Delete } from '@mui/icons-material'
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

  // Refetch both views after a removal — the endpoint now syncs the cached report
  const relatedQueryKeys = [
    `${reportDB.resolvedQueryKey}-true`,
    `${reportDB.resolvedQueryKey}-false`,
  ]

  const byMailboxActions = [
    {
      label: 'Bulk Remove Mailbox Permissions',
      type: 'POST',
      url: '/api/ExecModifyMBPerms',
      icon: <Delete />,
      confirmText: 'Remove the selected permissions from the selected mailboxes?',
      multiPost: false,
      relatedQueryKeys,
      fields: [
        {
          type: 'autoComplete',
          name: 'permissionsToRemove',
          label: 'Permissions to remove',
          multiple: true,
          creatable: false,
          required: true,
          options: (rows) => {
            const rowArray = Array.isArray(rows) ? rows : [rows]
            const seen = new Set()
            const options = []
            rowArray.forEach((row) =>
              (row?.Permissions ?? []).forEach((p) => {
                const key = `${p.User}|${p.AccessRights}`
                if (!seen.has(key)) {
                  seen.add(key)
                  options.push({ label: `${p.User} — ${p.AccessRights}`, value: key })
                }
              })
            )
            return options
          },
        },
      ],
      customDataformatter: (rows, action, formData) => {
        const rowArray = Array.isArray(rows) ? rows : [rows]
        const selected = new Set((formData.permissionsToRemove ?? []).map((o) => o.value))
        // Group per tenant; only remove grants each mailbox actually has
        const byTenant = {}
        rowArray.forEach((mailbox) => {
          const permissions = (mailbox.Permissions ?? [])
            .filter((p) => selected.has(`${p.User}|${p.AccessRights}`))
            .map((p) => ({
              UserID: p.User,
              PermissionLevel: p.AccessRights,
              Modification: 'Remove',
            }))
          if (!permissions.length) return
          ;(byTenant[mailbox.Tenant] ??= []).push({ userID: mailbox.MailboxUPN, permissions })
        })
        // Array return => one POST per tenant, so AllTenants selections work
        return Object.entries(byTenant).map(([tenantFilter, mailboxRequests]) => ({
          mailboxRequests,
          tenantFilter,
        }))
      },
    },
  ]

  const byUserActions = [
    {
      label: 'Bulk Remove Mailbox Permissions',
      type: 'POST',
      url: '/api/ExecModifyMBPerms',
      icon: <Delete />,
      confirmText: "Remove the selected users' permissions from the selected mailboxes?",
      multiPost: false,
      relatedQueryKeys,
      fields: [
        {
          type: 'autoComplete',
          name: 'permissionsToRemove',
          label: 'Mailbox permissions to remove',
          multiple: true,
          creatable: false,
          required: true,
          options: (rows) => {
            const rowArray = Array.isArray(rows) ? rows : [rows]
            const seen = new Set()
            const options = []
            rowArray.forEach((row) =>
              (row?.Permissions ?? []).forEach((p) => {
                const key = `${p.MailboxUPN}|${p.AccessRights}`
                if (!seen.has(key)) {
                  seen.add(key)
                  options.push({ label: `${p.MailboxUPN} — ${p.AccessRights}`, value: key })
                }
              })
            )
            return options
          },
        },
      ],
      customDataformatter: (rows, action, formData) => {
        const rowArray = Array.isArray(rows) ? rows : [rows]
        const selected = new Set((formData.permissionsToRemove ?? []).map((o) => o.value))
        // Group per tenant; strip each selected user from the chosen mailboxes only
        const byTenant = {}
        rowArray.forEach((user) => {
          ;(user.Permissions ?? [])
            .filter((p) => selected.has(`${p.MailboxUPN}|${p.AccessRights}`))
            .forEach((p) => {
              ;(byTenant[user.Tenant] ??= []).push({
                userID: p.MailboxUPN,
                permissions: [
                  { UserID: user.User, PermissionLevel: p.AccessRights, Modification: 'Remove' },
                ],
              })
            })
        })
        // Array return => one POST per tenant, so AllTenants selections work
        return Object.entries(byTenant).map(([tenantFilter, mailboxRequests]) => ({
          mailboxRequests,
          tenantFilter,
        }))
      },
    },
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
        actions={byUser ? byUserActions : byMailboxActions}
        cardButton={pageActions}
        offCanvas={null}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
