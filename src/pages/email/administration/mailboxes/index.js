import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippExchangeActions from '../../../../components/CippComponents/CippExchangeActions'
import { CippHVEUserDrawer } from '../../../../components/CippComponents/CippHVEUserDrawer.jsx'
import { CippSharedMailboxDrawer } from '../../../../components/CippComponents/CippSharedMailboxDrawer.jsx'
import { Sync, CloudDone, Bolt } from '@mui/icons-material'
import { Button, SvgIcon, Tooltip, Chip } from '@mui/material'
import { useSettings } from '../../../../hooks/use-settings'
import { Stack } from '@mui/system'
import { useDialog } from '../../../../hooks/use-dialog'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { useState, useEffect } from 'react'
import { CippQueueTracker } from '../../../../components/CippTable/CippQueueTracker'

const Page = () => {
  const pageTitle = 'Mailboxes'
  const currentTenant = useSettings().currentTenant
  const syncDialog = useDialog()
  const [syncQueueId, setSyncQueueId] = useState(null)

  const isAllTenants = currentTenant === 'AllTenants'
  const [useReportDB, setUseReportDB] = useState(true)

  useEffect(() => {
    setUseReportDB(true)
  }, [currentTenant])

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
  const simpleColumns = isAllTenants
    ? [
        'Tenant', // Tenant
        'displayName', // Display Name
        'recipientTypeDetails', // Recipient Type Details
        'UPN', // User Principal Name
        'primarySmtpAddress', // Primary Email Address
        'AdditionalEmailAddresses', // Additional Email Addresses
        'CacheTimestamp', // Cache Timestamp
      ]
    : [
        'displayName', // Display Name
        'recipientTypeDetails', // Recipient Type Details
        'UPN', // User Principal Name
        'primarySmtpAddress', // Primary Email Address
        'AdditionalEmailAddresses', // Additional Email Addresses
        'CacheTimestamp', // Cache Timestamp
      ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={`/api/ListMailboxes${useReportDB ? '?UseReportDB=true' : ''}`}
        queryKey={`ListMailboxes-${currentTenant}-${useReportDB}`}
        actions={CippExchangeActions()}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filterList}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippSharedMailboxDrawer />
            <CippHVEUserDrawer />
            {useReportDB && (
              <>
                <CippQueueTracker
                  queueId={syncQueueId}
                  queryKey={`ListMailboxes-${currentTenant}`}
                  title="Mailboxes Sync"
                />
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
              </>
            )}
            <Tooltip
              title={
                isAllTenants
                  ? 'AllTenants always uses cached data'
                  : useReportDB
                    ? 'Showing cached data — click to switch to live'
                    : 'Showing live data — click to switch to cache'
              }
            >
              <span>
                <Chip
                  icon={useReportDB ? <CloudDone /> : <Bolt />}
                  label={useReportDB ? 'Cached' : 'Live'}
                  color="primary"
                  size="small"
                  onClick={isAllTenants ? undefined : () => setUseReportDB((prev) => !prev)}
                  clickable={!isAllTenants}
                  disabled={isAllTenants}
                  variant="outlined"
                />
              </span>
            </Tooltip>
          </Stack>
        }
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Mailboxes"
        fields={[]}
        api={{
          type: 'GET',
          url: '/api/ExecCIPPDBCache',
          confirmText: `Run mailboxes cache sync for ${currentTenant}? This will update mailbox data immediately.`,
          relatedQueryKeys: [`ListMailboxes-${currentTenant}-true`],
          data: {
            Name: 'Mailboxes',
            Types: 'None',
          },
          onSuccess: (response) => {
            if (response?.Metadata?.QueueId) {
              setSyncQueueId(response.Metadata.QueueId)
            }
          },
        }}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>

export default Page
