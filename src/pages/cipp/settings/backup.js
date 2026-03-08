import {
  Alert,
  Box,
  Button,
  CardContent,
  Stack,
  Typography,
  Skeleton,
  Input,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
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
} from "@mui/icons-material";
import ReactTimeAgo from "react-time-ago";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { CippRestoreWizard } from "../../../components/CippComponents/CippRestoreWizard";
import { BackupValidator } from "../../../utils/backupValidation";
import { useState } from "react";
import { useDialog } from "../../../hooks/use-dialog";

const Page = () => {
  const [validationResult, setValidationResult] = useState(null);
  const wizardDialog = useDialog();
  const runBackupDialog = useDialog();
  const enableBackupDialog = useDialog();
  const disableBackupDialog = useDialog();
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);
  const [selectedBackupData, setSelectedBackupData] = useState(null);
  const [selectedBackupName, setSelectedBackupName] = useState(null);
  const [wizardLoading, setWizardLoading] = useState(false);

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

  const downloadAction = ApiPostCall({
    urlFromData: true,
  });

  const fetchForRestore = ApiPostCall({
    urlFromData: true,
  });

  const NextBackupRun = (props) => {
    const date = new Date(props.date);
    if (isNaN(date)) {
      return "Not Scheduled";
    } else {
      return <ReactTimeAgo date={date} />;
    }
  };

  const openWizardWithData = ({ file, validation, data, backupName = null }) => {
    setValidationResult(validation);
    setSelectedBackupFile(file);
    setSelectedBackupData(validation.isValid && data ? data : null);
    setSelectedBackupName(backupName);
    wizardDialog.handleOpen();
  };

  const handleRestoreBackupUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const rawContent = evt.target.result;
        const validation = BackupValidator.validateBackup(rawContent);
        openWizardWithData({
          file: { name: file.name, size: file.size, lastModified: new Date(file.lastModified) },
          validation,
          data: validation.data,
        });
      } catch (error) {
        console.error("Backup validation error:", error);
        openWizardWithData({
          file: { name: file.name, size: file.size, lastModified: new Date(file.lastModified) },
          validation: {
            isValid: false,
            errors: [`Validation failed: ${error.message}`],
            warnings: [],
            repaired: false,
          },
          data: null,
        });
      }
      // Clear file input
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleTableRestoreAction = (row) => {
    // Open immediately with loading state
    setValidationResult(null);
    setSelectedBackupFile({
      name: row.BackupName,
      size: null,
      lastModified: row.Timestamp ? new Date(row.Timestamp) : null,
    });
    setSelectedBackupData(null);
    setSelectedBackupName(row.BackupName);
    setWizardLoading(true);
    wizardDialog.handleOpen();
    fetchForRestore.mutate(
      {
        url: `/api/ExecListBackup?BackupName=${row.BackupName}`,
        data: {},
      },
      {
        onSuccess: (data) => {
          const jsonString = data?.data?.[0]?.Backup;
          if (!jsonString) {
            setWizardLoading(false);
            return;
          }
          const validation = BackupValidator.validateBackup(jsonString);
          setValidationResult(validation);
          setSelectedBackupData(validation.isValid && validation.data ? validation.data : null);
          setWizardLoading(false);
        },
        onError: () => setWizardLoading(false),
      },
    );
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

          let downloadContent = jsonString;
          if (validation.repaired) {
            // Use the repaired version if available
            downloadContent = JSON.stringify(validation.data, null, 2);
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
      },
    );
  };

  const actions = [
    {
      label: "Restore Backup",
      icon: <SettingsBackupRestore />,
      noConfirm: true,
      customFunction: handleTableRestoreAction,
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
          <Stack spacing={2}>
            <Alert severity="info" sx={{ mt: 2 }}>
              Backups are stored in the storage account associated with your CIPP instance. You can
              download or restore specific points in time from the list below. Enable automatic
              backups to have CIPP create daily backups using the scheduler.
            </Alert>
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
          </Stack>
        }
      >
        <CardContent sx={{ p: 0 }}>
          {backupList.isSuccess ? (
            <Box>
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
                        color="primary"
                        startIcon={<ArrowCircleRight />}
                        onClick={runBackupDialog.handleOpen}
                      >
                        Run Backup
                      </Button>
                      <Button component="label" color="primary" startIcon={<CloudUpload />}>
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
                          <Button
                            color="primary"
                            startIcon={<ManageHistory />}
                            onClick={enableBackupDialog.handleOpen}
                          >
                            Schedule Backups
                          </Button>
                        )}
                      {scheduledBackup.isSuccess &&
                        scheduledBackup.data?.[0]?.Name === "Automated CIPP Backup" && (
                          <Button
                            color="error"
                            startIcon={<ManageHistory />}
                            onClick={disableBackupDialog.handleOpen}
                          >
                            Remove Schedule
                          </Button>
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

      <CippApiDialog
        createDialog={runBackupDialog}
        title="Run Backup"
        api={{
          url: "/api/ExecRunBackup",
          type: "POST",
          data: {},
          confirmText: "Are you sure you want to run a backup now?",
          relatedQueryKeys: ["BackupList", "ScheduledBackup"],
        }}
      />

      <CippApiDialog
        createDialog={enableBackupDialog}
        title="Schedule Backups"
        api={{
          url: "/api/ExecSetCIPPAutoBackup",
          type: "POST",
          data: { Enabled: true },
          confirmText: "Are you sure you want to enable automatic backups?",
          relatedQueryKeys: ["ScheduledBackup"],
        }}
      />

      <CippApiDialog
        createDialog={disableBackupDialog}
        title="Remove Backup Schedule"
        api={{
          url: "/api/ExecSetCIPPAutoBackup",
          type: "POST",
          data: { Enabled: false },
          confirmText: "Are you sure you want to remove the automatic backup schedule?",
          relatedQueryKeys: ["ScheduledBackup"],
        }}
      />

      <CippRestoreWizard
        open={wizardDialog.open}
        onClose={() => {
          wizardDialog.handleClose();
          setValidationResult(null);
          setSelectedBackupFile(null);
          setSelectedBackupData(null);
          setSelectedBackupName(null);
          setWizardLoading(false);
        }}
        validationResult={validationResult}
        backupFile={selectedBackupFile}
        backupData={selectedBackupData}
        backupName={selectedBackupName}
        isLoading={wizardLoading}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
