import { useEffect, useState } from "react";
import { Alert, Stack, Box, Link, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";
import { CippApiResults } from "../CippComponents/CippApiResults";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { ApiPostCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippSAMDeploy = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;
  const [authStatus, setAuthStatus] = useState({
    success: false,
    error: null,
    loading: false,
  });

  const authMethod = useWatch({ control: formControl.control, name: "authMethod" });

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
      data: {
        access_token: tokenData.accessToken,
        // Certificate-only setups create no client secret; the backend registers the SAM
        // certificate and enables certificate authentication instead.
        certificateOnly: formControl.getValues("authMethod") === "certificate",
      },
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
      <Stack spacing={2}>
        <Typography variant="h6" id="auth-method-heading">
          Authentication method
        </Typography>
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          Choose how CIPP authenticates its application registration to Microsoft. This determines
          whether a client secret is created during setup.
        </Typography>
        <CippFormComponent
          type="radio"
          name="authMethod"
          formControl={formControl}
          defaultValue="certificate"
          aria-labelledby="auth-method-heading"
          options={[
            {
              value: "certificate",
              label:
                "Certificate (recommended) - no client secret; CIPP generates and auto-rotates it.",
            },
            {
              value: "secret",
              label: "Client secret - a shared secret; newer Entra tenants may block creating one.",
            },
          ]}
        />
      </Stack>
      <Alert severity="info">
        To run this setup you will need the following prerequisites:
        <li>
          A CIPP Service Account. For more information on how to create a service account, click{" "}
          <Link
            href="https://docs.cipp.app/setup/installation/creating-the-cipp-service-account-gdap-ready"
            rel="noreferrer"
            target="_blank"
          >
            here
          </Link>
        </li>
        <li>
          An account with at minimum: <li>Application Administrator</li>
          <li>User Administrator</li>
        </li>
        <li>
          Multi-factor authentication enabled for the CIPP Service Account, with no trusted
          locations or other exclusions.
        </li>
        <li>
          Device code sign-in permitted in your partner tenant. Security defaults and Conditional
          Access authentication flow policies can block it, which will stop this step from
          completing.
        </li>
      </Alert>
      <Alert severity="info">
        This step only creates the CIPP-SAM application registration. The token CIPP runs on is
        created by the sign-in on the next step.
      </Alert>

      {authStatus.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {authStatus.error}
        </Alert>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
        <Stack direction="row" spacing={2} sx={{
          alignItems: "center"
        }}>
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
