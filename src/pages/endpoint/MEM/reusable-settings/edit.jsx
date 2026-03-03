import { useEffect } from "react";
import { Alert, Box, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";

const EditReusableSetting = () => {
  const router = useRouter();
  const { id, tenant } = router.query;
  const { currentTenant } = useSettings();

  const effectiveTenant = tenant || currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: effectiveTenant,
    },
  });

  const { reset } = formControl;

  const settingQuery = ApiGetCall({
    url: "/api/ListIntuneReusableSettings",
    queryKey: ["ListIntuneReusableSettings", effectiveTenant, id],
    enabled: !!id && !!effectiveTenant,
    data: { tenantFilter: effectiveTenant, ID: id },
  });

  const record = Array.isArray(settingQuery.data) ? settingQuery.data[0] : settingQuery.data;

  useEffect(() => {
    if (record) {
      reset({
        tenantFilter: effectiveTenant,
        ID: record.id,
        displayName: record.displayName,
        description: record.description,
        rawJSON: record.RawJSON,
      });
    }
  }, [record, effectiveTenant, reset]);

  const safeJson = () => {
    if (!record?.RawJSON) return null;
    try {
      return JSON.parse(record.RawJSON);
    } catch (e) {
      console.error("Failed to parse RawJSON for reusable setting preview", {
        error: e,
        recordId: record?.id,
      });
      return null;
    }
  };

  const customDataformatter = (values) => ({
    tenantFilter: values.tenantFilter || effectiveTenant,
    ID: values.ID, // forward the existing setting id so the API updates the same record
    TemplateId: values.ID, // keep legacy TemplateId for API compatibility
    displayName: values.displayName,
    description: values.description,
    rawJSON: values.rawJSON,
  });

  return (
    <CippFormPage
      title={
        record?.displayName ? `Reusable Setting - ${record.displayName}` : "Edit Reusable Setting"
      }
      formControl={formControl}
      queryKey={["ListIntuneReusableSettings", effectiveTenant, id]}
      backButtonTitle="Reusable Settings"
      postUrl="/api/AddIntuneReusableSetting"
      customDataformatter={customDataformatter}
      formPageType="Edit"
      resetForm={false}
    >
      <Box sx={{ my: 2 }}>
        {settingQuery.isLoading ? (
          <CippFormSkeleton layout={[2, 2, 2]} />
        ) : settingQuery.isError || !record ? (
          <Alert severity="error">Error loading reusable setting or setting not found.</Alert>
        ) : (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent type="hidden" name="tenantFilter" formControl={formControl} />
                <CippFormComponent type="hidden" name="ID" formControl={formControl} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="textField"
                  name="displayName"
                  label="Display Name"
                  formControl={formControl}
                  validators={{ required: "Display Name is required" }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="textField"
                  name="description"
                  label="Description"
                  formControl={formControl}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="json"
                  name="rawJSON"
                  label="Raw JSON"
                  formControl={formControl}
                  required
                  validators={{ required: "Raw JSON is required" }}
                  rows={14}
                />
              </Grid>
            </Grid>
            <CippJsonView object={safeJson()} type="intune" defaultOpen={true} />
          </Stack>
        )}
      </Box>
    </CippFormPage>
  );
};

EditReusableSetting.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditReusableSetting;
