import { useState, useEffect } from "react";
import { Button, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { RocketLaunch } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";

export const CippAddTransportRuleDrawer = ({
  buttonText = "Deploy Template",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      selectedTenants: [],
      TemplateList: null,
      PowerShellCommand: "",
    },
  });

  const { isValid } = useFormState({ control: formControl.control });
  const templateListVal = useWatch({ control: formControl.control, name: "TemplateList" });

  const addTransportRule = ApiPostCall({
    urlFromData: true,
  });

  // Update PowerShellCommand when template is selected
  useEffect(() => {
    if (templateListVal?.value) {
      formControl.setValue("PowerShellCommand", JSON.stringify(templateListVal?.value));
    }
  }, [templateListVal, formControl]);

  // Reset form fields on successful creation
  useEffect(() => {
    if (addTransportRule.isSuccess) {
      const currentTenants = formControl.getValues("selectedTenants");
      formControl.reset({
        selectedTenants: currentTenants,
        TemplateList: null,
        PowerShellCommand: "",
      });
    }
  }, [addTransportRule.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }

    const formData = formControl.getValues();

    addTransportRule.mutate({
      url: "/api/AddTransportRule",
      data: formData,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      selectedTenants: [],
      TemplateList: null,
      PowerShellCommand: "",
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
        title="Deploy Transport Rule"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={addTransportRule.isLoading || !isValid}
            >
              {addTransportRule.isLoading
                ? "Deploying..."
                : addTransportRule.isSuccess
                ? "Deploy Another"
                : "Deploy Transport Rule"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          {/* Tenant Selector */}
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

          {/* Template List */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Select a template (optional)"
              name="TemplateList"
              formControl={formControl}
              multiple={false}
              api={{
                queryKey: `TemplateListTransport`,
                labelField: "name",
                valueField: (option) => option,
                url: "/api/ListTransportRulesTemplates",
              }}
              placeholder="Select a template or enter PowerShell JSON manually"
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* PowerShell Command */}
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="New-TransportRule parameters (JSON)"
              name="PowerShellCommand"
              formControl={formControl}
              multiline
              rows={6}
              validators={{ required: "Please enter the PowerShell parameters as JSON." }}
            />
          </Grid>

          <CippApiResults apiObject={addTransportRule} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
