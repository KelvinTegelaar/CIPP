import { Grid, Stack } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippJsonView from "../CippFormPages/CippJSONView";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { ApiGetCall } from "../../api/ApiCall";
import { use, useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { CippFormCondition } from "../CippComponents/CippFormCondition";

export const CippIntunePolicy = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();
  const CATemplates = ApiGetCall({ url: "/api/ListIntuneTemplates", queryKey: "IntuneTemplates" });
  const [JSONData, setJSONData] = useState();
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });
  const jsonWatch = useWatch({ control: formControl.control, name: "RAWJson" });
  const selectedTenants = useWatch({ control: formControl.control, name: "tenantFilter" });
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

  return (
    <Stack spacing={3}>
      <Stack spacing={3}>
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

        <Grid item xs={12}>
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
          <Grid item xs={12}>
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
              <Grid key={placeholder} item xs={6}>
                {selectedTenants.map((tenant, idx) => (
                  <CippFormComponent
                    key={`${tenant.value}-${placeholder}-${idx}`}
                    type="textField"
                    name={`replacemap.${tenant.value}.%${placeholder}%`}
                    label={`Value for '${placeholder}' in Tenant '${tenant.addedFields.defaultDomainName}'`}
                    formControl={formControl}
                    validators={{ required: `Please provide a value for ${placeholder}` }}
                  />
                ))}
              </Grid>
            ));
          })()}
        </CippFormCondition>
      </Stack>
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        noNextButton={values.selectedOption === "UpdateTokens"}
        formControl={formControl}
        noSubmitButton={true}
      />
    </Stack>
  );
};
