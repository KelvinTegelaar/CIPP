import { Card, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { PropertyList } from "../property-list";
import { PropertyListItem } from "../property-list-item";
import CippWizardStepButtons from "./CippWizardStepButtons";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";

export const CippWizardConfirmation = (props) => {
  const { postUrl, lastStep, formControl, onPreviousStep, onNextStep, currentStep } = props;
  const formValues = formControl.getValues();
  const formEntries = Object.entries(formValues);

  const blacklist = [
    "selectedOption",
    "GDAPAuth",
    "SAMWizard",
    "GUID",
    "ID",
    "noSubmitButton",
    "RAWJson",
    "TemplateList",
    "addrow",
  ];

  // Filter out null values and undefined values which could be from hidden conditional fields
  const filteredFormEntries = formEntries.filter(
    ([_, value]) => value !== null && value !== undefined
  );

  const tenantEntry = filteredFormEntries.find(
    ([key]) => key === "tenantFilter" || key === "tenant"
  );
  const userEntry = filteredFormEntries.find(([key]) =>
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
      {firstHalf.length === 0 ? (
        <Card variant="outlined">
          <Stack p={3}>
            <Typography variant="h6">
              You've completed the steps in this wizard. Hit submit to save your changes.
            </Typography>
          </Stack>
        </Card>
      ) : (
        <Card variant="outlined">
          <Grid container spacing={3}>
            <Grid item size={{ md: 6, xs: 12 }}>
              <PropertyList>
                {firstHalf.map(([key, value]) => (
                  <PropertyListItem
                    key={key}
                    label={getCippTranslation(key)}
                    value={getCippFormatting(value, key)}
                  />
                ))}
              </PropertyList>
            </Grid>
            <Grid item size={{ md: 6, xs: 12 }}>
              <PropertyList>
                {secondHalf.map(([key, value]) => (
                  <PropertyListItem
                    key={key}
                    label={getCippTranslation(key)}
                    value={getCippFormatting(value, key)}
                  />
                ))}
              </PropertyList>
            </Grid>
          </Grid>
        </Card>
      )}

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
