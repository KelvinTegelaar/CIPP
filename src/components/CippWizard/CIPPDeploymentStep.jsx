import { useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CIPPDeploymentUpdateTokens } from "./CIPPDeploymentUpdateTokens";

export const CippDeploymentStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();
  
  // Use useEffect to set form values instead of doing it during render
  useEffect(() => {
    if (values.selectedOption === "Manual") {
      formControl.setValue("setKeys", true);
    }
  }, [values.selectedOption, formControl]);
  
  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        {values.selectedOption === "UpdateTokens" && (
          <CIPPDeploymentUpdateTokens formControl={formControl} />
        )}

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
              validators={{
                validate: (value) => {
                  const guidRegex =
                    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                  return value === "" || guidRegex.test(value) || "Invalid Tenant ID";
                },
              }}
            />
            <CippFormComponent
              formControl={formControl}
              type="textField"
              name="ApplicationID"
              label="Application ID"
              placeholder="Enter the Application ID. Leave blank to retain previous key."
              validators={{
                validate: (value) => {
                  const guidRegex =
                    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                  return value === "" || guidRegex.test(value) || "Invalid Application ID";
                },
              }}
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="ApplicationSecret"
              label="Application Secret"
              placeholder="Enter the application secret. Leave blank to retain previous key."
              validators={{
                validate: (value) => {
                  const secretRegex =
                    /^(?!^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)[A-Za-z0-9-_~.]{20,}$/;
                  return (
                    value === "" ||
                    secretRegex.test(value) ||
                    "This should be the secret value, not the secret ID"
                  );
                },
              }}
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="RefreshToken"
              label="Refresh Token"
              placeholder="Enter the refresh token. Leave blank to retain previous key."
              validators={{
                validate: (value) => {
                  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
                  return value === "" || jwtRegex.test(value) || "Invalid Refresh Token";
                },
              }}
            />
          </>
        )}
      </Stack>
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        noSubmitButton={true}
      />
    </Stack>
  );
};
