import React, { useEffect } from "react";
import { Grid, Divider, Typography, CircularProgress, Alert, Chip, Link } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";
import { Box } from "@mui/system";
import { CippFormCondition } from "../../../components/CippComponents/CippFormCondition";
import { ApiGetCall } from "/src/api/ApiCall";
import NextLink from "next/link";

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

  const templateRepo = useWatch({ control: formControl.control, name: "templateRepo" });

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

  useEffect(() => {
    if (templateRepo?.value) {
      formControl.setValue("templateRepoBranch", {
        label: templateRepo.addedFields.branch,
        value: templateRepo.addedFields.branch,
      });
    }
  }, [templateRepo?.value]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="TemplateLibrary"
      title="Template Library"
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

        <Divider sx={{ mt: 2, width: "100%" }} />
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "center",
            my: 1,
            mx: 1,
          }}
        >
          <Grid item xs={12} md={5}>
            <Box sx={{ my: "auto" }}>
              <CippFormTenantSelector
                formControl={formControl}
                multiple={false}
                disableClearable={false}
              />
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
                label="Community Repository"
                api={{
                  url: "/api/ListCommunityRepos",
                  queryKey: "CommunityRepos",
                  dataKey: "Results",
                  valueField: "FullName",
                  labelField: (option) => `${option.Name} (${option.URL})`,
                  addedField: {
                    branch: "DefaultBranch",
                  },
                }}
                formControl={formControl}
                multiple={false}
              />
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ mt: 2, width: "100%" }} />
        {templateRepo?.value && (
          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Repository Branch
            </Typography>
            <CippFormComponent
              type="autoComplete"
              name="templateRepoBranch"
              label="Select Branch"
              formControl={formControl}
              api={{
                url: "/api/ExecGitHubAction",
                data: {
                  Action: "GetBranches",
                  FullName: templateRepo?.value,
                },
                queryKey: `${templateRepo?.value}-Branches`,
                dataKey: "Results",
                valueField: "name",
                labelField: "name",
              }}
              multiple={false}
            />
          </Grid>
        )}
        <CippFormCondition
          formControl={formControl}
          field="templateRepo"
          compareType="doesNotContain"
          compareValue={"CIPP"}
        >
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Conditional Access
            </Typography>
            <CippFormComponent
              type="switch"
              name="ca"
              label="Create Conditional Access Templates"
              formControl={formControl}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Intune
            </Typography>
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
            <Typography variant="h6" sx={{ mb: 1 }}>
              Template Repository files
            </Typography>
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
