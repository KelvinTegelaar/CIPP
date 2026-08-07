import { useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { Box, Button, Container, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { ArrowBack, InfoOutlined, Save } from "@mui/icons-material";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { CippHead } from "../../../components/CippComponents/CippHead";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import CippButtonCard from "../../../components/CippCards/CippButtonCard";
import {
  CippSharePointTemplateBuilder,
  CippSharePointTemplateBuilderSkeleton,
  CippSharePointTemplateQuickStats,
  CippSharePointTemplateQuickStatsSkeleton,
  getSiteTemplateSaveIssues,
  getSiteLanguageOption,
  siteTemplateBlocksSave,
  SHAREPOINT_TEMPLATE_ENGINE_VERSION,
} from "../../../components/CippComponents/CippSharePointTemplateBuilder";

const emptyTemplate = {
  templateName: "",
  templateEngineVersion: SHAREPOINT_TEMPLATE_ENGINE_VERSION,
  siteType: "sharePoint",
  overrideSiteType: false,
  createMissingGroups: false,
  skipIfExists: false,
  siteTemplates: [],
};

const Page = () => {
  const router = useRouter();
  const { template, copy } = router.query;
  // Next may give query values as string | string[]. Treat only explicit copy=true as copy mode
  // so title and save (TemplateId) cannot disagree.
  const templateId = Array.isArray(template) ? template[0] : template;
  const isCopy = copy === true || copy === "true";
  const isEdit = !!templateId && !isCopy;
  const pageTitle = isCopy
    ? "Copy SharePoint Template"
    : isEdit
    ? "Edit SharePoint Template"
    : "Create SharePoint Template";

  const formControl = useForm({ mode: "onChange", defaultValues: emptyTemplate });

  const templateQuery = ApiGetCall({
    url: templateId ? `/api/ExecSharePointTemplate?Action=Get&TemplateId=${templateId}` : null,
    queryKey: templateId ? `ExecSharePointTemplate-${templateId}` : null,
    waiting: !!templateId,
    // Edit/copy must never paint a stale cached template — always refetch on open.
    staleTime: 0,
    refetchOnMount: "always",
  });
  const templateData = templateQuery.data;
  // Treat in-flight refetch like loading so a previous cache cannot flash into the form.
  const isLoadingTemplate =
    !!templateId && (templateQuery.isLoading || templateQuery.isFetching);

  // Site-template fields that block Save (name, root perms, library names). Cards outline offenders in red.
  const siteTemplatesValue = useWatch({ control: formControl.control, name: "siteTemplates" });
  const siteTemplatesBlockSave = (siteTemplatesValue || []).some(siteTemplateBlocksSave);
  const siteTemplateSaveIssues = getSiteTemplateSaveIssues(siteTemplatesValue || []);

  const saveTemplate = ApiPostCall({
    // Wildcard: Get uses ExecSharePointTemplate-{id}, not the bare ExecSharePointTemplate key.
    relatedQueryKeys: ["ListSharePointTemplates", "ExecSharePointTemplate-*"],
  });

  // Hydrate only after a fresh fetch finishes. Skip while isFetching so we never reset() from
  // a stale cache entry that React Query still exposes during refetch.
  useEffect(() => {
    if (!templateId || templateQuery.isFetching) return;
    const result = Array.isArray(templateData) ? templateData[0] : templateData?.Results;
    if (!result) return;
    const normalizeSiteType = (value) =>
      value === "teams" || value?.value === "teams" ? "teams" : "sharePoint";
    formControl.reset({
      templateName: isCopy ? `${result.templateName || ""} (Copy)` : result.templateName || "",
      templateEngineVersion: SHAREPOINT_TEMPLATE_ENGINE_VERSION,
      siteType: normalizeSiteType(result.siteType),
      overrideSiteType: !!result.overrideSiteType,
      createMissingGroups: !!result.createMissingGroups,
      skipIfExists: !!result.skipIfExists,
      siteTemplates: (result.siteTemplates || []).map((site) => ({
        ...site,
        siteType: normalizeSiteType(site.siteType),
        language: getSiteLanguageOption(site.language),
      })),
    });
    formControl.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templateData, isCopy, templateQuery.isFetching, templateQuery.dataUpdatedAt]);

  const handleSubmit = (payload) => {
    payload.templateEngineVersion = SHAREPOINT_TEMPLATE_ENGINE_VERSION;
    if (isEdit) {
      payload.TemplateId = templateId;
    }
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

            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 8, lg: 9 }}>
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
                          siteTemplatesBlockSave ||
                          !formControl.formState.isValid
                        }
                      >
                        {saveTemplate.isPending ? "Saving..." : "Save Template"}
                      </Button>
                      {siteTemplatesBlockSave && (
                        <Tooltip
                          title={
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                              {siteTemplateSaveIssues.map((issue) => (
                                <li key={issue}>{issue}</li>
                              ))}
                            </Box>
                          }
                        >
                          <IconButton
                            size="small"
                            aria-label="What needs fixing before save"
                            sx={{ color: "error.main" }}
                          >
                            <InfoOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                {isLoadingTemplate ? (
                  <CippSharePointTemplateQuickStatsSkeleton />
                ) : (
                  <CippSharePointTemplateQuickStats formControl={formControl} />
                )}
              </Grid>
            </Grid>

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
