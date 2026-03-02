import { Book, LaptopChromebook } from "@mui/icons-material";
import { GlobeAltIcon, TrashIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const assignmentModeOptions = [
  { label: "Replace existing assignments", value: "replace" },
  { label: "Append to existing assignments", value: "append" },
];

const assignmentFilterTypeOptions = [
  { label: "Include - Apply policy to devices matching filter", value: "include" },
  { label: "Exclude - Apply policy to devices NOT matching filter", value: "exclude" },
];

/**
 * Get assignment actions for Intune policies
 * @param {string} tenant - The tenant filter
 * @param {string} policyType - The policy type (URLName, deviceCompliancePolicies, etc.)
 * @param {object} options - Additional options
 * @param {string} options.platformType - Platform type for app protection policies (deviceAppManagement)
 * @param {boolean} options.includeCreateTemplate - Whether to include create template action (default: true)
 * @param {boolean} options.includeDelete - Whether to include delete action (default: true)
 * @param {string} options.deleteUrlName - URLName for delete action (default: same as policyType)
 * @param {object} options.templateData - Data for template creation
 * @returns {Array} Array of action objects
 */
export const useCippIntunePolicyActions = (tenant, policyType, options = {}) => {
  const {
    platformType = null,
    includeCreateTemplate = true,
    includeDelete = true,
    deleteUrlName = policyType,
    templateData = null,
  } = options;

  const getAssignmentFields = () => [
    {
      type: "radio",
      name: "assignmentMode",
      label: "Assignment mode",
      options: assignmentModeOptions,
      defaultValue: "replace",
      helperText:
        "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups.",
    },
    {
      type: "autoComplete",
      name: "assignmentFilter",
      label: "Assignment Filter (Optional)",
      multiple: false,
      creatable: false,
      api: {
        url: "/api/ListAssignmentFilters",
        queryKey: `ListAssignmentFilters-${tenant}`,
        labelField: (filter) => filter.displayName,
        valueField: "displayName",
      },
    },
    {
      type: "radio",
      name: "assignmentFilterType",
      label: "Assignment Filter Mode",
      options: assignmentFilterTypeOptions,
      defaultValue: "include",
      helperText: "Choose whether to include or exclude devices matching the filter.",
    },
  ];

  const getCustomDataFormatter = (assignTo) => (row, action, formData) => {
    const rows = Array.isArray(row) ? row : [row];
    return rows.map((item) => ({
      tenantFilter: tenant === "AllTenants" && item?.Tenant ? item.Tenant : tenant,
      ID: item?.id,
      type: item?.URLName || policyType,
      ...(platformType && { platformType }),
      AssignTo: assignTo,
      assignmentMode: formData?.assignmentMode || "replace",
      AssignmentFilterName: formData?.assignmentFilter?.value || null,
      AssignmentFilterType: formData?.assignmentFilter?.value
        ? formData?.assignmentFilterType || "include"
        : null,
    }));
  };

  const getCustomDataFormatterForGroups = () => (row, action, formData) => {
    const rows = Array.isArray(row) ? row : [row];
    const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : [];
    return rows.map((item) => ({
      tenantFilter: tenant === "AllTenants" && item?.Tenant ? item.Tenant : tenant,
      ID: item?.id,
      type: item?.URLName || policyType,
      ...(platformType && { platformType }),
      GroupIds: selectedGroups.map((group) => group.value).filter(Boolean),
      GroupNames: selectedGroups.map((group) => group.label).filter(Boolean),
      assignmentMode: formData?.assignmentMode || "replace",
      AssignmentFilterName: formData?.assignmentFilter?.value || null,
      AssignmentFilterType: formData?.assignmentFilter?.value
        ? formData?.assignmentFilterType || "include"
        : null,
    }));
  };

  const actions = [];

  // Create template action
  if (includeCreateTemplate) {
    actions.push({
      label: "Create template based on policy",
      type: "POST",
      url: "/api/AddIntuneTemplate",
      data: templateData || {
        ID: "id",
        URLName: policyType === "URLName" ? "URLName" : policyType,
      },
      confirmText: "Are you sure you want to create a template based on this policy?",
      icon: <Book />,
      color: "info",
      multiPost: false,
    });
  }

  // Assign to All Users
  actions.push({
    label: "Assign to All Users",
    type: "POST",
    url: "/api/ExecAssignPolicy",
    data: {
      AssignTo: "allLicensedUsers",
      ID: "id",
      type: policyType === "URLName" ? "URLName" : policyType,
      ...(platformType && { platformType: "!deviceAppManagement" }),
    },
    multiPost: false,
    fields: getAssignmentFields(),
    customDataformatter: getCustomDataFormatter("allLicensedUsers"),
    confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
    icon: <UserIcon />,
    color: "info",
  });

  // Assign to All Devices
  actions.push({
    label: "Assign to All Devices",
    type: "POST",
    url: "/api/ExecAssignPolicy",
    data: {
      AssignTo: "AllDevices",
      ID: "id",
      type: policyType === "URLName" ? "URLName" : policyType,
      ...(platformType && { platformType: "!deviceAppManagement" }),
    },
    multiPost: false,
    fields: getAssignmentFields(),
    customDataformatter: getCustomDataFormatter("AllDevices"),
    confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
    icon: <LaptopChromebook />,
    color: "info",
  });

  // Assign Globally (All Users / All Devices)
  actions.push({
    label: "Assign Globally (All Users / All Devices)",
    type: "POST",
    url: "/api/ExecAssignPolicy",
    data: {
      AssignTo: "AllDevicesAndUsers",
      ID: "id",
      type: policyType === "URLName" ? "URLName" : policyType,
      ...(platformType && { platformType: "!deviceAppManagement" }),
    },
    multiPost: false,
    fields: getAssignmentFields(),
    customDataformatter: getCustomDataFormatter("AllDevicesAndUsers"),
    confirmText: 'Are you sure you want to assign "[displayName]" to all users and devices?',
    icon: <GlobeAltIcon />,
    color: "info",
  });

  // Assign to Custom Group
  actions.push({
    label: "Assign to Custom Group",
    type: "POST",
    url: "/api/ExecAssignPolicy",
    icon: <UserGroupIcon />,
    color: "info",
    confirmText: 'Select the target groups for "[displayName]".',
    multiPost: false,
    fields: [
      {
        type: "autoComplete",
        name: "groupTargets",
        label: "Group(s)",
        multiple: true,
        creatable: false,
        allowResubmit: true,
        validators: { required: "Please select at least one group" },
        api: {
          url: "/api/ListGraphRequest",
          dataKey: "Results",
          queryKey: `ListPolicyAssignmentGroups-${tenant}`,
          labelField: (group) =>
            group.id ? `${group.displayName} (${group.id})` : group.displayName,
          valueField: "id",
          addedField: {
            description: "description",
          },
          data: {
            Endpoint: "groups",
            manualPagination: true,
            $select: "id,displayName,description",
            $orderby: "displayName",
            $top: 999,
            $count: true,
          },
        },
      },
      ...getAssignmentFields(),
    ],
    customDataformatter: getCustomDataFormatterForGroups(),
  });

  // Delete action
  if (includeDelete) {
    actions.push({
      label: "Delete Policy",
      type: "POST",
      url: "/api/RemovePolicy",
      data: {
        ID: "id",
        URLName: deleteUrlName === "URLName" ? "URLName" : deleteUrlName,
      },
      confirmText: "Are you sure you want to delete this policy?",
      icon: <TrashIcon />,
      color: "danger",
    });
  }

  return actions;
};
