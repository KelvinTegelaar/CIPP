import { EyeIcon } from '@heroicons/react/24/outline'
import {
  Sync,
  RestartAlt,
  LocationOn,
  Password,
  PasswordOutlined,
  Key,
  Memory,
  Edit,
  Security,
  FindInPage,
  Shield,
  AutoMode,
  Recycling,
  ManageAccounts,
  GroupAdd,
} from '@mui/icons-material'

// Shared between the MEM devices list page and the View Device detail page.
// Link-type actions (View Device / View in Intune) render on the list page but are
// filtered out of the detail page's ActionsMenu (see components/actions-menu.js),
// so a single array is safe to reuse as-is.
export const getIntuneDeviceActions = ({ tenantFilter } = {}) => [
  {
    label: 'View Device',
    link: `/endpoint/MEM/devices/device?deviceId=[id]`,
    color: 'info',
    icon: <EyeIcon />,
    multiPost: false,
  },
  {
    label: 'View in Intune',
    link: `https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[id]`,
    color: 'info',
    icon: <EyeIcon />,
    target: '_blank',
    multiPost: false,
    external: true,
  },
  {
    label: 'Change Primary User',
    type: 'POST',
    icon: <ManageAccounts />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: '!users',
    },
    fields: [
      {
        type: 'autoComplete',
        name: 'user',
        label: 'Select User',
        multiple: false,
        creatable: false,
        api: {
          url: '/api/ListGraphRequest',
          data: {
            Endpoint: 'users',
            $select: 'id,displayName,userPrincipalName',
            $top: 999,
            $count: true,
          },
          queryKey: 'ListUsersAutoComplete',
          dataKey: 'Results',
          labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
          valueField: 'id',
          addedField: {
            userPrincipalName: 'userPrincipalName',
          },
          showRefresh: true,
        },
      },
    ],
    confirmText: 'Select the User to set as the primary user for [deviceName]',
  },
  {
    label: 'Add to Group',
    type: 'POST',
    icon: <GroupAdd />,
    url: '/api/EditGroup',
    customDataformatter: (row, action, formData) => {
      // Build the device list from selected devices - the backend resolves the Entra
      // directory object id from azureADDeviceId
      const rows = Array.isArray(row) ? row : [row]
      const addDevice = rows.map((r) => ({
        label: r.deviceName,
        value: r.azureADDeviceId,
        addedFields: {
          azureADDeviceId: r.azureADDeviceId,
          deviceName: r.deviceName,
        },
      }))

      // Handle multiple groups - return an array of requests (one per group)
      const selectedGroups = Array.isArray(formData.groupId) ? formData.groupId : [formData.groupId]

      return selectedGroups.map((group) => ({
        AddDevice: addDevice,
        tenantFilter: tenantFilter,
        groupId: group,
      }))
    },
    fields: [
      {
        type: 'autoComplete',
        name: 'groupId',
        label: 'Select groups to add the device to',
        multiple: true,
        creatable: false,
        validators: { required: 'Please select at least one group' },
        api: {
          url: '/api/ListGroups',
          labelField: (option) =>
            option?.calculatedGroupType
              ? `${option.displayName} (${option.calculatedGroupType})`
              : (option?.displayName ?? ''),
          valueField: 'id',
          addedField: {
            groupType: 'groupType',
            groupName: 'displayName',
          },
          queryKey: `groups-${tenantFilter}`,
          showRefresh: true,
        },
      },
    ],
    confirmText: 'Are you sure you want to add [deviceName] to the selected groups?',
    multiPost: false,
    allowResubmit: true,
  },
  {
    label: 'Rename Device',
    type: 'POST',
    icon: <Edit />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'setDeviceName',
    },
    confirmText: 'Enter the new name for the device',
    fields: [
      {
        type: 'textField',
        name: 'input',
        label: 'New Device Name',
        required: true,
      },
    ],
  },
  {
    label: 'Sync Device',
    type: 'POST',
    icon: <Sync />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'syncDevice',
    },
    confirmText: 'Are you sure you want to sync [deviceName]?',
  },
  {
    label: 'Reboot Device',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'rebootNow',
    },
    confirmText: 'Are you sure you want to reboot [deviceName]?',
  },
  {
    label: 'Locate Device',
    type: 'POST',
    icon: <LocationOn />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'locateDevice',
    },
    confirmText: 'Are you sure you want to locate [deviceName]?',
  },
  {
    label: 'Retrieve LAPS password',
    type: 'POST',
    icon: <Password />,
    url: '/api/ExecGetLocalAdminPassword',
    data: {
      GUID: 'azureADDeviceId',
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to retrieve the local admin password for [deviceName]?',
  },
  {
    label: 'Rotate Local Admin Password',
    type: 'POST',
    icon: <PasswordOutlined />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'RotateLocalAdminPassword',
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to rotate the password for [deviceName]?',
  },
  {
    label: 'Retrieve BIOS Password',
    type: 'POST',
    icon: <Memory />,
    url: '/api/ExecGetRecoveryKey',
    data: {
      // hardwarePasswordDetails is keyed on the Intune managedDevice id, not azureADDeviceId.
      GUID: 'id',
      RecoveryKeyType: '!BiosPassword',
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to retrieve the BIOS password for [deviceName]?',
  },
  {
    label: 'Retrieve BitLocker Keys',
    type: 'POST',
    icon: <Key />,
    url: '/api/ExecGetRecoveryKey',
    data: {
      GUID: 'azureADDeviceId',
      RecoveryKeyType: '!BitLocker',
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to retrieve the BitLocker keys for [deviceName]?',
  },
  {
    label: 'Retrieve FileVault Key',
    type: 'POST',
    icon: <Security />,
    url: '/api/ExecGetRecoveryKey',
    data: {
      GUID: 'id',
      RecoveryKeyType: '!FileVault',
    },
    condition: (row) => row.operatingSystem === 'macOS',
    confirmText: 'Are you sure you want to retrieve the FileVault key for [deviceName]?',
  },
  {
    label: 'Reset Passcode',
    type: 'POST',
    icon: <PasswordOutlined />,
    url: '/api/ExecDevicePasscodeAction',
    data: {
      GUID: 'id',
      Action: 'resetPasscode',
    },
    condition: (row) => row.operatingSystem === 'Android',
    confirmText:
      'Are you sure you want to reset the passcode for [deviceName]? A new passcode will be generated and displayed.',
  },
  {
    label: 'Remove Passcode',
    type: 'POST',
    icon: <Password />,
    url: '/api/ExecDevicePasscodeAction',
    data: {
      GUID: 'id',
      Action: 'resetPasscode',
    },
    condition: (row) => row.operatingSystem === 'iOS',
    confirmText:
      'Are you sure you want to remove the passcode from [deviceName]? This will remove the device passcode requirement.',
  },
  {
    label: 'Windows Defender Full Scan',
    type: 'POST',
    icon: <Security />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'WindowsDefenderScan',
      quickScan: false,
    },
    confirmText: 'Are you sure you want to perform a full scan on [deviceName]?',
  },
  {
    label: 'Windows Defender Quick Scan',
    type: 'POST',
    icon: <FindInPage />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'WindowsDefenderScan',
      quickScan: true,
    },
    confirmText: 'Are you sure you want to perform a quick scan on [deviceName]?',
  },
  {
    label: 'Update Windows Defender',
    type: 'POST',
    icon: <Shield />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'windowsDefenderUpdateSignatures',
    },
    confirmText:
      'Are you sure you want to update the Windows Defender signatures for [deviceName]?',
  },
  // This endpoint currently does not work, Graph just returns an error. Leaving this here for now in case it is fixed in the future. -Zac
  // {
  //   label: 'Generate logs and ship to MEM',
  //   type: 'POST',
  //   icon: <Archive />,
  //   url: '/api/ExecDeviceAction',
  //   data: {
  //     GUID: 'id',
  //     Action: 'createDeviceLogCollectionRequest',
  //   },
  //   condition: (row) => row.operatingSystem === 'Windows',
  //   confirmText:
  //     'Are you sure you want to generate logs for device [deviceName] and ship these to MEM?',
  // },
  {
    label: 'Fresh Start (Remove user data)',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'cleanWindowsDevice',
      keepUserData: false,
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to Fresh Start [deviceName]?',
  },
  {
    label: 'Fresh Start (Do not remove user data)',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'cleanWindowsDevice',
      keepUserData: true,
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to Fresh Start [deviceName]?',
  },
  {
    label: 'Wipe Device, keep enrollment data',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'cleanWindowsDevice',
      keepUserData: false,
      keepEnrollmentData: true,
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to wipe [deviceName], and retain enrollment data?',
  },
  {
    label: 'Wipe Device, remove enrollment data',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'cleanWindowsDevice',
      keepUserData: false,
      keepEnrollmentData: false,
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to wipe [deviceName], and remove enrollment data?',
  },
  {
    label: 'Wipe Device, keep enrollment data, and continue at powerloss',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'cleanWindowsDevice',
      keepEnrollmentData: true,
      keepUserData: false,
      useProtectedWipe: true,
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText:
      'Are you sure you want to wipe [deviceName]? This will retain enrollment data. Continuing at powerloss may cause boot issues if wipe is interrupted.',
  },
  {
    label: 'Wipe Device, remove enrollment data, and continue at powerloss',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'cleanWindowsDevice',
      keepEnrollmentData: false,
      keepUserData: false,
      useProtectedWipe: true,
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText:
      'Are you sure you want to wipe [deviceName]? This will also remove enrollment data. Continuing at powerloss may cause boot issues if wipe is interrupted.',
  },
  {
    label: 'Autopilot Reset',
    type: 'POST',
    icon: <AutoMode />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'wipe',
      keepUserData: 'false',
      keepEnrollmentData: 'true',
    },
    condition: (row) => row.operatingSystem === 'Windows',
    confirmText: 'Are you sure you want to Autopilot Reset [deviceName]?',
  },
  {
    label: 'Delete device',
    type: 'POST',
    icon: <Recycling />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'delete',
    },
    confirmText: 'Are you sure you want to delete [deviceName]?',
  },
  {
    label: 'Retire device',
    type: 'POST',
    icon: <Recycling />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'retire',
    },
    confirmText: 'Are you sure you want to retire [deviceName]?',
  },
]

// Scoped actions for Compromise Remediation Check 9 — Retire + full factory wipe
// (keepUserData/keepEnrollmentData false). Not the MEM cleanWindowsDevice "Wipe Device" variants.
export const getBecIntuneDeviceActions = ({ tenantFilter } = {}) => [
  {
    label: 'View Device',
    link: `/endpoint/MEM/devices/device?deviceId=[id]&tenantFilter=${tenantFilter}`,
    color: 'info',
    icon: <EyeIcon />,
    multiPost: false,
  },
  {
    label: 'View in Intune',
    link: `https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[id]`,
    color: 'info',
    icon: <EyeIcon />,
    target: '_blank',
    multiPost: false,
    external: true,
  },
  {
    label: 'Retire device',
    type: 'POST',
    icon: <Recycling />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'retire',
    },
    confirmText: 'Are you sure you want to retire [deviceName]?',
  },
  {
    label: 'Wipe device (remove enrollment)',
    type: 'POST',
    icon: <RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'wipe',
      keepUserData: false,
      keepEnrollmentData: false,
    },
    confirmText:
      'Are you sure you want to factory-wipe [deviceName]? This removes all data and Intune enrollment. This cannot be undone.',
  },
]
