import { useState } from "react";
import {
  Alert,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { ApiGetCall } from "../../api/ApiCall";

/**
 * CIPPM365OAuthButton - A reusable button component for Microsoft 365 OAuth authentication
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onAuthSuccess - Callback function called when authentication is successful with token data
 * @param {Function} props.onAuthError - Callback function called when authentication fails with error data
 * @param {string} props.buttonText - Text to display on the button (default: "Login with Microsoft")
 * @param {boolean} props.showResults - Whether to show authentication results in the component (default: true)
 * @param {string} props.scope - OAuth scope to request (default: "https://graph.microsoft.com/.default offline_access profile openid")
 * @returns {JSX.Element} The CIPPM365OAuthButton component
 */
export const CIPPM365OAuthButton = ({
  onAuthSuccess,
  onAuthError,
  buttonText = "Login with Microsoft",
  showResults = true,
  scope = "https://graph.microsoft.com/.default offline_access profile openid",
}) => {
  const [authInProgress, setAuthInProgress] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresOn: null,
    refreshTokenExpiresOn: null,
    username: null,
    tenantId: null,
    onmicrosoftDomain: null,
  });

  // Get application ID information
  const appId = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: `ExecListAppId`,
    waiting: true,
  });

  // Handle closing the error
  const handleCloseError = () => {
    setAuthError(null);
  };

  // MSAL-like authentication function
  const handleMsalAuthentication = () => {
    // Clear previous authentication state when starting a new authentication
    setAuthInProgress(true);
    setAuthError(null);
    setTokens({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresOn: null,
      refreshTokenExpiresOn: null,
      username: null,
      tenantId: null,
      onmicrosoftDomain: null,
    });

    // Generate MSAL-like authentication parameters
    const msalConfig = {
      auth: {
        clientId: appId?.data?.applicationId,
        authority: `https://login.microsoftonline.com/common`,
        redirectUri: window.location.origin,
      },
    };

    // Define the request object similar to MSAL
    const loginRequest = {
      scopes: [scope],
    };

    console.log("MSAL Config:", msalConfig);
    console.log("Login Request:", loginRequest);

    // Generate PKCE code verifier and challenge
    const generateCodeVerifier = () => {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)).join("");
    };

    const base64URLEncode = (str) => {
      return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    };

    // Generate code verifier for PKCE
    const codeVerifier = generateCodeVerifier();
    // In a real implementation, we would hash the code verifier to create the code challenge
    // For simplicity, we'll use the same value
    const codeChallenge = codeVerifier;

    // Note: We're not storing the code verifier in session storage for security reasons
    // Instead, we'll use it directly in the token exchange

    // Create a random state value for security
    const state = Math.random().toString(36).substring(2, 15);

    // Create the auth URL with PKCE parameters
    const authUrl =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${appId?.data?.applicationId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(window.location.origin)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=plain` +
      `&state=${state}` +
      `&prompt=select_account`;

    console.log("MSAL Auth URL:", authUrl);

    // Open popup for authentication
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      "msalAuthPopup",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Function to actually exchange the authorization code for tokens
    const handleAuthorizationCode = async (code, receivedState) => {
      // Verify the state parameter matches what we sent (security check)
      if (receivedState !== state) {
        const errorMessage = "State mismatch in auth response - possible CSRF attack";
        console.error(errorMessage);
        const error = {
          errorCode: "state_mismatch",
          errorMessage: errorMessage,
          timestamp: new Date().toISOString(),
        };
        setAuthError(error);
        if (onAuthError) onAuthError(error);
        setAuthInProgress(false);
        return;
      }

      console.log("Authorization code received:", code);

      try {
        // Actually exchange the code for tokens using the token endpoint
        console.log("Exchanging authorization code for tokens...");

        // Prepare the token request
        const tokenRequest = {
          grant_type: "authorization_code",
          client_id: appId?.data?.applicationId,
          code: code,
          redirect_uri: window.location.origin,
          code_verifier: codeVerifier,
        };

        // Make the token request
        const tokenResponse = await fetch(
          `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(tokenRequest).toString(),
          }
        );

        // Parse the token response
        const tokenData = await tokenResponse.json();

        if (tokenResponse.ok) {
          // Extract token information
          const accessTokenExpiresOn = new Date(Date.now() + tokenData.expires_in * 1000);
          // Refresh tokens typically last for 90 days, but this can vary
          // For demonstration, we'll set it to 90 days from now
          const refreshTokenExpiresOn = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

          // Extract information from ID token if available
          let username = "unknown user";
          let tenantId = appId?.data?.tenantId || "unknown tenant";
          let onmicrosoftDomain = null;
          
          if (tokenData.id_token) {
            try {
              const idTokenPayload = JSON.parse(atob(tokenData.id_token.split(".")[1]));
              
              // Extract username
              username =
                idTokenPayload.preferred_username ||
                idTokenPayload.email ||
                idTokenPayload.upn ||
                idTokenPayload.name ||
                "unknown user";
              
              // Extract tenant ID if available in the token
              if (idTokenPayload.tid) {
                tenantId = idTokenPayload.tid;
              }
              
              // Try to extract onmicrosoft domain from the username or issuer
              if (username && username.includes("@") && username.includes(".onmicrosoft.com")) {
                onmicrosoftDomain = username.split("@")[1];
              } else if (idTokenPayload.iss) {
                const issuerMatch = idTokenPayload.iss.match(/https:\/\/sts\.windows\.net\/([^/]+)\//);
                if (issuerMatch && issuerMatch[1]) {
                  // We have the tenant ID, but not the domain name
                  // We could potentially make an API call to get the domain, but for now we'll leave it null
                }
              }
            } catch (error) {
              console.error("Error parsing ID token:", error);
            }
          }

          // Create token result object
          const tokenResult = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            accessTokenExpiresOn: accessTokenExpiresOn,
            refreshTokenExpiresOn: refreshTokenExpiresOn,
            username: username,
            tenantId: tenantId,
            onmicrosoftDomain: onmicrosoftDomain,
          };

          // Store tokens in component state
          setTokens(tokenResult);

          // Log only the necessary token information to console
          console.log("Access Token:", tokenData.access_token);
          console.log("Refresh Token:", tokenData.refresh_token);

          // Call the onAuthSuccess callback if provided
          if (onAuthSuccess) onAuthSuccess(tokenResult);
        } else {
          // Handle token error - display in error box instead of throwing
          const error = {
            errorCode: tokenData.error || "token_error",
            errorMessage:
              tokenData.error_description || "Failed to exchange authorization code for tokens",
            timestamp: new Date().toISOString(),
          };
          setAuthError(error);
          if (onAuthError) onAuthError(error);
        }
      } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        const errorObj = {
          errorCode: "token_exchange_error",
          errorMessage: error.message || "Failed to exchange authorization code for tokens",
          timestamp: new Date().toISOString(),
        };
        setAuthError(errorObj);
        if (onAuthError) onAuthError(errorObj);
      } finally {
        // Close the popup window if it's still open
        if (popup && !popup.closed) {
          popup.close();
        }

        // Update UI state
        setAuthInProgress(false);
      }
    };

    // Monitor for the redirect with the authorization code
    // This is what MSAL does internally
    const checkPopupLocation = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopupLocation);

        // If authentication is still in progress when popup closes, it's an error
        if (authInProgress) {
          const errorMessage = "Authentication was cancelled. Please try again.";
          console.error(errorMessage);
          const error = {
            errorCode: "user_cancelled",
            errorMessage: errorMessage,
            timestamp: new Date().toISOString(),
          };
          setAuthError(error);
          if (onAuthError) onAuthError(error);
          
          // Ensure we're not showing any previous success state
          setTokens({
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresOn: null,
            refreshTokenExpiresOn: null,
            username: null,
            tenantId: null,
            onmicrosoftDomain: null,
          });
        }

        setAuthInProgress(false);
        return;
      }

      try {
        // Try to access the popup location to check for the authorization code
        const currentUrl = popup.location.href;

        // Check if the URL contains a code parameter (authorization code)
        if (currentUrl.includes("code=") && currentUrl.includes("state=")) {
          clearInterval(checkPopupLocation);

          console.log("Detected authorization code in URL:", currentUrl);

          // Parse the URL to extract the code and state
          const urlParams = new URLSearchParams(popup.location.search);
          const code = urlParams.get("code");
          const receivedState = urlParams.get("state");

          // Process the authorization code
          handleAuthorizationCode(code, receivedState);
        }

        // Check for error in the URL
        if (currentUrl.includes("error=")) {
          clearInterval(checkPopupLocation);

          console.error("Detected error in authentication response:", currentUrl);

          // Parse the URL to extract the error details
          const urlParams = new URLSearchParams(popup.location.search);
          const errorCode = urlParams.get("error");
          const errorDescription = urlParams.get("error_description");

          // Set the error state
          const error = {
            errorCode: errorCode,
            errorMessage: errorDescription || "Unknown authentication error",
            timestamp: new Date().toISOString(),
          };
          setAuthError(error);
          if (onAuthError) onAuthError(error);

          // Close the popup
          popup.close();
          setAuthInProgress(false);
        }
      } catch (error) {
        // This will throw an error when the popup is on a different domain
        // due to cross-origin restrictions, which is normal during auth flow
        // Just continue monitoring
      }
    }, 500);

    // Also monitor for popup closing as a fallback
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        clearInterval(checkPopupLocation);

        // If authentication is still in progress when popup closes, it's an error
        if (authInProgress) {
          const errorMessage = "Authentication was cancelled. Please try again.";
          console.error(errorMessage);
          const error = {
            errorCode: "user_cancelled",
            errorMessage: errorMessage,
            timestamp: new Date().toISOString(),
          };
          setAuthError(error);
          if (onAuthError) onAuthError(error);
          
          // Ensure we're not showing any previous success state
          setTokens({
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresOn: null,
            refreshTokenExpiresOn: null,
            username: null,
            tenantId: null,
            onmicrosoftDomain: null,
          });
        }

        setAuthInProgress(false);
      }
    }, 1000);
  };

  return (
    <div>
      <Button
        variant="contained"
        disabled={
          appId.isLoading ||
          authInProgress ||
          !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            appId?.data?.applicationId
          )
        }
        onClick={handleMsalAuthentication}
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

      {!appId.isLoading && 
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          appId?.data?.applicationId
        ) && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            The Application ID is not valid. Please check your configuration.
          </Alert>
        )
      }

      {showResults && (
        <Box mt={2}>
          {tokens.accessToken ? (
            <Alert severity="success">
              <Typography variant="subtitle2">Authentication Successful</Typography>
              <Typography variant="body2">
                You've successfully refreshed your token. The account you're using for authentication
                is: <strong>{tokens.username}</strong>
              </Typography>
              <Typography variant="body2">
                Tenant ID: <strong>{tokens.tenantId}</strong>
                {tokens.onmicrosoftDomain && (
                  <> | Domain: <strong>{tokens.onmicrosoftDomain}</strong></>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Refresh token expires: {tokens.refreshTokenExpiresOn?.toLocaleString()}
              </Typography>
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

export default CIPPM365OAuthButton;