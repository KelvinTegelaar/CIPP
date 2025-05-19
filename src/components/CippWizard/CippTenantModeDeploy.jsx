import { useState, useEffect } from "react";
import {
  Alert,
  Stack,
  Box,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { CIPPM365OAuthButton } from "../CippComponents/CIPPM365OAuthButton";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiPostCall, ApiGetCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";

export const CippTenantModeDeploy = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;

  const [tenantMode, setTenantMode] = useState("GDAP");
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
    if (tenantList.data && (tenantMode === "perTenant" || tenantMode === "mixed")) {
      setAuthenticatedTenants(tenantList.data);
    }
  }, [tenantList.data, tenantMode]);

  // Handle tenant mode change
  const handleTenantModeChange = (selectedOption) => {
    if (selectedOption) {
      setTenantMode(selectedOption.value);
      // Reset auth status when changing modes
      setGdapAuthStatus({
        success: false,
        loading: false,
      });
      setPerTenantAuthStatus({
        success: false,
        loading: false,
      });
      // Reset partner tenant management option
      setAllowPartnerTenantManagement(false);
    }
  };

  // Tenant mode options
  const tenantModeOptions = [
    {
      label: "GDAP - Uses your partner center to connect to tenants",
      value: "GDAP",
    },
    {
      label: "Per Tenant - Add each tenant individually",
      value: "perTenant",
    },
    {
      label: "Mixed - Use Partner Center and add tenants individually",
      value: "mixed",
    },
  ];

  // Handle GDAP authentication success
  const handleGdapAuthSuccess = (tokenData) => {
    setGdapAuthStatus({
      success: true,
      loading: false,
    });

    // Allow user to proceed to next step for GDAP mode
    if (tenantMode === "GDAP") {
      formControl.setValue("tenantModeSet", true);
    } else if (tenantMode === "mixed") {
      // For mixed mode, allow proceeding if either authentication is successful
      formControl.setValue("tenantModeSet", true);
    }
  };

  // Handle perTenant authentication success
  const handlePerTenantAuthSuccess = (tokenData) => {
    setPerTenantAuthStatus({
      success: true,
      loading: false,
    });

    // For perTenant mode or mixed mode with perTenant auth, add the tenant to the cache
    if (tenantMode === "perTenant" || tenantMode === "mixed") {
      // Call the AddTenant API to add the tenant to the cache with directTenant status
      addTenant.mutate({
        url: "/api/ExecAddTenant",
        data: {
          tenantId: tokenData.tenantId,
        },
      });
    }

    // Allow user to proceed to next step
    formControl.setValue("tenantModeSet", true);

    // Refresh tenant list for perTenant and mixed modes
    if (tenantMode === "perTenant" || tenantMode === "mixed") {
      tenantList.refetch();
    }
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

  // Handle AddTenant API response
  useEffect(() => {
    if (addTenant.isSuccess) {
      console.log("Tenant added to cache successfully:", addTenant.data);
    } else if (addTenant.isError) {
      console.error("Failed to add tenant to cache:", addTenant.error);
    }
  }, [addTenant.isSuccess, addTenant.isError]);

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Select how you want to connect to your tenants. You have three options:
        <ul>
          <li>
            <strong>GDAP:</strong> Use delegated administration (recommended)
          </li>
          <li>
            <strong>Per Tenant:</strong> Authenticate to each tenant individually
          </li>
          <li>
            <strong>Mixed:</strong> Use both GDAP and per-tenant authentication
          </li>
        </ul>
      </Alert>

      {/* Tenant mode selection */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Tenant Connection Mode
        </Typography>
        <CippAutoComplete
          label="Select Tenant Connection Mode"
          options={tenantModeOptions}
          value={tenantModeOptions.find((option) => option.value === tenantMode)}
          onChange={handleTenantModeChange}
          multiple={false}
          required={true}
        />
      </Box>

      <Divider />

      {/* Show API results */}
      <CippApiResults apiObject={addTenant} />
      {addTenant.isSuccess && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          Tenant successfully added to the cache.
        </Alert>
      )}
      {addTenant.isError && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          Failed to add tenant to the cache: {addTenant.error?.message || "Unknown error"}
        </Alert>
      )}

      {/* GDAP Authentication Section */}
      {(tenantMode === "GDAP" || tenantMode === "mixed") && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Partner Tenant
          </Typography>

          <CippApiResults apiObject={updateRefreshToken} /> 

          {/* GDAP Partner Tenant Management Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={allowPartnerTenantManagement}
                onChange={(e) => setAllowPartnerTenantManagement(e.target.checked)}
                color="primary"
              />
            }
            label="Allow management of the partner tenant."
          />

          {/* Show authenticate button only if not successful yet */}
          {(!gdapAuthStatus.success || gdapAuthStatus.loading) && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CIPPM365OAuthButton
                  onAuthSuccess={(tokenData) => {
                    // Add the tenantMode and allowPartnerTenantManagement parameters to the tokenData
                    const updatedTokenData = {
                      ...tokenData,
                      tenantMode: tenantMode === "mixed" ? "GDAP" : tenantMode,
                      allowPartnerTenantManagement: allowPartnerTenantManagement,
                    };
                    handleGdapAuthSuccess(updatedTokenData);
                  }}
                  buttonText={
                    tenantMode === "mixed" ? "Connect to GDAP" : "Authenticate with Microsoft GDAP"
                  }
                  showSuccessAlert={false}
                />
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {/* Per Tenant Authentication Section */}
      {(tenantMode === "perTenant" || tenantMode === "mixed") && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Per-Tenant Authentication
          </Typography>

          {/* Show success message when authentication is successful */}
          {perTenantAuthStatus.success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              {tenantMode === "mixed"
                ? "Tenant authentication successful. You can add another tenant or proceed to the next step."
                : "Per-tenant authentication successful. You can add another tenant or proceed to the next step."}
            </Alert>
          )}

          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            {tenantMode === "mixed"
              ? "Click the button below to connect to individual tenants. You can authenticate to multiple tenants one by one."
              : "You can click the button below to authenticate to a tenant. Perform this authentication for every tenant you wish to manage using CIPP."}
          </Alert>
          {/* Show authenticate button */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CIPPM365OAuthButton
                onAuthSuccess={(tokenData) => {
                  // Add the tenantMode parameter to the tokenData
                  const updatedTokenData = {
                    ...tokenData,
                    tenantMode: tenantMode === "mixed" ? "perTenant" : tenantMode,
                  };
                  handlePerTenantAuthSuccess(updatedTokenData);
                }}
                buttonText={
                  tenantMode === "mixed"
                    ? "Connect to Separate Tenants"
                    : "Authenticate with Microsoft"
                }
                showSuccessAlert={false}
              />
            </Stack>
          </Box>

          {/* List authenticated tenants for perTenant and mixed modes */}
          {(tenantMode === "perTenant" || tenantMode === "mixed") &&
            authenticatedTenants.length > 0 && (
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
      )}

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
