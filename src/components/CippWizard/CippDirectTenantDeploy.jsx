import { useEffect } from "react";
import { Stack, Box, Typography, Link } from "@mui/material";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippDirectTenantDeploy = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;

  formControl.register("DirectTenantAuth", {
    required: true,
  });

  const addTenant = ApiPostCall({ urlfromdata: true, relatedQueryKeys: ["tenants-table"] });

  useEffect(() => {
    if (addTenant.isSuccess) {
      formControl.setValue("DirectTenantAuth", true);
      formControl.trigger("DirectTenantAuth");
    }
  }, [addTenant.isSuccess, formControl]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Per-Tenant Authentication
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Click the button below to connect to individual tenants. This option allows you to
          authenticate directly to a tenant without using GDAP or Partner Center relationships.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          You can authenticate to multiple tenants by repeating this step for each tenant you want
          to add. More information about per-tenant authentication can be found in the{" "}
          <Link
            href="https://docs.cipp.app/setup/authentication"
            target="_blank"
            rel="noopener noreferrer"
          >
            authentication documentation
          </Link>
          .
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
              buttonText="Connect to Tenant"
              showSuccessAlert={false}
              scope="https://graph.microsoft.com/DelegatedPermissionGrant.ReadWrite.All https://graph.microsoft.com/Directory.ReadWrite.All https://graph.microsoft.com/AppRoleAssignment.ReadWrite.All offline_access profile openid"
            />
          </Stack>
        </Box>

        <CippApiResults apiObject={addTenant} />
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

export default CippDirectTenantDeploy;
