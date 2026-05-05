import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import {
  Button,
  SvgIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add,
  ToggleOn,
  ToggleOff,
  NotificationsActive,
  NotificationsOff,
  GitHub,
  CloudDownload,
  InsertDriveFile,
} from "@mui/icons-material";
import { TrashIcon, PencilIcon, ClockIcon } from "@heroicons/react/24/outline";
import NextLink from "next/link";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { CippAutoComplete } from "../../../components/CippComponents/CippAutocomplete";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import { useState } from "react";
import { Grid } from "@mui/system";

const Page = () => {
  const pageTitle = "Custom Tests";
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const branchQuery = ApiGetCall({
    url: "/api/ExecGitHubAction",
    data: { Action: "GetBranches", FullName: selectedRepo },
    queryKey: `${selectedRepo}-branches`,
    waiting: !!selectedRepo,
  });

  const fileTreeQuery = ApiGetCall({
    url: "/api/ExecGitHubAction",
    data: {
      Action: "GetFileTree",
      FullName: selectedRepo,
      Branch: selectedBranch,
    },
    queryKey: `${selectedRepo}-${selectedBranch}-filetree-customtests`,
    waiting: !!selectedRepo && !!selectedBranch,
  });

  const importScriptApi = ApiPostCall({
    relatedQueryKeys: ["Custom Tests"],
    urlFromData: true,
  });

  const scriptFiles = (fileTreeQuery.data?.Results || []).filter(
    (f) => f.path?.endsWith(".json") && f.path?.startsWith("CustomTests/")
  );

  const handleImportClose = () => {
    setImportDialogOpen(false);
    setSelectedRepo(null);
    setSelectedBranch(null);
  };
  const simpleColumns = [
    "ScriptName",
    "Description",
    "Enabled",
    "AlertOnFailure",
    "ResultMode",
    "ReturnType",
    "Category",
    "Pillar",
    "Risk",
    "UserImpact",
    "ImplementationEffort",
    "Version",
    "CreatedBy",
    "CreatedDate",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey="Custom Tests"
        cardButton={
          <Stack direction="row" spacing={1}>
            {integrations.isSuccess && integrations?.data?.GitHub?.Enabled && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setImportDialogOpen(true)}
              >
                <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
                  <CloudDownload />
                </SvgIcon>
                Import from GitHub
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              size="small"
              component={NextLink}
              href="/tools/custom-tests/add"
            >
              <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
                <Add />
              </SvgIcon>
              Add Test
            </Button>
          </Stack>
        }
        tenantInTitle={false}
        apiUrl="/api/ListCustomScripts"
        simpleColumns={simpleColumns}
        actions={[
          {
            label: "Edit Test",
            icon: <PencilIcon />,
            link: "/tools/custom-tests/add?ScriptGuid=[ScriptGuid]",
          },
          {
            label: "View Versions",
            icon: <ClockIcon />,
            link: "/tools/custom-tests/versions?ScriptGuid=[ScriptGuid]",
          },
          {
            label: "Enable Test",
            icon: <ToggleOn />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!EnableScript",
            },
            condition: (row) => row.Enabled !== true,
            confirmText: "Enable script '[ScriptName]'?",
          },
          {
            label: "Disable Test",
            icon: <ToggleOff />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!DisableScript",
            },
            condition: (row) => row.Enabled === true,
            confirmText: "Disable script '[ScriptName]'?",
          },
          {
            label: "Enable Alerts",
            icon: <NotificationsActive />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!EnableAlerts",
            },
            condition: (row) => row.AlertOnFailure !== true,
            confirmText: "Enable alerts for '[ScriptName]'?",
          },
          {
            label: "Disable Alerts",
            icon: <NotificationsOff />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!DisableAlerts",
            },
            condition: (row) => row.AlertOnFailure === true,
            confirmText: "Disable alerts for '[ScriptName]'?",
          },
          {
            label: "Delete Test",
            icon: <TrashIcon />,
            url: "/api/RemoveCustomScript",
            type: "POST",
            relatedquerykeys: ["ListAvailableTests"],
            data: {
              ScriptGuid: "ScriptGuid",
            },
            confirmText:
              "Are you sure you want to delete the test '[ScriptName]'? This will permanently delete ALL versions of this script.",
          },
          {
            label: "Save to GitHub",
            type: "POST",
            url: "/api/ExecCommunityRepo",
            icon: <GitHub />,
            data: {
              Action: "UploadScript",
              GUID: "ScriptGuid",
            },
            fields: [
              {
                label: "Repository",
                name: "FullName",
                type: "select",
                api: {
                  url: "/api/ListCommunityRepos",
                  data: { WriteAccess: true },
                  queryKey: "CommunityRepos-Write",
                  dataKey: "Results",
                  valueField: "FullName",
                  labelField: "FullName",
                },
                multiple: false,
                creatable: false,
                required: true,
                validators: {
                  required: { value: true, message: "This field is required" },
                },
              },
              {
                label: "Commit Message",
                placeholder: "Enter a commit message for adding this script to GitHub",
                name: "Message",
                type: "textField",
                multiline: true,
                required: true,
                rows: 4,
              },
            ],
            confirmText:
              "Are you sure you want to save '[ScriptName]' to the selected repository?",
            condition: () => integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
          },
        ]}
      />

      <Dialog
        open={importDialogOpen}
        onClose={handleImportClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Custom Test from GitHub</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippAutoComplete
                fullWidth
                onChange={(newValue) => {
                  setSelectedRepo(newValue?.value || null);
                  setSelectedBranch(null);
                }}
                api={{
                  url: "/api/ListCommunityRepos",
                  queryKey: "CommunityRepos",
                  dataKey: "Results",
                  valueField: "FullName",
                  labelField: "FullName",
                }}
                multiple={false}
                label="Select Repository"
                placeholder="Select a repository"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippAutoComplete
                fullWidth
                onChange={(newValue) => {
                  setSelectedBranch(newValue?.value || null);
                }}
                options={
                  branchQuery.data?.Results?.map((b) => ({
                    label: b.name,
                    value: b.name,
                  })) || []
                }
                multiple={false}
                label="Select Branch"
                placeholder="Select a branch"
                disabled={!selectedRepo}
                isFetching={branchQuery.isFetching}
              />
            </Grid>
          </Grid>

          {fileTreeQuery.isFetching ? (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={200} />
            </Box>
          ) : scriptFiles.length > 0 ? (
            <List dense>
              {scriptFiles.map((file) => (
                <ListItemButton
                  key={file.path}
                  onClick={() => {
                    importScriptApi.mutate({
                      url: "/api/ExecCommunityRepo",
                      data: {
                        Action: "ImportScript",
                        FullName: selectedRepo,
                        Path: file.path,
                        Branch: selectedBranch,
                      },
                    });
                  }}
                  disabled={importScriptApi.isPending}
                >
                  <ListItemIcon>
                    <InsertDriveFile fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.path.replace("CustomTests/", "").replace(".json", "")}
                    secondary={file.path}
                  />
                  <CloudDownload fontSize="small" color="action" />
                </ListItemButton>
              ))}
            </List>
          ) : selectedRepo && selectedBranch && !fileTreeQuery.isFetching ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No custom test files found in the CustomTests/ folder of this repository.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              Select a repository and branch to browse available custom tests.
            </Typography>
          )}

          <CippApiResults apiObject={importScriptApi} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
