import { Button, MenuItem, Stack, TextField } from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
export const CippDeploymentStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();
  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <>
          {values.selectedOption === "samwizard" && "HELLO WORLD"}
          <CippFormComponent
            formControl={formControl}
            type="textField"
            fullWidth
            validators={{ required: true }}
            label="First Name"
            name="firstName"
          />
          <TextField
            fullWidth
            select
            required
            label="Deployment Region. Please make sure you choose the region closest to you."
            name="region"
          >
            <MenuItem value="northeurope">Europe (North)</MenuItem>
            <MenuItem value="westeurope">Europe (West)</MenuItem>
            <MenuItem value="uksouth">UK South</MenuItem>
            <MenuItem value="ukwest">UK West</MenuItem>
            <MenuItem value="eastus">US East</MenuItem>
            <MenuItem value="westus">US West</MenuItem>
            <MenuItem value="canadacentral">Canada (Central)</MenuItem>
            <MenuItem value="centralus">US (Central)</MenuItem>
            <MenuItem value="westcentralus">US (West Central)</MenuItem>
            <MenuItem value="southcentralus">US (South Central)</MenuItem>
            <MenuItem value="northcentralus">US (North Central)</MenuItem>
            <MenuItem value="southafricanorth">South Africa</MenuItem>
            <MenuItem value="australiacentral">Australia (Central)</MenuItem>
            <MenuItem value="australiaeast">Australia (East)</MenuItem>
            <MenuItem value="southeastasia">South East Asia</MenuItem>
            <MenuItem value="eastasia">East Asia</MenuItem>
            <MenuItem value="Unknown">
              My preferred Azure region is not listed. I need a manual deployment.
            </MenuItem>
          </TextField>
        </>
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
