import { CircularProgress, Divider, InputAdornment, Typography } from "@mui/material";
import { Box, Grid, Stack } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { ApiGetCall } from "../../api/ApiCall";
import { useWatch } from "react-hook-form";
import debounce from "lodash/debounce";
import React, { useState, useEffect } from "react";

export const CippAddTenantForm = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;

  const tenantDomain = useWatch({ control: formControl.control, name: "TenantName" });
  const [debouncedTenantDomain, setDebouncedTenantDomain] = useState("");

  const updateTenantDomain = debounce((value) => {
    setDebouncedTenantDomain(value);
  }, 500);

  useEffect(() => {
    updateTenantDomain(tenantDomain);
    return () => updateTenantDomain.cancel();
  }, [tenantDomain]);

  const checkDomain = ApiGetCall({
    url: "/api/AddTenant",
    data: { action: "ValidateDomain", TenantName: debouncedTenantDomain },
    queryKey: `ValidateDomain-${debouncedTenantDomain}`,
    waiting: debouncedTenantDomain !== "" && debouncedTenantDomain !== undefined,
  });

  useEffect(() => {
    validateDomain();
  }, [checkDomain.data, checkDomain.isFetching]);

  const validateDomain = () => {
    if (!tenantDomain) {
      // set error state on TenantName form field
      formControl.setError("TenantName", { type: "required", message: "Tenant Name is required" });
    }
    if (checkDomain.isFetching) {
      formControl.setError("TenantName", {
        type: "required",
        message: "Checking domain availability...",
      });
    }
    if (checkDomain.isSuccess) {
      if (checkDomain.data.Success === true) {
        // clear error
        formControl.clearErrors("TenantName");
        formControl.trigger();
      } else {
        // set error state on TenantName form field
        formControl.setError("TenantName", { type: "validate", message: checkDomain.data.Message });
      }
    }
    if (checkDomain.isError) {
      formControl.setError("TenantName", { type: "error", message: "An error occurred" });
    }
  };

  const fields = [
    {
      type: "header",
      label: "Company Information",
    },
    {
      name: "TenantName",
      label: "Tenant Name",
      placeholder: "Enter the desired subdomain for the onmicrosoft.com domain",
      type: "textField",
      required: true,
      InputProps: {
        endAdornment: (
          <InputAdornment position="end">
            .onmicrosoft.com{" "}
            {checkDomain.isFetching ? (
              <CircularProgress size={20} sx={{ ml: 2 }} />
            ) : (
              <>
                {checkDomain.isSuccess && checkDomain.data.Success && (
                  <Box sx={{ color: "green", ml: 1 }}>✔</Box>
                )}
                {checkDomain.isSuccess && !checkDomain.data.Success && (
                  <Box sx={{ color: "red", ml: 1 }}>✘</Box>
                )}
              </>
            )}
          </InputAdornment>
        ),
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
      name: "PostalCode",
      label: "Postal Code",
      type: "textField",
      required: true,
      placeholder: "Enter the postal code",
    },
    {
      name: "Country",
      label: "Country",
      type: "textField",
      required: true,
      placeholder: "Enter the country (e.g., US)",
    },
    {
      type: "header",
      label: "Contact Information",
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
      type: "textField",
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
  ];

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        {fields.map((field, index) => (
          <React.Fragment key={index}>
            {field.type === "header" ? (
              <>
                <Grid size={12}>
                  <Typography variant="h5">{field.label}</Typography>
                  <Divider sx={{ mt: 1 }} />
                </Grid>
              </>
            ) : (
              <Grid size={field?.gridSize ?? { xs: 12, md: 6 }}>
                <CippFormComponent {...field} formControl={formControl} />
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>
      <CippWizardStepButtons
        postUrl="/api/AddTenant"
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
