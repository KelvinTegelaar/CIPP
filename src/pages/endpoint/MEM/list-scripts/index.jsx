import { Layout as DashboardLayout } from "/src/layouts/index";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage";
import {
  TrashIcon,
  PencilIcon,
  UserIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "/src/store/toasts";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  DialogActions,
} from "@mui/material";
import { CippCodeBlock } from "/src/components/CippComponents/CippCodeBlock";
import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Close, Save, LaptopChromebook } from "@mui/icons-material";
import { useSettings } from "../../../../hooks/use-settings";
import { Stack } from "@mui/system";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const assignmentModeOptions = [
  { label: "Replace existing assignments", value: "replace" },
  { label: "Append to existing assignments", value: "append" },
];

const Page = () => {
  const pageTitle = "Scripts";
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [scriptId, setScriptId] = useState(null);
  const [saveScript, setSaveScript] = useState(false);
  const [codeContentChanged, setCodeContentChanged] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);

  const dispatch = useDispatch();

  const language = useMemo(() => {
    return currentScript?.scriptType?.toLowerCase() === ("macos" || "linux")
      ? "shell"
      : "powershell";
  }, [currentScript?.scriptType]);

  const tenantFilter = useSettings().currentTenant;
  const {
    isLoading: scriptIsLoading,
    isRefetching: scriptIsFetching,
    refetch: scriptRefetch,
    data,
  } = useQuery({
    queryKey: ["script", { scriptId }],
    queryFn: async () => {
      const response = await fetch(
        `/api/EditIntuneScript?TenantFilter=${tenantFilter}&ScriptId=${scriptId}`
      );
      return response.json();
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  // Refetch the script on scriptId change
  useEffect(() => {
    if (scriptId) {
      scriptRefetch().then(({ data }) => {
        setCurrentScript(data);
        const scriptBytes = Buffer.from(data.scriptContent, "base64");
        setCodeContent(scriptBytes.toString("ascii"));
      });
    }
  }, [scriptId, scriptRefetch]);

  const handleScriptEdit = async (row, action) => {
    setScriptId(row.id);
    setCodeOpen(!codeOpen);
  };

  const codeChange = (newValue, evt) => {
    setCodeContent(newValue);
    setCodeContentChanged(true);
  };

  const codeClosed = () => {
    if (codeContentChanged) {
      setWarnOpen(!warnOpen);
    } else {
      setCodeOpen(!codeOpen);
      setCodeContentChanged(false);
      setScriptId(null);
      setCodeContent("");
    }
  };

  const { refetch: saveScriptRefetch, isFetching: isSaving } = useQuery({
    queryKey: ["saveScript"],
    queryFn: async () => {
      const scriptBytes = Buffer.from(codeContent, "ascii");
      const {
        runAs32Bit,
        id,
        displayName,
        description,
        scriptContent,
        runAsAccount,
        fileName,
        roleScopeTagIds,
        scriptType,
      } = currentScript;
      const patchData = {
        TenantFilter: tenantFilter,
        ScriptId: id,
        ScriptType: scriptType,
        IntuneScript: JSON.stringify({
          runAs32Bit,
          id,
          displayName,
          description,
          scriptContent: scriptBytes.toString("base64"), // Convert to base64
          runAsAccount,
          fileName,
          roleScopeTagIds,
        }),
      };

      const response = await fetch("/api/EditIntuneScript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData),
      });

      if (!response.ok) {
        dispatch(
          showToast({
            title: "Script Save Error",
            message: "Your Intune script could not be saved.",
            type: "error",
          })
        );
      }

      return response.json();
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const queryClient = useQueryClient();

  const saveCode = async () => {
    const { data } = await saveScriptRefetch();
    setCodeContentChanged(false);
    setCodeOpen(!codeOpen);
    dispatch(
      showToast({
        title: "Script Saved",
        message: "Your Intune script has been saved successfully.",
        type: "update",
      })
    );
  };

  // Map script type to Graph API endpoint
  const getScriptEndpoint = (scriptType) => {
    const mapping = {
      Windows: "deviceManagementScripts",
      MacOS: "deviceShellScripts",
      Remediation: "deviceHealthScripts",
      Linux: "configurationPolicies",
    };
    return mapping[scriptType] || "deviceManagementScripts";
  };

  const actions = [
    {
      label: "Assign to All Users",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      icon: <UserIcon />,
      color: "info",
      fields: [
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds the new ones.",
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
      customDataformatter: (row, action, formData) => ({
        tenantFilter: tenantFilter,
        ID: row?.id,
        Type: getScriptEndpoint(row?.scriptType),
        AssignTo: "allLicensedUsers",
        assignmentMode: formData?.assignmentMode || "replace",
      }),
    },
    {
      label: "Assign to All Devices",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      icon: <LaptopChromebook />,
      color: "info",
      fields: [
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds the new ones.",
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
      customDataformatter: (row, action, formData) => ({
        tenantFilter: tenantFilter,
        ID: row?.id,
        Type: getScriptEndpoint(row?.scriptType),
        AssignTo: "AllDevices",
        assignmentMode: formData?.assignmentMode || "replace",
      }),
    },
    {
      label: "Assign Globally (All Users / All Devices)",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      icon: <GlobeAltIcon />,
      color: "info",
      fields: [
        {
          type: "radio",
          name: "assignmentMode",
          label: "Assignment mode",
          options: assignmentModeOptions,
          defaultValue: "replace",
          helperText:
            "Replace will overwrite existing assignments. Append keeps current assignments and adds the new ones.",
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all users and devices?',
      customDataformatter: (row, action, formData) => ({
        tenantFilter: tenantFilter,
        ID: row?.id,
        Type: getScriptEndpoint(row?.scriptType),
        AssignTo: "AllDevicesAndUsers",
        assignmentMode: formData?.assignmentMode || "replace",
      }),
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
            queryKey: `ListScriptAssignmentGroups-${tenantFilter}`,
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
            "Replace will overwrite existing assignments. Append keeps current assignments and adds the new ones.",
        },
      ],
      customDataformatter: (row, action, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : [];
        return {
          tenantFilter: tenantFilter,
          ID: row?.id,
          Type: getScriptEndpoint(row?.scriptType),
          GroupIds: selectedGroups.map((group) => group.value).filter(Boolean),
          GroupNames: selectedGroups.map((group) => group.label).filter(Boolean),
          assignmentMode: formData?.assignmentMode || "replace",
        };
      },
    },
    {
      label: "Edit Script",
      icon: <PencilIcon />,
      color: "primary",
      noConfirm: true,
      customFunction: handleScriptEdit,
    },
    {
      label: "Delete Script",
      type: "POST",
      url: "/api/RemoveIntuneScript",
      data: {
        ID: "id",
        displayName: "displayName",
        ScriptType: "scriptType",
      },
      confirmText: "Are you sure you want to delete this script?",
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "scriptType",
      "id",
      "fileName",
      "displayName",
      "description",
      "lastModifiedDateTime",
      "runAsAccount",
      "createdDateTime",
      "runAs32Bit",
      "executionFrequency",
      "enforceSignatureCheck",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "scriptType",
    "displayName",
    "ScriptAssignment",
    "ScriptExclude",
    "description",
    "runAsAccount",
    "lastModifiedDateTime",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListIntuneScript"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />

      <Dialog open={codeOpen} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2 }}>
          Script Content
          {!isSaving && (
            <IconButton
              aria-label="close"
              onClick={codeClosed}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          )}
          {!isSaving && (
            <IconButton
              aria-label="save"
              onClick={saveCode}
              sx={{ position: "absolute", right: 50, top: 8 }}
            >
              <Save />
            </IconButton>
          )}
          {isSaving && (
            <CircularProgress size={20} sx={{ position: "absolute", right: 55, top: 14 }} />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {(scriptIsFetching || scriptIsLoading) && <CircularProgress size={40} />}
          {!scriptIsFetching && !scriptIsLoading && (
            <CippCodeBlock
              open={codeOpen}
              type="editor"
              code={codeContent}
              onChange={codeChange}
              language={language}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={warnOpen} fullWidth maxWidth="sm">
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>Changes detected, are you sure you want to close?</Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setWarnOpen(false)}>
            Abort
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setCodeOpen(false);
              setWarnOpen(false);
              setCodeContent("");
              setScriptId(null);
              setCodeContentChanged(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
