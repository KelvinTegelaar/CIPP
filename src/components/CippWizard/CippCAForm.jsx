import { Grid, Stack } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippJsonView from "../CippFormPages/CippJSONView";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { ApiGetCall } from "../../api/ApiCall";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

export const CippCAForm = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();
  const CATemplates = ApiGetCall({ url: "/api/ListCATemplates" });
  const [JSONData, setJSONData] = useState();
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });
  useEffect(() => {
    if (CATemplates.isSuccess && watcher?.value) {
      const template = CATemplates.data.find((template) => template.GUID === watcher.value);
      if (template) {
        setJSONData(template);
        formControl.setValue("rawjson", JSON.stringify(template, null));
      }
    }
  }, [CATemplates, watcher]);

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
