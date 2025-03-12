import React from "react";
import { Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { omit } from "lodash";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { CippFormTenantSelector } from "../../../../components/CippComponents/CippFormTenantSelector";

const CreateBackup = () => {
  const userSettingsDefaults = useSettings();
  const tenantDomain = userSettingsDefaults.currentTenant || "";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: tenantDomain,
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
    },
  });

  return (
    <CippFormPage
      title="Backup Schedule"
      formControl={formControl}
      queryKey={`Backup Tasks`}
      postUrl="/api/AddScheduledItem?hidden=true&DisallowDuplicateName=true"
      customDataformatter={(values) => {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const unixTime = Math.floor(startDate.getTime() / 1000) - 45;
        const tenantFilter = values.tenantFilter || tenantDomain;
        const shippedValues = {
          TenantFilter: tenantFilter,
          Name: `CIPP Backup - ${tenantFilter}`,
          Command: { value: `New-CIPPBackup` },
          Parameters: { backupType: "Scheduled", ScheduledBackupValues: { ...omit(values, ['tenantFilter']) } },
          ScheduledTime: unixTime,
          Recurrence: { value: "1d" },
        };
        return shippedValues;
      }}
      backButtonTitle="Backup Tasks"
      allowResubmit={true}
    >
      <Typography variant="body1">
        Backups are stored in CIPP's storage and can be restored using the CIPP Restore Backup
        Wizard. Backups run daily or on demand by clicking the backup now button.
      </Typography>
      <Grid container spacing={2} sx={{ my: 2 }}>
        <Grid item xs={12}>
          <CippFormTenantSelector
            formControl={formControl}
            allTenants={true}
            name="tenantFilter"
            required={true}
            disableClearable={true}
            componentType="select"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Identity</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="User List"
            name="users"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent type="switch" label="Groups" name="groups" formControl={formControl} />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Conditional Access</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Conditional Access Configuration"
            name="ca"
            formControl={formControl}
          />
        </Grid>
        {/* Optional: Add an empty Grid item to balance the layout */}
        <Grid item xs={12} md={6}></Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Intune</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Intune Configuration Policies"
            name="intuneconfig"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Intune Compliance Policies"
            name="intunecompliance"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Intune Protection Policies"
            name="intuneprotection"
            formControl={formControl}
          />
        </Grid>
        {/* Add an empty Grid item to fill the second column */}
        <Grid item xs={12} md={6}></Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Email Security</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Anti-Spam Policies"
            name="antispam"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Anti-Phishing Policies"
            name="antiphishing"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">CIPP</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Webhook Alerts Configuration"
            name="CippWebhookAlerts"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Scripted Alerts Configuration"
            name="CippScriptedAlerts"
            formControl={formControl}
          />
        </Grid>
        {/* Add an empty Grid item to fill the second column */}
        <Grid item xs={12} md={6}></Grid>
      </Grid>
    </CippFormPage>
  );
};

CreateBackup.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CreateBackup;
