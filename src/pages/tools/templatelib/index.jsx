import React from "react";
import { Grid, Divider, Typography, CircularProgress, Alert, Chip } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";
import { Box } from "@mui/system";
import { CippFormCondition } from "../../../components/CippComponents/CippFormCondition";

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
      TenantFilter: values?.tenantFilter?.value ? values?.tenantFilter?.value : "No tenant",
      Name: `CIPP Template ${
        values.tenantFilter?.value ? values.tenantFilter?.value : values.templateRepo?.value
      }`,
      Command: { value: `New-CIPPTemplateRun` },
      Parameters: { TemplateSettings: { ...values } },
      ScheduledTime: unixTime,
      Recurrence: { value: values.tenantFilter?.value ? "4h" : "7d" },
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
          <Typography sx={{ mb: 2 }}>
            Template libraries are tenants set up to retrieve the latest version of a specific
            tenants policies. These are then stored in CIPPs templates, allowing you to keep an up
            to date copy of the policies.This copy occurs every 4 hours.
          </Typography>
          <Typography>
            There are also template repositories, these are community driven and are used to share
            templates with other users. Template repositories are downloaded when new versions are
            released.
          </Typography>
          <Alert severity="warning" sx={{ my: 2 }}>
            Enabling this feature will overwrite templates with the same name.
          </Alert>
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "center",
            m: 3,
          }}
        >
          <Grid item xs={12} md={5}>
            <Box sx={{ my: "auto" }}>
              <CippFormTenantSelector formControl={formControl} multiple={false} />
            </Box>
          </Grid>
          <Grid item xs={12} md={0.7}>
            <Box sx={{ my: "auto" }}>
              <Chip label="OR" color="info" />
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ my: "auto" }}>
              <CippFormComponent
                name="templateRepo"
                type="autoComplete"
                label="Template Repository"
                options={[
                  {
                    label: "Open Intune Baseline - https://skiptotheendpoint.co.uk/",
                    value: "CIPP-OIB",
                  },
                  { label: "CIPP Recommended Baseline - https://cipp.app", value: "CIPP-CIPP" },
                  {
                    label: "Conditional Access Framework - https://www.joeyverlinden.com/",
                    value: "CIPP-CAF",
                  },
                ]}
                formControl={formControl}
                multiple={false}
              />
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2, width: "100%" }} />
        <CippFormCondition
          formControl={formControl}
          field="templateRepo"
          compareType="isNot"
          compareValue={''}
        >
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
        </CippFormCondition>
        <CippFormCondition
          formControl={formControl}
          field="templateRepo"
          compareType="contains"
          compareValue={"CIPP-"}
        >
          <Grid item xs={12}>
            <Typography variant="h6">Template Repository files</Typography>
            <CippFormComponent
              type="switch"
              name="standardsconfig"
              label="Create Template Standards"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              name="groupTemplates"
              label="Create Group Templates"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              name="policyTemplates"
              label="Create Policy Templates"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              name="caTemplates"
              label="Create CA Templates"
              formControl={formControl}
            />
          </Grid>
        </CippFormCondition>
      </Grid>
    </CippFormPage>
  );
};

TemplateLibrary.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateLibrary;
