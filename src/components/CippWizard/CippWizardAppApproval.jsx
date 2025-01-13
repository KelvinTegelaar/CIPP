import { Stack } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { getCippValidator } from "../../utils/get-cipp-validator";
import { CippFormCondition } from "../CippComponents/CippFormCondition";

export const CippWizardAppApproval = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            label="Application ID"
            validators={{
              validate: (value) => getCippValidator(value, "guid"),
            }}
            name="AppId"
            formControl={formControl}
          />
        </Grid>
      </Grid>
      <CippFormComponent
        type="switch"
        label="Copy permissions from the existing application. This app must have been added to the partner tenant first."
        name="CopyPermissions"
        formControl={formControl}
      />
      <CippFormCondition
        field="CopyPermissions"
        compareType="is"
        compareValue={false}
        formControl={formControl}
      >
        <CippFormComponent
          type="cippDataTable"
          name="permissions"
          title="Domains"
          label="Select your permissions"
          queryKey="GraphpermissionsList"
          api={{ url: "/permissionsList.json" }}
          simpleColumns={["displayName", "description"]}
          formControl={formControl}
        />
      </CippFormCondition>
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
