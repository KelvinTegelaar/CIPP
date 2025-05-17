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

  // API call to update refresh token
  const updateRefreshToken = ApiPostCall({ urlfromdata: true });

  // API call to get list of authenticated tenants (for perTenant mode)
  const tenantList = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: "ListTenants",
  });

  // Update authenticated tenants list when tenantList changes
  useEffect(() => {
    if (tenantList.data && tenantMode === "perTenant") {
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
      success: false,
      loading: true,
    });

    // Send the refresh token to the API
    updateRefreshToken.mutate({
      url: "/api/ExecUpdateRefreshToken",
      data: {
        tenantId: tokenData.tenantId,
        refreshToken: tokenData.refreshToken,
        tenantMode: tenantMode === "mixed" ? "GDAP" : tenantMode,
        allowPartnerTenantManagement: tenantMode === "GDAP" ? allowPartnerTenantManagement : false,
      },
    });
  };

  // Handle perTenant authentication success
  const handlePerTenantAuthSuccess = (tokenData) => {
    setPerTenantAuthStatus({
      success: false,
      loading: true,
    });

    // Send the refresh token to the API
    updateRefreshToken.mutate({
      url: "/api/ExecUpdateRefreshToken",
      data: {
        tenantId: tokenData.tenantId,
        refreshToken: tokenData.refreshToken,
        tenantMode: tenantMode === "mixed" ? "perTenant" : tenantMode,
      },
    });
  };

  // Update status when API call completes
  useEffect(() => {
    if (updateRefreshToken.isSuccess) {
      const data = updateRefreshToken.data;

      if (data.state === "error") {
        if (tenantMode === "GDAP" || (tenantMode === "mixed" && gdapAuthStatus.loading)) {
          setGdapAuthStatus({
            success: false,
            loading: false,
          });
        } else {
          setPerTenantAuthStatus({
            success: false,
            loading: false,
          });
        }
      } else if (data.state === "success") {
        if (tenantMode === "GDAP" || (tenantMode === "mixed" && gdapAuthStatus.loading)) {
          setGdapAuthStatus({
            success: true,
            loading: false,
          });
          // Allow user to proceed to next step if not in mixed mode
          if (tenantMode !== "mixed") {
            formControl.setValue("tenantModeSet", true);
          }
        } else {
          setPerTenantAuthStatus({
            success: true,
            loading: false,
          });
          // Allow user to proceed to next step
          formControl.setValue("tenantModeSet", true);

          // Refresh tenant list for perTenant mode
          if (tenantMode === "perTenant") {
            tenantList.refetch();
          }
        }
      }
    }
  }, [updateRefreshToken.isSuccess, updateRefreshToken.data]);

  // Handle API error
  useEffect(() => {
    if (updateRefreshToken.isError) {
      if (tenantMode === "GDAP" || (tenantMode === "mixed" && gdapAuthStatus.loading)) {
        setGdapAuthStatus({
          success: false,
          loading: false,
        });
      } else {
        setPerTenantAuthStatus({
          success: false,
          loading: false,
        });
      }
    }
  }, [updateRefreshToken.isError]);

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
      <CippApiResults apiObject={updateRefreshToken} />

      {/* GDAP Authentication Section */}
      {(tenantMode === "GDAP" || tenantMode === "mixed") && (
        <Box>
          <Typography variant="h6" gutterBottom>
            GDAP Authentication
          </Typography>

          {/* Show success message when authentication is successful */}
          {gdapAuthStatus.success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              GDAP authentication successful. You can now proceed to the next step.
            </Alert>
          )}

          {/* GDAP Partner Tenant Management Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={allowPartnerTenantManagement}
                onChange={(e) => setAllowPartnerTenantManagement(e.target.checked)}
                color="primary"
              />
            }
            label="Allow management of the partner tenant"
          />

          {/* Show authenticate button only if not successful yet */}
          {(!gdapAuthStatus.success || gdapAuthStatus.loading) && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CIPPM365OAuthButton
                  onAuthSuccess={handleGdapAuthSuccess}
                  buttonText="Authenticate with Microsoft GDAP"
                  showSuccessAlert={false}
                />
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {/* Per Tenant Authentication Section */}
      {(tenantMode === "perTenant" || (tenantMode === "mixed" && gdapAuthStatus.success)) && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Per-Tenant Authentication
          </Typography>

          {/* Show success message when authentication is successful */}
          {perTenantAuthStatus.success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              Per-tenant authentication successful. You can add another tenant or proceed to the
              next step.
            </Alert>
          )}

          {/* Show authenticate button */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2, mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CIPPM365OAuthButton
                onAuthSuccess={handlePerTenantAuthSuccess}
                buttonText="Authenticate with Microsoft Per-Tenant"
                showSuccessAlert={false}
              />
              {(perTenantAuthStatus.loading || updateRefreshToken.isLoading) && (
                <CircularProgress size="1.5rem" />
              )}
            </Stack>
          </Box>

          {/* List authenticated tenants for perTenant mode */}
          {tenantMode === "perTenant" && authenticatedTenants.length > 0 && (
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
