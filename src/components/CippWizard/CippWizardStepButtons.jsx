import { Button, Stack } from "@mui/material";
import { useFormState } from "react-hook-form";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";

export const CippWizardStepButtons = (props) => {
  const {
    postUrl,
    lastStep,
    currentStep,
    onPreviousStep,
    onNextStep,
    formControl,
    noNextButton = false,
    noSubmitButton = false,
    replacementBehaviour,
    queryKeys,
    ...other
  } = props;
  const { isValid, isSubmitted, isSubmitting } = useFormState({ control: formControl.control });
  const sendForm = ApiPostCall({ relatedQueryKeys: queryKeys });
  const handleSubmit = () => {
    const values = formControl.getValues();
    const newData = {};
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (replacementBehaviour !== "removeNulls") {
        newData[key] = value;
      } else if (row[value] !== undefined) {
        newData[key] = row[value];
      }
    });
    sendForm.mutate({ url: postUrl, data: newData });
  };

  return (
    <>
      <CippApiResults apiObject={sendForm} />
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ mt: 3 }}
      >
        {currentStep > 0 && (
          <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
            Back
          </Button>
        )}
        {!noNextButton && currentStep !== lastStep && (
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
        {!noSubmitButton && currentStep === lastStep && (
          <form onSubmit={formControl.handleSubmit(handleSubmit)}>
            <Button size="large" type="submit" variant="contained" disabled={sendForm.isPending}>
              {isSubmitted ? "Resubmit" : "Submit"}
            </Button>
          </form>
        )}
      </Stack>
    </>
  );
};

export default CippWizardStepButtons;
