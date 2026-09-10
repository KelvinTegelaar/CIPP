
import { CippIcons } from '../../utils/icon-registry'

// Shared between the MEM devices list page and the View Device detail page.
// Link-type actions (View Device / View in Intune) render on the list page but are
// filtered out of the detail page's ActionsMenu (see components/actions-menu.js),
// so a single array is safe to reuse as-is.
export const getIntuneDeviceActions = ({ tenantFilter } = {}) => [
  {
    label: 'View Device',
    link: `/endpoint/MEM/devices/device?deviceId=[id]`,
    pinned: true,
    color: 'info',
    icon: <CippIcons.EyeIcon />,
    multiPost: false,
  },
  {
    label: 'View in Intune',
    link: `https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[id]`,
    pinned: true,
    color: 'info',
    icon: <CippIcons.EyeIcon />,
    target: '_blank',
    multiPost: false,
    external: true,
  },
  {
    label: 'Change Primary User',
    type: 'POST',
    icon: <CippIcons.ManageAccounts />,
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
    icon: <CippIcons.GroupAdd />,
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
    icon: <CippIcons.Edit />,
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
    icon: <CippIcons.Sync />,
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
    icon: <CippIcons.RestartAlt />,
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
    icon: <CippIcons.LocationOn />,
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
    icon: <CippIcons.Password />,
    url: '/api/ExecGetLocalAdminPassword',
    data: {
      GUID: 'azureADDeviceId',
    },
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText: 'Are you sure you want to retrieve the local admin password for [deviceName]?',
  },
  {
    label: 'Rotate Local Admin Password',
    type: 'POST',
    icon: <CippIcons.PasswordOutlined />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'RotateLocalAdminPassword',
    },
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText: 'Are you sure you want to rotate the password for [deviceName]?',
  },
  {
    label: 'Retrieve BIOS Password',
    type: 'POST',
    icon: <CippIcons.Memory />,
    url: '/api/ExecGetRecoveryKey',
    data: {
      // hardwarePasswordDetails is keyed on the Intune managedDevice id, not azureADDeviceId.
      GUID: 'id',
      RecoveryKeyType: '!BiosPassword',
    },
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText: 'Are you sure you want to retrieve the BIOS password for [deviceName]?',
  },
  {
    label: 'Retrieve BitLocker Keys',
    type: 'POST',
    icon: <CippIcons.Key />,
    url: '/api/ExecGetRecoveryKey',
    data: {
      GUID: 'azureADDeviceId',
      RecoveryKeyType: '!BitLocker',
    },
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText: 'Are you sure you want to retrieve the BitLocker keys for [deviceName]?',
  },
  {
    label: 'Retrieve FileVault Key',
    type: 'POST',
    icon: <CippIcons.Security />,
    url: '/api/ExecGetRecoveryKey',
    data: {
      GUID: 'id',
      RecoveryKeyType: '!FileVault',
    },
    hideCondition: (row) => row.operatingSystem !== 'macOS',
    confirmText: 'Are you sure you want to retrieve the FileVault key for [deviceName]?',
  },
  {
    label: 'Reset Passcode',
    type: 'POST',
    icon: <CippIcons.PasswordOutlined />,
    url: '/api/ExecDevicePasscodeAction',
    data: {
      GUID: 'id',
      Action: 'resetPasscode',
    },
    hideCondition: (row) => row.operatingSystem !== 'Android',
    confirmText:
      'Are you sure you want to reset the passcode for [deviceName]? A new passcode will be generated and displayed.',
  },
  {
    label: 'Remove Passcode',
    type: 'POST',
    icon: <CippIcons.Password />,
    url: '/api/ExecDevicePasscodeAction',
    data: {
      GUID: 'id',
      Action: 'resetPasscode',
    },
    hideCondition: (row) => row.operatingSystem !== 'iOS',
    confirmText:
      'Are you sure you want to remove the passcode from [deviceName]? This will remove the device passcode requirement.',
  },
  {
    label: 'Windows Defender Full Scan',
    type: 'POST',
    icon: <CippIcons.Security />,
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
    icon: <CippIcons.FindInPage />,
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
    icon: <CippIcons.Shield />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'windowsDefenderUpdateSignatures',
    },
    confirmText:
      'Are you sure you want to update the Windows Defender signatures for [deviceName]?',
  },
  {
    label: 'Offboard from Defender for Endpoint',
    type: 'POST',
    icon: <CippIcons.RemoveModerator />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'azureADDeviceId',
      Action: 'offboardMDEDevice',
    },
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText:
      'Are you sure you want to offboard [deviceName] from Microsoft Defender for Endpoint? This queues an offboarding action via the MDE API and cannot be undone without re-onboarding the device.',
  },
  // This endpoint currently does not work, Graph just returns an error. Leaving this here for now in case it is fixed in the future. -Zac
  // {
  //   label: 'Generate logs and ship to MEM',
  //   type: 'POST',
  //   icon: <CippIcons.Archive />,
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
    label: 'Fresh Start',
    type: 'POST',
    icon: <CippIcons.RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'cleanWindowsDevice',
    },
    fields: [
      {
        type: 'radio',
        name: 'keepUserData',
        label: 'User Data',
        options: [
          { label: 'Keep user data', value: true },
          { label: 'Remove user data', value: false },
        ],
        validators: { required: 'Please select an option' },
      },
    ],
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText: 'Are you sure you want to Fresh Start [deviceName]?',
  },
  {
    label: 'Wipe Device',
    type: 'POST',
    icon: <CippIcons.RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'wipe',
      keepUserData: false,
    },
    fields: [
      {
        type: 'radio',
        name: 'keepEnrollmentData',
        label: 'Enrollment Data',
        options: [
          {
            label:
              'Keep enrollment data (Autopilot Reset — device re-provisions through Autopilot)',
            value: true,
          },
          { label: 'Remove enrollment data (full retirement)', value: false },
        ],
        validators: { required: 'Please select an option' },
      },
      {
        type: 'radio',
        name: 'useProtectedWipe',
        label: 'Wipe Type',
        options: [
          { label: 'Standard wipe', value: false },
          {
            label:
              'Protected wipe — resumes if interrupted; may leave the device unbootable if it fails',
            value: true,
          },
        ],
        validators: { required: 'Please select an option' },
      },
    ],
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText:
      'Are you sure you want to wipe [deviceName]? This removes all user data on the device. Use Fresh Start to keep user files.',
  },
  {
    label: 'Wipe Device',
    type: 'POST',
    icon: <CippIcons.RestartAlt />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'wipe',
    },
    fields: [
      {
        type: 'textField',
        name: 'macOsUnlockCode',
        label: 'Recovery PIN (optional, 6 digits)',
      },
    ],
    hideCondition: (row) => row.operatingSystem !== 'macOS',
    confirmText:
      'Are you sure you want to wipe [deviceName]? This erases all content and settings and cannot be undone. Intel Macs without a T2 security chip require the recovery PIN to unlock the device after the wipe. This removes all user data on the device.',
  },
  {
    label: 'Autopilot Reset',
    type: 'POST',
    icon: <CippIcons.AutoMode />,
    url: '/api/ExecDeviceAction',
    data: {
      GUID: 'id',
      Action: 'wipe',
      keepUserData: false,
      keepEnrollmentData: true,
    },
    hideCondition: (row) => row.operatingSystem !== 'Windows',
    confirmText:
      'Are you sure you want to Autopilot Reset [deviceName]? This wipes the device and keeps enrollment data, removes all user data on the device, and the device will re-provision through Windows Autopilot.',
  },
  {
    label: 'Delete Device',
    type: 'POST',
    icon: <CippIcons.Recycling />,
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
    icon: <CippIcons.Recycling />,
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
    pinned: true,
    color: 'info',
    icon: <CippIcons.EyeIcon />,
    multiPost: false,
  },
  {
    label: 'View in Intune',
    link: `https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[id]`,
    pinned: true,
    color: 'info',
    icon: <CippIcons.EyeIcon />,
    target: '_blank',
    multiPost: false,
    external: true,
  },
  {
    label: 'Retire device',
    type: 'POST',
    icon: <CippIcons.Recycling />,
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
    icon: <CippIcons.RestartAlt />,
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
