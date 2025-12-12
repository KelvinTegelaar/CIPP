import { Alert, Stack, Typography } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippNotificationForm } from "../CippComponents/CippNotificationForm";

export const CippNotificationsStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Notification Settings</Typography>
        <Alert severity="info">
          Configure your notification settings. These settings will determine how you receive alerts
          from CIPP. You can test your configuration using the "Send Test Alert" button. Don't want
          to setup notifications yet? You can skip this step and configure it later via Application
          Settings - Notifications
        </Alert>
        {/* Use the reusable notification form component */}
        <CippNotificationForm formControl={formControl} showTestButton={true} />
      </Stack>

      {/* Use the wizard step buttons for navigation */}
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

export default CippNotificationsStep;
