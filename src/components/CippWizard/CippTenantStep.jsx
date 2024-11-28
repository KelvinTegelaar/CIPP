import { Stack } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";

export const CippTenantStep = (props) => {
  const {
    allTenants,
    type = "single",
    onNextStep,
    formControl,
    currentStep,
    onPreviousStep,
    preText,
  } = props;

  return (
    <Stack spacing={3}>
      {preText}
      <label>Select a tenant</label>
      <CippFormTenantSelector formControl={formControl} allTenants={allTenants} type={type} />
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
