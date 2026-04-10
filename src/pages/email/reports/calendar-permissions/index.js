import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useState } from 'react'
import { Button, Alert, SvgIcon, Tooltip, Chip } from '@mui/material'
import { useSettings } from '../../../../hooks/use-settings'
import { Stack } from '@mui/system'
import { Sync, CloudDone, Person, CalendarMonth } from '@mui/icons-material'
import { useDialog } from '../../../../hooks/use-dialog'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { CippQueueTracker } from '../../../../components/CippTable/CippQueueTracker'

const Page = () => {
  const [byUser, setByUser] = useState(true)
  const currentTenant = useSettings().currentTenant
  const syncDialog = useDialog()
  const [syncQueueId, setSyncQueueId] = useState(null)

  const isAllTenants = currentTenant === 'AllTenants'

  const columns = byUser
    ? [
        ...(isAllTenants ? ['Tenant'] : []),
        'User',
        'UserMailboxType',
        'Permissions',
        'MailboxCacheTimestamp',
        'PermissionCacheTimestamp',
      ]
    : [
        ...(isAllTenants ? ['Tenant'] : []),
        'CalendarUPN',
        'CalendarDisplayName',
        'CalendarType',
        'Permissions',
        'MailboxCacheTimestamp',
        'PermissionCacheTimestamp',
      ]

  // Compute apiData based on byUser directly (no useState needed)
  const apiData = {
    UseReportDB: true,
    ByUser: byUser,
  }

  const pageActions = [
    <Stack direction="row" spacing={1} alignItems="center" key="actions-stack">
      <CippQueueTracker
        queueId={syncQueueId}
        queryKey={`calendar-permissions-${currentTenant}-${byUser}`}
        title="Calendar Permissions Sync"
      />
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
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <Sync />
          </SvgIcon>
        }
        size="xs"
        onClick={syncDialog.handleOpen}
        disabled={isAllTenants}
      >
        Sync
      </Button>
      <Tooltip title="This page always uses cached data from the CIPP reporting database.">
        <span>
          <Chip
            icon={<CloudDone />}
            label="Cached"
            color="primary"
            size="small"
            disabled
            variant="outlined"
          />
        </span>
      </Tooltip>
    </Stack>,
  ]

  return (
    <>
      {currentTenant && currentTenant !== '' ? (
        <CippTablePage
          key={`calendar-permissions-${byUser}`}
          title="Calendar Permissions Report"
          apiUrl="/api/ListCalendarPermissions"
          queryKey={`calendar-permissions-${currentTenant}-${byUser}`}
          apiData={apiData}
          simpleColumns={columns}
          cardButton={pageActions}
          offCanvas={null}
        />
      ) : (
        <Alert severity="warning">Please select a tenant to view calendar permissions.</Alert>
      )}
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Calendar Permissions Cache"
        fields={[]}
        api={{
          type: 'GET',
          url: '/api/ExecCIPPDBCache',
          confirmText: `Run calendar permissions cache sync for ${currentTenant}? This will update mailbox and calendar permission data immediately.`,
          relatedQueryKeys: [`calendar-permissions-${currentTenant}-${byUser}`],
          data: {
            Name: 'Mailboxes',
            Types: 'CalendarPermissions',
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result.Metadata.QueueId)
            }
          },
        }}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
