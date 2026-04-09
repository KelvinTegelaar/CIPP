import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog.jsx";
import { GlobeAltIcon, TrashIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { LaptopMac, Sync } from "@mui/icons-material";
import { CippApplicationDeployDrawer } from "../../../../components/CippComponents/CippApplicationDeployDrawer";
import { Button, Box } from "@mui/material";
import { useSettings } from "../../../../hooks/use-settings.js";
import { useDialog } from "../../../../hooks/use-dialog.js";

const assignmentIntentOptions = [
  { label: "Required", value: "Required" },
  { label: "Available", value: "Available" },
  { label: "Available without enrollment", value: "AvailableWithoutEnrollment" },
  { label: "Uninstall", value: "Uninstall" },
];

const assignmentModeOptions = [
  { label: "Replace existing assignments", value: "replace" },
  { label: "Append to existing assignments", value: "append" },
];

const assignmentFilterTypeOptions = [
  { label: "Include - Apply to devices matching filter", value: "include" },
  { label: "Exclude - Apply to devices NOT matching filter", value: "exclude" },
];

const getAppAssignmentSettingsType = (odataType) => {
  if (!odataType || typeof odataType !== "string") {
    return undefined;
  }

  return odataType.replace("#microsoft.graph.", "").replace(/App$/i, "");
};

const Page = () => {
  const pageTitle = "Applications";
  const syncDialog = useDialog();
  const tenant = useSettings().currentTenant;

  const getAssignmentFilterFields = () => [
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

  const actions = [
    {
      label: "Assign to All Users",
      type: "POST",
      url: "/api/ExecAssignApp",
      fields: [
        {
          type: "radio",
          name: "Intent",
          label: "Assignment intent",
          options: assignmentIntentOptions,
          defaultValue: "Required",
          validators: { required: "Select an assignment intent" },
          helperText:
            "Available assigns to Company Portal, Required installs automatically, Uninstall removes the app, Available without enrollment exposes it without device enrollment.",
        },
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups/intents.",
        },
        ...getAssignmentFilterFields(),
      ],
      customDataformatter: (row, action, formData) => {
        const tenantFilterValue = tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant;
        return {
          tenantFilter: tenantFilterValue,
          ID: row?.id,
          AssignTo: "AllUsers",
          Intent: formData?.Intent || "Required",
          assignmentMode: formData?.assignmentMode || "replace",
          AssignmentFilterName: formData?.assignmentFilter?.value || null,
          AssignmentFilterType: formData?.assignmentFilter?.value
            ? formData?.assignmentFilterType || "include"
            : null,
        };
      },
      confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
      icon: <UserIcon />,
      color: "info",
    },
    {
      label: "Assign to All Devices",
      type: "POST",
      url: "/api/ExecAssignApp",
      fields: [
        {
          type: "radio",
          name: "Intent",
          label: "Assignment intent",
          options: assignmentIntentOptions,
          defaultValue: "Required",
          validators: { required: "Select an assignment intent" },
          helperText:
            "Available assigns to Company Portal, Required installs automatically, Uninstall removes the app, Available without enrollment exposes it without device enrollment.",
        },
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups/intents.",
        },
        ...getAssignmentFilterFields(),
      ],
      customDataformatter: (row, action, formData) => {
        const tenantFilterValue = tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant;
        return {
          tenantFilter: tenantFilterValue,
          ID: row?.id,
          AssignTo: "AllDevices",
          Intent: formData?.Intent || "Required",
          assignmentMode: formData?.assignmentMode || "replace",
          AssignmentFilterName: formData?.assignmentFilter?.value || null,
          AssignmentFilterType: formData?.assignmentFilter?.value
            ? formData?.assignmentFilterType || "include"
            : null,
        };
      },
      confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
      icon: <LaptopMac />,
      color: "info",
    },
    {
      label: "Assign Globally (All Users / All Devices)",
      type: "POST",
      url: "/api/ExecAssignApp",
      fields: [
        {
          type: "radio",
          name: "Intent",
          label: "Assignment intent",
          options: assignmentIntentOptions,
          defaultValue: "Required",
          validators: { required: "Select an assignment intent" },
          helperText:
            "Available assigns to Company Portal, Required installs automatically, Uninstall removes the app, Available without enrollment exposes it without device enrollment.",
        },
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups/intents.",
        },
        ...getAssignmentFilterFields(),
      ],
      customDataformatter: (row, action, formData) => {
        const tenantFilterValue = tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant;
        return {
          tenantFilter: tenantFilterValue,
          ID: row?.id,
          AssignTo: "AllDevicesAndUsers",
          Intent: formData?.Intent || "Required",
          assignmentMode: formData?.assignmentMode || "replace",
          AssignmentFilterName: formData?.assignmentFilter?.value || null,
          AssignmentFilterType: formData?.assignmentFilter?.value
            ? formData?.assignmentFilterType || "include"
            : null,
        };
      },
      confirmText: 'Are you sure you want to assign "[displayName]" to all users and devices?',
      icon: <GlobeAltIcon />,
      color: "info",
    },
    {
      label: "Assign to Custom Group",
      type: "POST",
      url: "/api/ExecAssignApp",
      icon: <UserGroupIcon />,
      color: "info",
      confirmText: 'Select the target groups and intent for "[displayName]".',
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
            queryKey: `ListAppAssignmentGroups-${tenant}`,
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
          name: "assignmentIntent",
          label: "Assignment intent",
          options: assignmentIntentOptions,
          defaultValue: "Required",
          validators: { required: "Select an assignment intent" },
          helperText:
            "Available assigns to Company Portal, Required installs automatically, Uninstall removes the app, Available without enrollment exposes it without device enrollment.",
        },
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups/intents.",
        },
        ...getAssignmentFilterFields(),
      ],
      customDataformatter: (row, action, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : [];
        const tenantFilterValue = tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant;
        return {
          tenantFilter: tenantFilterValue,
          ID: row?.id,
          GroupIds: selectedGroups.map((group) => group.value).filter(Boolean),
          GroupNames: selectedGroups.map((group) => group.label).filter(Boolean),
          Intent: formData?.assignmentIntent || "Required",
          AssignmentMode: formData?.assignmentMode || "replace",
          AppType: getAppAssignmentSettingsType(row?.["@odata.type"]),
          AssignmentFilterName: formData?.assignmentFilter?.value || null,
          AssignmentFilterType: formData?.assignmentFilter?.value
            ? formData?.assignmentFilterType || "include"
            : null,
        };
      },
    },
    {
      label: "Delete Application",
      type: "POST",
      url: "/api/RemoveApp",
      data: {
        ID: "id",
      },
      confirmText: 'Are you sure you want to delete "[displayName]"?',
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "installExperience.runAsAccount",
      "installExperience.deviceRestartBehavior",
      "isAssigned",
      "createdDateTime",
      "lastModifiedDateTime",
      "isFeatured",
      "publishingState",
      "dependentAppCount",
      "rules.0.ruleType",
      "rules.0.fileOrFolderName",
      "rules.0.path",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "AppAssignment",
    "AppExclude",
    "publishingState",
    "lastModifiedDateTime",
    "createdDateTime",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListApps"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <Box sx={{ display: "flex", gap: 1 }}>
            <CippApplicationDeployDrawer />
            <Button onClick={syncDialog.handleOpen} startIcon={<Sync />}>
              Sync VPP
            </Button>
          </Box>
        }
      />
      <CippApiDialog
        title="Sync VPP Tokens"
        createDialog={syncDialog}
        api={{
          type: "POST",
          url: "/api/ExecSyncVPP",
          data: {},
          confirmText: `Are you sure you want to sync Apple Volume Purchase Program (VPP) tokens? This will sync all VPP tokens for ${tenant}.`,
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
