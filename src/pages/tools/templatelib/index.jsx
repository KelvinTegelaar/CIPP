import React from "react";
import { Grid, Divider, Typography, CircularProgress, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";

const TemplateLibrary = () => {
  const currentTenant = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      ca: false,
      intuneconfig: false,
      intunecompliance: false,
      intuneprotection: false,
    },
  });

  const customDataFormatter = (values) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45;

    return {
      TenantFilter: values.tenantFilter.value,
      Name: `CIPP Template ${values.tenantFilter.value}`,
      Command: { value: `New-CIPPTemplateRun` },
      Parameters: { TemplateSettings: { ...values } },
      ScheduledTime: unixTime,
      Recurrence: { value: "4h" },
    };
  };

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="TemplateLibrary"
      title="Add Template Library"
      hideBackButton
      postUrl="/api/AddScheduledItem?DisallowDuplicateName=true"
      customDataformatter={customDataFormatter}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography>
            Template libraries are tenants set up to retrieve the latest version of a specific
            tenants policies. These are then stored in CIPPs templates, allowing you to keep an up
            to date copy of the policies.This copy occurs every 4 hours.
          </Typography>
          <Alert severity="warning" sx={{ my: 2 }}>
            Enabling this feature will overwrite templates with the same name.
          </Alert>
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        <Grid item xs={12} md={6}>
          <CippFormTenantSelector formControl={formControl} multiple={false} />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        <Grid item xs={12}>
          <Typography variant="h6">Conditional Access</Typography>
          <CippFormComponent
            type="switch"
            name="ca"
            label="Create Conditional Access Templates"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Intune</Typography>
          <CippFormComponent
            type="switch"
            name="intuneconfig"
            label="Create Intune Configuration Templates"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            name="intunecompliance"
            label="Create Intune Compliance Templates"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            name="intuneprotection"
            label="Create Intune Protection Templates"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

TemplateLibrary.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateLibrary;
