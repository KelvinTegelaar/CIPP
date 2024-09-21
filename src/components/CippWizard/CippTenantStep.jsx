import { Stack } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippTenantSelector } from "../CippComponents/CippTenantSelector";
export const CippTenantStep = (props) => {
  const { allTenants, type, onNextStep, formControl, currentStep, onPreviousStep } = props;

  return (
    <Stack spacing={3}>
      <label>Select a tenant</label>
      <CippTenantSelector width="100%" tenantButton={false} allTenants={allTenants} type={type} />
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
