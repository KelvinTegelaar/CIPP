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
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formControl = useForm();
  const tenantFilter = useSettings()?.tenantFilter;
  const CATemplates = ApiGetCall({ url: "/api/ListCATemplates", queryKey: "CATemplates" });
  const [JSONData, setJSONData] = useState();
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });

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
    setDrawerVisible(false);
    formControl.reset();
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
            label="Please choose a template to apply."
            isFetching={CATemplates.isLoading}
            multiple={false}
            formControl={formControl}
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
