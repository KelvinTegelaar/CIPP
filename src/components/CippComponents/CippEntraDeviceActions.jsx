import { CippIcons } from '../../utils/icon-registry'
import { useSettings } from '../../hooks/use-settings'
import { tenantScope } from '../../utils/tenant-selection'

const extensionAttributeOptions = Array.from({ length: 15 }, (_, i) => ({
  label: `Extension attribute ${i + 1}`,
  value: i + 1,
}))

// Shared by the Entra devices list and the device page; link actions only show on the list.
export const useCippEntraDeviceActions = () => {
  const tenantFilter = useSettings().currentTenant

  return [
    {
      label: 'View Device',
      link: '/identity/administration/devices/device?deviceId=[id]',
      icon: <CippIcons.EyeIcon />,
      color: 'info',
      multiPost: false,
    },
    {
      label: 'View in Entra',
      link: `https://entra.microsoft.com/${tenantFilter}/#view/Microsoft_AAD_Devices/DeviceDetailsMenuBlade/~/Properties/objectId/[id]/deviceId/`,
      icon: <CippIcons.Launch />,
      color: 'info',
      target: '_blank',
      multiPost: false,
      external: true,
    },
    {
      label: 'Enable Device',
      type: 'POST',
      url: '/api/ExecDeviceDelete',
      data: { ID: 'id', action: '!Enable' },
      confirmText: 'Are you sure you want to enable this device?',
      multiPost: false,
      condition: (row) => !row.accountEnabled,
      icon: <CippIcons.CheckCircleOutlined />,
    },
    {
      label: 'Disable Device',
      type: 'POST',
      url: '/api/ExecDeviceDelete',
      data: { ID: 'id', action: '!Disable' },
      confirmText: 'Are you sure you want to disable this device?',
      multiPost: false,
      condition: (row) => row.accountEnabled,
      icon: <CippIcons.Block />,
    },
    {
      label: 'Retrieve BitLocker Keys',
      type: 'POST',
      url: '/api/ExecGetRecoveryKey',
      data: { GUID: 'deviceId' },
      confirmText: 'Are you sure you want to retrieve the BitLocker keys?',
      multiPost: false,
      icon: <CippIcons.Key />,
    },
    {
      label: 'Retrieve LAPS password',
      type: 'POST',
      url: '/api/ExecGetLocalAdminPassword',
      data: { GUID: 'deviceId' },
      confirmText:
        'Are you sure you want to retrieve the local admin password for [displayName]?',
      multiPost: false,
      condition: (row) => row.operatingSystem === 'Windows',
      icon: <CippIcons.Password />,
    },
    {
      label: 'Add to Group',
      type: 'POST',
      url: '/api/EditGroup',
      icon: <CippIcons.GroupAdd />,
      customDataformatter: (row, action, formData) => {
        const rows = Array.isArray(row) ? row : [row]
        const addDevice = rows.map((r) => ({
          label: r.displayName,
          value: r.id,
        }))
        const groups = Array.isArray(formData.groupId)
          ? formData.groupId
          : [formData.groupId]
        return groups.map((group) => ({
          AddDevice: addDevice,
          ...tenantScope(rows[0]?.Tenant ?? tenantFilter),
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
      confirmText:
        'Are you sure you want to add [displayName] to the selected groups?',
      multiPost: false,
      allowResubmit: true,
      relatedQueryKeys: ['EntraDevice*'],
    },
    {
      label: 'Set Extension Attribute',
      type: 'POST',
      url: '/api/ExecSetDeviceExtensionAttribute',
      icon: <CippIcons.Edit />,
      data: { ID: 'id' },
      fields: [
        {
          type: 'autoComplete',
          name: 'Attribute',
          label: 'Extension attribute',
          multiple: false,
          creatable: false,
          options: extensionAttributeOptions,
          validators: { required: 'Select an extension attribute' },
        },
        {
          type: 'textField',
          name: 'Value',
          label: 'Value',
          helperText: 'Leave empty to clear the attribute.',
        },
      ],
      confirmText:
        'Set an extension attribute on [displayName]. These are often used in dynamic device group rules.',
      multiPost: false,
      relatedQueryKeys: ['EntraDevice*'],
    },
    {
      label: 'Delete Device',
      type: 'POST',
      url: '/api/ExecDeviceDelete',
      data: { ID: 'id', action: '!Delete' },
      confirmText: 'Are you sure you want to delete this device?',
      multiPost: false,
      icon: <CippIcons.Delete />,
    },
  ]
}

export const actionSearch = {
  page: '/identity/administration/devices/device',
  idParam: 'deviceId',
  useActions: useCippEntraDeviceActions,
}
