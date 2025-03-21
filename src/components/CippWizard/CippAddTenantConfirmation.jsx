import { useState, useEffect } from "react";
import { Grid, Typography, CircularProgress } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippAddTenantConfirmation = ({ formData, onSubmit, onBack }) => {
  const [domainStatus, setDomainStatus] = useState(null);
  const [addressStatus, setAddressStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDomainAvailability = async () => {
      try {
        const response = await fetch("/api/AddTenant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Action: "ValidateDomain", TenantName: formData.Domain }),
        });
        const result = await response.json();
        setDomainStatus(result.Status === "Success" ? "Available" : "Unavailable");
      } catch {
        setDomainStatus("Error");
      }
    };

    const validateAddress = async () => {
      try {
        const response = await fetch("/api/AddTenant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Action: "ValidateAddress",
            AddressLine1: formData.AddressLine1,
            AddressLine2: formData.AddressLine2,
            City: formData.City,
            State: formData.State,
            PostalCode: formData.PostalCode,
            Country: formData.Country,
          }),
        });
        const result = await response.json();
        setAddressStatus(result.Status === "Success" ? "Valid" : "Invalid");
      } catch {
        setAddressStatus("Error");
      }
    };

    const performChecks = async () => {
      setLoading(true);
      await Promise.all([checkDomainAvailability(), validateAddress()]);
      setLoading(false);
    };

    performChecks();
  }, [formData]);

  const isReadyToSubmit = domainStatus === "Available" && addressStatus === "Valid";

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Confirmation</Typography>
        <Typography>
          Please review the results of the domain availability and address validation before submitting.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>Domain Status: {loading ? <CircularProgress size={20} /> : domainStatus}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>Address Status: {loading ? <CircularProgress size={20} /> : addressStatus}</Typography>
      </Grid>
      <Grid item xs={12}>
        <CippWizardStepButtons onNext={onSubmit} onBack={onBack} nextDisabled={!isReadyToSubmit || loading} />
      </Grid>
    </Grid>
  );
};
