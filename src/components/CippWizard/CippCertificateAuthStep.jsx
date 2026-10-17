import { useEffect, useRef } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippIcons } from "../../utils/icon-registry";
import { CippDataTable } from "../CippTable/CippDataTable";

export const CippCertificateAuthStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const initialized = useRef(false);

  const renewCert = ApiPostCall({
    urlfromdata: true,
    relatedQueryKeys: ["ExecSAMCertificateStatus"],
  });

  const certStatus = ApiGetCall({
    url: "/api/ExecSAMCertificate?Action=Get",
    queryKey: "ExecSAMCertificateStatus",
    // Graph reads of the app's credentials lag the renew write by a few seconds
    refetchInterval: (query) =>
      renewCert.isSuccess && query.state.data?.RegisteredOnApp !== true ? 5000 : false,
  });

  const featureFlags = ApiGetCall({
    url: "/api/ListFeatureFlags",
    queryKey: "ListFeatureFlags",
  });

  const configured = certStatus.data?.Configured === true;
  const registered = certStatus.data?.RegisteredOnApp === true;
  const daysRemaining = certStatus.data?.DaysRemaining;
  const registeredCerts = [...(certStatus.data?.RegisteredCertificates ?? [])].sort(
    (a, b) => (b.ThisInstance === true) - (a.ThisInstance === true),
  );
  const applicationId = certStatus.data?.ApplicationId;
  const entraUrl =
    typeof applicationId === "string" && applicationId !== ""
      ? `https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Credentials/appId/${applicationId}/isMSAApp~/false`
      : null;

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

        {certStatus.isSuccess && (registeredCerts.length > 0 || entraUrl) && (
          <Accordion variant="outlined" disableGutters>
            <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  width: "100%",
                  pr: 1,
                }}
              >
                <Typography variant="subtitle1">Certificate details</Typography>
                {entraUrl && (
                  <Button
                    size="small"
                    variant="outlined"
                    href={entraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in Entra
                  </Button>
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {registeredCerts.length > 0 && (
                <CippDataTable
                  noCard={true}
                  hideTitle={true}
                  title="Registered certificates"
                  data={registeredCerts}
                  isFetching={certStatus.isFetching}
                  refreshFunction={() => certStatus.refetch()}
                  simpleColumns={["ThisInstance", "DisplayName", "Thumbprint", "EndDateTime"]}
                />
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {certStatus.isSuccess && !registered && (
          <Alert severity="info">
            The stored certificate is not registered on the application. Turn the switch on and
            finish the wizard to register it, or use Renew certificate below to replace it now. If
            registration fails, the client secret stays in use.
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

      <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
        <Typography variant="subtitle1">Rotate the certificate</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Renew mints a new certificate for this instance, registers it on the application and
          retires the previous one. Certificates registered by other CIPP instances are left alone.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={renewCert.isPending}
          onClick={() =>
            renewCert.mutate({ url: "/api/ExecSAMCertificate", data: { Action: "Renew" } })
          }
        >
          Renew certificate
        </Button>
        <CippApiResults apiObject={renewCert} />
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
