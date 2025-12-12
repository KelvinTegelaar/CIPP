import { Stack } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippFormCondition } from "../CippComponents/CippFormCondition";
import { Grid } from "@mui/system";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";

export const CippWizardGroupTemplates = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });
  const groupOptions = [
    { label: "Dynamic Group", value: "dynamic" },
    { label: "Dynamic Distribution Group", value: "dynamicDistribution" },
    { label: "Security Group", value: "generic" },
    { label: "Distribution Group", value: "distribution" },
    { label: "Azure Role Group", value: "azureRole" },
    { label: "Mail Enabled Security Group", value: "security" },
  ];
  useEffect(() => {
    if (watcher?.value) {
      console.log("Loading template:", watcher);

      // Set groupType first to ensure conditional fields are visible
      formControl.setValue("groupType", watcher.addedFields.groupType);

      // Use setTimeout to ensure the DOM updates with the groupType before setting other fields
      setTimeout(() => {
        formControl.setValue("displayName", watcher.addedFields.displayName);
        formControl.setValue("description", watcher.addedFields.description);
        formControl.setValue("username", watcher.addedFields.username);
        formControl.setValue("allowExternal", watcher.addedFields.allowExternal);
        formControl.setValue("membershipRules", watcher.addedFields.membershipRules);

        console.log("Set membershipRules to:", watcher.addedFields.membershipRules);
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
              url: "/api/ListGroupTemplates",
              queryKey: "ListGroupTemplates",
              labelField: (option) =>
                `${option.Displayname || option.displayName} (${option.groupType})`,
              valueField: "GUID",
              addedField: {
                groupType: "groupType",
                displayName: "displayName",
                description: "description",
                username: "username",
                allowExternal: "allowExternal",
                membershipRules: "membershipRules",
              },
              showRefresh: true,
            }}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="radio"
            name="groupType"
            label="Group Type"
            formControl={formControl}
            options={groupOptions}
            validators={{ required: "Please select a group type" }}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="displayName"
            label="Group Display Name"
            formControl={formControl}
            validators={{ required: "Group display name is required" }}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="description"
            label="Group Description"
            formControl={formControl}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="username"
            label="Group Username"
            formControl={formControl}
          />
        </Grid>
        <CippFormCondition
          field="groupType"
          compareType="is"
          compareValue="distribution"
          formControl={formControl}
        >
          <Grid size={12}>
            <CippFormComponent
              type="switch"
              name="allowExternal"
              label="Allow external emails to the group"
              formControl={formControl}
            />
          </Grid>
        </CippFormCondition>
        <CippFormCondition
          field="groupType"
          compareType="isOneOf"
          compareValue={["dynamic", "dynamicDistribution"]}
          formControl={formControl}
        >
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="membershipRules"
              label="Membership Rules"
              formControl={formControl}
              validators={{ required: "Membership rules are required" }}
            />
          </Grid>
        </CippFormCondition>
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
