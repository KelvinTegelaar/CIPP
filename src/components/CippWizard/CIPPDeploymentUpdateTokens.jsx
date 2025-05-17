import { useState } from "react";
import { Stack, Typography, CircularProgress, SvgIcon, Box } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";

export const CIPPDeploymentUpdateTokens = ({ formControl }) => {
  const values = formControl.getValues();
  const [tokens, setTokens] = useState(null);

  // Get application ID information for the card header
  const appId = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: `ExecListAppId`,
    waiting: true,
  });

  // Handle successful authentication
  const handleAuthSuccess = (tokenData) => {
    setTokens(tokenData);
    console.log("Token data received:", tokenData);
  };

  return (
    <Stack spacing={2}>
      <CippButtonCard
        variant="outlined"
        title={
          <Stack direction="row" justifyContent={"space-between"}>
            <Box>Update Tokens (MSAL Style)</Box>
            <Stack direction="row" spacing={2}>
              {appId.isLoading ? (
                <CircularProgress size="1rem" />
              ) : (
                <SvgIcon color="primary">
                  <CheckCircle />
                </SvgIcon>
              )}
            </Stack>
          </Stack>
        }
        CardButton={
          <CIPPM365OAuthButton
            onAuthSuccess={handleAuthSuccess}
            buttonText="Refresh Graph Token (Popup)"
          />
        }
      >
        <Typography variant="body2" gutterBottom>
          Click the button to refresh the Graph token for your tenants using popup authentication.
          This method opens a popup window where you can sign in to your Microsoft account.
        </Typography>
        {formControl.setValue("noSubmitButton", true)}
        <CippApiResults apiObject={appId} errorsOnly />
      </CippButtonCard>

      <CippButtonCard
        variant="outlined"
        title={
          <Stack direction="row" justifyContent={"space-between"}>
            <Box>Update Tokens (Device Code Flow)</Box>
            <Stack direction="row" spacing={2}>
              {appId.isLoading ? (
                <CircularProgress size="1rem" />
              ) : (
                <SvgIcon color="primary">
                  <CheckCircle />
                </SvgIcon>
              )}
            </Stack>
          </Stack>
        }
        CardButton={
          <CIPPM365OAuthButton
            onAuthSuccess={handleAuthSuccess}
            buttonText="Refresh Graph Token (Device Code)"
            useDeviceCode={true}
            applicationId="1950a258-227b-4e31-a9cf-717495945fc2"
            autoStartDeviceLogon={true}
          />
        }
      >
        <Typography variant="body2" gutterBottom>
          Device code flow test
        </Typography>
      </CippButtonCard>
    </Stack>
  );
};

export default CIPPDeploymentUpdateTokens;
