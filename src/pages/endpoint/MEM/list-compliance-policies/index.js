import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Book, LaptopChromebook } from "@mui/icons-material";
import { GlobeAltIcon, TrashIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { PermissionButton } from "/src/utils/permissions.js";
import { CippPolicyDeployDrawer } from "/src/components/CippComponents/CippPolicyDeployDrawer.jsx";
import { useSettings } from "/src/hooks/use-settings.js";

const assignmentModeOptions = [
  { label: "Replace existing assignments", value: "replace" },
  { label: "Append to existing assignments", value: "append" },
];

const assignmentFilterTypeOptions = [
  { label: "Include - Apply policy to devices matching filter", value: "include" },
  { label: "Exclude - Apply policy to devices NOT matching filter", value: "exclude" },
];

const Page = () => {
  const pageTitle = "Intune Compliance Policies";
  const cardButtonPermissions = ["Endpoint.MEM.ReadWrite"];
  const tenant = useSettings().currentTenant;

  const actions = [
    {
      label: "Create template based on policy",
      type: "POST",
      url: "/api/AddIntuneTemplate",
      data: {
        ID: "id",
        ODataType: "@odata.type",
      },
      confirmText: "Are you sure you want to create a template based on this policy?",
      icon: <Book />,
      color: "info",
    },
    {
      label: "Assign to All Users",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      data: {
        AssignTo: "allLicensedUsers",
        ID: "id",
        type: "deviceCompliancePolicies",
      },
      fields: [
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups.",
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
      icon: <UserIcon />,
      color: "info",
    },
    {
      label: "Assign to All Devices",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      data: {
        AssignTo: "AllDevices",
        ID: "id",
        type: "deviceCompliancePolicies",
      },
      fields: [
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups.",
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
      icon: <LaptopChromebook />,
      color: "info",
    },
    {
      label: "Assign Globally (All Users / All Devices)",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      data: {
        AssignTo: "AllDevicesAndUsers",
        ID: "id",
        type: "deviceCompliancePolicies",
      },
      fields: [
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups.",
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all users and devices?',
      icon: <GlobeAltIcon />,
      color: "info",
    },
    {
      label: "Assign to Custom Group",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      icon: <UserGroupIcon />,
      color: "info",
      confirmText: 'Select the target groups for "[displayName]".',
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
      ],
      customDataformatter: (row, action, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : [];
        const tenantFilterValue = tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant;
        return {
          tenantFilter: tenantFilterValue,
          ID: row?.id,
          type: "deviceCompliancePolicies",
          GroupIds: selectedGroups.map((group) => group.value).filter(Boolean),
          GroupNames: selectedGroups.map((group) => group.label).filter(Boolean),
          assignmentMode: formData?.assignmentMode || "replace",
          AssignmentFilterName: formData?.assignmentFilter?.value || null,
          AssignmentFilterType: formData?.assignmentFilter?.value
            ? formData?.assignmentFilterType || "include"
            : null,
        };
      },
    },
    {
      label: "Delete Policy",
      type: "POST",
      url: "/api/RemovePolicy",
      data: {
        ID: "id",
        URLName: "deviceCompliancePolicies",
      },
      confirmText: "Are you sure you want to delete this policy?",
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime",
      "displayName",
      "lastModifiedDateTime",
      "PolicyTypeName",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "PolicyTypeName",
    "PolicyAssignment",
    "PolicyExclude",
    "description",
    "lastModifiedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListCompliancePolicies"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippPolicyDeployDrawer
          buttonText="Deploy Policy"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
