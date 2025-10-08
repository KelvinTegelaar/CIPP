import { useState, useEffect } from "react";
import { Button, Box, Typography, Alert, AlertTitle } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { Backup } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import { omit } from "lodash";

export const CippBackupScheduleDrawer = ({
  buttonText = "Add Backup Schedule",
  requiredPermissions = [],
  PermissionButton = Button,
  onSuccess,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
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
      CippCustomVariables: true,
    },
  });

  const createBackup = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`BackupTasks-${userSettingsDefaults.currentTenant}`],
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  useEffect(() => {
    if (createBackup.isSuccess) {
      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
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
        CippCustomVariables: true,
      });
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [createBackup.isSuccess, onSuccess]);

  const handleSubmit = () => {
    formControl.trigger();
    if (!isValid) {
      return;
    }
    const values = formControl.getValues();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45;
    const tenantFilter = values.tenantFilter || userSettingsDefaults.currentTenant;

    const shippedValues = {
      TenantFilter: tenantFilter,
      Name: `CIPP Backup - ${tenantFilter}`,
      Command: { value: `New-CIPPBackup` },
      Parameters: {
        backupType: "Scheduled",
        ScheduledBackupValues: { ...omit(values, ["tenantFilter"]) },
      },
      ScheduledTime: unixTime,
      Recurrence: { value: "1d" },
    };

    createBackup.mutate({
      url: "/api/AddScheduledItem?hidden=true&DisallowDuplicateName=true",
      data: shippedValues,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: userSettingsDefaults.currentTenant,
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
      CippCustomVariables: true,
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<Backup />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Backup Schedule"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={formControl.handleSubmit(handleSubmit)}
              disabled={createBackup.isPending || !isValid}
            >
              {createBackup.isPending
                ? "Creating Schedule..."
                : createBackup.isSuccess
                ? "Create Another Schedule"
                : "Create Schedule"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Box sx={{ my: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Backup Schedule Information</AlertTitle>
            Create a scheduled backup task that will automatically backup your tenant configuration.
            Backups are stored securely and can be restored using the restore functionality.
          </Alert>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Tenant Selection</Typography>
              <CippFormTenantSelector
                formControl={formControl}
                allTenants={true}
                name="tenantFilter"
                required={true}
                disableClearable={true}
                componentType="select"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Identity</Typography>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="User List"
                name="users"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Groups"
                name="groups"
                formControl={formControl}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Conditional Access</Typography>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Conditional Access Configuration"
                name="ca"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}></Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Intune</Typography>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Intune Configuration Policies"
                name="intuneconfig"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Intune Compliance Policies"
                name="intunecompliance"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Intune Protection Policies"
                name="intuneprotection"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}></Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Email Security</Typography>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Anti-Spam Policies"
                name="antispam"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Anti-Phishing Policies"
                name="antiphishing"
                formControl={formControl}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">CIPP</Typography>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Webhook Alerts Configuration"
                name="CippWebhookAlerts"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Scripted Alerts Configuration"
                name="CippScriptedAlerts"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Custom Variables"
                name="CippCustomVariables"
                formControl={formControl}
              />
            </Grid>
          </Grid>
        </Box>
        <CippApiResults apiObject={createBackup} />
      </CippOffCanvas>
    </>
  );
};
