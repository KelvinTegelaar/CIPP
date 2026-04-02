import { Card, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { PropertyList } from "../property-list";
import { PropertyListItem } from "../property-list-item";
import CippWizardStepButtons from "./CippWizardStepButtons";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";

export const CippWizardConfirmation = (props) => {
  const { 
    postUrl, 
    lastStep, 
    formControl, 
    onPreviousStep, 
    onNextStep, 
    currentStep,
    columns = 2 // Default to 2 columns for backward compatibility
  } = props;
  
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
      !["user", "userPrincipalName", "username"].includes(key) &&
      !key.startsWith('HIDDEN_')
  );

  // Calculate total entries including special ones for even distribution
  const totalEntries = filteredEntries.length + (tenantEntry ? 1 : 0) + (userEntry ? 1 : 0);

  // Dynamically split entries based on columns prop with special entries distributed
  const splitEntries = () => {
    const result = Array.from({ length: columns }, () => []);

    // Add special entries to different columns first
    if (tenantEntry) {
      result[0].push(tenantEntry);
    }
    if (userEntry && result[1]) {
      result[1].push(userEntry);
    }

    // Distribute remaining entries across columns to balance them
    filteredEntries.forEach((entry) => {
      // Find the column with the fewest entries
      let targetColumn = 0;
      let minLength = result[0].length;
      
      for (let i = 1; i < columns; i++) {
        if (result[i].length < minLength) {
          minLength = result[i].length;
          targetColumn = i;
        }
      }
      
      result[targetColumn].push(entry);
    });

    return result;
  };

  const columnEntries = splitEntries();

  // Calculate Grid sizes based on number of columns
  const getGridSize = () => {
    const sizes = {
      1: { lg: 12, md: 12, xs: 12 },
      2: { lg: 6, md: 6, xs: 12 },
      3: { lg: 4, md: 6, xs: 12 },
      4: { lg: 3, md: 6, xs: 12 },
      6: { lg: 2, md: 4, xs: 12 },
    };
    
    return sizes[columns] || sizes[2]; // Default to 2 columns
  };

  const gridSize = getGridSize();

  return (
    <Stack spacing={3}>
      {filteredEntries.length === 0 ? (
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
            {columnEntries.map((columnData, index) => (
              <Grid key={index} size={gridSize}>
                <PropertyList>
                  {columnData.map(([key, value]) => (
                    <PropertyListItem
                      key={key}
                      label={getCippTranslation(key)}
                      value={getCippFormatting(value, key)}
                    />
                  ))}
                </PropertyList>
              </Grid>
            ))}
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
