import { Stack } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { Grid } from "@mui/system";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";

export const CippWizardAssignmentFilterTemplates = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });
  
  const platformOptions = [
    { label: "Windows 10 and Later", value: "windows10AndLater" },
    { label: "iOS", value: "iOS" },
    { label: "Android", value: "android" },
    { label: "macOS", value: "macOS" },
    { label: "Android Work Profile", value: "androidWorkProfile" },
    { label: "Android AOSP", value: "androidAOSP" },
  ];

  const filterTypeOptions = [
    { label: "Devices", value: "devices" },
    { label: "Apps", value: "apps" },
  ];

  useEffect(() => {
    if (watcher?.value) {
      console.log("Loading template:", watcher);

      // Set platform first to ensure conditional fields are visible
      formControl.setValue("platform", watcher.addedFields.platform);

      // Use setTimeout to ensure the DOM updates before setting other fields
      setTimeout(() => {
        formControl.setValue("displayName", watcher.addedFields.displayName);
        formControl.setValue("description", watcher.addedFields.description);
        formControl.setValue("rule", watcher.addedFields.rule);
        formControl.setValue("assignmentFilterManagementType", watcher.addedFields.assignmentFilterManagementType);

        console.log("Set rule to:", watcher.addedFields.rule);
      }, 100);
    }
  }, [watcher]);

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <CippFormComponent
            type="autoComplete"
            name="TemplateList"
            label="Choose a Template"
            formControl={formControl}
            creatable={false}
            multiple={false}
            api={{
              excludeTenantFilter: true,
              url: "/api/ListAssignmentFilterTemplates",
              queryKey: "ListAssignmentFilterTemplates",
              labelField: (option) =>
                `${option.Displayname || option.displayName} (${option.platform})`,
              valueField: "GUID",
              addedField: {
                platform: "platform",
                displayName: "displayName",
                description: "description",
                rule: "rule",
                assignmentFilterManagementType: "assignmentFilterManagementType",
              },
              showRefresh: true,
            }}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="radio"
            name="platform"
            label="Platform"
            formControl={formControl}
            options={platformOptions}
            validators={{ required: "Please select a platform" }}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="radio"
            name="assignmentFilterManagementType"
            label="Filter Type"
            formControl={formControl}
            options={filterTypeOptions}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="displayName"
            label="Filter Display Name"
            formControl={formControl}
            validators={{ required: "Filter display name is required" }}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="description"
            label="Filter Description"
            formControl={formControl}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="rule"
            label="Filter Rule"
            formControl={formControl}
            multiline
            rows={6}
            validators={{ required: "Filter rule is required" }}
          />
        </Grid>
      </Grid>

      <CippWizardStepButtons
        postUrl={postUrl}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
