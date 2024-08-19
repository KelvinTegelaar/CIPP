import { useCallback, useEffect, useState } from "react";
import { Button, FormHelperText, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
export const CippDeploymentStep = (props) => {
  const { values: initialValues, onPreviousStep, onNextStep } = props;
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const deploymentState = ApiGetCall({
    url: "/api/deploymentstatus",
    queryKey: "deploymentstatus",
  });

  const apiKey = ApiGetCall({
    url: "/api/CredentialStatus",
    queryKey: "CredentialStatus",
  });
  const PSATest = ApiPostCall({ urlFromData: true });
  const handleChange = useCallback((event) => {
    setValues((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
      url: "/api/Setup",
    }));
  }, []);
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      onNextStep?.({
        syncAllClients: true,
        ...PSATest.data?.data,
        ...values,
      });
    },
    [PSATest.data, onNextStep, values]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h6">Step 2. Configure Deployment</Typography>
          <Typography color="text.secondary" variant="body2"></Typography>
        </div>
        <Stack spacing={2}>
          {values.Option === "Deploy" && (
            <>
              {deploymentState.data?.status === "Ready" ? (
                <>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    name="firstName"
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    name="lastName"
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    required
                    label="Where did you first hear about CIPP?"
                    name="hearAboutCIPP"
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="UPN / e-mail for the first CIPP user"
                    name="UserPrincipalName"
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    select
                    required
                    label="Deployment Region. Please make sure you choose the region closest to you."
                    name="region"
                    onChange={handleChange}
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
              ) : (
                <Typography>
                  Your instance is already deployed, or deployment failed. Please contact support.
                </Typography>
              )}
            </>
          )}
          {values.Option === "Api" && (
            <>
              <Typography>
                Api setup currently requires manual intervention. Please contact support.
              </Typography>
            </>
          )}
          {values.Option === "Creds" && (
            <>
              <CippPropertyListCard
                title="API Credentials"
                isFetching={apiKey.isFetching}
                propertyItems={[
                  {
                    label: "API Credential Status",
                    value: apiKey.data?.status,
                  },
                  {
                    label: "API URL",
                    value: apiKey.data?.APIUrl,
                  },
                  {
                    label: "API Tenant ID",
                    value: apiKey.data?.APITenant,
                  },
                  {
                    label: "API Application ID",
                    value: apiKey.data?.APIID,
                  },
                  {
                    label: "API Secret",
                    value: apiKey.data?.APIKey,
                    type: "password",
                  },
                ]}
              />
            </>
          )}
          <>
            {error && (
              <FormHelperText error sx={{ mt: 2 }}>
                {error}
              </FormHelperText>
            )}
          </>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ mt: 3 }}
        >
          <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
            Back
          </Button>
          {values.Option === "Deploy" && deploymentState.data?.status === "Ready" && (
            <Button size="large" type="submit" variant="contained">
              Next Step
            </Button>
          )}
        </Stack>
      </Stack>
    </form>
  );
};
