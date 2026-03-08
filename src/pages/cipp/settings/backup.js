import {
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
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import { CippRestoreWizard } from "../../../components/CippComponents/CippRestoreWizard";
import { BackupValidator } from "../../../utils/backupValidation";
import { useState } from "react";
import { useDialog } from "../../../hooks/use-dialog";

const Page = () => {
  const [validationResult, setValidationResult] = useState(null);
  const wizardDialog = useDialog();
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

  const backupAction = ApiPostCall({
    urlFromData: true,
  });

  const downloadAction = ApiPostCall({
    urlFromData: true,
  });

  const fetchForRestore = ApiPostCall({
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
