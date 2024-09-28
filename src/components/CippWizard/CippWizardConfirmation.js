import { Card, Stack, Grid } from "@mui/material";
import { PropertyList } from "../property-list";
import CippWizardStepButtons from "./CippWizardStepButtons";
import { PropertyListItem } from "../property-list-item";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";

export const CippWizardConfirmation = (props) => {
  const { lastStep, formControl, onPreviousStep, onNextStep, currentStep } = props;
  const formvalues = formControl.getValues();
  const formEntries = Object.entries(formvalues);
  const halfIndex = Math.ceil(formEntries.length / 2);
  const firstHalf = formEntries.slice(0, halfIndex);
  const secondHalf = formEntries.slice(halfIndex);

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <PropertyList>
              {firstHalf.map(([key, value]) => {
                const formattedValue = getCippFormatting(value, key);
                const label = getCippTranslation(key);
                return <PropertyListItem key={key} label={label} value={formattedValue} />;
              })}
            </PropertyList>
          </Grid>
          <Grid item xs={12} md={6}>
            <PropertyList>
              {secondHalf.map(([key, value]) => {
                const formattedValue = getCippFormatting(value, key);
                const label = getCippTranslation(key);
                return <PropertyListItem key={key} label={label} value={formattedValue} />;
              })}
            </PropertyList>
          </Grid>
        </Grid>
      </Card>

      <CippWizardStepButtons
        lastStep={lastStep}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};

export default CippWizardConfirmation;
