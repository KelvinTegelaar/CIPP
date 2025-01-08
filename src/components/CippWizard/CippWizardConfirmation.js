import { Card, Stack, Grid } from "@mui/material";
import { PropertyList } from "../property-list";
import CippWizardStepButtons from "./CippWizardStepButtons";
import { PropertyListItem } from "../property-list-item";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";

export const CippWizardConfirmation = (props) => {
  const { postUrl, lastStep, formControl, onPreviousStep, onNextStep, currentStep } = props;
  const formValues = formControl.getValues();
  const formEntries = Object.entries(formValues);
  //remove all entries in "blacklist" from showing on confirmation page
  const blacklist = [
    "selectedOption",
    "GUID",
    "ID",
    "noSubmitButton",
    "RAWJson",
    "TemplateList",
    "addrow",
  ];

  const tenantEntry = formEntries.find(([key]) => key === "tenantFilter" || key === "tenant");
  const userEntry = formEntries.find(([key]) =>
    ["user", "userPrincipalName", "username"].includes(key)
  );
  const filteredEntries = formEntries.filter(
    ([key]) =>
      !blacklist.includes(key) &&
      key !== "tenantFilter" &&
      key !== "tenant" &&
      !["user", "userPrincipalName", "username"].includes(key)
  );

  const halfIndex = Math.ceil(filteredEntries.length / 2);
  const firstHalf = filteredEntries.slice(0, halfIndex);
  const secondHalf = filteredEntries.slice(halfIndex);

  if (tenantEntry) {
    firstHalf.unshift(tenantEntry);
  }

  if (userEntry) {
    secondHalf.unshift(userEntry);
  }

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
        postUrl={postUrl}
        lastStep={lastStep}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        noSubmitButton={formValues?.noSubmitButton}
      />
    </Stack>
  );
};

export default CippWizardConfirmation;
