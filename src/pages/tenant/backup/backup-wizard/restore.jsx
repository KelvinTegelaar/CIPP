import { useState, useEffect } from "react";
import { Alert, Divider, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { Chip, Stack } from "@mui/material";

const RestoreBackupForm = () => {
  const userSettingsDefaults = useSettings();
  const tenantFilter = userSettingsDefaults.currentTenant || "";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: tenantFilter,
      users: true,
      groups: true,
      ca: true,
      intuneconfig: true,
      intunecompliance: true,
      intuneprotection: true,
      antispam: true,
      antiphishing: true,
      CippWebhookAlerts: true,
      CippScriptedAlerts: true,
      CippStandards: true,
      overwrite: false,
      webhook: false,
      email: false,
      psa: false,
      backup: null,
    },
  });

  const [backups, setBackups] = useState([]);
  const [backupsError, setBackupsError] = useState(null);
  const [backupsLoading, setBackupsLoading] = useState(false);

  // Since we cannot make API calls, we need to handle backups differently
  // For the purpose of this example, let's assume that backups are passed as props or are hardcoded
  // Here we'll use some mock data

  useEffect(() => {
    // Mock data for backups
    const mockBackups = [{ RowKey: "Backup1" }, { RowKey: "Backup2" }, { RowKey: "Backup3" }];

    if (tenantFilter) {
      setBackupsLoading(true);
      // Simulate loading
      setTimeout(() => {
        setBackups(mockBackups);
        setBackupsLoading(false);
      }, 500); // Simulate loading delay
    } else {
      setBackups([]);
    }
  }, [tenantFilter]);

  return (
    <CippFormPage
      title="Backup Restore Task"
      formControl={formControl}
      postUrl="/api/AddScheduledItem"
      customDataformatter={(values) => {
        const startDate = new Date();
        const unixTime = Math.floor(startDate.getTime() / 1000) - 45;
        const tenantFilterValue = tenantFilter;
        const shippedValues = {
          TenantFilter: tenantFilterValue,
          Name: `CIPP Restore ${tenantFilterValue}`,
          Command: { value: `New-CIPPRestore` },
          Parameters: {
            Type: "Scheduled",
            RestoreValues: {
              backup: values.backup?.value || values.backup,
              users: values.users,
              groups: values.groups,
              ca: values.ca,
              intuneconfig: values.intuneconfig,
              intunecompliance: values.intunecompliance,
              intuneprotection: values.intuneprotection,
              antispam: values.antispam,
              antiphishing: values.antiphishing,
              CippWebhookAlerts: values.CippWebhookAlerts,
              CippScriptedAlerts: values.CippScriptedAlerts,
              overwrite: values.overwrite,
            },
          },
          ScheduledTime: unixTime,
          PostExecution: {
            Webhook: values.webhook,
            Email: values.email,
            PSA: values.psa,
          },
          DisallowDuplicateName: true,
        };
        return shippedValues;
      }}
      backButtonTitle="Backup Tasks"
    >
      <Typography variant="body1" sx={{ mb: 2 }}>
        Use this form to restore a backup for a tenant. Please select the tenant, backup, and
        restore options.
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Backup Selector */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label={`Backups for ${tenantFilter}`}
            name="backup"
            multiple={false}
            api={{
              url: "/api/ExecListBackup",
              queryKey: `BackupList-${tenantFilter}`,
              labelField: (option) => {
                const match = option.BackupName.match(/.*_(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})/);
                return match ? `${match[1]} @ ${match[2]}:${match[3]}` : option.BackupName;
              },
              valueField: "BackupName",
              data: {
                Type: "Scheduled",
                NameOnly: true,
              },
            }}
            formControl={formControl}
            required={true}
            validators={{
              validate: (value) => !!value || "Please select a backup",
            }}
          />
        </Grid>

        {/* Restore Settings */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Restore Settings</Typography>
        </Grid>

        {/* Identity */}
        <Grid size={{ md: 6, xs: 12 }}>
          <Typography variant="subtitle1">Identity</Typography>
          <CippFormComponent
            type="switch"
            label="User List"
            name="users"
            formControl={formControl}
          />
          <CippFormComponent type="switch" label="Groups" name="groups" formControl={formControl} />
        </Grid>

        {/* Conditional Access */}
        <Grid size={{ md: 6, xs: 12 }}>
          <Typography variant="subtitle1">Conditional Access</Typography>
          <CippFormComponent
            type="switch"
            label="Conditional Access Configuration"
            name="ca"
            formControl={formControl}
          />
        </Grid>

        {/* Intune */}
        <Grid size={{ md: 6, xs: 12 }}>
          <Typography variant="subtitle1">Intune</Typography>
          <CippFormComponent
            type="switch"
            label="Intune Configuration Policies"
            name="intuneconfig"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Intune Compliance Policies"
            name="intunecompliance"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Intune Protection Policies"
            name="intuneprotection"
            formControl={formControl}
          />
        </Grid>

        {/* Email Security */}
        <Grid size={{ md: 6, xs: 12 }}>
          <Typography variant="subtitle1">Email Security</Typography>
          <CippFormComponent
            type="switch"
            label="Anti-Spam Policies"
            name="antispam"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Anti-Phishing Policies"
            name="antiphishing"
            formControl={formControl}
          />
        </Grid>

        {/* CIPP */}
        <Grid size={{ md: 6, xs: 12 }}>
          <Typography variant="subtitle1">CIPP</Typography>
          <CippFormComponent
            type="switch"
            label="Webhook Alerts Configuration"
            name="CippWebhookAlerts"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Scripted Alerts Configuration"
            name="CippScriptedAlerts"
            formControl={formControl}
          />
        </Grid>

        {/* Overwrite Existing Entries */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Overwrite existing entries"
            name="overwrite"
            formControl={formControl}
          />
          <CippFormCondition
            formControl={formControl}
            field="overwrite"
            compareType="is"
            compareValue={true}
          >
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                <strong>Warning:</strong> Overwriting existing entries will remove the current
                settings and replace them with the backup settings. If you have selected to restore
                users, all properties will be overwritten with the backup settings. To prevent and
                skip already existing entries, deselect the setting from the list above, or disable
                overwrite.
              </Alert>
            </Grid>
          </CippFormCondition>
        </Grid>

        {/* Send Results To */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Send Restore results to:</Typography>
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Webhook"
            name="webhook"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <CippFormComponent type="switch" label="E-mail" name="email" formControl={formControl} />
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <CippFormComponent type="switch" label="PSA" name="psa" formControl={formControl} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Divider />
        </Grid>
        {/* Review and Confirm */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5">Review and Confirm</Typography>
          <Typography variant="body1" color="textSecondary">
            Please review the selected options before submitting.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Selected Tenant:</Typography>
          <Typography variant="body2" color="textSecondary">
            {tenantFilter}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Selected Backup:</Typography>
          <Typography variant="body2" color="textSecondary">
            {formControl.watch("backup")?.label || "None selected"}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Overwrite Existing Configuration:</Typography>
          <Typography variant="body2" color="textSecondary">
            {formControl.watch("overwrite") ? "Yes" : "No"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Send Results To:</Typography>
          <Typography variant="body2" color="textSecondary">
            <Stack direction="row" spacing={1}>
              {formControl.watch("webhook") && <Chip color="primary" label="Webhook" />}
              {formControl.watch("email") && <Chip color="primary" label="E-mail" />}
              {formControl.watch("psa") && <Chip color="primary" label="PSA" />}
              {!formControl.watch("webhook") &&
                !formControl.watch("email") &&
                !formControl.watch("psa") && <Chip color="default" label="None" />}
            </Stack>
          </Typography>
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

RestoreBackupForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default RestoreBackupForm;
