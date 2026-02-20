import { useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { useForm, useWatch, useFormState } from "react-hook-form";
import { CippOffCanvas } from "./CippOffCanvas";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import CippFormComponent from "./CippFormComponent";
import CippJsonView from "../CippFormPages/CippJSONView";
import { Grid } from "@mui/system";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { PermissionButton as PermissionAwareButton } from "../../utils/permissions";

export const CippReusableSettingsDeployDrawer = ({
  buttonText = "Deploy Reusable Settings",
  requiredPermissions = [],
  PermissionButton = PermissionAwareButton,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formControl = useForm({ mode: "onChange" });
  const { isValid } = useFormState({ control: formControl.control });
  const tenantFilter = useSettings()?.tenantFilter;
  const selectedTemplate = useWatch({ control: formControl.control, name: "TemplateList" });
  const rawJson = useWatch({ control: formControl.control, name: "rawJSON" });
  const selectedTenants = useWatch({ control: formControl.control, name: "tenantFilter" });

  const templates = ApiGetCall({ url: "/api/ListIntuneReusableSettingTemplates", queryKey: "ListIntuneReusableSettingTemplates" });

  useEffect(() => {
    if (templates.isSuccess && selectedTemplate?.value) {
      const match = templates.data?.find((t) => t.GUID === selectedTemplate.value);
      if (match) {
        formControl.setValue("rawJSON", match.RawJSON || "");
        formControl.setValue("TemplateId", match.GUID);
      }
    }
  }, [templates.isSuccess, templates.data, selectedTemplate, formControl]);

  const effectiveTenants = Array.isArray(selectedTenants) && selectedTenants.length > 0
    ? selectedTenants
    : tenantFilter
      ? [tenantFilter]
      : [];

  const deploy = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [
      "ListIntuneReusableSettingTemplates",
      `ListIntuneReusableSettings-${effectiveTenants.join(",")}`,
    ],
  });

  const handleSubmit = async () => {
    const isFormValid = await formControl.trigger();
    if (!isFormValid) {
      return;
    }
    const values = formControl.getValues();
    deploy.mutate({
      url: "/api/AddIntuneReusableSetting",
      data: {
        tenantFilter: effectiveTenants,
        TemplateId: values?.TemplateList?.value,
        rawJSON: values?.rawJSON,
      },
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset();
    deploy.reset();
  };

  const safeJson = () => {
    if (!rawJson) return null;
    try {
      return JSON.parse(rawJson);
    } catch (e) {
      return null;
    }
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<RocketLaunch />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Deploy Reusable Settings"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={deploy.isLoading || !isValid}
            >
              {deploy.isLoading ? "Deploying..." : "Deploy"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          <CippFormTenantSelector
            formControl={formControl}
            name="tenantFilter"
            required={true}
            disableClearable={false}
            allTenants={true}
            preselectedEnabled={true}
            type="multiple"
          />
          <CippFormComponent
            type="autoComplete"
            name="TemplateList"
            label="Choose a Reusable Settings Template"
            isFetching={templates.isLoading}
            multiple={false}
            formControl={formControl}
            options={
              templates.isSuccess && Array.isArray(templates.data)
                ? templates.data.map((t) => ({
                    label:
                      t.displayName ||
                      t.DisplayName ||
                      t.templateName ||
                      t.TemplateName ||
                      t.name ||
                      `Template ${t.GUID}`,
                    value: t.GUID,
                  }))
                : []
            }
            validators={{ required: { value: true, message: "Template selection is required" } }}
          />
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="json"
              name="rawJSON"
              label="Raw JSON"
              formControl={formControl}
              required
              validators={{ required: "Raw JSON is required" }}
              rows={12}
            />
          </Grid>
          <CippJsonView object={safeJson()} type="intune" />
          <CippApiResults apiObject={deploy} />
        </Stack>
      </CippOffCanvas>
    </>
  );
};
