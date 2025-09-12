import { useEffect, useState, useCallback } from "react";
import { Button, Stack, Box } from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import { CippOffCanvas } from "./CippOffCanvas";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import CippFormComponent from "./CippFormComponent";
import CippJsonView from "../CippFormPages/CippJSONView";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { CippFormTenantSelector } from "./CippFormTenantSelector";

export const CippCADeployDrawer = ({
  buttonText = "Deploy CA Policy",
  requiredPermissions = [],
  PermissionButton = Button,
  templateId = null, // New prop for pre-supplying template ID
  open = null, // External control for drawer visibility
  onClose = null, // External close handler
}) => {
  const [internalDrawerVisible, setInternalDrawerVisible] = useState(false);
  const formControl = useForm();
  const tenantFilter = useSettings()?.tenantFilter;
  const CATemplates = ApiGetCall({ url: "/api/ListCATemplates", queryKey: "CATemplates" });
  const [JSONData, setJSONData] = useState();
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });

  // Use external open state if provided, otherwise use internal state
  const drawerVisible = open !== null ? open : internalDrawerVisible;
  const isExternallyControlled = open !== null && onClose !== null;

  const updateTemplate = useCallback(
    (templateGuid) => {
      if (CATemplates.isSuccess && templateGuid) {
        const template = CATemplates.data.find((template) => template.GUID === templateGuid);
        if (template) {
          setJSONData(template);
          formControl.setValue("rawjson", JSON.stringify(template, null));
        }
      }
    },
    [CATemplates.isSuccess, CATemplates.data, formControl.setValue]
  );

  // Effect to set template when templateId prop is provided
  useEffect(() => {
    if (templateId && CATemplates.isSuccess) {
      // Find the template to get the display name
      const template = CATemplates.data.find((template) => template.GUID === templateId);
      if (template) {
        // Pre-select the template when drawer opens
        formControl.setValue("TemplateList", { value: templateId, label: template.displayName });
        updateTemplate(templateId);
      }
    }
  }, [templateId, CATemplates.isSuccess, formControl, updateTemplate]);

  useEffect(() => {
    updateTemplate(watcher?.value);
  }, [updateTemplate, watcher?.value]);

  const deployPolicy = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CATemplates", `Conditional Access Policies - ${tenantFilter}`],
  });

  const handleSubmit = () => {
    const formData = formControl.getValues();
    console.log("Submitting CA form data:", formData);
    deployPolicy.mutate({
      url: "/api/AddCAPolicy",
      relatedQueryKeys: ["CATemplates", "Conditional Access Policies"],
      data: { ...formData },
    });
  };

  const handleCloseDrawer = () => {
    if (isExternallyControlled) {
      onClose();
    } else {
      setInternalDrawerVisible(false);
    }
    formControl.reset();
  };

  return (
    <>
      {!isExternallyControlled && (
        <PermissionButton
          requiredPermissions={requiredPermissions}
          onClick={() => setInternalDrawerVisible(true)}
          startIcon={<RocketLaunch />}
        >
          {buttonText}
        </PermissionButton>
      )}
      <CippOffCanvas
        title="Deploy Conditional Access Policy"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack direction="row" justifyContent="flex-start" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={deployPolicy.isLoading}
            >
              {deployPolicy.isLoading
                ? "Deploying..."
                : deployPolicy.isSuccess
                ? "Redeploy Policy"
                : "Deploy Policy"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <CippFormTenantSelector
            formControl={formControl}
            name="tenantFilter"
            required={true}
            disableClearable={false}
            allTenants={true}
            type="multiple"
          />

          <CippFormComponent
            type="autoComplete"
            name="TemplateList"
            label={templateId ? "Selected Template" : "Please choose a template to apply."}
            isFetching={CATemplates.isLoading}
            multiple={false}
            formControl={formControl}
            disabled={!!templateId} // Disable if templateId is provided
            options={
              CATemplates.isSuccess
                ? CATemplates.data.map((template) => ({
                    label: template.displayName,
                    value: template.GUID,
                  }))
                : []
            }
          />

          <CippFormComponent
            type="hidden"
            name="rawjson"
            label="Conditional Access Parameters"
            placeholder="Enter the JSON information to use as parameters, or select from a template"
            formControl={formControl}
          />

          <CippJsonView object={JSONData} />

          <CippFormComponent
            type="radio"
            name="replacename"
            label="How should groups and users be handled?"
            formControl={formControl}
            options={[
              { value: "leave", label: "Leave the groups and users as is" },
              { value: "displayName", label: "Replace by display name" },
              { value: "AllUsers", label: "Remove all exclusions, apply to all users" },
            ]}
          />

          <CippFormComponent
            type="radio"
            name="newstate"
            label="Policy State"
            formControl={formControl}
            options={[
              { value: "donotchange", label: "Do not change state" },
              { value: "Enabled", label: "Set to enabled" },
              { value: "Disabled", label: "Set to disabled" },
              { value: "enabledForReportingButNotEnforced", label: "Set to report only" },
            ]}
          />

          <CippFormComponent
            type="switch"
            name="overwrite"
            label="Overwrite Existing Policy"
            formControl={formControl}
          />

          <CippFormComponent
            type="switch"
            name="DisableSD"
            label="Disable Security Defaults if enabled when creating policy"
            formControl={formControl}
          />

          <CippApiResults apiObject={deployPolicy} />
        </Stack>
      </CippOffCanvas>
    </>
  );
};
