import React, { useState, useEffect } from "react";
import { Button, Box, Typography, Alert, AlertTitle, Divider, Chip, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { SettingsBackupRestore } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippRestoreBackupDrawer = ({
  buttonText = "Restore Backup",
  backupName = null,
  requiredPermissions = [],
  PermissionButton = Button,
  ...props
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
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
      backup: backupName ? { value: backupName, label: backupName } : null,
    },
  });

  const restoreBackup = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["BackupList", "BackupTasks"],
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  useEffect(() => {
    if (restoreBackup.isSuccess) {
      formControl.reset({
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
        backup: backupName ? { value: backupName, label: backupName } : null,
      });
    }
  }, [restoreBackup.isSuccess]);

  const handleSubmit = () => {
    formControl.trigger();
    if (!isValid) {
      return;
    }
    const values = formControl.getValues();
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

    restoreBackup.mutate({
      url: "/api/AddScheduledItem",
      data: shippedValues,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
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
      backup: backupName ? { value: backupName, label: backupName } : null,
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<SettingsBackupRestore />}
        {...props}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Restore Configuration Backup"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={formControl.handleSubmit(handleSubmit)}
              disabled={restoreBackup.isPending || !isValid}
            >
              {restoreBackup.isPending
                ? "Creating Restore Task..."
                : restoreBackup.isSuccess
                ? "Create Another Restore Task"
                : "Restore Backup"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Use this form to restore a backup for a tenant. Please select the backup and restore
            options.
          </Typography>

          <Grid container spacing={2}>
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
                    tenantFilter: tenantFilter,
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
              <CippFormComponent
                type="switch"
                label="Groups"
                name="groups"
                formControl={formControl}
              />
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
                    settings and replace them with the backup settings. If you have selected to
                    restore users, all properties will be overwritten with the backup settings. To
                    prevent and skip already existing entries, deselect the setting from the list
                    above, or disable overwrite.
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
              <CippFormComponent
                type="switch"
                label="E-mail"
                name="email"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippFormComponent type="switch" label="PSA" name="psa" formControl={formControl} />
            </Grid>
          </Grid>
        </Box>
        <CippApiResults apiObject={restoreBackup} />
      </CippOffCanvas>
    </>
  );
};
