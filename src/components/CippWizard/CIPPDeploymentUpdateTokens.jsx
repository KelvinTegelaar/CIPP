import { useState } from "react";
import { Stack, Typography, CircularProgress, SvgIcon, Box } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";

export const CIPPDeploymentUpdateTokens = ({ formControl }) => {
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
  };

  return (
    <Stack spacing={2}>
      <CippButtonCard
        variant="outlined"
        title={
          <Stack direction="row" justifyContent={"space-between"}>
            <Box>Update Tokens</Box>
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
        <CippApiResults apiObject={appId} errorsOnly />
      </CippButtonCard>
    </Stack>
  );
};

export default CIPPDeploymentUpdateTokens;
