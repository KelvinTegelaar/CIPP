import { useState, useEffect } from "react";
import { Alert, Button, Typography, CircularProgress, Box } from "@mui/material";
import { Microsoft, Login, Refresh } from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { CippApiDialog } from "./CippApiDialog";

export const CIPPM365OAuthButton = ({
  onAuthSuccess,
  onAuthError,
  buttonText = "Login with Microsoft",
  showResults = true,
  showSuccessAlert = true,
  scope = "https://graph.microsoft.com/.default offline_access profile openid",
  useDeviceCode = false,
  applicationId = null,
  autoStartDeviceLogon = false,
  validateServiceAccount = true,
  promptBeforeAuth = false,
}) => {
  const [authInProgress, setAuthInProgress] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [deviceCodeInfo, setDeviceCodeInfo] = useState(null);
  const [codeRetrievalInProgress, setCodeRetrievalInProgress] = useState(false);
  const [isServiceAccount, setIsServiceAccount] = useState(true);
  const [promptDialog, setPromptDialog] = useState({ open: false });
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresOn: null,
    refreshTokenExpiresOn: null,
    username: null,
    tenantId: null,
    onmicrosoftDomain: null,
  });

  const appIdInfo = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: "listAppId",
    waiting: true,
  });

  const handleCloseError = () => {
    setAuthError(null);
  };

  const checkIsServiceAccount = (username) => {
    if (!username || !validateServiceAccount) return true; // If no username or validation disabled, don't show warning

    const lowerUsername = username.toLowerCase();
    return lowerUsername.includes("service") || lowerUsername.includes("cipp");
  };

  // Function to retrieve device code
  const retrieveDeviceCode = async () => {
    setCodeRetrievalInProgress(true);
    setAuthError(null);

    // Only refetch appId if not already present
    if (!applicationId && !appIdInfo?.data?.applicationId) {
      await appIdInfo.refetch();
    }

    try {
      // Get the application ID to use
      const appId =
        applicationId || appIdInfo?.data?.applicationId || "1b730954-1685-4b74-9bfd-dac224a7b894"; // Default to MS Graph Explorer app ID

      // Request device code from our API endpoint
      const deviceCodeResponse = await fetch(
        `/api/ExecDeviceCodeLogon?operation=getDeviceCode&clientId=${appId}&scope=${encodeURIComponent(
          scope,
        )}`,
      );
      const deviceCodeData = await deviceCodeResponse.json();

      if (deviceCodeResponse.ok && deviceCodeData.user_code) {
        // Store device code info
        setDeviceCodeInfo(deviceCodeData);
      } else {
        // Error getting device code
        setAuthError({
          errorCode: deviceCodeData.error || "device_code_error",
          errorMessage: deviceCodeData.error_description || "Failed to get device code",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      setAuthError({
        errorCode: "device_code_error",
        errorMessage: error.message || "An error occurred retrieving device code",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setCodeRetrievalInProgress(false);
    }
  };

  // Device code authentication function - opens popup and starts polling
  const handleDeviceCodeAuthentication = async () => {
    // Only refetch appId if not already present
    if (!applicationId && !appIdInfo?.data?.applicationId) {
      await appIdInfo.refetch();
    }

    if (!deviceCodeInfo) {
      // If we don't have a device code yet, retrieve it first
      await retrieveDeviceCode();
      return;
    }

    setAuthInProgress(true);
    setTokens({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresOn: null,
      refreshTokenExpiresOn: null,
      username: null,
      tenantId: null,
      onmicrosoftDomain: null,
    });

    try {
      // Get the application ID to use - refetch already happened at the start of this function
      const appId =
        applicationId || appIdInfo?.data?.applicationId || "1b730954-1685-4b74-9bfd-dac224a7b894"; // Default to MS Graph Explorer app ID

      // Open popup to device login page
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        "https://microsoft.com/devicelogin",
        "deviceLoginPopup",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Start polling for token
      const pollInterval = deviceCodeInfo.interval || 5;
      const expiresIn = deviceCodeInfo.expires_in || 900;
      const startTime = Date.now();

      const pollForToken = async () => {
        // Check if we've exceeded the expiration time
        if (Date.now() - startTime >= expiresIn * 1000) {
          if (popup && !popup.closed) {
            popup.close();
          }
          setAuthError({
            errorCode: "timeout",
            errorMessage: "Device code authentication timed out",
            timestamp: new Date().toISOString(),
          });
          setAuthInProgress(false);
          return;
        }

        try {
          // Poll for token using our API endpoint
          const tokenResponse = await fetch(
            `/api/ExecDeviceCodeLogon?operation=checkToken&clientId=${appId}&deviceCode=${deviceCodeInfo.device_code}`,
          );
          const tokenData = await tokenResponse.json();

          if (tokenResponse.ok && tokenData.status === "success") {
            // Successfully got token
            if (popup && !popup.closed) {
              popup.close();
            }
            handleTokenResponse(tokenData);
          } else if (
            tokenData.error === "authorization_pending" ||
            tokenData.status === "pending"
          ) {
            // User hasn't completed authentication yet, continue polling
            setTimeout(pollForToken, pollInterval * 1000);
          } else if (tokenData.error === "slow_down") {
            // Server asking us to slow down polling
            setTimeout(pollForToken, (pollInterval + 5) * 1000);
          } else {
            // Other error
            if (popup && !popup.closed) {
              popup.close();
            }
            setAuthError({
              errorCode: tokenData.error || "token_error",
              errorMessage: tokenData.error_description || "Failed to get token",
              timestamp: new Date().toISOString(),
            });
            setAuthInProgress(false);
          }
        } catch (error) {
          setTimeout(pollForToken, pollInterval * 1000);
        }
      };

      // Start polling
      setTimeout(pollForToken, pollInterval * 1000);
    } catch (error) {
      setAuthError({
        errorCode: "device_code_error",
        errorMessage: error.message || "An error occurred during device code authentication",
        timestamp: new Date().toISOString(),
      });
      setAuthInProgress(false);
    }
  };

  // Process token response (common for both auth methods)
  const handleTokenResponse = (tokenData) => {
    // Extract token information
    const accessTokenExpiresOn = new Date(Date.now() + tokenData.expires_in * 1000);
    // Refresh tokens typically last for 90 days, but this can vary
    const refreshTokenExpiresOn = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    // Extract information from ID token if available
    let username = "unknown user";
    let tenantId = "unknown tenant";
    let onmicrosoftDomain = null;

    if (tokenData.id_token) {
      try {
        const idTokenPayload = JSON.parse(atob(tokenData.id_token.split(".")[1]));

        username =
          idTokenPayload.preferred_username ||
          idTokenPayload.email ||
          idTokenPayload.upn ||
          idTokenPayload.name ||
          "unknown user";

        if (idTokenPayload.tid) {
          tenantId = idTokenPayload.tid;
        }

        if (username && username.includes("@") && username.includes(".onmicrosoft.com")) {
          onmicrosoftDomain = username.split("@")[1];
        } else if (idTokenPayload.iss) {
          const issuerMatch = idTokenPayload.iss.match(/https:\/\/sts\.windows\.net\/([^/]+)\//);
          if (issuerMatch && issuerMatch[1]) {
          }
        }
        setIsServiceAccount(checkIsServiceAccount(username));
      } catch (error) {}
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

    setTokens(tokenResult);
    setDeviceCodeInfo(null);

    if (onAuthSuccess) onAuthSuccess(tokenResult);

    // Update UI state
    setAuthInProgress(false);
    setIsServiceAccount(checkIsServiceAccount(username));
  };

  // MSAL-like authentication function
  const handleMsalAuthentication = async (retryCount = 0) => {
    const maxRetries = 3;

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

    // Only refetch app ID if not already present
    if (!applicationId && !appIdInfo?.data?.applicationId) {
      await appIdInfo.refetch();
    }

    // Get the application ID to use
    const appId = applicationId || appIdInfo?.data?.applicationId;

    // Generate MSAL-like authentication parameters
    const msalConfig = {
      auth: {
        clientId: appId,
        authority: `https://login.microsoftonline.com/common`,
        redirectUri: `${window.location.origin}/authredirect`,
      },
    };

    // Define the request object similar to MSAL
    const loginRequest = {
      scopes: [scope],
    };

    // Generate PKCE code verifier and challenge
    const generateCodeVerifier = () => {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)).join("");
    };

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = codeVerifier;
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${appId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(window.location.origin)}/authredirect` +
      `&scope=${encodeURIComponent(scope)}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=plain` +
      `&state=${state}` +
      `&prompt=select_account`;

    // Open popup for authentication
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      "msalAuthPopup",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    // Function to actually exchange the authorization code for tokens
    const handleAuthorizationCode = async (code, receivedState) => {
      // Verify the state parameter matches what we sent (security check)
      if (receivedState !== state) {
        const errorMessage = "State mismatch in auth response - possible CSRF attack";
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
      try {
        // Prepare the token request
        const tokenRequest = {
          grant_type: "authorization_code",
          client_id: appId,
          code: code,
          redirect_uri: `${window.location.origin}/authredirect`,
          code_verifier: codeVerifier,
        };

        // Make the token request through our API proxy to avoid origin header issues
        // Retry logic for AADSTS650051 (service principal already exists)
        let retryCount = 0;
        const maxRetries = 3;
        let tokenResponse;
        let tokenData;

        while (retryCount <= maxRetries) {
          tokenResponse = await fetch(`/api/ExecTokenExchange`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tokenRequest,
              tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
              tenantId: appId, // Pass the tenant ID to retrieve the correct client secret
            }),
          });

          // Parse the token response
          tokenData = await tokenResponse.json();

          // Check if it's the AADSTS650051 error (service principal already exists)
          if (
            tokenData.error === "invalid_client" &&
            tokenData.error_description?.includes("AADSTS650051")
          ) {
            retryCount++;
            if (retryCount <= maxRetries) {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) => setTimeout(resolve, 2000 * retryCount));
              continue;
            }
          }
          // If no error or different error, break out of retry loop
          break;
        }

        // Check if the response contains an error
        if (tokenData.error) {
          const error = {
            errorCode: tokenData.error || "token_error",
            errorMessage:
              tokenData.error_description || "Failed to exchange authorization code for tokens",
            timestamp: new Date().toISOString(),
          };
          setAuthError(error);
          if (onAuthError) onAuthError(error);
          setAuthInProgress(false);
          return;
        }

        if (tokenResponse.ok) {
          // If we have a refresh token, store it
          if (tokenData.refresh_token) {
            try {
              // Extract tid from access_token jwt base64
              const accessTokenParts = tokenData.access_token.split(".");
              const accessTokenPayload = JSON.parse(atob(accessTokenParts[1] || ""));
              tokenData.tid = accessTokenPayload.tid;
              const refreshResponse = await fetch(`/api/ExecUpdateRefreshToken`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  tenantId: tokenData.tid,
                  refreshtoken: tokenData.refresh_token,
                  tenantMode: tokenData.tenantMode,
                  allowPartnerTenantManagement: tokenData.allowPartnerTenantManagement,
                }),
              });

              if (!refreshResponse.ok) {
                console.warn("Failed to store refresh token, but continuing with authentication");
              } else {
                // Invalidate the listAppId and tenants-table queryKeys to refresh data
                appIdInfo.refetch();
              }
            } catch (error) {
              console.error("Failed to store refresh token:", error);
            }
          }

          handleTokenResponse(tokenData);
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
          // Parse the URL to extract the error details
          const urlParams = new URLSearchParams(popup.location.search);
          const errorCode = urlParams.get("error");
          const errorDescription = urlParams.get("error_description");

          // Check if it's the AADSTS650051 error (service principal already exists during consent)
          if (
            errorCode === "invalid_client" &&
            errorDescription?.includes("AADSTS650051") &&
            retryCount < maxRetries
          ) {
            // Close the popup
            popup.close();
            setAuthInProgress(false);

            // Wait before retrying (exponential backoff)
            setTimeout(
              () => {
                handleMsalAuthentication(retryCount + 1);
              },
              2000 * (retryCount + 1),
            );
            return;
          }

          // Set the error state for non-retryable errors
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
  };

  // Auto-start device code retrieval if requested
  useEffect(() => {
    if (
      useDeviceCode &&
      autoStartDeviceLogon &&
      !codeRetrievalInProgress &&
      !deviceCodeInfo &&
      !tokens.accessToken &&
      appIdInfo?.data
    ) {
      retrieveDeviceCode();
    }
  }, [
    useDeviceCode,
    autoStartDeviceLogon,
    codeRetrievalInProgress,
    deviceCodeInfo,
    tokens.accessToken,
    appIdInfo?.data,
  ]);

  return (
    <div>
      {!applicationId &&
        !appIdInfo.isLoading &&
        appIdInfo?.data?.applicationId && // Only check if applicationId is present in data
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          appIdInfo?.data?.applicationId,
        ) && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            The Application ID is not valid. Please check your configuration.
          </Alert>
        )}

      {showResults && (
        <Box mb={2}>
          {deviceCodeInfo ? (
            <Alert severity="info">
              <Typography variant="subtitle2">Application Creation</Typography>
              <Typography variant="body2" gutterBottom>
                {authInProgress ? (
                  <>
                    When asked to log onto an account, please use a{" "}
                    <strong>CIPP Service Account</strong>. Enter this code to authenticate:{" "}
                  </>
                ) : (
                  <>
                    Click the button below to authenticate. When asked to log onto an account,
                    please use a <strong>CIPP Service Account</strong>. You will need to enter this
                    code:{" "}
                  </>
                )}
                <CippCopyToClipBoard text={deviceCodeInfo.user_code} type="chip" />
              </Typography>
              <Typography variant="body2" gutterBottom>
                {authInProgress ? (
                  <>
                    If the popup was blocked or you closed it, you can also go to{" "}
                    <strong>microsoft.com/devicelogin</strong> manually and enter the code shown
                    above.
                  </>
                ) : (
                  <>
                    When you click the button below, a popup will open to{" "}
                    <strong>microsoft.com/devicelogin</strong> where you'll enter this code.
                  </>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Code expires in {Math.round(deviceCodeInfo.expires_in / 60)} minutes
              </Typography>
            </Alert>
          ) : tokens.accessToken ? (
            <>
              {showSuccessAlert ? (
                <Alert severity="success">
                  <Typography variant="subtitle2">Authentication Successful</Typography>
                  <Typography variant="body2">
                    You've successfully refreshed your token. The account you're using for
                    authentication is: <strong>{tokens.username}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Tenant ID: <strong>{tokens.tenantId}</strong>
                    {tokens.onmicrosoftDomain && (
                      <>
                        {" "}
                        | Domain: <strong>{tokens.onmicrosoftDomain}</strong>
                      </>
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Refresh token expires: {tokens.refreshTokenExpiresOn?.toLocaleString()}
                  </Typography>
                </Alert>
              ) : null}

              {!isServiceAccount && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Service Account Required</Typography>
                  <Typography variant="body2">
                    CIPP requires a service account for authentication. The account you're using (
                    <strong>{tokens.username}</strong>) does not appear to be a service account.
                  </Typography>
                  <Typography variant="body2">
                    Please redo authentication using an account with "service" or "cipp" in the
                    username.
                  </Typography>
                </Alert>
              )}
            </>
          ) : authError ? (
            <Alert severity="error">
              <Typography variant="subtitle2">
                Authentication Error: {authError.errorCode}
              </Typography>
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

      {promptBeforeAuth !== false && (
        <CippApiDialog
          title={"Microsoft 365 Authentication"}
          createDialog={{
            open: promptDialog.open,
            handleClose: () => setPromptDialog({ open: false }),
          }}
          api={{
            type: "POST",
            confirmText: promptBeforeAuth,
            noConfirm: false,
            customFunction: () => {
              setPromptDialog({ open: false });
              const authFunction = useDeviceCode
                ? handleDeviceCodeAuthentication
                : handleMsalAuthentication;
              authFunction();
            },
          }}
          fields={[]}
        />
      )}

      <Button
        variant="contained"
        disabled={
          appIdInfo.isLoading ||
          authInProgress ||
          codeRetrievalInProgress ||
          (!applicationId &&
            !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              appIdInfo?.data?.applicationId,
            ))
        }
        onClick={() => {
          if (promptBeforeAuth !== false) {
            setPromptDialog({ open: true });
          } else {
            const authFunction = useDeviceCode
              ? handleDeviceCodeAuthentication
              : handleMsalAuthentication;
            authFunction();
          }
        }}
        color="primary"
        startIcon={
          authInProgress || codeRetrievalInProgress ? (
            <CircularProgress size="1rem" color="inherit" />
          ) : tokens.accessToken ? (
            <Refresh />
          ) : (
            <Microsoft />
          )
        }
      >
        {authInProgress || codeRetrievalInProgress
          ? "Authenticating..."
          : deviceCodeInfo && useDeviceCode
            ? "Authenticate with Code"
            : buttonText}
      </Button>
    </div>
  );
};
