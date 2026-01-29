import { useEffect } from "react";
import {
  Stack,
  Box,
  Typography,
  Link,
  Chip,
  Skeleton,
  SvgIcon,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Person, Apartment, Sync } from "@mui/icons-material";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiPostCall, ApiGetCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippTenantTable } from "./CippTenantTable";
import { getCippTranslation } from "../../utils/get-cipp-translation";

export const CippTenantModeDeploy = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;

  formControl.register("GDAPAuth", {
    required: true,
  });

  const updateRefreshToken = ApiPostCall({ urlfromdata: true, relatedQueryKeys: ["listAppId"] });
  const addTenant = ApiPostCall({ urlfromdata: true, relatedQueryKeys: ["tenants-table"] });

  // Get partner tenant info using the same API call as CIPPM365OAuthButton
  const partnerTenantInfo = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: "listAppId",
    waiting: true,
  });

  useEffect(() => {
    if (updateRefreshToken.isSuccess) {
      formControl.setValue("GDAPAuth", true);
      formControl.trigger("GDAPAuth");
    }
    if (addTenant.isSuccess) {
      // Reset the form control for the next tenant addition
      formControl.setValue("GDAPAuth", true);
      formControl.trigger("GDAPAuth");
    }
  }, [updateRefreshToken.isSuccess, formControl, addTenant.isSuccess]);

  return (
    <Stack spacing={2}>
      {/* Partner Tenant (GDAP) */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            Partner Tenant
          </Typography>
          <Tooltip title="Refresh partner tenant information">
            <IconButton
              size="small"
              onClick={() => partnerTenantInfo.refetch()}
              disabled={partnerTenantInfo.isLoading}
            >
              <Sync fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Using GDAP is recommended for CIPP, however you can also authenticate to individual
          tenants. It is required to connect to your partner tenant first, even if you are not a
          Microsoft CSP. This is where the multi-tenant App Registration (CIPP-SAM) is installed. It
          also allows CIPP to send notifications, perform permission checks, and update permissions
          when required.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Please remember to log onto a service account dedicated for CIPP. More info? Check out the{" "}
          <Link
            href="https://docs.cipp.app/setup/gdap/creating-the-cipp-service-account-gdap-ready"
            target="_blank"
            rel="noopener noreferrer"
          >
            service account documentation
          </Link>
          .
        </Typography>

        {(partnerTenantInfo.isLoading || partnerTenantInfo.isFetching) && (
          <Box sx={{ mb: 2, mt: 2 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="column" spacing={1} sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Stack>
                <Skeleton variant="rounded" width={120} height={24} />
              </Stack>
            </Box>
          </Box>
        )}

        {!partnerTenantInfo.isLoading &&
          !partnerTenantInfo.isFetching &&
          partnerTenantInfo?.data?.orgName && (
            <Box sx={{ mb: 2, mt: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="column" spacing={0.5}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <SvgIcon fontSize="small">
                        <Apartment />
                      </SvgIcon>
                      <Typography variant="body2" fontWeight="medium">
                        {partnerTenantInfo.data.orgName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {partnerTenantInfo.data.tenantId}
                      </Typography>
                    </Stack>
                    {partnerTenantInfo.data.authenticatedUserDisplayName && (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <SvgIcon fontSize="small">
                          <Person />
                        </SvgIcon>
                        <Typography variant="body2" fontWeight="medium">
                          {partnerTenantInfo.data.authenticatedUserDisplayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partnerTenantInfo.data.authenticatedUserPrincipalName}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {partnerTenantInfo.data.isPartnerTenant ? (
                      <Chip
                        label={getCippTranslation(partnerTenantInfo.data.partnerTenantType)}
                        size="small"
                        color="info"
                      />
                    ) : (
                      <Chip label="Non-Partner" size="small" color="default" />
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}

        {!partnerTenantInfo.isLoading &&
          !partnerTenantInfo.isFetching &&
          !partnerTenantInfo?.data?.orgName && (
            <Box sx={{ mb: 2, mt: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "warning.main",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="warning.main">
                    No partner tenant connected. Click the button below to authenticate with your
                    partner tenant.
                  </Typography>
                </Stack>
              </Box>
            </Box>
          )}

        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
          <CIPPM365OAuthButton
            onAuthSuccess={(tokenData) => {
              const updatedTokenData = {
                ...tokenData,
                tenantMode: "GDAP",
              };
              updateRefreshToken.mutate({
                url: "/api/ExecUpdateRefreshToken",
                data: updatedTokenData,
              });
            }}
            buttonText={
              partnerTenantInfo?.data?.orgName
                ? "Change Partner Tenant"
                : "Connect to Partner Tenant"
            }
            showSuccessAlert={false}
            promptBeforeAuth={
              partnerTenantInfo?.data?.orgName
                ? `Are you sure you want to change the partner tenant from '${partnerTenantInfo?.data?.orgName}'? If you are trying to add another tenant, use the per-tenant authentication below.`
                : false
            }
            scope="https://graph.microsoft.com/DelegatedPermissionGrant.ReadWrite.All https://graph.microsoft.com/Directory.ReadWrite.All https://graph.microsoft.com/AppRoleAssignment.ReadWrite.All offline_access profile openid"
          />
        </Box>
      </Box>

      <CippApiResults apiObject={updateRefreshToken} />

      {/* Per-Tenant */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Per-Tenant Authentication
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Click the button below to connect to individual tenants. You can authenticate to multiple
          tenants by repeating this step for each tenant you want to add. Accidentally added the
          wrong tenant? Use the table below to remove it.
        </Typography>

        {!partnerTenantInfo?.data?.orgName && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="warning.main">
              Please connect to your partner tenant first before adding separate tenants.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ position: "relative" }}>
              {!partnerTenantInfo?.data?.orgName && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    cursor: "not-allowed",
                  }}
                />
              )}
              <Box sx={{ opacity: !partnerTenantInfo?.data?.orgName ? 0.5 : 1 }}>
                <CIPPM365OAuthButton
                  onAuthSuccess={(tokenData) => {
                    if (!partnerTenantInfo?.data?.orgName) return;
                    const updatedTokenData = {
                      ...tokenData,
                      tenantMode: "perTenant",
                    };
                    addTenant.mutate({
                      url: "/api/ExecAddTenant",
                      data: updatedTokenData,
                    });
                  }}
                  buttonText="Connect to Separate Tenants"
                  showSuccessAlert={false}
                  scope="https://graph.microsoft.com/DelegatedPermissionGrant.ReadWrite.All https://graph.microsoft.com/Directory.ReadWrite.All https://graph.microsoft.com/AppRoleAssignment.ReadWrite.All offline_access profile openid"
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        <CippApiResults apiObject={addTenant} />

        <Box sx={{ mx: -4 }}>
          <CippTenantTable
            title="Authenticated Tenants"
            tenantInTitle={false}
            customColumns={["displayName", "defaultDomainName", "delegatedPrivilegeStatus"]}
            showExcludeButtons={false}
            showCardButton={false}
            showTenantSelector={false}
            showAllTenantsSelector={false}
          />
        </Box>
      </Box>

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        noSubmitButton={true}
      />
    </Stack>
  );
};

export default CippTenantModeDeploy;
