import { Stack } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";

export const CippWizardAutoComplete = (props) => {
  const {
    title,
    type = "single",
    name,
    placeholder,
    api,
    onNextStep,
    formControl,
    currentStep,
    onPreviousStep,
  } = props;

  const currentTenant = formControl.watch("tenantFilter");

  return (
    <Stack spacing={3}>
      <label>{title}</label>
      <CippFormComponent
        key={currentTenant ? currentTenant.value : "default"}
        type="autoComplete"
        name={name}
        formControl={formControl}
        placeholder={placeholder}
        api={{
          ...api,
          tenantFilter: currentTenant ? currentTenant.value : undefined,
          queryKey: api.queryKey ? api.queryKey.replace('{tenant}', currentTenant ? currentTenant.value : "default") : `${api.url}-${currentTenant ? currentTenant.value : "default"}`,
        }}
        multiple={type === "single" ? false : true}
        disableClearable={true}
        validators={{
          required: { value: true, message: "This field is required" },
        }}
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
