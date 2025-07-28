import { Stack, Typography, Alert, FormControl, FormLabel, Box } from "@mui/material";
import { CippWizardStepButtons } from "/src/components/CippWizard/CippWizardStepButtons";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Grid } from "@mui/system";

export const CippDriftNotificationSettings = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Notification Settings</Typography>
        <Alert severity="info">
          <Typography variant="body2">
            Configure how you want to receive drift reports when configuration changes are detected.
            You can specify an email address and choose additional notification methods.
          </Typography>
        </Alert>

        <FormLabel component="legend">Email Configuration</FormLabel>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="textField"
                name="driftReportEmail"
                label="Drift Report Email Address"
                placeholder="Enter email address to receive drift reports"
                formControl={formControl}
                validators={{
                  required: { value: true, message: "Email address is required" },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                helperText="This email will receive detailed drift reports when configuration changes are detected"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="textField"
                name="emailSubjectPrefix"
                label="Email Subject Prefix (Optional)"
                placeholder="e.g., [DRIFT ALERT]"
                formControl={formControl}
                helperText="Optional prefix to add to drift report email subjects"
              />
            </Grid>
          </Grid>
        </Box>

        <FormLabel component="legend">Additional Notification Methods</FormLabel>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippFormComponent
                type="switch"
                name="sendToWebhook"
                label="Send to Notifications Webhook"
                formControl={formControl}
                helperText="Send drift reports to your configured webhook endpoint"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippFormComponent
                type="switch"
                name="sendToPSA"
                label="Send to PSA"
                formControl={formControl}
                helperText="Create tickets in your PSA system when drift is detected"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippFormComponent
                type="switch"
                name="enableDailyDigest"
                label="Enable Daily Digest"
                formControl={formControl}
                helperText="Receive a daily summary of all drift detections across your tenants"
              />
            </Grid>
          </Grid>
        </Box>
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

export default CippDriftNotificationSettings;
