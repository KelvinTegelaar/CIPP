import { Stack } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";

export const CippTenantStep = (props) => {
  const {
    allTenants,
    type = "single",
    valueField = "defaultDomainName",
    onNextStep,
    formControl,
    currentStep,
    onPreviousStep,
    preText,
    includeTenantDefaults = false,
    includeOffboardingDefaults = false,
  } = props;

  return (
    <Stack spacing={3}>
      {preText}
      <label>Select a tenant</label>
      <CippFormTenantSelector
        valueField={valueField}
        formControl={formControl}
        allTenants={allTenants}
        type={type}
        includeTenantDefaults={includeTenantDefaults || includeOffboardingDefaults}
        preselectedEnabled={true}
      />
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
