import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
export const CippDeploymentStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();
  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        {values.selectedOption === "Manual" && (
          <>
            <Typography variant="body1">
              You may enter your secrets below. Leave fields blank to retain existing values.
            </Typography>
            <CippFormComponent
              formControl={formControl}
              type="textField"
              name="TenantID"
              label="Tenant ID"
              placeholder="Enter the Tenant ID. Leave blank to retain previous key."
            />
            <CippFormComponent
              formControl={formControl}
              type="textField"
              name="ApplicationID"
              label="Application ID"
              placeholder="Enter the Application ID. Leave blank to retain previous key."
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="ApplicationSecret"
              label="Application Secret"
              placeholder="Enter the application secret. Leave blank to retain previous key."
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="RefreshToken"
              label="Refresh Token"
              placeholder="Enter the refresh token. Leave blank to retain previous key."
            />
          </>
        )}
      </Stack>
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
