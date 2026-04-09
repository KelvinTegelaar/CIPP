import { Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";

export const CippWizardVacationSchedule = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep, lastStep } = props;

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle1">
        Set the date range for the vacation period and optional notification settings.
      </Typography>

      <Grid container spacing={2}>
        {/* Start Date */}
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="datePicker"
            label="Scheduled Start Date"
            name="startDate"
            dateTimeType="dateTime"
            formControl={formControl}
            required={true}
            validators={{
              validate: (value) => {
                if (!value) {
                  return "Start date is required";
                }
                return true;
              },
            }}
          />
        </Grid>

        {/* End Date */}
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="datePicker"
            label="Scheduled End Date"
            name="endDate"
            dateTimeType="dateTime"
            formControl={formControl}
            required={true}
            validators={{
              validate: (value) => {
                const startDate = formControl.getValues("startDate");
                if (!value) {
                  return "End date is required";
                }
                if (startDate && value && new Date(value * 1000) < new Date(startDate * 1000)) {
                  return "End date must be after start date";
                }
                return true;
              },
            }}
          />
        </Grid>

        {/* Post Execution Actions */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            name="postExecution"
            label="Post Execution Actions"
            formControl={formControl}
            multiple
            creatable={false}
            options={[
              { label: "Webhook", value: "Webhook" },
              { label: "Email", value: "Email" },
              { label: "PSA", value: "PSA" },
            ]}
          />
        </Grid>

        {/* Reference */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Reference"
            name="reference"
            formControl={formControl}
            placeholder="Optional note to help identify this vacation schedule, also added to notification titles."
          />
        </Grid>
      </Grid>

      <CippWizardStepButtons
        currentStep={currentStep}
        lastStep={lastStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
