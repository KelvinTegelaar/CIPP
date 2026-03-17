import { Button, Stack } from "@mui/material";
import { useFormState } from "react-hook-form";
import { createPortal } from "react-dom";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useCippWizardDialog } from "./CippWizardDialogContext";

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
    nextButtonDisabled = false,
    replacementBehaviour,
    queryKeys,
    ...other
  } = props;
  const { isValid, isSubmitted, isSubmitting } = useFormState({ control: formControl.control });
  const dialogContext = useCippWizardDialog();
  const mergedQueryKeys = [
    ...(Array.isArray(queryKeys) ? queryKeys : queryKeys ? [queryKeys] : []),
    ...(Array.isArray(dialogContext?.relatedQueryKeys)
      ? dialogContext.relatedQueryKeys
      : dialogContext?.relatedQueryKeys
        ? [dialogContext.relatedQueryKeys]
        : []),
  ];
  const sendForm = ApiPostCall({
    relatedQueryKeys: mergedQueryKeys.length ? mergedQueryKeys : undefined,
  });
  const handleSubmit = () => {
    const values = formControl.getValues();
    const newData = {};
    Object.keys(values).forEach((key) => {
      const value = values[key];
      // Only add non-null values if removeNulls is specified
      if (replacementBehaviour !== "removeNulls" || value !== null) {
        newData[key] = value;
      }
    });
    sendForm.mutate({ url: postUrl, data: newData });
  };

  const buttonStack = (
    <Stack
      alignItems="center"
      direction="row"
      justifyContent="flex-end"
      spacing={2}
      sx={dialogContext?.actionsEl ? {} : { mt: 3 }}
    >
      {dialogContext?.onClose && (
        <Button
          color="inherit"
          onClick={dialogContext.onClose}
          size="large"
          type="button"
          sx={{ mr: "auto" }}
        >
          Close
        </Button>
      )}
      {currentStep > 0 && (
        <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
          Back
        </Button>
      )}
      {!noNextButton && currentStep !== lastStep && (
        <Button
          size="large"
          disabled={!isValid || nextButtonDisabled}
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
  );

  return (
    <>
      <CippApiResults apiObject={sendForm} />
      {dialogContext?.actionsEl ? createPortal(buttonStack, dialogContext.actionsEl) : buttonStack}
    </>
  );
};

export default CippWizardStepButtons;
