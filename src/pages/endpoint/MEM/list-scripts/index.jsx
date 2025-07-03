import { Layout as DashboardLayout } from "/src/layouts/index";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
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
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Close, Save } from "@mui/icons-material";
import { useSettings } from "../../../../hooks/use-settings";
import { Stack } from "@mui/system";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

  const actions = [
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
              language="powershell"
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
