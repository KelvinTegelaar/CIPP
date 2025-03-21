import { InputAdornment } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippAddTenantForm = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;

  const fields = [
    {
      name: "TenantName",
      label: "Tenant Name",
      placeholder: "Enter the desired subdomain for the onmicrosoft.com domain",
      type: "textField",
      required: true,
      InputProps: {
        endAdornment: <InputAdornment position="end">.onmicrosoft.com</InputAdornment>,
      },
      gridSize: 12,
    },
    {
      name: "CompanyName",
      label: "Company Name",
      type: "textField",
      required: true,
      gridSize: 12,
      placeholder: "Enter the registered company/organization name",
    },
    {
      name: "FirstName",
      label: "First Name",
      type: "textField",
      required: true,
      placeholder: "Enter the first name of the contact person",
    },
    {
      name: "LastName",
      label: "Last Name",
      type: "textField",
      required: true,
      placeholder: "Enter the last name of the contact person",
    },
    {
      name: "Email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter the customer's email address",
    },
    {
      name: "PhoneNumber",
      label: "Phone Number",
      type: "textField",
      required: true,
      placeholder: "Enter the contact phone number",
    },
    {
      name: "Country",
      label: "Country",
      type: "textField",
      required: true,
      placeholder: "Enter the country (e.g., US)",
    },
    {
      name: "City",
      label: "City",
      type: "textField",
      required: true,
      placeholder: "Enter the city",
    },
    {
      name: "State",
      label: "State",
      type: "textField",
      required: true,
      placeholder: "Enter the state or region",
    },
    {
      name: "AddressLine1",
      label: "Address Line 1",
      type: "textField",
      required: true,
      placeholder: "Enter the primary address line",
    },
    {
      name: "AddressLine2",
      label: "Address Line 2",
      type: "textField",
      required: false,
      placeholder: "Enter the secondary address line (optional)",
    },
    {
      name: "PostalCode",
      label: "Postal Code",
      type: "textField",
      required: true,
      placeholder: "Enter the postal code",
    },
  ];

  return (
    <Grid container spacing={3}>
      {fields.map((field, index) => (
        <Grid size={field?.gridSize ?? { xs: 12, md: 6 }} key={index}>
          <CippFormComponent
            {...field}
            formControl={formControl}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <CippWizardStepButtons
          currentStep={currentStep}
          onPreviousStep={onPreviousStep}
          onNextStep={onNextStep}
          formControl={formControl}
          noSubmitButton={true}
        />
      </Grid>
    </Grid>
  );
};
