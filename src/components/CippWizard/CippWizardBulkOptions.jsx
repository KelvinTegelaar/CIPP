import { Grid, Stack } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import countryList from "/src/data/countryList.json";
import { CippFormLicenseSelector } from "../CippComponents/CippFormLicenseSelector";
export const CippWizardBulkOptions = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;

  return (
    <Stack spacing={3}>
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="autoComplete"
              label="Usage Location"
              fullWidth
              name="usageLocation"
              multiple={false}
              defaultValue="US"
              options={countryList.map(({ Code, Name }) => ({
                label: Name,
                value: Code,
              }))}
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormLicenseSelector
              fullWidth
              label="Assign License - We will attempt to assign the license to the user if it is available"
              name="licenses"
              formControl={formControl}
            />
          </Grid>
        </Grid>
      </>
      <CippWizardStepButtons
        postUrl={postUrl}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
