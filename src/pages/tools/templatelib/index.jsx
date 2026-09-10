import { useEffect } from "react";
import { Divider, Typography, Alert, Chip, Link } from "@mui/material";
import NextLink from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../layouts/index";
import CippFormPage from "../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";
import { Grid } from "@mui/system";
import { CippFormCondition } from "../../../components/CippComponents/CippFormCondition";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { ApiGetCall } from "../../../api/ApiCall";

// react-query key for the "configured template libraries" table below. Passed to CippFormPage as a
// related query key so creating a new library refreshes the table without a manual reload.
const TEMPLATE_LIBRARY_JOBS_KEY = "TemplateLibraryJobs";

const TemplateLibrary = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      ca: false,
      intuneconfig: false,
      intunecompliance: false,
      intuneprotection: false,
    },
  });

  const tenantFilter = useWatch({ control: formControl.control, name: "tenantFilter" });
  const templateRepo = useWatch({ control: formControl.control, name: "templateRepo" });

  // All configured template libraries (across every tenant/repo). ListScheduledItems filters by
  // command via the Type parameter, and ApiGetCall does not inject a tenantFilter, so this returns
  // every template-library job the caller is allowed to see rather than just the current tenant's.
  const existingJobs = ApiGetCall({
    url: "/api/ListScheduledItems",
    data: { Type: "New-CIPPTemplateRun" },
    queryKey: TEMPLATE_LIBRARY_JOBS_KEY,
  });
  const jobRows = Array.isArray(existingJobs.data) ? existingJobs.data : [];

  // A library targets either a tenant or a community repository; the job name and payload are both
  // built from whichever one is chosen.
  const targetValue = tenantFilter?.value || templateRepo?.value;
  const hasTarget = Boolean(targetValue);
  const selectedName = `CIPP Template ${targetValue}`;

  // Drive form validity from a hidden required field so Submit stays disabled until a target is
  // chosen - this is what stops the "No tenant" job ("CIPP Template undefined") that used to be
  // created and reported as success.
  useEffect(() => {
    formControl.setValue("_libraryTarget", hasTarget ? "ok" : "", { shouldValidate: true });
  }, [hasTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  // Spot an existing library for the picked target so we can warn before the server rejects it.
  const duplicateJob = hasTarget ? jobRows.find((job) => job?.Name === selectedName) : null;

  const customDataFormatter = (values) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45;

    // _libraryTarget only exists to gate Submit; keep it out of the stored TemplateSettings.
    const { _libraryTarget, ...templateSettings } = values;

    return {
      TenantFilter: values?.tenantFilter?.value ? values?.tenantFilter?.value : "No tenant",
      Name: `CIPP Template ${
        values.tenantFilter?.value ? values.tenantFilter?.value : values.templateRepo?.value
      }`,
      Command: { value: `New-CIPPTemplateRun` },
      Parameters: { TemplateSettings: { ...templateSettings } },
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
      queryKey={TEMPLATE_LIBRARY_JOBS_KEY}
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
            to date copy of the policies. Tenant-based template libraries sync every 4 hours,
            while community repository-based template libraries sync every 7 days.
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

        {/* Hidden field: registered with a required rule and toggled from `hasTarget` so the Submit
            button reflects whether a tenant or repository has been chosen. */}
        <CippFormComponent
          type="hidden"
          name="_libraryTarget"
          formControl={formControl}
          validators={{
            required: { value: true, message: "Select a tenant or a community repository." },
          }}
        />

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
              required={false}
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

        {!hasTarget && (
          <Grid size={12}>
            <Alert severity="info">
              Select a tenant or a community repository to set up a template library.
            </Alert>
          </Grid>
        )}
        {duplicateJob && (
          <Grid size={12}>
            <Alert severity="warning">
              A template library for <strong>{selectedName}</strong> is already set up
              {duplicateJob.TaskState ? ` (current state: ${duplicateJob.TaskState})` : ""}. Saving
              again will be rejected as a duplicate - it appears in the list below.
            </Alert>
          </Grid>
        )}

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

        <Grid size={12}>
          <Divider sx={{ mt: 2, mb: 2, width: "100%" }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Configured Template Libraries
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Template libraries that are already set up and running. Edit or remove them from the{" "}
            <Link component={NextLink} href="/cipp/scheduler">
              Scheduled Tasks
            </Link>{" "}
            page.
          </Typography>
          <CippDataTable
            title="Configured Template Libraries"
            noCard
            data={jobRows}
            isFetching={existingJobs.isFetching}
            refreshFunction={() => existingJobs.refetch()}
            simpleColumns={[
              "Name",
              "Tenant",
              "Recurrence",
              "TaskState",
              "ExecutedTime",
              "Results",
            ]}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

TemplateLibrary.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateLibrary;
