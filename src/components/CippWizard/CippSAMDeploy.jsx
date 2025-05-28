import { useEffect, useState } from "react";
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

  // Block next step until SAM app is created
  formControl.register("SAMWizard", {
    required: true,
  });

  // Set SAMWizard = true if auth is successful
  useEffect(() => {
    if (authStatus.success) {
      formControl.setValue("SAMWizard", true);
      formControl.trigger("SAMWizard");
    }
  }, [authStatus, formControl]);

  const createSamApp = ApiPostCall({ urlfromdata: true });

  const handleAuthSuccess = (tokenData) => {
    setAuthStatus({
      success: false,
      error: null,
      loading: true,
    });

    createSamApp.mutate({
      url: "/api/ExecCreateSamApp",
      data: { access_token: tokenData.accessToken },
    });
  };

  const handleAuthError = (error) => {
    setAuthStatus({
      success: false,
      error: error.errorMessage || "Authentication failed",
      loading: false,
    });
  };

  useEffect(() => {
    if (createSamApp.isSuccess && authStatus.loading && createSamApp.data) {
      const data = createSamApp.data?.data;
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
      }
    }
  }, [createSamApp, authStatus]);

  useEffect(() => {
    if (createSamApp.isError && authStatus.loading) {
      setAuthStatus({
        success: false,
        error: "An error occurred while creating the SAM application",
        loading: false,
      });
    }
  }, [createSamApp, authStatus]);

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

      {authStatus.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {authStatus.error}
        </Alert>
      )}
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
      <CippApiResults apiObject={createSamApp} />

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
