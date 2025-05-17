import { useState } from "react";
import { Alert, Stack, Box, CircularProgress, Link } from "@mui/material";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippSAMDeploy = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;
  const [authStatus, setAuthStatus] = useState({
    success: false,
    error: null,
    loading: false,
  });

  //TODO: Make sure to block next button until the app is created.

  // API call to create/update SAM app
  const createSamApp = ApiPostCall({ urlfromdata: true });
  // Handle successful authentication
  const handleAuthSuccess = (tokenData) => {
    setAuthStatus({
      success: false,
      error: null,
      loading: true,
    });

    // Send the access token to the API to create/update SAM app
    createSamApp.mutate({
      url: "/api/ExecCreateSamApp",
      data: { access_token: tokenData.accessToken },
    });
  };

  // Handle authentication error
  const handleAuthError = (error) => {
    setAuthStatus({
      success: false,
      error: error.errorMessage || "Authentication failed",
      loading: false,
    });
  };

  // Update status when API call completes
  if (createSamApp.isSuccess && authStatus.loading) {
    const data = createSamApp.data;
    if (data.severity === "error") {
      setAuthStatus({
        success: false,
        error: data.message || "Failed to create SAM application",
        loading: false,
      });
    } else if (data.severity === "success") {
      setAuthStatus({
        success: true,
        error: null,
        loading: false,
      });
      // Allow user to proceed to next step
      formControl.setValue("samAppCreated", true);
    }
  }

  // Handle API error
  if (createSamApp.isError && authStatus.loading) {
    setAuthStatus({
      success: false,
      error: "An error occurred while creating the SAM application",
      loading: false,
    });
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        To run this setup you will need the following prerequisites:
        <li>
          A CIPP Service Account. For more information on how to create a service account, click{" "}
          <Link
            href="https://docs.cipp.app/setup/installation/samwizard"
            rel="noreferrer"
            target="_blank"
          >
            here
          </Link>
        </li>
        <li>(Temporary) Global Administrator permissions for the CIPP Service Account</li>
        <li>
          Multi-factor authentication enabled for the CIPP Service Account, with no trusted
          locations or other exclusions.
        </li>
      </Alert>
      {/* Show API results */}
      <CippApiResults apiObject={createSamApp} />

      {/* Show error message if any */}
      {authStatus.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {authStatus.error}
        </Alert>
      )}

      {/* Show success message when authentication is successful */}
      {authStatus.success && !authStatus.loading && (
        <Alert severity="success" sx={{ mt: 2 }}>
          SAM application has been successfully created/updated. You can now proceed to the next
          step.
        </Alert>
      )}

      {/* Show authenticate button only if not successful yet */}
      {(!authStatus.success || authStatus.loading) && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CIPPM365OAuthButton
              onAuthSuccess={handleAuthSuccess}
              onAuthError={handleAuthError}
              buttonText="Authenticate with Microsoft"
              useDeviceCode={true}
              applicationId="1950a258-227b-4e31-a9cf-717495945fc2"
              showSuccessAlert={false}
              autoStartDeviceLogon={true}
            />
          </Stack>
        </Box>
      )}

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

export default CippSAMDeploy;
