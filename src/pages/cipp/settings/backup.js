import {
  Box,
  Button,
  CardContent,
  Stack,
  Typography,
  Skeleton,
  Alert,
  AlertTitle,
  Input,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippPageCard from "../../../components/CippCards/CippPageCard";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { CippInfoBar } from "../../../components/CippCards/CippInfoBar";
import {
  ArrowCircleRight,
  CloudDownload,
  CloudUpload,
  EventRepeat,
  History,
  ManageHistory,
  NextPlan,
  SettingsBackupRestore,
  Storage,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  UploadFile,
} from "@mui/icons-material";
import ReactTimeAgo from "react-time-ago";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { BackupValidator, BackupValidationError } from "../../../utils/backupValidation";
import { useState } from "react";
import { useDialog } from "../../../hooks/use-dialog";

const Page = () => {
  const [validationResult, setValidationResult] = useState(null);
  const restoreDialog = useDialog();
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);
  const [selectedBackupData, setSelectedBackupData] = useState(null);

  const backupList = ApiGetCall({
    url: "/api/ExecListBackup",
    data: {
      NameOnly: true,
    },
    queryKey: "BackupList",
  });

  const scheduledBackup = ApiGetCall({
    url: "/api/ListScheduledItems",
    data: {
      Name: "Automated CIPP Backup",
    },
    queryKey: "ScheduledBackup",
  });

  const backupAction = ApiPostCall({
    urlFromData: true,
  });

  const downloadAction = ApiPostCall({
    urlFromData: true,
  });

  const runBackup = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["BackupList", "ScheduledBackup"],
  });

  const enableBackupSchedule = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ScheduledBackup"],
  });

  // Component for displaying validation results
  const ValidationResultsDisplay = ({ result }) => {
    if (!result) return null;

    return (
      <Box sx={{ mb: 2 }}>
        {result.isValid ? (
          <Alert severity="success" icon={<CheckCircle />}>
            <AlertTitle>Backup Validation Successful</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              The backup file is valid and ready for restoration.
            </Typography>
            {result.validRows !== undefined && result.totalRows !== undefined && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Import Summary:</strong> {result.validRows} valid rows out of{" "}
                {result.totalRows} total rows will be imported.
              </Typography>
            )}
            {result.repaired && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Note:</strong> The backup file had minor issues that were automatically
                repaired.
              </Typography>
            )}
            {result.warnings.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="warning.main">
                  <strong>Warnings:</strong>
                </Typography>
                <ul>
                  {result.warnings.map((warning, index) => (
                    <li key={index}>
                      <Typography variant="body2" color="warning.main">
                        {warning}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Alert>
        ) : (
          <Alert severity="error" icon={<ErrorIcon />}>
            <AlertTitle>Backup Validation Failed</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              The backup file is corrupted and cannot be restored safely.
            </Typography>
            {result.validRows !== undefined && result.totalRows !== undefined && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Analysis:</strong> Found {result.validRows} valid rows out of{" "}
                {result.totalRows} total rows.
              </Typography>
            )}
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Errors found:</strong>
              </Typography>
              <ul>
                {result.errors.map((error, index) => (
                  <li key={index}>
                    <Typography variant="body2">{error}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please try downloading a fresh backup or contact support if this issue persists.
            </Typography>
          </Alert>
        )}
      </Box>
    );
  };

  const NextBackupRun = (props) => {
    const date = new Date(props.date);
    if (isNaN(date)) {
      return "Not Scheduled";
    } else {
      return <ReactTimeAgo date={date} />;
    }
  };

  const handleCreateBackup = () => {
    runBackup.mutate({
      url: "/api/ExecRunBackup",
      data: {},
    });
  };

  const handleEnableScheduledBackup = () => {
    enableBackupSchedule.mutate({
      url: "/api/ExecSetCIPPAutoBackup",
      data: {
        Enabled: true,
      },
    });
  };

  const handleRestoreBackupUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawContent = e.target.result;

        // Validate the backup file
        const validation = BackupValidator.validateBackup(rawContent);
        setValidationResult(validation);

        // Store the file info and validated data
        setSelectedBackupFile({
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified),
        });

        if (validation.isValid) {
          setSelectedBackupData(validation.data);
        } else {
          setSelectedBackupData(null);
        }

        // Open the confirmation dialog
        restoreDialog.handleOpen();

        // Clear the file input
        e.target.value = null;
      } catch (error) {
        console.error("Backup validation error:", error);
        setValidationResult({
          isValid: false,
          errors: [`Validation failed: ${error.message}`],
          warnings: [],
          repaired: false,
        });
        setSelectedBackupFile({
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified),
        });
        setSelectedBackupData(null);
        restoreDialog.handleOpen();
        e.target.value = null;
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadBackupAction = (row) => {
    downloadAction.mutate(
      {
        url: `/api/ExecListBackup?BackupName=${row.BackupName}`,
        data: {},
      },
      {
        onSuccess: (data) => {
          const jsonString = data?.data?.[0]?.Backup;
          if (!jsonString) {
            return;
          }

          // Validate the backup before downloading
          const validation = BackupValidator.validateBackup(jsonString);

          let finalJsonString = jsonString;
          if (validation.repaired) {
            // Use the repaired version if available
            finalJsonString = JSON.stringify(validation.data, null, 2);
          }

          // Create a validation report comment at the top
          let downloadContent = finalJsonString;
          if (!validation.isValid || validation.warnings.length > 0) {
            const report = {
              validationReport: {
                timestamp: new Date().toISOString(),
                isValid: validation.isValid,
                repaired: validation.repaired,
                errors: validation.errors,
                warnings: validation.warnings,
              },
            };

            downloadContent = `// CIPP Backup Validation Report\n// ${JSON.stringify(
              report,
              null,
              2
            )}\n\n${finalJsonString}`;
          }

          const blob = new Blob([downloadContent], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${row.BackupName}${validation.repaired ? "_repaired" : ""}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
      }
    );
  };

  const actions = [
    {
      label: "Restore Backup",
      icon: <SettingsBackupRestore />,
      type: "POST",
      url: "/api/ExecRestoreBackup",
      data: { BackupName: "BackupName" },
      confirmText: "Are you sure you want to restore this backup?",
      relatedQueryKeys: ["BackupList"],
      multiPost: false,
      hideBulk: true,
    },
    {
      label: "Download Backup",
      icon: <CloudDownload />,
      noConfirm: true,
      customFunction: handleDownloadBackupAction,
    },
  ];

  return (
    <>
      <CippPageCard
        title="CIPP Backup"
        backButtonTitle="Settings"
        infoBar={
          <CippInfoBar
            isFetching={backupList.isFetching}
            data={[
              {
                icon: <Storage />,
                name: "Backup Count",
                data: backupList.data?.length,
              },
              {
                icon: <History />,
                name: "Last Backup",
                data: backupList.data?.[0]?.Timestamp ? (
                  <ReactTimeAgo date={backupList.data?.[0]?.Timestamp} />
                ) : (
                  "No Backups"
                ),
              },
              {
                icon: <EventRepeat />,
                name: "Automatic Backups",
                data:
                  scheduledBackup.data?.[0]?.Name === "Automated CIPP Backup"
                    ? "Enabled"
                    : "Disabled",
              },
              {
                icon: <NextPlan />,
                name: "Next Backup",
                data: <NextBackupRun date={scheduledBackup.data?.[0]?.ScheduledTime} />,
              },
            ]}
          />
        }
      >
        <CardContent>
          <Typography variant="body2" sx={{ mt: 3, px: 3 }}>
            Backups are stored in the storage account associated with your CIPP instance. You can
            download or restore specific points in time from the list below. Enable automatic
            backups to have CIPP create daily backups using the scheduler.
          </Typography>
          {backupList.isSuccess ? (
            <Box sx={{ mt: 3 }}>
              <CippApiResults apiObject={runBackup} />
              <CippApiResults apiObject={enableBackupSchedule} />
              <CippApiResults apiObject={backupAction} />

              <CippDataTable
                title="Backup List"
                data={backupList.data}
                simpleColumns={["BackupName", "Timestamp"]}
                refreshFunction={() => backupList.refetch()}
                isFetching={backupList.isFetching}
                actions={actions}
                cardButton={
                  <>
                    <Stack spacing={2} direction="row">
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ArrowCircleRight />}
                        onClick={handleCreateBackup}
                      >
                        Run Backup
                      </Button>
                      <Button
                        component="label"
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUpload />}
                      >
                        Restore From File
                        <input
                          hidden
                          accept=".json"
                          type="file"
                          id="backup-upload"
                          onChange={handleRestoreBackupUpload}
                        />
                      </Button>
                      {scheduledBackup.isSuccess &&
                        scheduledBackup.data?.[0]?.Name !== "Automated CIPP Backup" && (
                          <>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<ManageHistory />}
                              onClick={handleEnableScheduledBackup}
                            >
                              Schedule Backups
                            </Button>
                          </>
                        )}
                    </Stack>
                  </>
                }
              />
            </Box>
          ) : (
            <Box sx={{ mt: 3 }}>
              <Stack spacing={2}>
                <Skeleton variant="rectangular" width="100%" height={100} />
                <Skeleton variant="rectangular" width="100%" height={400} />
              </Stack>
            </Box>
          )}
        </CardContent>
      </CippPageCard>

      {/* Backup Restore Confirmation Dialog */}
      <CippApiDialog
        key={
          selectedBackupFile
            ? `restore-${selectedBackupFile.name}-${selectedBackupFile.lastModified}`
            : "restore-dialog"
        }
        title="Confirm Backup Restoration"
        createDialog={{
          open: restoreDialog.open,
          handleClose: () => {
            restoreDialog.handleClose();
            // Clear state when user manually closes the dialog
            setValidationResult(null);
            setSelectedBackupFile(null);
            setSelectedBackupData(null);
          },
        }}
        api={{
          type: "POST",
          url: "/api/ExecRestoreBackup",
          customDataformatter: () => selectedBackupData,
          confirmText: validationResult?.isValid
            ? "Are you sure you want to restore this backup? This will overwrite your current CIPP configuration."
            : null,
          onSuccess: () => {
            // Don't auto-close the dialog - let user see the results and close manually
            // The dialog will show the API results and user can close when ready
          },
        }}
        relatedQueryKeys={["BackupList", "ScheduledBackup"]}
      >
        {({ formHook, row }) => (
          <Stack spacing={3}>
            {/* File Information */}
            {selectedBackupFile && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <UploadFile color="primary" />
                  Selected File
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.800" : "grey.50"),
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Filename:</strong> {selectedBackupFile.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Size:</strong> {(selectedBackupFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Typography variant="body2">
                      <strong>Last Modified:</strong>{" "}
                      {selectedBackupFile.lastModified.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* Validation Results */}
            <ValidationResultsDisplay result={validationResult} />

            {/* Additional Information if Validation Failed */}
            {validationResult && !validationResult.isValid && (
              <Alert severity="warning" icon={<Warning />}>
                <AlertTitle>Restore Blocked</AlertTitle>
                The backup file cannot be restored due to validation errors. Please ensure you have
                a valid backup file before proceeding.
              </Alert>
            )}

            {/* Success Information with Data Summary */}
            {validationResult?.isValid && selectedBackupData && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CheckCircle color="success" />
                  Backup Contents
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "success.dark" : "success.light",
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.success.main}`,
                    color: (theme) =>
                      theme.palette.mode === "dark" ? "success.contrastText" : "success.dark",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Total Objects:</strong>{" "}
                      {Array.isArray(selectedBackupData) ? selectedBackupData.length : "Unknown"}
                    </Typography>
                    {validationResult.repaired && (
                      <Typography variant="body2">
                        <strong>Status:</strong> Automatically repaired and validated
                      </Typography>
                    )}
                    {validationResult.warnings.length > 0 && (
                      <Typography variant="body2">
                        <strong>Warnings:</strong> {validationResult.warnings.length} warning(s)
                        noted
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            )}
          </Stack>
        )}
      </CippApiDialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
