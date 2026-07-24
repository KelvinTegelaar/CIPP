import { useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { CippHead } from "../../../components/CippComponents/CippHead";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import CippButtonCard from "../../../components/CippCards/CippButtonCard";
import {
  CippSharePointTemplateBuilder,
  CippSharePointTemplateBuilderSkeleton,
} from "../../../components/CippComponents/CippSharePointTemplateBuilder";

const emptyTemplate = {
  templateName: "",
  createAsTeams: false,
  createMissingGroups: false,
  skipIfExists: false,
  siteTemplates: [],
};

const Page = () => {
  const router = useRouter();
  const { template, copy } = router.query;
  const isEdit = !!template && !copy;
  const pageTitle = copy
    ? "Copy SharePoint Template"
    : isEdit
    ? "Edit SharePoint Template"
    : "Create SharePoint Template";

  const formControl = useForm({ mode: "onChange", defaultValues: emptyTemplate });

  const templateQuery = ApiGetCall({
    url: template ? `/api/ExecSharePointTemplate?Action=Get&TemplateId=${template}` : null,
    queryKey: template ? `ExecSharePointTemplate-${template}` : null,
    waiting: !!template,
    // Always reload the current template when opening the editor so a save made moments ago
    // isn't masked by a stale cache.
    staleTime: 0,
  });
  const templateData = templateQuery.data;
  // Show a skeleton on the first load of an existing template (no cached data yet).
  const isLoadingTemplate = !!template && templateQuery.isLoading;

  // Root-level permission objects are mandatory on every site template; block saving until
  // each one has at least one grant. The cards themselves flag the offenders in red.
  const siteTemplatesValue = useWatch({ control: formControl.control, name: "siteTemplates" });
  const missingRootPerms = (siteTemplatesValue || []).some(
    (site) => !Array.isArray(site?.permissions) || site.permissions.length === 0
  );

  const saveTemplate = ApiPostCall({
    relatedQueryKeys: ["ListSharePointTemplates", "ExecSharePointTemplate"],
  });

  // Hydrate the form when editing or copying an existing template. The Get action returns an
  // array of matching templates, so take the first entry. reset() alone doesn't re-run
  // validation, so trigger it afterwards to enable the Save button on a freshly-loaded edit.
  useEffect(() => {
    const result = Array.isArray(templateData) ? templateData[0] : templateData?.Results;
    if (!result) return;
    formControl.reset({
      templateName: copy ? `${result.templateName || ""} (Copy)` : result.templateName || "",
      createAsTeams: !!result.createAsTeams,
      createMissingGroups: !!result.createMissingGroups,
      skipIfExists: !!result.skipIfExists,
      siteTemplates: result.siteTemplates || [],
    });
    formControl.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateData, copy]);

  const handleSubmit = (payload) => {
    if (isEdit) payload.TemplateId = template;
    saveTemplate.mutate(
      {
        url: "/api/ExecSharePointTemplate?Action=Save",
        data: payload,
        queryKey: "ExecSharePointTemplate",
      },
      {
        onSuccess: () => {
          router.push("/teams-share/sharepoint-templates");
        },
      }
    );
  };

  return (
    <>
      <CippHead title={pageTitle} />
      <Box sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<ArrowBack />}
                onClick={() => router.push("/teams-share/sharepoint-templates")}
              >
                Back
              </Button>
              <Typography variant="h4" sx={{ flexGrow: 1 }}>
                {pageTitle}
              </Typography>
            </Box>

            {/* Template settings: name + options, save in the card footer */}
            <CippButtonCard
              title="Template Settings"
              isFetching={isLoadingTemplate}
              CardButton={
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={formControl.handleSubmit(handleSubmit)}
                    disabled={
                      isLoadingTemplate ||
                      saveTemplate.isPending ||
                      missingRootPerms ||
                      !formControl.formState.isValid
                    }
                  >
                    {saveTemplate.isPending ? "Saving..." : "Save Template"}
                  </Button>
                  {missingRootPerms && (
                    <Typography variant="caption" color="error">
                      Every site template needs at least one root-level permission object.
                    </Typography>
                  )}
                </Stack>
              }
            >
              <Stack spacing={1}>
                <CippFormComponent
                  type="textField"
                  label="Template Name"
                  name="templateName"
                  formControl={formControl}
                  validators={{ required: "A template name is required" }}
                />
                <CippFormComponent
                  type="switch"
                  label="Create as Microsoft Teams"
                  name="createAsTeams"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Create groups if they do not exist"
                  name="createMissingGroups"
                  formControl={formControl}
                  helperText="Missing groups are created as security groups during deployment."
                />
                <CippFormComponent
                  type="switch"
                  label="Skip if exists"
                  name="skipIfExists"
                  formControl={formControl}
                  helperText="If a site or team with the same name already exists in the tenant, leave it untouched: no libraries or permissions are applied to it."
                />
              </Stack>
            </CippButtonCard>

            <CippApiResults apiObject={saveTemplate} />

            {isLoadingTemplate ? (
              <CippSharePointTemplateBuilderSkeleton />
            ) : (
              <CippSharePointTemplateBuilder formControl={formControl} />
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
