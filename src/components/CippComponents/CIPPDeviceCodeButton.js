import { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { ApiGetCall } from "../../api/ApiCall";

/**
 * CIPPDeviceCodeButton - A button component for Microsoft 365 OAuth authentication using device code flow
 *
 * @param {Object} props - Component props
 * @param {Function} props.onAuthSuccess - Callback function called when authentication is successful with token data
 * @param {Function} props.onAuthError - Callback function called when authentication fails with error data
 * @param {string} props.buttonText - Text to display on the button (default: "Login with Device Code")
 * @param {boolean} props.showResults - Whether to show authentication results in the component (default: true)
 * @returns {JSX.Element} The CIPPDeviceCodeButton component
 */
export const CIPPDeviceCodeButton = ({
  onAuthSuccess,
  onAuthError,
  buttonText = "Login with Device Code",
  showResults = true,
}) => {
  const [authInProgress, setAuthInProgress] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [deviceCodeInfo, setDeviceCodeInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [pollInterval, setPollInterval] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresOn: null,
    refreshTokenExpiresOn: null,
    username: null,
    tenantId: null,
    onmicrosoftDomain: null,
  });

  // Get application ID information from API
  const appIdInfo = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: `ExecListAppId`,
    waiting: true,
  });

  // Handle closing the error
  const handleCloseError = () => {
    setAuthError(null);
  };

  // Clear polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Start device code authentication
  const startDeviceCodeAuth = async () => {
    try {
      setAuthInProgress(true);
      setAuthError(null);
      setDeviceCodeInfo(null);
      setCurrentStep(1);
      
      // Call the API to start device code flow
      const response = await fetch(`/api/ExecSAMSetup?CreateSAM=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.code) {
        // Store device code info
        setDeviceCodeInfo({
          user_code: data.code,
          verification_uri: data.url,
          expires_in: 900, // Default to 15 minutes if not provided
        });
        
        // Start polling for token
        const interval = setInterval(checkAuthStatus, 5000);
        setPollInterval(interval);
      } else {
        // Error getting device code
        setAuthError({
          errorCode: "device_code_error",
          errorMessage: data.message || "Failed to get device code",
          timestamp: new Date().toISOString(),
        });
        setAuthInProgress(false);
        if (onAuthError) onAuthError(error);
      }
    } catch (error) {
      console.error("Error starting device code authentication:", error);
      setAuthError({
        errorCode: "device_code_error",
        errorMessage: error.message || "An error occurred during device code authentication",
        timestamp: new Date().toISOString(),
      });
      setAuthInProgress(false);
      if (onAuthError) onAuthError(error);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      // Call the API to check auth status
      const response = await fetch(`/api/ExecSAMSetup?CheckSetupProcess=true&step=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.step === 2) {
          // Authentication successful
          clearInterval(pollInterval);
          setPollInterval(null);
          
          // Process token data
          const tokenData = {
            accessToken: "Successfully authenticated",
            refreshToken: "Token stored on server",
            accessTokenExpiresOn: new Date(Date.now() + 3600 * 1000), // 1 hour from now
            refreshTokenExpiresOn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            username: "authenticated user",
            tenantId: data.tenantId || "unknown",
            onmicrosoftDomain: null,
          };
          
          // Store tokens in component state
          setTokens(tokenData);
          setDeviceCodeInfo(null);
          setCurrentStep(2);
          
          // Call the onAuthSuccess callback if provided
          if (onAuthSuccess) onAuthSuccess(tokenData);
          
          // Update UI state
          setAuthInProgress(false);
        }
      } else {
        // Error checking auth status
        clearInterval(pollInterval);
        setPollInterval(null);
        
        setAuthError({
          errorCode: "auth_status_error",
          errorMessage: data.message || "Failed to check authentication status",
          timestamp: new Date().toISOString(),
        });
        setAuthInProgress(false);
        if (onAuthError) onAuthError({
          errorCode: "auth_status_error",
          errorMessage: data.message || "Failed to check authentication status",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // Don't stop polling on transient errors
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        disabled={
          appIdInfo.isLoading ||
          authInProgress ||
          (!appIdInfo?.data?.applicationId)
        }
        onClick={startDeviceCodeAuth}
        color="primary"
      >
        {authInProgress ? (
          <>
            <CircularProgress size="1rem" color="inherit" sx={{ mr: 1 }} />
            Authenticating...
          </>
        ) : (
          buttonText
        )}
      </Button>

      {!appIdInfo.isLoading && 
        !appIdInfo?.data?.applicationId && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            The Application ID is not valid. Please check your configuration.
          </Alert>
        )
      }

      {showResults && (
        <Box mt={2}>
          {deviceCodeInfo && authInProgress ? (
            <Alert severity="info">
              <Typography variant="subtitle2">Device Code Authentication</Typography>
              <Typography variant="body2" gutterBottom>
                To sign in, use a web browser to open the page <strong>{deviceCodeInfo.verification_uri}</strong> and enter the code <strong>{deviceCodeInfo.user_code}</strong> to authenticate.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Code expires in {Math.round(deviceCodeInfo.expires_in / 60)} minutes
              </Typography>
            </Alert>
          ) : tokens.accessToken ? (
            <Alert severity="success">
              <Typography variant="subtitle2">Authentication Successful</Typography>
              <Typography variant="body2">
                You've successfully refreshed your token using device code flow.
              </Typography>
              {tokens.tenantId && (
                <Typography variant="body2">
                  Tenant ID: <strong>{tokens.tenantId}</strong>
                </Typography>
              )}
            </Alert>
          ) : authError ? (
            <Alert severity="error">
              <Typography variant="subtitle2">Authentication Error: {authError.errorCode}</Typography>
              <Typography variant="body2">{authError.errorMessage}</Typography>
              <Typography variant="caption" color="text.secondary">
                Time: {authError.timestamp}
              </Typography>
              <Box mt={1}>
                <Button size="small" variant="outlined" color="error" onClick={handleCloseError}>
                  Dismiss
                </Button>
              </Box>
            </Alert>
          ) : null}
        </Box>
      )}
    </div>
  );
};

export default CIPPDeviceCodeButton;