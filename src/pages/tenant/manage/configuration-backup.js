import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import {
  Button,
  Box,
  Typography,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Stack,
  Skeleton,
  Chip,
} from "@mui/material";
import { Grid } from "@mui/system";
import {
  Storage,
  History,
  EventRepeat,
  Schedule,
  SettingsBackupRestore,
  Settings,
  CheckCircle,
  Cancel,
  Delete,
} from "@mui/icons-material";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { CippBackupScheduleDrawer } from "/src/components/CippComponents/CippBackupScheduleDrawer";
import { CippRestoreBackupDrawer } from "/src/components/CippComponents/CippRestoreBackupDrawer";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { CippTimeAgo } from "/src/components/CippComponents/CippTimeAgo";
import { useDialog } from "/src/hooks/use-dialog";
import ReactTimeAgo from "react-time-ago";
import tabOptions from "./tabOptions.json";
import { useRouter } from "next/router";
import { CippHead } from "/src/components/CippComponents/CippHead";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const settings = useSettings();
  const removeDialog = useDialog();

  // API call to get backup files
  const backupList = ApiGetCall({
    url: "/api/ExecListBackup",
    data: {
      tenantFilter: settings.currentTenant,
      Type: "Scheduled",
      NameOnly: true,
    },
    queryKey: `BackupList-${settings.currentTenant}`,
  });

  // API call to get existing backup configuration/schedule
  const existingBackupConfig = ApiGetCall({
    url: "/api/ListScheduledItems",
    data: {
      showHidden: true,
      Type: "New-CIPPBackup",
    },
    queryKey: `BackupTasks-${settings.currentTenant}`,
  });

  // Use the actual backup files as the backup data
  const filteredBackupData = Array.isArray(backupList.data) ? backupList.data : [];
  // Generate backup tags from actual API response items - use raw items directly
  const generateBackupTags = (backup) => {
    // Use the Items array directly from the API response without any translation
    if (backup.Items && Array.isArray(backup.Items)) {
      return backup.Items;
    }

    // Fallback if no items found
    return ["Configuration"];
  };

  const backupDisplayItems = filteredBackupData.map((backup, index) => ({
    id: backup.RowKey || index,
    name: backup.BackupName || "Unnamed Backup",
    timestamp: backup.Timestamp,
    tenantSource: backup.BackupName?.includes("AllTenants")
      ? "All Tenants"
      : backup.BackupName?.replace("CIPP Backup - ", "") || settings.currentTenant,
    tags: generateBackupTags(backup),
  }));

  // Process existing backup configuration, find tenantFilter. by comparing settings.currentTenant with Tenant.value
  const currentConfig = Array.isArray(existingBackupConfig.data)
    ? existingBackupConfig.data.find((tenant) => tenant.Tenant.value === settings.currentTenant)
    : null;
  const hasExistingConfig = currentConfig && currentConfig.Parameters?.ScheduledBackupValues;

  // Create property items for current configuration
  const configPropertyItems = hasExistingConfig
    ? [
        { label: "Backup Name", value: currentConfig.Name },
        {
          label: "Tenant",
          value:
            currentConfig.Tenant?.value ||
            currentConfig.Tenant ||
            currentConfig.TenantFilter ||
            settings.currentTenant,
        },
        { label: "Recurrence", value: currentConfig.Recurrence?.value || "Daily" },
        { label: "Task State", value: currentConfig.TaskState || "Unknown" },
        {
          label: "Last Executed",
          value: currentConfig.ExecutedTime ? (
            <CippTimeAgo data={currentConfig.ExecutedTime} />
          ) : (
            "Never"
          ),
        },
        {
          label: "Next Run",
          value: currentConfig.ScheduledTime ? (
            <CippTimeAgo data={currentConfig.ScheduledTime} />
          ) : (
            "Not scheduled"
          ),
        },
      ]
    : [];

  // Create component status tags
  const getEnabledComponents = () => {
    if (!hasExistingConfig) return [];

    const values = currentConfig.Parameters.ScheduledBackupValues;
    const enabledComponents = [];

    if (values.users) enabledComponents.push("Users");
    if (values.groups) enabledComponents.push("Groups");
    if (values.ca) enabledComponents.push("Conditional Access");
    if (values.intuneconfig) enabledComponents.push("Intune Configuration");
    if (values.intunecompliance) enabledComponents.push("Intune Compliance");
    if (values.intuneprotection) enabledComponents.push("Intune Protection");
    if (values.antispam) enabledComponents.push("Anti-Spam");
    if (values.antiphishing) enabledComponents.push("Anti-Phishing");
    if (values.CippWebhookAlerts) enabledComponents.push("CIPP Webhook Alerts");
    if (values.CippScriptedAlerts) enabledComponents.push("CIPP Scripted Alerts");
    if (values.CippCustomVariables) enabledComponents.push("Custom Variables");

    return enabledComponents;
  };

  // Info bar data following CIPP patterns
  const infoBarData = [
    {
      icon: <Storage />,
      name: "Total Backups",
      data: filteredBackupData?.length || 0,
    },
    {
      icon: <History />,
      name: "Last Backup",
      data: filteredBackupData?.[0]?.Timestamp ? (
        <ReactTimeAgo date={filteredBackupData[0].Timestamp} />
      ) : (
        "No Backups"
      ),
    },
    {
      icon: <EventRepeat />,
      name: "Tenant Scope",
      data: settings.currentTenant === "AllTenants" ? "All Tenants" : settings.currentTenant,
    },
    {
      icon: <Schedule />,
      name: "Configuration",
      data: hasExistingConfig ? "Configured" : "Not Configured",
    },
  ];

  const title = "Manage Backups";

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      backUrl="/tenant/standards/list-standards"
      actions={[]}
      actionsData={{}}
      isFetching={backupList.isFetching || existingBackupConfig.isFetching}
    >
      <CippHead title="Configuration Backup" />
      <Box sx={{ p: 1 }}>
        <Grid container spacing={3}>
          {/* Two Side-by-Side Displays */}
          <Grid size={{ md: 6, xs: 12 }}>
            <Stack spacing={3}>
              {/* Current Configuration Header */}
              <Card>
                <CardContent>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Settings color="primary" />
                      Current Configuration
                    </Typography>
                    {!hasExistingConfig ? (
                      <CippBackupScheduleDrawer
                        buttonText="Add Backup Schedule"
                        onSuccess={() => {
                          // Refresh both queries when a backup schedule is added
                          setTimeout(() => {
                            backupList.refetch();
                            existingBackupConfig.refetch();
                          }, 2000);
                        }}
                      />
                    ) : (
                      <Button
                        onClick={removeDialog.handleOpen}
                        startIcon={<Delete />}
                        color="error"
                      >
                        Remove Backup Schedule
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Configuration Details */}
              {existingBackupConfig.isFetching ? (
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                  <Skeleton variant="rectangular" width="100%" height={200} />
                </Stack>
              ) : hasExistingConfig ? (
                <Stack spacing={3}>
                  <CippPropertyListCard
                    title="Backup Schedule Details"
                    propertyItems={configPropertyItems}
                    isFetching={existingBackupConfig.isFetching}
                  />
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Backup Components
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                        {getEnabledComponents().map((component, idx) => (
                          <Chip
                            key={idx}
                            label={component}
                            color="success"
                            size="small"
                            icon={<CheckCircle />}
                          />
                        ))}
                        {getEnabledComponents().length === 0 && (
                          <Chip
                            label="No components configured"
                            color="default"
                            size="small"
                            icon={<Cancel />}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>
              ) : (
                <Alert severity="info">
                  <AlertTitle>No Backup Configuration</AlertTitle>
                  No backup schedule is currently configured for{" "}
                  {settings.currentTenant === "AllTenants" ? "any tenant" : settings.currentTenant}.
                  Click "Add Backup Schedule" to create an automated backup configuration.
                </Alert>
              )}
            </Stack>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            {/* Backup History */}
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <History color="primary" />
                    Backup History
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {settings.currentTenant === "AllTenants"
                      ? "Viewing backups for all tenants."
                      : `Viewing backups for ${settings.currentTenant} and global backups.`}
                  </Typography>

                  {filteredBackupData.length === 0 && !backupList.isFetching ? (
                    <Alert severity="info">
                      <AlertTitle>No Backup History</AlertTitle>
                      {settings.currentTenant === "AllTenants"
                        ? "No backups exist for any tenant."
                        : `No backups found for ${settings.currentTenant}.`}
                    </Alert>
                  ) : backupList.isFetching ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rectangular" width="100%" height={200} />
                    </Stack>
                  ) : (
                    <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                      <Stack spacing={2}>
                        {backupDisplayItems.map((backup) => (
                          <Card key={backup.id} variant="outlined">
                            <CardContent sx={{ p: 2 }}>
                              <Stack spacing={2}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                                      {(() => {
                                        const match = backup.name.match(
                                          /.*_(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})/
                                        );
                                        return match
                                          ? `${match[1]} @ ${match[2]}:${match[3]}`
                                          : backup.name;
                                      })()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <ReactTimeAgo date={backup.timestamp} />
                                    </Typography>
                                  </Box>
                                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                    <CippRestoreBackupDrawer
                                      buttonText="Restore Backup"
                                      backupName={backup.name}
                                      backupData={backup}
                                      size="small"
                                      variant="contained"
                                      startIcon={<SettingsBackupRestore />}
                                    />
                                  </Stack>
                                </Box>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                  {backup.tags.map((tag, idx) => (
                                    <Chip
                                      key={idx}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.7rem", height: "20px" }}
                                    />
                                  ))}
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Remove Backup Schedule Dialog */}
      <CippApiDialog
        createDialog={removeDialog}
        title="Remove Backup Schedule"
        api={{
          type: "POST",
          url: "/api/RemoveScheduledItem",
          data: { ID: currentConfig?.RowKey },
          confirmText:
            "Are you sure you want to remove this backup schedule? This will stop automatic backups but won't delete existing backup files.",
        }}
        relatedQueryKeys={[`BackupTasks-${settings.currentTenant}`, `BackupList-${settings.currentTenant}`]}
        onSuccess={() => {
          // Refresh both queries when a backup schedule is removed
          setTimeout(() => {
            backupList.refetch();
            existingBackupConfig.refetch();
          }, 2000);
        }}
      />
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
