import { useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import { ApiGetCall } from "../../../../api/ApiCall";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import CippIntuneSettingsEditor, {
  useIntuneDefinitionResolver,
} from "../../../../components/CippComponents/CippIntuneSettingsEditor";
import {
  applyIntuneSettingEdits,
  buildIntunePropertyLeaves,
  buildIntuneSettingLeaves,
  defaultValueForLeaf,
} from "../../../../utils/intune-template-leaves";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";

const EditIntuneTemplate = () => {
  const router = useRouter();
  const { id } = router.query;
  const formControl = useForm({ mode: "onChange" });

  const templateQuery = ApiGetCall({
    url: `/api/ListIntuneTemplates?id=${id}`,
    queryKey: `IntuneTemplate-${id}`,
    enabled: !!id,
  });

  const templateData = Array.isArray(templateQuery.data)
    ? templateQuery.data.find((t) => t.id === id || t.GUID === id)
    : templateQuery.data;

  // The stored policy, parsed once and never rebuilt. Everything the editor does is expressed as a
  // patch against this object, so properties no field is bound to survive the round-trip untouched.
  const originalPolicy = useMemo(() => {
    if (!templateData?.RAWJson) return null;
    try {
      return JSON.parse(templateData.RAWJson);
    } catch {
      return null;
    }
  }, [templateData?.RAWJson]);

  // A settings catalog policy names its settings by ID; the friendly names and the option lists come
  // from a catalog that is fetched separately, so the editor waits for it rather than showing raw
  // IDs that would rename themselves a moment later.
  const {
    getDefinition,
    isLoading: definitionsLoading,
    isError: definitionsError,
  } = useIntuneDefinitionResolver(originalPolicy);

  // Administrative templates carry their settings as definition references resolved against a
  // tenant, which CIPP cannot present as fields. Their name and description stay editable.
  const isAdminTemplate =
    Array.isArray(originalPolicy?.added) || Array.isArray(originalPolicy?.definitionValues);
  const isSettingTree =
    Array.isArray(originalPolicy?.settings) || Array.isArray(originalPolicy?.omaSettings);

  const leaves = useMemo(() => {
    if (!originalPolicy || isAdminTemplate || definitionsLoading) return [];
    return isSettingTree
      ? buildIntuneSettingLeaves(originalPolicy, getDefinition)
      : buildIntunePropertyLeaves(originalPolicy, getCippTranslation);
  }, [originalPolicy, getDefinition, isAdminTemplate, isSettingTree, definitionsLoading]);

  useEffect(() => {
    // Deferred until the leaves are final. Resetting once the catalog arrives would otherwise
    // discard anything typed while it was still downloading.
    if (!templateData || definitionsLoading) return;
    formControl.reset({
      displayName: templateData.Displayname ?? templateData.displayName ?? "",
      description: templateData.Description ?? templateData.description ?? "",
      settingValues: leaves.map(defaultValueForLeaf),
    });
  }, [templateData, leaves, definitionsLoading]);

  const customDataFormatter = (values) => {
    const payload = {
      id,
      displayName: values.displayName,
      description: values.description,
    };

    // Omitted for policy shapes with no editable fields, which makes the backend keep the stored
    // RAWJson as-is rather than accept a body this editor cannot faithfully reproduce.
    if (originalPolicy && leaves.length > 0) {
      payload.parsedRAWJson = applyIntuneSettingEdits(originalPolicy, leaves, values.settingValues);
    }

    return payload;
  };

  return (
    <CippFormPage
      title={templateData?.Displayname || templateData?.displayName || "Intune Template"}
      formControl={formControl}
      queryKey={[`IntuneTemplate-${id}`, "IntuneTemplates", "Available Endpoint Manager"]}
      backButtonTitle="Intune Templates"
      postUrl="/api/ExecEditTemplate?type=IntuneTemplate"
      customDataformatter={customDataFormatter}
      formPageType="Edit"
    >
      <Stack spacing={3} sx={{ my: 2 }}>
        {templateQuery.isLoading ? (
          <CippFormSkeleton layout={[2, 1, 2, 2]} />
        ) : templateQuery.isError || !templateData ? (
          <Alert severity="error">Error loading template or template not found.</Alert>
        ) : (
          <>
            <Card variant="outlined">
              <CardHeader
                title="Template details"
                action={templateData.Type ? <Chip label={templateData.Type} size="small" /> : null}
                slotProps={{
                  title: { variant: "h6" }
                }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CippFormComponent
                      type="textField"
                      label="Template Name"
                      name="displayName"
                      formControl={formControl}
                      validators={{
                        required: { value: true, message: "A template name is required" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CippFormComponent
                      type="textField"
                      label="Description"
                      name="description"
                      formControl={formControl}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Policy settings" slotProps={{
                title: { variant: "h6" }
              }} />
              <CardContent>
                {!originalPolicy ? (
                  <Alert severity="error">
                    The stored policy for this template is not valid JSON and cannot be edited.
                  </Alert>
                ) : isAdminTemplate ? (
                  <Alert severity="info">
                    Administrative template settings are resolved against a tenant and cannot be
                    edited here. The name and description above can still be changed.
                  </Alert>
                ) : definitionsLoading ? (
                  <Box>
                    <Stack direction="row" spacing={1.5} sx={{
                      alignItems: "center"
                    }}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" sx={{
                        color: "text.secondary"
                      }}>
                        Resolving setting names and available values…
                      </Typography>
                    </Stack>
                    <CippFormSkeleton layout={[2, 2, 2]} />
                  </Box>
                ) : (
                  <>
                    {definitionsError && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        The Intune setting catalog could not be loaded, so settings are shown by
                        their definition ID and choices cannot be picked from a list. Values you
                        change are still saved correctly.
                      </Alert>
                    )}
                    <CippIntuneSettingsEditor
                      leaves={leaves}
                      formControl={formControl}
                      fieldPrefix="settingValues"
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </CippFormPage>
  );
};

EditIntuneTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditIntuneTemplate;
