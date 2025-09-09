import { useEffect } from "react";
import { Divider, Typography, Alert, Chip } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";
import { Grid } from "@mui/system";
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
        <Grid size={12}>
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
            width: "100%",
          }}
        >
          <Grid size={{ md: 5, xs: 12 }}>
            <CippFormTenantSelector
              formControl={formControl}
              multiple={false}
              disableClearable={false}
            />
          </Grid>
          <Grid size={{ md: 2, xs: 12 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Chip label="OR" color="info" />
          </Grid>
          <Grid size={{ md: 5, xs: 12 }}>
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
          </Grid>
        </Grid>
        <Divider sx={{ mt: 2, width: "100%" }} />
        {templateRepo?.value && (
          <Grid size={12}>
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
          <Grid size={12}>
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

          <Grid size={12}>
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
          <Grid size={12}>
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
