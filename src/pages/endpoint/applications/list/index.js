import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog.jsx";
import { GlobeAltIcon, TrashIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { LaptopMac, Sync, BookmarkAdd, CloudDone, Bolt } from "@mui/icons-material";
import { CippApplicationDeployDrawer } from "../../../../components/CippComponents/CippApplicationDeployDrawer";
import { Button, Chip, SvgIcon, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useSettings } from "../../../../hooks/use-settings.js";
import { useDialog } from "../../../../hooks/use-dialog.js";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";
import { useEffect, useState } from "react";

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

const mapOdataToAppType = (odataType) => {
  if (!odataType) return "win32ScriptApp";
  const type = odataType.toLowerCase();
  if (type.includes("wingetapp")) return "StoreApp";
  if (type.includes("win32lobapp")) return "chocolateyApp";
  if (type.includes("officesuiteapp")) return "officeApp";
  return "win32ScriptApp";
};

const Page = () => {
  const pageTitle = "Applications";
  const vppSyncDialog = useDialog();
  const cacheSyncDialog = useDialog();
  const tenant = useSettings().currentTenant;
  const isAllTenants = tenant === "AllTenants";
  const [syncQueueId, setSyncQueueId] = useState(null);
  const [useReportDB, setUseReportDB] = useState(isAllTenants);

  useEffect(() => {
    setUseReportDB(tenant === "AllTenants");
  }, [tenant]);

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

  // Builds a customDataformatter that handles both single-row and bulk (array) inputs.
  const makeAssignFormatter = (getRowData) => (row, action, formData) => {
    const formatRow = (singleRow) => {
      const tenantFilterValue =
        tenant === "AllTenants" && singleRow?.Tenant ? singleRow.Tenant : tenant;
      return {
        tenantFilter: tenantFilterValue,
        ID: singleRow?.id,
        AppType: getAppAssignmentSettingsType(singleRow?.["@odata.type"]),
        AssignmentFilterName: formData?.assignmentFilter?.value || null,
        AssignmentFilterType: formData?.assignmentFilter?.value
          ? formData?.assignmentFilterType || "include"
          : null,
        ...getRowData(singleRow, formData),
      };
    };
    return Array.isArray(row) ? row.map(formatRow) : formatRow(row);
  };

  const assignmentFields = [
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
  ];

  const actions = [
    {
      label: "Assign to All Users",
      type: "POST",
      url: "/api/ExecAssignApp",
      fields: assignmentFields,
      customDataformatter: makeAssignFormatter((_singleRow, formData) => ({
        AssignTo: "AllUsers",
        Intent: formData?.Intent || "Required",
        assignmentMode: formData?.assignmentMode || "replace",
      })),
      confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
      icon: <UserIcon />,
      color: "info",
    },
    {
      label: "Assign to All Devices",
      type: "POST",
      url: "/api/ExecAssignApp",
      fields: assignmentFields,
      customDataformatter: makeAssignFormatter((_singleRow, formData) => ({
        AssignTo: "AllDevices",
        Intent: formData?.Intent || "Required",
        assignmentMode: formData?.assignmentMode || "replace",
      })),
      confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
      icon: <LaptopMac />,
      color: "info",
    },
    {
      label: "Assign Globally (All Users / All Devices)",
      type: "POST",
      url: "/api/ExecAssignApp",
      fields: assignmentFields,
      customDataformatter: makeAssignFormatter((_singleRow, formData) => ({
        AssignTo: "AllDevicesAndUsers",
        Intent: formData?.Intent || "Required",
        assignmentMode: formData?.assignmentMode || "replace",
      })),
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
      customDataformatter: makeAssignFormatter((_singleRow, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : [];
        return {
          GroupIds: selectedGroups.map((group) => group.value).filter(Boolean),
          GroupNames: selectedGroups.map((group) => group.label).filter(Boolean),
          Intent: formData?.assignmentIntent || "Required",
          AssignmentMode: formData?.assignmentMode || "replace",
        };
      }),
    },
    {
      label: "Save as Template",
      type: "POST",
      url: "/api/AddAppTemplate",
      icon: <BookmarkAdd />,
      color: "info",
      fields: [
        {
          type: "textField",
          name: "displayName",
          label: "Template Name",
          validators: { required: "Template name is required" },
        },
        {
          type: "textField",
          name: "description",
          label: "Description",
        },
      ],
      customDataformatter: (row, action, formData) => {
        const rows = Array.isArray(row) ? row : [row];
        return {
          displayName: formData?.displayName,
          description: formData?.description || "",
          apps: rows.map((r) => ({
            appType: mapOdataToAppType(r["@odata.type"]),
            appName: r.displayName,
            config: JSON.stringify({
              ApplicationName: r.displayName,
              IntuneBody: r,
              assignTo: "On",
            }),
          })),
        };
      },
      confirmText: 'Save selected application(s) as a reusable template?',
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
    ...(useReportDB ? ["CacheTimestamp"] : []),
    ...(useReportDB && isAllTenants ? ["Tenant"] : []),
    "displayName",
    "AppAssignment",
    "AppExclude",
    "publishingState",
    "lastModifiedDateTime",
    "createdDateTime",
  ];

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      {useReportDB && (
        <>
          <CippQueueTracker
            queueId={syncQueueId}
            queryKey={`ListApps-${tenant}-true`}
            title="Intune Applications Sync"
          />
          <Button
            startIcon={
              <SvgIcon fontSize="small">
                <Sync />
              </SvgIcon>
            }
            size="xs"
            onClick={cacheSyncDialog.handleOpen}
          >
            Sync
          </Button>
        </>
      )}
      <Tooltip
        title={
          isAllTenants
            ? "AllTenants always uses cached data"
            : useReportDB
              ? "Showing cached data from the Reporting Database - click to switch to live"
              : "Showing live data - click to switch to cache"
        }
      >
        <span>
          <Chip
            icon={useReportDB ? <CloudDone /> : <Bolt />}
            label={useReportDB ? "Cached" : "Live"}
            color="primary"
            size="small"
            onClick={isAllTenants ? undefined : () => setUseReportDB((prev) => !prev)}
            clickable={!isAllTenants}
            disabled={isAllTenants}
            variant="outlined"
          />
        </span>
      </Tooltip>
    </Stack>,
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={`/api/ListApps${useReportDB ? "?UseReportDB=true" : ""}`}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        queryKey={`ListApps-${tenant}-${useReportDB}`}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippApplicationDeployDrawer />
            <Button onClick={vppSyncDialog.handleOpen} startIcon={<Sync />}>
              Sync VPP
            </Button>
            {pageActions}
          </Stack>
        }
      />
      <CippApiDialog
        title="Sync VPP Tokens"
        createDialog={vppSyncDialog}
        api={{
          type: "POST",
          url: "/api/ExecSyncVPP",
          data: {},
          confirmText: `Are you sure you want to sync Apple Volume Purchase Program (VPP) tokens? This will sync all VPP tokens for ${tenant}.`,
        }}
      />
      <CippApiDialog
        title="Sync Intune Applications Report"
        createDialog={cacheSyncDialog}
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run Intune applications cache sync for ${tenant}? This will update application data immediately.`,
          relatedQueryKeys: [`ListApps-${tenant}-true`],
          data: {
            Name: "IntuneApplications",
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result?.Metadata?.QueueId);
            }
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;
export default Page;
