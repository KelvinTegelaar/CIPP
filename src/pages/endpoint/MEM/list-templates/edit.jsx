import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import CippIntuneSettingsEditor from "../../../../components/CippComponents/CippIntuneSettingsEditor";
import { CippIntunePolicySettingsCard } from "../../../../components/CippComponents/CippIntunePolicySettingsCard";
import { defaultValueForLeaf } from "../../../../utils/intune-template-leaves";
import { useIntunePolicyEditor } from "../../../../hooks/use-intune-policy-editor";

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

  // Replaced only by adding or removing settings; scalar edits stay in form state until save.
  const [workingPolicy, setWorkingPolicy] = useState(null);
  useEffect(() => {
    setWorkingPolicy(originalPolicy);
  }, [originalPolicy]);
  const policy = workingPolicy ?? originalPolicy;

  const editor = useIntunePolicyEditor({ policy, setPolicy: setWorkingPolicy, formControl });
  const {
    structureRevision,
    definitionsLoading,
    definitionsError,
    leaves,
    isAdminTemplate,
    supportsStructuralEdits,
    foldValuesIntoPolicy,
  } = editor;

  // react-hook-form reports an unpopulated text field as '', so the first pass is tracked explicitly.
  const populatedFromTemplate = useRef(false);

  useEffect(() => {
    // Deferred until the leaves are final. Resetting once the catalog arrives would otherwise
    // discard anything typed while it was still downloading.
    if (!templateData || definitionsLoading) return;

    // Later passes come from adding/removing settings and must keep the name and description typed so far.
    const current = formControl.getValues();
    const firstPass = !populatedFromTemplate.current;
    populatedFromTemplate.current = true;

    formControl.reset({
      displayName: firstPass
        ? templateData.Displayname ?? templateData.displayName ?? ""
        : current.displayName,
      description: firstPass
        ? templateData.Description ?? templateData.description ?? ""
        : current.description,
      settingValues: leaves.map(defaultValueForLeaf),
    });
  }, [templateData, leaves, definitionsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const customDataFormatter = (values) => {
    const payload = {
      id,
      displayName: values.displayName,
      description: values.description,
    };

    // Omitted for policy shapes with no editable fields, which makes the backend keep the stored
    // RAWJson as-is rather than accept a body this editor cannot faithfully reproduce. Removing the
    // last setting leaves no fields but is still an edit.
    if (policy && (leaves.length > 0 || workingPolicy !== originalPolicy)) {
      payload.parsedRAWJson = foldValuesIntoPolicy();
    }

    return payload;
  };

  const validateCall = ApiPostCall({});
  const handleValidate = () =>
    validateCall.mutate({
      url: "/api/ExecValidateIntuneTemplate",
      data: {
        ID: id,
        RAWJson: JSON.stringify(foldValuesIntoPolicy()),
        TemplateType: templateData?.Type,
        displayName: formControl.getValues().displayName,
      },
    });

  return (
    <CippFormPage
      title={templateData?.Displayname || templateData?.displayName || "Intune Template"}
      formControl={formControl}
      queryKey={[`IntuneTemplate-${id}`, "IntuneTemplates", "Available Endpoint Manager"]}
      backButtonTitle="Intune Templates"
      postUrl="/api/ExecEditTemplate?type=IntuneTemplate"
      allowResubmit={structureRevision > 0}
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
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleValidate}
                      disabled={validateCall.isPending || !originalPolicy}
                    >
                      {validateCall.isPending ? "Checking…" : "Validate template"}
                    </Button>
                    <Typography variant="caption" sx={{ color: "text.secondary", ml: 2 }}>
                      Checks these changes for anything that would stop the template deploying.
                      Nothing is saved.
                    </Typography>
                  </Box>
                  <CippApiResults apiObject={validateCall} />
                </Stack>
              </CardContent>
            </Card>

            {supportsStructuralEdits && (
              <CippIntunePolicySettingsCard
                policy={policy}
                editor={editor}
                platform={policy?.platforms}
                technology={policy?.technologies}
                emptyText="This policy has no settings. It would deploy as an empty policy."
              />
            )}

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
