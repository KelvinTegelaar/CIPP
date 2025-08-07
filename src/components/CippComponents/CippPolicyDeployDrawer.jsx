import { useEffect, useState } from "react";
import { Button, Stack, Box } from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import { CippOffCanvas } from "./CippOffCanvas";
import { CippIntunePolicy } from "../CippWizard/CippIntunePolicy";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import CippFormComponent from "./CippFormComponent";
import CippJsonView from "../CippFormPages/CippJSONView";
import { Grid } from "@mui/system";
import { CippFormCondition } from "./CippFormCondition";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { CippFormTenantSelector } from "./CippFormTenantSelector";

export const CippPolicyDeployDrawer = ({
  buttonText = "Deploy Policy",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formControl = useForm();
  const tenantFilter = useSettings()?.tenantFilter;
  const selectedTenants = useWatch({ control: formControl.control, name: "tenantFilter" }) || [];
  const CATemplates = ApiGetCall({ url: "/api/ListIntuneTemplates", queryKey: "IntuneTemplates" });
  const [JSONData, setJSONData] = useState();
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });
  const jsonWatch = useWatch({ control: formControl.control, name: "RAWJson" });
  useEffect(() => {
    if (CATemplates.isSuccess && watcher?.value) {
      const template = CATemplates.data.find((template) => template.GUID === watcher.value);
      if (template) {
        const jsonTemplate = template.RAWJson ? JSON.parse(template.RAWJson) : null;
        setJSONData(jsonTemplate);
        formControl.setValue("RAWJson", template.RAWJson);
        formControl.setValue("displayName", template.Displayname);
        formControl.setValue("description", template.Description);
        formControl.setValue("TemplateType", template.Type);
      }
    }
  }, [watcher]);
  const deployPolicy = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [
      "IntuneTemplates",
      `Configuration Policies - ${tenantFilter}`,
      `Compliance Policies - ${tenantFilter}`,
      `Protection Policies - ${tenantFilter}`,
    ],
  });

  const handleSubmit = () => {
    const formData = formControl.getValues();
    console.log("Submitting form data:", formData);
    deployPolicy.mutate({
      url: "/api/AddPolicy",
      relatedQueryKeys: [
        "IntuneTemplates",
        "Configuration Policies",
        "Compliance Policies",
        "Protection Policies",
      ],
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
        title="Deploy Policy"
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
        <Stack spacing={3}>
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
                    label: template.Displayname,
                    value: template.GUID,
                  }))
                : []
            }
          />

          <CippFormComponent
            type="hidden"
            name="RAWJson"
            label="Conditional Access Parameters"
            placeholder="Enter the JSON information to use as parameters, or select from a template"
            formControl={formControl}
          />
          <CippJsonView object={JSONData} type="intune" />

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="radio"
              name="AssignTo"
              options={[
                { label: "Do not assign", value: "On" },
                { label: "Assign to all users", value: "allLicensedUsers" },
                { label: "Assign to all devices", value: "AllDevices" },
                { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
                { label: "Assign to Custom Group", value: "customGroup" },
              ]}
              formControl={formControl}
            />
          </Grid>
          <CippFormCondition
            formControl={formControl}
            field="AssignTo"
            compareType="is"
            compareValue="customGroup"
          >
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Custom Group Names separated by comma. Wildcards (*) are allowed"
                name="customGroup"
                formControl={formControl}
                validators={{ required: "Please specify custom group names" }}
              />
            </Grid>
          </CippFormCondition>
          <CippFormCondition
            formControl={formControl}
            field="RAWJson"
            compareType="regex"
            compareValue={/%(\w+)%/}
          >
            {(() => {
              const rawJson = jsonWatch ? jsonWatch : "";
              const placeholderMatches = [...rawJson.matchAll(/%(\w+)%/g)].map((m) => m[1]);
              const uniquePlaceholders = Array.from(new Set(placeholderMatches));
              if (uniquePlaceholders.length === 0 || selectedTenants.length === 0) {
                return null;
              }
              return uniquePlaceholders.map((placeholder) => (
                <Grid key={placeholder} size={{ xs: 12 }}>
                  {selectedTenants.map((tenant, idx) => (
                    <CippFormComponent
                      key={`${tenant.value}-${placeholder}-${idx}`}
                      type="textField"
                      defaultValue={
                        //if the placeholder is tenantid then replace it with tenant.addedFields.customerId, if the placeholder is tenantdomain then replace it with tenant.addedFields.defaultDomainName.
                        placeholder === "tenantid"
                          ? tenant?.addedFields?.customerId
                          : placeholder === "tenantdomain"
                          ? tenant?.addedFields?.defaultDomainName
                          : ""
                      }
                      name={`replacemap.${tenant.value}.%${placeholder}%`}
                      label={`Value for '${placeholder}' in Tenant '${tenant.addedFields.defaultDomainName}'`}
                      formControl={formControl}
                      validators={{ required: `Please provide a value for ${placeholder}` }}
                      sx={{ m: 1 }}
                    />
                  ))}
                </Grid>
              ));
            })()}
          </CippFormCondition>
          <CippApiResults apiObject={deployPolicy} />
        </Stack>
      </CippOffCanvas>
    </>
  );
};
