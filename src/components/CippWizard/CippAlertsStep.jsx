import { Alert, Stack, Typography } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippAlertsStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;

  const postExecutionOptions = [
    { label: "Webhook", value: "Webhook" },
    { label: "Email", value: "Email" },
    { label: "PSA", value: "PSA" },
  ];

  const recurrenceOptions = [
    { value: "30m", label: "Every 30 minutes" },
    { value: "1h", label: "Every hour" },
    { value: "4h", label: "Every 4 hours" },
    { value: "1d", label: "Every 1 day" },
    { value: "7d", label: "Every 7 days" },
    { value: "14d", label: "Every 14 days" },
    { value: "21d", label: "Every 21 days" },
    { value: "30d", label: "Every 30 days" },
    { value: "365d", label: "Every 365 days" },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Almost done</Typography>
        <Alert severity="info">
          <Typography variant="body1" gutterBottom>
            There's a couple more things that you can configure outside of the wizard, let's list
            some of them;
          </Typography>
          <ul>
            <li>
              CIPP has the ability to send alerts to your PSA, Webhook or Email. You can configure
              these settings under &gt; Tenant Administration &gt; Alert Configuration.
            </li>
          </ul>
          <ul>
            <li>
              If you imported baselines, or want to set tenants to your own baseline, you should
              check out our standards under these settings under &gt; Tenant Administration &gt;
              Standards.
            </li>
          </ul>
          <ul>
            <li>
              If you want to use our integrations, you should set these up under &gt; CIPP &gt;
              Integrations. Some examples are CSP integrations, Password Pusher, PSA, and more.
            </li>
          </ul>
          <ul>
            <li>
              Adding more users to CIPP? you can do this via CIPP &gt; Advanced &gt; Super Admin.
            </li>
          </ul>
          <ul>
            <li>
              You can deploy Windows Applications too, directly using intune. We have Chocolately,
              WinGet, and RMM apps under &gt; Intune &gt; Applications. Some examples are CSP
              integrations, Password Pusher, PSA, and more.
            </li>
          </ul>
          <ul>
            <li>
              Tenants can be grouped, and you can implement custom variables for your tenants under
              WinGet, and RMM apps under Tenant Administrator &gt; Administration &gt; Tenants.
            </li>
          </ul>
          <ul>
            <li>
              Have an enterprise app you want to deploy? Check out our <strong> tools</strong>{" "}
              section. This menu also contains useful things such as our geo-ip lookup, and more.
            </li>
          </ul>
        </Alert>
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

export default CippAlertsStep;
