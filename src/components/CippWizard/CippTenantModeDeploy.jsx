import { useEffect } from "react";
import { Stack, Box, Typography, Link, Chip, Skeleton, SvgIcon } from "@mui/material";
import { Person, Apartment } from "@mui/icons-material";
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

  const updateRefreshToken = ApiPostCall({ urlfromdata: true });
  const addTenant = ApiPostCall({ urlfromdata: true });

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
      <CippApiResults apiObject={addTenant} />
      <CippApiResults apiObject={updateRefreshToken} />
      {/* Partner Tenant (GDAP) */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Partner Tenant
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Using GDAP is recommended for CIPP, however you can also authenticate to individual
          tenants. It is still highly recommended to connect to your partner tenant first, even if
          you are not a Microsoft CSP. This allows CIPP to send notifications, perform permission
          checks, and update permissions when required.
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

        {partnerTenantInfo.isLoading && (
          <Box sx={{ mb: 2, mt: 2 }}>
            <Skeleton variant="rounded" height={60} />
          </Box>
        )}

        {partnerTenantInfo?.data?.orgName && (
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
                : "Connect to Partner Tenant (Recommended)"
            }
            showSuccessAlert={false}
          />
        </Box>
      </Box>

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

        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CIPPM365OAuthButton
              onAuthSuccess={(tokenData) => {
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
            />
          </Stack>
        </Box>

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
