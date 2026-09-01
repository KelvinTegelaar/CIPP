import { useEffect, useRef } from "react";
import { Alert, Chip, Stack, Typography } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { ApiGetCall } from "../../api/ApiCall";

export const CippCertificateAuthStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const initialized = useRef(false);

  const certStatus = ApiGetCall({
    url: "/api/ExecSAMCertificate?Action=Get",
    queryKey: "ExecSAMCertificateStatus",
  });

  const featureFlags = ApiGetCall({
    url: "/api/ListFeatureFlags",
    queryKey: "ListFeatureFlags",
  });

  const configured = certStatus.data?.Configured === true;
  const registered = certStatus.data?.RegisteredOnApp === true;
  const daysRemaining = certStatus.data?.DaysRemaining;

  // Seed the switch from the current state so finishing the wizard untouched can't flip an enabled
  // install off. On a read error, leave it undefined so the field is omitted and nothing changes.
  useEffect(() => {
    if (initialized.current) return;
    if (featureFlags.isSuccess) {
      const current = Array.isArray(featureFlags.data)
        ? featureFlags.data.find((flag) => flag.Id === "CertificateAuthentication")
        : null;
      formControl.setValue("certificateAuth", current?.Enabled === true);
      initialized.current = true;
    } else if (featureFlags.isError) {
      formControl.setValue("certificateAuth", undefined);
      initialized.current = true;
    }
  }, [featureFlags.isSuccess, featureFlags.isError, featureFlags.data, formControl]);

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Certificate authentication</Typography>
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          Switch this existing install to authenticate CIPP's application with the SAM certificate
          instead of the client secret, for every Graph and Exchange Online call. The client secret
          is kept in Key Vault as a rollback - turn this off to switch back at any time.
        </Typography>

        {certStatus.isSuccess && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              alignItems: "center",
              flexWrap: "wrap"
            }}>
            <Chip
              size="small"
              color={configured ? "success" : "warning"}
              label={configured ? "Certificate present" : "No certificate yet"}
            />
            <Chip
              size="small"
              color={registered ? "success" : "warning"}
              label={registered ? "Registered on application" : "Not registered on application"}
            />
            {configured && typeof daysRemaining === "number" && (
              <Chip size="small" color="info" label={`Expires in ${daysRemaining} days`} />
            )}
          </Stack>
        )}

        {certStatus.isSuccess && !registered && (
          <Alert severity="info">
            The SAM certificate is not registered on the application yet. When you finish the wizard,
            CIPP will generate and register it before enabling certificate authentication. If that
            step fails, the client secret stays in use and nothing breaks.
          </Alert>
        )}

        <CippFormComponent
          type="switch"
          name="certificateAuth"
          label="Use certificate authentication (keep the client secret as a rollback)"
          formControl={formControl}
          disabled={!featureFlags.isFetched}
        />
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

export default CippCertificateAuthStep;
