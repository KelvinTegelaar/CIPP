import { useState } from "react";
import { CippIcons } from "../../utils/icon-registry";
import { Stack, Typography, CircularProgress, SvgIcon, Box, Chip, Skeleton } from "@mui/material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";
import { getCippTranslation } from "../../utils/get-cipp-translation";

export const CIPPDeploymentUpdateTokens = ({ formControl }) => {
  const [tokens, setTokens] = useState(null);

  // Get application ID information for the card header
  const appId = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: "listAppId",
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
          <Stack direction="row" sx={{
            justifyContent: "space-between"
          }}>
            <Box>Update Tokens</Box>
            <Stack direction="row" spacing={2}>
              {appId.isLoading ? (
                <CircularProgress size="1rem" />
              ) : (
                <SvgIcon color="primary">
                  <CippIcons.CheckCircle />
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
        <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
          Click the button to refresh the Graph token for your tenants using popup authentication.
          Use this to update your refresh token or change the logged in user. This method opens a
          popup window where you can sign in to your Microsoft account.
        </Typography>

        <Typography variant="h6" gutterBottom>
          Current Tenant Info
        </Typography>

        {(appId.isLoading || appId.isFetching) && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2
            }}>
            <Stack direction="column" spacing={1} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="80%" height={20} />
            </Stack>
            <Skeleton variant="rounded" width={120} height={24} />
          </Stack>
        )}
        {!appId.isLoading && !appId.isFetching && appId?.data?.orgName && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2
            }}>
            <Stack direction="column" spacing={0.5}>
              <Stack direction="row" spacing={0.75} sx={{
                alignItems: "center"
              }}>
                <SvgIcon fontSize="small">
                  <CippIcons.Apartment />
                </SvgIcon>
                <Typography variant="body2" sx={{
                  fontWeight: "medium"
                }}>
                  {appId.data.orgName}
                </Typography>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>
                  {appId.data.tenantId}
                </Typography>
              </Stack>
              {appId.data.authenticatedUserDisplayName && (
                <Stack direction="row" spacing={0.75} sx={{
                  alignItems: "center"
                }}>
                  <SvgIcon fontSize="small">
                    <CippIcons.Person />
                  </SvgIcon>
                  <Typography variant="body2" sx={{
                    fontWeight: "medium"
                  }}>
                    {appId.data.authenticatedUserDisplayName}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>
                    {appId.data.authenticatedUserPrincipalName}
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Stack direction="row" spacing={1} sx={{
              alignItems: "center"
            }}>
              {appId.data.isPartnerTenant ? (
                <Chip
                  label={getCippTranslation(appId.data.partnerTenantType)}
                  size="small"
                  color="info"
                />
              ) : (
                <Chip label="Non-Partner" size="small" color="default" />
              )}
            </Stack>
          </Stack>
        )}

        <CippApiResults apiObject={appId} errorsOnly />
      </CippButtonCard>
    </Stack>
  );
};

export default CIPPDeploymentUpdateTokens;
