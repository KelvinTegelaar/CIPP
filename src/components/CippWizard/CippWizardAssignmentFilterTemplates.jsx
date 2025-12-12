import { Stack } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { Grid } from "@mui/system";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";

const DEVICE_PLATFORM_OPTIONS = [
  { label: "Windows 10 and later", value: "windows10AndLater" },
  { label: "iOS", value: "iOS" },
  { label: "macOS", value: "macOS" },
  { label: "Android Enterprise", value: "androidForWork" },
  { label: "Android device administrator", value: "android" },
  { label: "Android Work Profile", value: "androidWorkProfile" },
  { label: "Android (AOSP)", value: "androidAOSP" },
];

const APP_PLATFORM_OPTIONS = [
  { label: "Windows", value: "windowsMobileApplicationManagement" },
  { label: "Android", value: "androidMobileApplicationManagement" },
  { label: "iOS/iPadOS", value: "iOSMobileApplicationManagement" },
];

const FILTER_TYPE_OPTIONS = [
  { label: "Devices", value: "devices" },
  { label: "Apps", value: "apps" },
];

export const CippWizardAssignmentFilterTemplates = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;
  const templateSelection = useWatch({ control: formControl.control, name: "TemplateList" });
  const assignmentFilterManagementType =
    useWatch({
      control: formControl?.control ?? formControl,
      name: "assignmentFilterManagementType",
      defaultValue: "devices",
    }) ?? "devices";
  const platformOptions =
    assignmentFilterManagementType === "apps" ? APP_PLATFORM_OPTIONS : DEVICE_PLATFORM_OPTIONS;

  useEffect(() => {
    if (templateSelection?.value) {
      const { addedFields } = templateSelection;

      formControl.setValue(
        "assignmentFilterManagementType",
        addedFields.assignmentFilterManagementType || "devices"
      );
      formControl.setValue("platform", addedFields.platform || "");
      formControl.setValue("displayName", addedFields.displayName || "");
      formControl.setValue("description", addedFields.description || "");
      formControl.setValue("rule", addedFields.rule || "");
    }
  }, [templateSelection, formControl]);

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
            name="assignmentFilterManagementType"
            label="Filter Type"
            formControl={formControl}
            validators={{ required: "Filter Type is required" }}
            options={FILTER_TYPE_OPTIONS}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="radio"
            name="platform"
            label="Platform"
            formControl={formControl}
            options={platformOptions}
            validators={{ required: "Platform is required" }}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="displayName"
            label="Filter Display Name"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
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
            validators={{ required: "Filter Rule is required" }}
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
