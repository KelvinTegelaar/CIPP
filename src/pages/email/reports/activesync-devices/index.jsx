import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'

const Page = () => {
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListActiveSyncDevices',
    queryKey: 'ListActiveSyncDevices',
    cacheName: 'MobileDevices',
    syncTitle: 'Sync Mobile Devices',
    allowToggle: true,
    defaultCached: false,
    serverPagination: true,
  })

  const actions = [
    {
      label: 'Allow Device',
      type: 'POST',
      icon: <CippIcons.CheckCircle />,
      url: '/api/ExecMailboxMobileDevices',
      data: {
        Userid: 'primarySmtpAddress',
        deviceid: 'deviceID',
        guid: 'Guid',
        Quarantine: false,
        Delete: false,
      },
      confirmText:
        'Are you sure you want to allow the device [deviceFriendlyName] for [userDisplayName] ([primarySmtpAddress])?',
      multiPost: false,
      condition: (row) => row.deviceAccessState !== 'Allowed',
    },
    {
      label: 'Block Device',
      type: 'POST',
      icon: <CippIcons.Block />,
      url: '/api/ExecMailboxMobileDevices',
      data: {
        Userid: 'primarySmtpAddress',
        deviceid: 'deviceID',
        guid: 'Guid',
        Quarantine: true,
        Delete: false,
      },
      confirmText:
        'Are you sure you want to block the device [deviceFriendlyName] for [userDisplayName] ([primarySmtpAddress])?',
      multiPost: false,
      condition: (row) => row.deviceAccessState !== 'Blocked',
    },
    {
      label: 'Delete Device',
      type: 'POST',
      icon: <CippIcons.Delete />,
      url: '/api/ExecMailboxMobileDevices',
      data: {
        Userid: 'primarySmtpAddress',
        deviceid: 'deviceID',
        guid: 'Guid',
        Quarantine: false,
        Delete: true,
      },
      confirmText:
        'Are you sure you want to delete the device [deviceFriendlyName] for [userDisplayName] ([primarySmtpAddress])? This action cannot be undone.',
      multiPost: false,
    },
  ]

  return (
    <>
      <CippTablePage
        title="ActiveSync Devices"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        dataSourceControls={reportDB.controls}
        filters={[
          {
            filterName: 'Quarantined',
            value: [{ id: 'deviceAccessState', value: 'Quarantined' }],
            type: 'column',
          },
          {
            filterName: 'Blocked',
            value: [{ id: 'deviceAccessState', value: 'Blocked' }],
            type: 'column',
          },
        ]}
        actions={actions}
        offCanvas={{
          extendedInfoFields: [
            'userDisplayName',
            'primarySmtpAddress',
            'deviceFriendlyName',
            'deviceModel',
            'deviceOS',
            'deviceType',
            'clientType',
            'clientVersion',
            'deviceAccessState',
            'deviceAccessStateReason',
            'deviceAccessControlRule',
            'mailboxAccessList',
            'firstSyncTime',
            'lastSyncAttemptTime',
            'lastSuccessSync',
            'syncInfoNote',
            'deviceID',
          ],
          actions: actions,
        }}
        simpleColumns={[
          ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
          'userDisplayName',
          'primarySmtpAddress',
          'deviceFriendlyName',
          'deviceModel',
          'deviceOS',
          'deviceType',
          'clientType',
          'clientVersion',
          'deviceAccessState',
          'deviceAccessStateReason',
          'mailboxAccessList',
          'firstSyncTime',
          'lastSyncAttemptTime',
          'lastSuccessSync',
          ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
        ]}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout tenantGroupSupport={true}>{page}</DashboardLayout>
)

export default Page
