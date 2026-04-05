import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Block, CheckCircle } from '@mui/icons-material'
import { TrashIcon } from '@heroicons/react/24/outline'

const Page = () => {
  const actions = [
    {
      label: 'Allow Device',
      type: 'GET',
      icon: <CheckCircle />,
      url: '/api/ExecMailboxMobileDevices',
      data: {
        Userid: 'userPrincipalName',
        deviceid: 'deviceID',
        guid: 'Guid',
        Quarantine: false,
        Delete: false,
      },
      confirmText:
        'Are you sure you want to allow the device [deviceFriendlyName] for [userPrincipalName]?',
      multiPost: false,
      condition: (row) => row.deviceAccessState !== 'Allowed',
    },
    {
      label: 'Block Device',
      type: 'GET',
      icon: <Block />,
      url: '/api/ExecMailboxMobileDevices',
      data: {
        Userid: 'userPrincipalName',
        deviceid: 'deviceID',
        guid: 'Guid',
        Quarantine: true,
        Delete: false,
      },
      confirmText:
        'Are you sure you want to block the device [deviceFriendlyName] for [userPrincipalName]?',
      multiPost: false,
      condition: (row) => row.deviceAccessState !== 'Blocked',
    },
    {
      label: 'Delete Device',
      type: 'GET',
      icon: <TrashIcon />,
      url: '/api/ExecMailboxMobileDevices',
      data: {
        Userid: 'userPrincipalName',
        deviceid: 'deviceID',
        guid: 'Guid',
        Quarantine: false,
        Delete: true,
      },
      confirmText:
        'Are you sure you want to delete the device [deviceFriendlyName] for [userPrincipalName]? This action cannot be undone.',
      multiPost: false,
    },
  ]

  return (
    <CippTablePage
      title="ActiveSync Devices"
      apiUrl="/api/ListActiveSyncDevices"
      actions={actions}
      offCanvas={{
        extendedInfoFields: [
          'userDisplayName',
          'userPrincipalName',
          'deviceFriendlyName',
          'deviceModel',
          'deviceOS',
          'deviceType',
          'clientType',
          'clientVersion',
          'deviceAccessState',
          'firstSyncTime',
          'lastSyncAttemptTime',
          'lastSuccessSync',
          'deviceID',
        ],
        actions: actions,
      }}
      simpleColumns={[
        'userDisplayName',
        'userPrincipalName',
        'deviceFriendlyName',
        'deviceModel',
        'deviceOS',
        'deviceType',
        'clientType',
        'clientVersion',
        'deviceAccessState',
        'firstSyncTime',
        'lastSyncAttemptTime',
        'lastSuccessSync',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>

export default Page
