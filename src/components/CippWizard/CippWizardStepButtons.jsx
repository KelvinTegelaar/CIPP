import { Button, Stack } from "@mui/material";
import { useFormState } from "react-hook-form";

export const CippWizardStepButtons = (props) => {
  const { lastStep, currentStep, onPreviousStep, onNextStep, formControl, ...other } = props;

  const { isDirty, isValid, isSubmitted } = useFormState({ control: formControl.control });
  return (
    <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
      {currentStep > 0 && (
        <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
          Back
        </Button>
      )}
      {currentStep !== lastStep && (
        <Button
          size="large"
          disabled={!isValid}
          onClick={onNextStep}
          type="submit"
          variant="contained"
        >
          Next Step
        </Button>
      )}
      {currentStep === lastStep && (
        <Button
          size="large"
          disabled={!isValid || isSubmitted}
          onClick={onNextStep}
          type="submit"
          variant="contained"
          //post the form.
        >
          Submit
        </Button>
      )}
    </Stack>
  );
};

export default CippWizardStepButtons;
