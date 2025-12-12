import React, { useState, useEffect } from "react";
import { Button, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { RocketLaunch } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";

export const CippDeployContactTemplateDrawer = ({
  buttonText = "Deploy Contact Template",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      selectedTenants: [],
      TemplateList: [],
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  const deployTemplate = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["DeployContactTemplates"],
  });

  // Reset form fields on successful creation
  useEffect(() => {
    if (deployTemplate.isSuccess) {
      formControl.reset({
        selectedTenants: [],
        TemplateList: [],
      });
    }
  }, [deployTemplate.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }

    const formData = formControl.getValues();

    deployTemplate.mutate({
      url: "/api/DeployContactTemplates",
      data: formData,
      relatedQueryKeys: ["DeployContactTemplates"],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      selectedTenants: [],
      TemplateList: [],
    });
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
        title="Deploy Contact Templates"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={deployTemplate.isLoading || !isValid}
            >
              {deployTemplate.isLoading
                ? "Deploying..."
                : deployTemplate.isSuccess
                ? "Deploy Another"
                : "Deploy Templates"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              label="Select Tenants"
              formControl={formControl}
              name="selectedTenants"
              type="multiple"
              allTenants={true}
              preselectedEnabled={true}
              validators={{ required: "At least one tenant must be selected" }}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* TemplateList */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Select a template"
              name="TemplateList"
              formControl={formControl}
              multiple={true}
              validators={{ required: "At least one template must be selected" }}
              api={{
                queryKey: `TemplateListConnectors`,
                labelField: "name",
                valueField: (option) => option,
                url: "/api/ListContactTemplates",
              }}
              placeholder="Select a template or enter PowerShell JSON manually"
            />
          </Grid>

          <CippApiResults apiObject={deployTemplate} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
