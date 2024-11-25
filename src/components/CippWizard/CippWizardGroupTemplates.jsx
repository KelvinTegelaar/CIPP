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
    { label: "Dynamic Distribution Group", value: "dynamicdistribution" },
    { label: "Security Group", value: "generic" },
    { label: "Distribution Group", value: "distribution" },
    { label: "Azure Role Group", value: "azurerole" },
    { label: "Mail Enabled Security Group", value: "security" },
  ];
  useEffect(() => {
    if (watcher?.value) {
      formControl.setValue("groupType", watcher.addedFields.groupType);
      formControl.setValue("Displayname", watcher.addedFields.Displayname);
      formControl.setValue("Description", watcher.addedFields.Description);
      formControl.setValue("username", watcher.addedFields.username);
      formControl.setValue("allowExternal", watcher.addedFields.allowExternal);
      formControl.setValue("MembershipRules", watcher.addedFields.MembershipRules);
    }
  }, [watcher]);
  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid item size={12}>
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
              labelField: (option) => `${option.Displayname} (${option.groupType})`,
              valueField: "GUID",
              addedField: {
                groupType: "groupType",
                Displayname: "Displayname",
                Description: "Description",
                username: "username",
                allowExternal: "allowExternal",
                MembershipRules: "MembershipRules",
              },
            }}
          />
        </Grid>
        <Grid item size={12}>
          <CippFormComponent
            type="radio"
            name="groupType"
            label="Group Type"
            formControl={formControl}
            options={groupOptions}
            validators={{ required: "Please select a group type" }}
          />
        </Grid>
        <Grid item size={12}>
          <CippFormComponent
            type="textField"
            name="Displayname"
            label="Group Display Name"
            formControl={formControl}
            validators={{ required: "Group display name is required" }}
          />
        </Grid>
        <Grid item size={12}>
          <CippFormComponent
            type="textField"
            name="Description"
            label="Group Description"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={12}>
          <CippFormComponent
            type="textField"
            name="username"
            label="Group Username"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={12}>
          <CippFormCondition
            field="groupType"
            compareType="is"
            compareValue="distribution"
            formControl={formControl}
          >
            <CippFormComponent
              type="switch"
              name="allowExternal"
              label="Allow external emails to the group"
              formControl={formControl}
            />
          </CippFormCondition>
        </Grid>
        <Grid item size={12}>
          <CippFormCondition
            field="groupType"
            compareType="is"
            compareValue="dynamic"
            formControl={formControl}
          >
            <CippFormComponent
              type="textField"
              name="MembershipRules"
              label="Membership Rules"
              formControl={formControl}
              validators={{ required: "Membership rules are required" }}
            />
          </CippFormCondition>
        </Grid>
        <Grid item size={12}>
          <CippFormCondition
            field="groupType"
            compareType="is"
            compareValue="dynamicdistribution"
            formControl={formControl}
          >
            <CippFormComponent
              type="textField"
              name="MembershipRules"
              label="Membership Rules"
              formControl={formControl}
              validators={{ required: "Membership rules are required" }}
            />
          </CippFormCondition>
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
