import { Grid, Stack } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
export const CippWizardAutopilotOptions = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;

  return (
    <Stack spacing={3}>
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="textField"
              label="Group Name (Leave blank to automatically generate)"
              fullWidth
              name="GroupName"
              formControl={formControl}
            />
          </Grid>
        </Grid>
      </>
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
