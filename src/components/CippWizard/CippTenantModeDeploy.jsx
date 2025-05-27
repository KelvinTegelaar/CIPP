import { useState, useEffect } from "react";
import {
  Stack,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Switch,
  FormControlLabel,
  Link,
} from "@mui/material";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiPostCall, ApiGetCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippTenantModeDeploy = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;

  const [tenantMode, setTenantMode] = useState("mixed");
  const [allowPartnerTenantManagement, setAllowPartnerTenantManagement] = useState(false);
  const [gdapAuthStatus, setGdapAuthStatus] = useState({
    success: false,
    loading: false,
  });
  const [perTenantAuthStatus, setPerTenantAuthStatus] = useState({
    success: false,
    loading: false,
  });
  const [authenticatedTenants, setAuthenticatedTenants] = useState([]);

  // API calls
  const updateRefreshToken = ApiPostCall({ urlfromdata: true });
  const addTenant = ApiPostCall({ urlfromdata: true });

  // API call to get list of authenticated tenants (for perTenant mode)
  const tenantList = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: "ListTenants",
  });

  // Update authenticated tenants list when tenantList changes
  useEffect(() => {
    if (tenantList.data) {
      setAuthenticatedTenants(tenantList.data);
    }
  }, [tenantList.data]);

  // Tenant mode is always set to "mixed"

  // Handle GDAP authentication success
  const handleGdapAuthSuccess = (tokenData) => {
    // Set loading state
    setGdapAuthStatus({
      success: true,
      loading: true,
    });

    // Explicitly call the updateRefreshToken API
    updateRefreshToken.mutate(
      {
        url: "/api/ExecUpdateRefreshToken",
        data: {
          tenantId: tokenData.tenantId,
          refreshtoken: tokenData.refreshToken,
          tenantMode: tokenData.tenantMode,
          allowPartnerTenantManagement: tokenData.allowPartnerTenantManagement,
        },
      },
      {
        onSuccess: (data) => {
          setGdapAuthStatus({
            success: true,
            loading: false,
          });
        },
        onError: (error) => {
          setGdapAuthStatus({
            success: false,
            loading: false,
          });
        },
      }
    );

    // Allow user to proceed to next step
    formControl.setValue("tenantModeSet", true);
  };

  // Handle perTenant authentication success
  const handlePerTenantAuthSuccess = (tokenData) => {
    // Set loading state
    setPerTenantAuthStatus({
      success: true,
      loading: true,
    });

    // Add the tenant to the cache
    // Call the AddTenant API to add the tenant to the cache with directTenant status
    addTenant.mutate({
      url: "/api/ExecAddTenant",
      data: {
        tenantId: tokenData.tenantId,
        access_token: tokenData.accessToken,
      },
    });

    // Allow user to proceed to next step
    formControl.setValue("tenantModeSet", true);

    // Refresh tenant list
    tenantList.refetch();
  };

  // Handle API error
  useEffect(() => {
    if (addTenant.isError) {
      setPerTenantAuthStatus({
        success: false,
        loading: false,
      });
    }
  }, [addTenant.isError]);

  return (
    <Stack spacing={2}>
      {/* Show API results at top level for visibility across all modes */}
      <CippApiResults apiObject={updateRefreshToken} />
      <CippApiResults apiObject={addTenant} />

      {/* GDAP Authentication Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Partner Tenant
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Using GDAP is recommended for CIPP, however you can also authenticate to individual
          tenants. It is still highly recommended to connect to your partner tenant first, even if
          you are not a Microsoft CSP.
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
        {/* Always show authenticate button */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CIPPM365OAuthButton
              onAuthSuccess={(tokenData) => {
                // Add the tenantMode and allowPartnerTenantManagement parameters to the tokenData
                const updatedTokenData = {
                  ...tokenData,
                  tenantMode: "GDAP",
                  allowPartnerTenantManagement: allowPartnerTenantManagement,
                };
                handleGdapAuthSuccess(updatedTokenData);
              }}
              buttonText="Connect to Partner Tenant (Recommended)"
              showSuccessAlert={false}
            />
          </Stack>
        </Box>
      </Box>

      {/* Per Tenant Authentication Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Per-Tenant Authentication
        </Typography>

        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Click the button below to connect to individual tenants. You can authenticate to multiple
          tenants by repeating this step for each tenant you want to add.
        </Typography>

        {/* Show authenticate button */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CIPPM365OAuthButton
              onAuthSuccess={(tokenData) => {
                // Add the tenantMode parameter to the tokenData
                const updatedTokenData = {
                  ...tokenData,
                  tenantMode: "perTenant",
                };
                handlePerTenantAuthSuccess(updatedTokenData);
              }}
              buttonText="Connect to Separate Tenants"
              showSuccessAlert={false}
            />
          </Stack>
        </Box>

        {/* List authenticated tenants */}
        {authenticatedTenants.length > 0 && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Authenticated Tenants
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto" }}>
              <List dense>
                {authenticatedTenants.map((tenant, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={tenant.defaultDomainName || tenant.tenantId}
                      secondary={tenant.displayName || "Unknown Tenant"}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
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
