import { Book, LaptopChromebook } from '@mui/icons-material'
import {
  DocumentDuplicateIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const assignmentModeOptions = [
  { label: 'Replace existing assignments', value: 'replace' },
  { label: 'Append to existing assignments', value: 'append' },
]

const assignmentFilterTypeOptions = [
  { label: 'Include - Apply policy to devices matching filter', value: 'include' },
  { label: 'Exclude - Apply policy to devices NOT matching filter', value: 'exclude' },
]

const assignmentDirectionOptions = [
  { label: 'Include these group(s)', value: 'include' },
  { label: 'Exclude these group(s)', value: 'exclude' },
]

/**
 * Get assignment actions for Intune policies
 * @param {string} tenant - The tenant filter
 * @param {string} policyType - The policy type (URLName, deviceCompliancePolicies, etc.)
 * @param {object} options - Additional options
 * @param {string} options.platformType - Platform type for app protection policies (deviceAppManagement)
 * @param {boolean} options.includeCreateTemplate - Whether to include create template action (default: true)
 * @param {boolean} options.includeRename - Whether to include the edit name/description action (default: true)
 * @param {boolean} options.includeClone - Whether to include the clone policy action (default: true)
 * @param {boolean} options.includeDelete - Whether to include delete action (default: true)
 * @param {string} options.deleteUrlName - URLName for delete action (default: same as policyType)
 * @param {object} options.templateData - Data for template creation
 * @returns {Array} Array of action objects
 */
export const useCippIntunePolicyActions = (tenant, policyType, options = {}) => {
  const {
    platformType = null,
    includeCreateTemplate = true,
    includeRename = true,
    includeClone = true,
    includeDelete = true,
    deleteUrlName = policyType,
    templateData = null,
  } = options

  // Group picker (by ID) reused for both include and exclude selection
  const getGroupPickerField = (name, label, required) => ({
    type: 'autoComplete',
    name,
    label,
    multiple: true,
    creatable: false,
    allowResubmit: true,
    ...(required && { validators: { required: 'Please select at least one group' } }),
    api: {
      url: '/api/ListGraphRequest',
      dataKey: 'Results',
      queryKey: `ListPolicyAssignmentGroups-${tenant}`,
      labelField: (group) => (group.id ? `${group.displayName} (${group.id})` : group.displayName),
      valueField: 'id',
      addedField: {
        description: 'description',
      },
      data: {
        Endpoint: 'groups',
        manualPagination: true,
        $select: 'id,displayName,description',
        $orderby: 'displayName',
        $top: 999,
        $count: true,
      },
    },
  })

  // Assignment mode + optional device filter, shared by every assign action.
  const getOptionsAndFilterFields = (modeHelperText) => [
    {
      type: 'heading',
      label: 'Assignment options',
    },
    {
      type: 'radio',
      name: 'assignmentMode',
      label: 'Assignment mode',
      options: assignmentModeOptions,
      defaultValue: 'replace',
      // Re-validate the Custom Group picker (no-op for broad actions, which have no groupTargets).
      validators: { deps: ['groupTargets'] },
      helperText:
        modeHelperText ||
        'Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups.',
    },
    {
      type: 'heading',
      label: 'Device filter (optional)',
    },
    {
      type: 'autoComplete',
      name: 'assignmentFilter',
      label: 'Assignment Filter (Optional)',
      multiple: false,
      creatable: false,
      api: {
        url: '/api/ListAssignmentFilters',
        queryKey: `ListAssignmentFilters-${tenant}`,
        labelField: (filter) => filter.displayName,
        valueField: 'displayName',
      },
    },
    {
      type: 'radio',
      name: 'assignmentFilterType',
      label: 'Assignment Filter Mode',
      options: assignmentFilterTypeOptions,
      defaultValue: 'include',
      helperText: 'Choose whether to include or exclude devices matching the filter.',
      condition: { field: 'assignmentFilter', compareType: 'hasValue', clearOnHide: false },
    },
  ]

  // All Users / All Devices / Globally: fixed target, with an optional exclude-groups picker.
  const getBroadAssignFields = () => [
    {
      type: 'heading',
      label: 'Exclude groups (optional)',
    },
    getGroupPickerField('excludeGroupTargets', 'Exclude group(s)', false),
    ...getOptionsAndFilterFields(),
  ]

  // Custom Group: one picker + a radio choosing whether those groups are included or excluded.
  const getCustomGroupFields = () => [
    {
      type: 'heading',
      label: 'Target groups',
    },
    {
      ...getGroupPickerField('groupTargets', 'Group(s)', false),
      helperText: 'Leave empty with Exclude + Replace to remove all exclusions (keeps includes).',
      validators: {
        // Required, except Exclude + Replace where an empty selection clears all exclusions.
        validate: (value, formValues) => {
          if (
            formValues?.assignmentDirection === 'exclude' &&
            (formValues?.assignmentMode || 'replace') === 'replace'
          ) {
            return true
          }
          return (Array.isArray(value) && value.length > 0) || 'Please select at least one group'
        },
      },
    },
    {
      type: 'radio',
      name: 'assignmentDirection',
      label: 'Assignment direction',
      options: assignmentDirectionOptions,
      defaultValue: 'include',
      // Re-validate the picker so the empty-allowed rule updates when direction changes.
      validators: { deps: ['groupTargets'] },
      helperText:
        'Include assigns to these groups; Exclude excludes them. Replace updates only this direction and keeps the other (and All Users/All Devices) intact.',
    },
    ...getOptionsAndFilterFields(
      'Replace updates only the selected direction and keeps the other direction plus All Users/All Devices. Append adds the selected groups to existing assignments.'
    ),
  ]

  const getCustomDataFormatter = (assignTo) => (row, action, formData) => {
    const rows = Array.isArray(row) ? row : [row]
    return rows.map((item) => ({
      tenantFilter: tenant === 'AllTenants' && item?.Tenant ? item.Tenant : tenant,
      ID: item?.id,
      type: item?.URLName || policyType,
      ...(platformType && { platformType }),
      AssignTo: assignTo,
      assignmentMode: formData?.assignmentMode || 'replace',
      ExcludeGroupIds: (formData?.excludeGroupTargets || []).map((g) => g.value).filter(Boolean),
      ExcludeGroupNames: (formData?.excludeGroupTargets || []).map((g) => g.label).filter(Boolean),
      AssignmentFilterName: formData?.assignmentFilter?.value || null,
      AssignmentFilterType: formData?.assignmentFilter?.value
        ? formData?.assignmentFilterType || 'include'
        : null,
    }))
  }

  const getCustomDataFormatterForGroups = () => (row, action, formData) => {
    const rows = Array.isArray(row) ? row : [row]
    const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : []
    const isExclude = formData?.assignmentDirection === 'exclude'
    const ids = selectedGroups.map((group) => group.value).filter(Boolean)
    const names = selectedGroups.map((group) => group.label).filter(Boolean)
    return rows.map((item) => ({
      tenantFilter: tenant === 'AllTenants' && item?.Tenant ? item.Tenant : tenant,
      ID: item?.id,
      type: item?.URLName || policyType,
      ...(platformType && { platformType }),
      GroupIds: isExclude ? [] : ids,
      GroupNames: isExclude ? [] : names,
      ExcludeGroupIds: isExclude ? ids : [],
      ExcludeGroupNames: isExclude ? names : [],
      assignmentDirection: formData?.assignmentDirection || 'include',
      assignmentMode: formData?.assignmentMode || 'replace',
      AssignmentFilterName: formData?.assignmentFilter?.value || null,
      AssignmentFilterType: formData?.assignmentFilter?.value
        ? formData?.assignmentFilterType || 'include'
        : null,
    }))
  }

  const actions = []

  // Create template action
  if (includeCreateTemplate) {
    actions.push({
      label: 'Create template based on policy',
      type: 'POST',
      url: '/api/AddIntuneTemplate',
      data: templateData || {
        ID: 'id',
        URLName: policyType === 'URLName' ? 'URLName' : policyType,
      },
      confirmText: 'Are you sure you want to create a template based on this policy?',
      icon: <Book />,
      color: 'info',
      multiPost: false,
    })
  }

  // Edit name and description action
  if (includeRename) {
    actions.push({
      label: 'Edit Name & Description',
      type: 'POST',
      url: '/api/EditIntunePolicy',
      multiPost: false,
      icon: <PencilIcon />,
      color: 'info',
      data: {
        ID: 'id',
        policyType: policyType === 'URLName' ? 'URLName' : policyType,
        ...(platformType && { platformType: '!deviceAppManagement' }),
      },
      fields: [
        {
          type: 'textField',
          name: 'newDisplayName',
          label: 'Display Name',
        },
        {
          type: 'textField',
          name: 'description',
          label: 'Description',
        },
      ],
      defaultvalues: (row) => ({
        newDisplayName: row.displayName,
        description: row.description,
      }),
      confirmText: 'Enter the new name and description for this policy.',
    })
  }

  // Clone policy action
  if (includeClone) {
    actions.push({
      label: 'Clone Policy',
      type: 'POST',
      url: '/api/AddIntunePolicyClone',
      multiPost: false,
      icon: <DocumentDuplicateIcon />,
      color: 'info',
      data: templateData || {
        ID: 'id',
        URLName: policyType === 'URLName' ? 'URLName' : policyType,
      },
      fields: [
        {
          type: 'textField',
          name: 'newDisplayName',
          label: 'New Display Name',
          validators: { required: 'Please enter a name for the cloned policy' },
        },
        {
          type: 'textField',
          name: 'newDescription',
          label: 'Description',
        },
      ],
      defaultvalues: (row) => ({
        newDisplayName: row?.displayName ? `${row.displayName} - Copy` : '',
        newDescription: row?.description ?? '',
      }),
      confirmText:
        'Enter a name for the cloned policy. The name must be different from the original policy and assignments are not copied to the clone.',
    })
  }

  // Assign to All Users
  actions.push({
    label: 'Assign to All Users',
    type: 'POST',
    url: '/api/ExecAssignPolicy',
    allowResubmit: true,
    data: {
      AssignTo: 'allLicensedUsers',
      ID: 'id',
      type: policyType === 'URLName' ? 'URLName' : policyType,
      ...(platformType && { platformType: '!deviceAppManagement' }),
    },
    multiPost: false,
    fields: getBroadAssignFields(),
    customDataformatter: getCustomDataFormatter('allLicensedUsers'),
    confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
    icon: <UserIcon />,
    color: 'info',
  })

  // Assign to All Devices
  actions.push({
    label: 'Assign to All Devices',
    type: 'POST',
    url: '/api/ExecAssignPolicy',
    allowResubmit: true,
    data: {
      AssignTo: 'AllDevices',
      ID: 'id',
      type: policyType === 'URLName' ? 'URLName' : policyType,
      ...(platformType && { platformType: '!deviceAppManagement' }),
    },
    multiPost: false,
    fields: getBroadAssignFields(),
    customDataformatter: getCustomDataFormatter('AllDevices'),
    confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
    icon: <LaptopChromebook />,
    color: 'info',
  })

  // Assign Globally (All Users / All Devices)
  actions.push({
    label: 'Assign Globally (All Users / All Devices)',
    type: 'POST',
    url: '/api/ExecAssignPolicy',
    allowResubmit: true,
    data: {
      AssignTo: 'AllDevicesAndUsers',
      ID: 'id',
      type: policyType === 'URLName' ? 'URLName' : policyType,
      ...(platformType && { platformType: '!deviceAppManagement' }),
    },
    multiPost: false,
    fields: getBroadAssignFields(),
    customDataformatter: getCustomDataFormatter('AllDevicesAndUsers'),
    confirmText: 'Are you sure you want to assign "[displayName]" to all users and devices?',
    icon: <GlobeAltIcon />,
    color: 'info',
  })

  // Assign to Custom Group
  actions.push({
    label: 'Assign to Custom Group',
    type: 'POST',
    url: '/api/ExecAssignPolicy',
    allowResubmit: true,
    icon: <UserGroupIcon />,
    color: 'info',
    confirmText: 'Select the target groups for "[displayName]".',
    multiPost: false,
    fields: getCustomGroupFields(),
    customDataformatter: getCustomDataFormatterForGroups(),
  })

  // Delete action
  if (includeDelete) {
    actions.push({
      label: 'Delete Policy',
      type: 'POST',
      url: '/api/RemovePolicy',
      data: {
        ID: 'id',
        URLName: deleteUrlName === 'URLName' ? 'URLName' : deleteUrlName,
      },
      confirmText: 'Are you sure you want to delete this policy?',
      icon: <TrashIcon />,
      color: 'danger',
    })
  }

  return actions
}
