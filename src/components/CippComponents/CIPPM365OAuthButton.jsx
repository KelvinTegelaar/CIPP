import { useState, useEffect, useRef } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { Alert, Button, Typography, CircularProgress, Box } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import { CippApiDialog } from './CippApiDialog'

export const CIPPM365OAuthButton = ({
  onAuthSuccess,
  onAuthError,
  buttonText = 'Login with Microsoft',
  showResults = true,
  showSuccessAlert = true,
  scope = 'https://graph.microsoft.com/.default offline_access profile openid',
  useDeviceCode = false,
  applicationId = null,
  autoStartDeviceLogon = false,
  validateServiceAccount = true,
  promptBeforeAuth = false,
  disabled = false,
}) => {
  const [authInProgress, setAuthInProgress] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [deviceCodeInfo, setDeviceCodeInfo] = useState(null)
  const [codeRetrievalInProgress, setCodeRetrievalInProgress] = useState(false)
  const [isServiceAccount, setIsServiceAccount] = useState(true)
  const [promptDialog, setPromptDialog] = useState({ open: false })
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresOn: null,
    refreshTokenExpiresOn: null,
    username: null,
    tenantId: null,
    onmicrosoftDomain: null,
  })

  const appIdInfo = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: 'listAppId',
    waiting: true,
  })

  // Closing the device login window does not cancel anything - the device code stays
  // valid server side until it expires and can be completed in any browser. So the
  // watcher below never stops the poll; it only tracks whether the window is gone so
  // the UI can offer a way back in instead of sitting on a disabled "Authenticating..."
  // button for the full 15 minutes.
  const devicePopupRef = useRef(null)
  const devicePopupWatcherRef = useRef(null)
  const devicePollIdRef = useRef(0)
  const [devicePopupClosed, setDevicePopupClosed] = useState(false)

  const stopDevicePopupWatcher = () => {
    if (devicePopupWatcherRef.current) {
      clearInterval(devicePopupWatcherRef.current)
      devicePopupWatcherRef.current = null
    }
  }

  const openDeviceLoginPopup = () => {
    const width = 500
    const height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      'https://microsoft.com/devicelogin',
      'deviceLoginPopup',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    stopDevicePopupWatcher()
    devicePopupRef.current = popup

    // A blocked popup is indistinguishable from a closed one as far as the user is
    // concerned - both leave them with no window to sign in through.
    if (!popup) {
      setDevicePopupClosed(true)
      return null
    }

    setDevicePopupClosed(false)
    devicePopupWatcherRef.current = setInterval(() => {
      if (popup.closed) {
        stopDevicePopupWatcher()
        setDevicePopupClosed(true)
      }
    }, 1000)

    return popup
  }

  const closeDeviceLoginPopup = () => {
    stopDevicePopupWatcher()
    const popup = devicePopupRef.current
    if (popup && !popup.closed) {
      popup.close()
    }
    devicePopupRef.current = null
    setDevicePopupClosed(false)
  }

  useEffect(() => stopDevicePopupWatcher, [])

  // Reopening the window is not offered: a user code is consumed the moment it is entered,
  // so once someone has typed it in, re-entering the same code fails. Closing the window
  // part way through a sign-in is therefore unrecoverable except with a fresh code. The
  // poll is left running anyway, because the sign-in may still be getting finished at
  // microsoft.com/devicelogin in another browser.
  const canRestartDeviceLogin = useDeviceCode && authInProgress && devicePopupClosed

  const restartDeviceLogin = async () => {
    // Supersede the in-flight poll before requesting a new code, or it would keep
    // polling the old device_code alongside the new one.
    devicePollIdRef.current += 1
    closeDeviceLoginPopup()
    setAuthInProgress(false)
    setAuthError(null)
    setDeviceCodeInfo(null)
    await retrieveDeviceCode()
  }

  const handleCloseError = () => {
    setAuthError(null)
  }

  const checkIsServiceAccount = (username) => {
    if (!username || !validateServiceAccount) return true // If no username or validation disabled, don't show warning

    const lowerUsername = username.toLowerCase()
    return lowerUsername.includes('service') || lowerUsername.includes('cipp')
  }

  // Function to retrieve device code
  const retrieveDeviceCode = async () => {
    setCodeRetrievalInProgress(true)
    setAuthError(null)

    // Only refetch appId if not already present
    if (!applicationId && !appIdInfo?.data?.applicationId) {
      await appIdInfo.refetch()
    }

    try {
      // Get the application ID to use
      const appId =
        applicationId || appIdInfo?.data?.applicationId || '1b730954-1685-4b74-9bfd-dac224a7b894' // Default to MS Graph Explorer app ID

      // Request device code from our API endpoint
      const deviceCodeResponse = await fetch(
        `/api/ExecDeviceCodeLogon?operation=getDeviceCode&clientId=${appId}&scope=${encodeURIComponent(
          scope
        )}`
      )
      const deviceCodeData = await deviceCodeResponse.json()

      if (deviceCodeResponse.ok && deviceCodeData.user_code) {
        // Store device code info
        setDeviceCodeInfo(deviceCodeData)
      } else {
        // Error getting device code
        setAuthError({
          errorCode: deviceCodeData.error || 'device_code_error',
          errorMessage: deviceCodeData.error_description || 'Failed to get device code',
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      setAuthError({
        errorCode: 'device_code_error',
        errorMessage: error.message || 'An error occurred retrieving device code',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setCodeRetrievalInProgress(false)
    }
  }

  // Device code authentication function - opens popup and starts polling
  const handleDeviceCodeAuthentication = async () => {
    // Only refetch appId if not already present
    if (!applicationId && !appIdInfo?.data?.applicationId) {
      await appIdInfo.refetch()
    }

    if (!deviceCodeInfo) {
      // If we don't have a device code yet, retrieve it first
      await retrieveDeviceCode()
      return
    }

    setAuthInProgress(true)
    setTokens({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresOn: null,
      refreshTokenExpiresOn: null,
      username: null,
      tenantId: null,
      onmicrosoftDomain: null,
    })

    try {
      // Get the application ID to use - refetch already happened at the start of this function
      const appId =
        applicationId || appIdInfo?.data?.applicationId || '1b730954-1685-4b74-9bfd-dac224a7b894' // Default to MS Graph Explorer app ID

      // Open popup to device login page. If it is closed or blocked the poll below keeps
      // running - the button turns into "Reopen sign-in window" rather than locking up.
      openDeviceLoginPopup()

      // Start polling for token
      const pollInterval = deviceCodeInfo.interval || 5
      const expiresIn = deviceCodeInfo.expires_in || 900
      const startTime = Date.now()
      // Identifies this attempt. Starting over bumps the ref, which retires this poll
      // rather than leaving it chasing a device code the user has abandoned.
      const pollId = ++devicePollIdRef.current

      const pollForToken = async () => {
        if (devicePollIdRef.current !== pollId) return

        // Check if we've exceeded the expiration time
        if (Date.now() - startTime >= expiresIn * 1000) {
          closeDeviceLoginPopup()
          setAuthError({
            errorCode: 'timeout',
            errorMessage: 'Device code authentication timed out',
            timestamp: new Date().toISOString(),
          })
          setAuthInProgress(false)
          return
        }

        try {
          // Poll for token using our API endpoint. The scope has to match the one the device
          // code was issued for - omitting it here left the poll falling back to the API's
          // default instead.
          const tokenResponse = await fetch(
            `/api/ExecDeviceCodeLogon?operation=checkToken&clientId=${appId}&deviceCode=${
              deviceCodeInfo.device_code
            }&scope=${encodeURIComponent(scope)}`
          )
          const tokenData = await tokenResponse.json()

          if (tokenResponse.ok && tokenData.status === 'success') {
            // Successfully got token
            closeDeviceLoginPopup()
            handleTokenResponse(tokenData)
          } else if (
            tokenData.error === 'authorization_pending' ||
            tokenData.status === 'pending'
          ) {
            // User hasn't completed authentication yet, continue polling
            setTimeout(pollForToken, pollInterval * 1000)
          } else if (tokenData.error === 'slow_down') {
            // Server asking us to slow down polling
            setTimeout(pollForToken, (pollInterval + 5) * 1000)
          } else {
            // Other error
            closeDeviceLoginPopup()
            setAuthError({
              errorCode: tokenData.error || 'token_error',
              errorMessage: tokenData.error_description || 'Failed to get token',
              timestamp: new Date().toISOString(),
            })
            setAuthInProgress(false)
          }
        } catch (error) {
          setTimeout(pollForToken, pollInterval * 1000)
        }
      }

      // Start polling
      setTimeout(pollForToken, pollInterval * 1000)
    } catch (error) {
      setAuthError({
        errorCode: 'device_code_error',
        errorMessage: error.message || 'An error occurred during device code authentication',
        timestamp: new Date().toISOString(),
      })
      setAuthInProgress(false)
    }
  }

  // Process token response (common for both auth methods)
  const handleTokenResponse = (tokenData) => {
    // Extract token information
    const accessTokenExpiresOn = new Date(Date.now() + tokenData.expires_in * 1000)
    // Refresh tokens typically last for 90 days, but this can vary
    const refreshTokenExpiresOn = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    // Extract information from ID token if available
    let username = 'unknown user'
    let tenantId = 'unknown tenant'
    let onmicrosoftDomain = null

    if (tokenData.id_token) {
      try {
        const idTokenPayload = JSON.parse(atob(tokenData.id_token.split('.')[1]))

        username =
          idTokenPayload.preferred_username ||
          idTokenPayload.email ||
          idTokenPayload.upn ||
          idTokenPayload.name ||
          'unknown user'

        if (idTokenPayload.tid) {
          tenantId = idTokenPayload.tid
        }

        if (username && username.includes('@') && username.includes('.onmicrosoft.com')) {
          onmicrosoftDomain = username.split('@')[1]
        } else if (idTokenPayload.iss) {
          const issuerMatch = idTokenPayload.iss.match(/https:\/\/sts\.windows\.net\/([^/]+)\//)
          if (issuerMatch && issuerMatch[1]) {
          }
        }
        setIsServiceAccount(checkIsServiceAccount(username))
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
    }

    setTokens(tokenResult)
    setDeviceCodeInfo(null)

    if (onAuthSuccess) onAuthSuccess(tokenResult)

    // Update UI state
    setAuthInProgress(false)
    setIsServiceAccount(checkIsServiceAccount(username))
  }

  // MSAL-like authentication function
  const handleMsalAuthentication = async (retryCount = 0) => {
    const maxRetries = 3

    // Clear previous authentication state when starting a new authentication
    setAuthInProgress(true)
    setAuthError(null)
    setTokens({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresOn: null,
      refreshTokenExpiresOn: null,
      username: null,
      tenantId: null,
      onmicrosoftDomain: null,
    })

    // Only refetch app ID if not already present
    if (!applicationId && !appIdInfo?.data?.applicationId) {
      await appIdInfo.refetch()
    }

    // Get the application ID to use
    const appId = applicationId || appIdInfo?.data?.applicationId

    // Generate MSAL-like authentication parameters
    const msalConfig = {
      auth: {
        clientId: appId,
        authority: `https://login.microsoftonline.com/organizations`,
        redirectUri: `${window.location.origin}/authredirect`,
      },
    }

    // Define the request object similar to MSAL
    const loginRequest = {
      scopes: [scope],
    }

    // crypto.subtle is only exposed in a secure context. Without this guard an instance
    // served over plain HTTP fails on the digest below with an opaque TypeError.
    if (!window.crypto?.subtle) {
      const error = {
        errorCode: 'insecure_context',
        errorMessage:
          'Authentication requires a secure context. Serve CIPP over HTTPS (or localhost) and try again.',
        timestamp: new Date().toISOString(),
      }
      setAuthError(error)
      if (onAuthError) onAuthError(error)
      setAuthInProgress(false)
      return
    }

    const base64UrlEncode = (bytes) =>
      btoa(String.fromCharCode(...new Uint8Array(bytes)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    const randomUrlSafeString = (byteLength) => {
      const array = new Uint8Array(byteLength)
      window.crypto.getRandomValues(array)
      return base64UrlEncode(array)
    }

    const width = 500
    const height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    // Open the window before computing the challenge below. window.open only succeeds
    // while the click's user activation is still live, and awaiting the SHA-256 digest
    // first spends it - browsers then treat the call as an unsolicited popup and block
    // it. Open a blank window synchronously and navigate it once the URL is ready.
    const popup = window.open(
      '',
      'msalAuthPopup',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // A null reference means the browser blocked the popup outright - nothing will
    // ever post back, so fail fast instead of sitting on the 10-minute timeout.
    if (!popup) {
      const error = {
        errorCode: 'popup_blocked',
        errorMessage:
          'The sign-in popup was blocked by the browser. Allow popups for this site and try again.',
        timestamp: new Date().toISOString(),
      }
      setAuthError(error)
      if (onAuthError) onAuthError(error)
      setAuthInProgress(false)
      return
    }

    // Generate PKCE code verifier and S256 challenge
    const codeVerifier = randomUrlSafeString(32)
    const codeChallenge = base64UrlEncode(
      await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
    )
    const state = randomUrlSafeString(16)
    // prompt=login, not select_account: this flow mints the refresh token CIPP runs on, and
    // Entra stamps that token with the authentication context of the sign-in that created it
    // (including the protocol flow, which Conditional Access re-evaluates on every redemption).
    // select_account can complete via SSO from an existing session - including the one the
    // device code step establishes at microsoft.com/devicelogin in this same browser - which
    // would carry a device-code-flow marker forward instead of clearing it.
    // /organizations, not /common: CIPP-SAM is signInAudience AzureADMultipleOrgs, so it
    // supports work and school accounts only. /common additionally advertises personal
    // Microsoft accounts, letting someone pick one and fail later with a confusing error
    // instead of being told up front that the account cannot be used. It also matches the
    // authority the device code flow uses.
    const authUrl =
      `https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?` +
      `client_id=${appId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(window.location.origin)}/authredirect` +
      `&scope=${encodeURIComponent(scope)}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256` +
      `&state=${state}` +
      `&prompt=login`

    popup.location = authUrl

    // Function to actually exchange the authorization code for tokens
    const handleAuthorizationCode = async (code, receivedState) => {
      // Verify the state parameter matches what we sent (security check)
      if (receivedState !== state) {
        const errorMessage = 'State mismatch in auth response - possible CSRF attack'
        const error = {
          errorCode: 'state_mismatch',
          errorMessage: errorMessage,
          timestamp: new Date().toISOString(),
        }
        setAuthError(error)
        if (onAuthError) onAuthError(error)
        setAuthInProgress(false)
        return
      }
      try {
        // Prepare the token request
        const tokenRequest = {
          grant_type: 'authorization_code',
          client_id: appId,
          code: code,
          redirect_uri: `${window.location.origin}/authredirect`,
          code_verifier: codeVerifier,
        }

        // Make the token request through our API proxy to avoid origin header issues
        // Retry logic for AADSTS650051 (service principal already exists)
        let retryCount = 0
        const maxRetries = 3
        let tokenResponse
        let tokenData

        while (retryCount <= maxRetries) {
          tokenResponse = await fetch(`/api/ExecTokenExchange`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tokenRequest,
              tokenUrl: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
              tenantId: appId, // Pass the tenant ID to retrieve the correct client secret
            }),
          })

          // Parse the token response
          tokenData = await tokenResponse.json()

          // AADSTS650051: service principal already exists.
          // AADSTS7000215: the client secret is not valid *yet*. The wizard mints a new
          // secret on the previous step and arrives here seconds later, but Entra can take
          // minutes to replicate it. Retrying covers the fast case; the message below covers
          // the rest, since waiting it out would outlive the authorization code.
          if (
            tokenData.error === 'invalid_client' &&
            (tokenData.error_description?.includes('AADSTS650051') ||
              tokenData.error_description?.includes('AADSTS7000215'))
          ) {
            retryCount++
            if (retryCount <= maxRetries) {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) => setTimeout(resolve, 2000 * retryCount))
              continue
            }
          }
          // If no error or different error, break out of retry loop
          break
        }

        // Check if the response contains an error
        if (tokenData.error) {
          const secretNotReady = tokenData.error_description?.includes('AADSTS7000215')
          const error = {
            errorCode: tokenData.error || 'token_error',
            errorMessage: secretNotReady
              ? 'The application secret created for CIPP is not active yet. Microsoft can take several minutes to replicate a new secret across Entra ID. Wait a few minutes and run this step again - nothing needs to be recreated.'
              : tokenData.error_description || 'Failed to exchange authorization code for tokens',
            timestamp: new Date().toISOString(),
          }
          setAuthError(error)
          if (onAuthError) onAuthError(error)
          setAuthInProgress(false)
          return
        }

        if (tokenResponse.ok) {
          // If we have a refresh token, store it
          if (tokenData.refresh_token) {
            try {
              // Extract tid from access_token jwt base64
              const accessTokenParts = tokenData.access_token.split('.')
              const accessTokenPayload = JSON.parse(atob(accessTokenParts[1] || ''))
              tokenData.tid = accessTokenPayload.tid
              const refreshResponse = await fetch(`/api/ExecUpdateRefreshToken`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  tenantId: tokenData.tid,
                  refreshtoken: tokenData.refresh_token,
                  tenantMode: tokenData.tenantMode,
                  allowPartnerTenantManagement: tokenData.allowPartnerTenantManagement,
                }),
              })

              if (!refreshResponse.ok) {
                console.warn('Failed to store refresh token, but continuing with authentication')
              } else {
                // Invalidate the listAppId and tenants-table queryKeys to refresh data
                appIdInfo.refetch()
              }
            } catch (error) {
              console.error('Failed to store refresh token:', error)
            }
          }

          handleTokenResponse(tokenData)
        } else {
          // Handle token error - display in error box instead of throwing
          const error = {
            errorCode: tokenData.error || 'token_error',
            errorMessage:
              tokenData.error_description || 'Failed to exchange authorization code for tokens',
            timestamp: new Date().toISOString(),
          }
          setAuthError(error)
          if (onAuthError) onAuthError(error)
        }
      } catch (error) {
        const errorObj = {
          errorCode: 'token_exchange_error',
          errorMessage: error.message || 'Failed to exchange authorization code for tokens',
          timestamp: new Date().toISOString(),
        }
        setAuthError(errorObj)
        if (onAuthError) onAuthError(errorObj)
      } finally {
        // Update UI state
        setAuthInProgress(false)
      }
    }

    // Listen for auth result via BroadcastChannel (works regardless of COOP)
    const channel = new BroadcastChannel('cipp_auth')
    let resultReceived = false

    const authTimeout = setTimeout(() => {
      // If no response after 10 minutes, treat as cancelled
      cleanup()
      const error = {
        errorCode: 'timeout',
        errorMessage: 'Authentication timed out. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setAuthError(error)
      if (onAuthError) onAuthError(error)
      setTokens({
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresOn: null,
        refreshTokenExpiresOn: null,
        username: null,
        tenantId: null,
        onmicrosoftDomain: null,
      })
      setAuthInProgress(false)
    }, 600000)

    channel.onmessage = (event) => {
      if (event.data?.type === 'auth_code') {
        resultReceived = true
        cleanup()
        handleAuthorizationCode(event.data.code, event.data.state)
      } else if (event.data?.type === 'auth_error') {
        resultReceived = true
        cleanup()

        // Check if it's the AADSTS650051 error (service principal already exists during consent)
        if (
          event.data.error === 'invalid_client' &&
          event.data.errorDescription?.includes('AADSTS650051') &&
          retryCount < maxRetries
        ) {
          setAuthInProgress(false)
          setTimeout(() => handleMsalAuthentication(retryCount + 1), 2000 * (retryCount + 1))
          return
        }

        const error = {
          errorCode: event.data.error || 'auth_error',
          errorMessage: event.data.errorDescription || 'Unknown authentication error',
          timestamp: new Date().toISOString(),
        }
        setAuthError(error)
        if (onAuthError) onAuthError(error)
        setAuthInProgress(false)
      }
    }

    // The /authredirect callback posts its result and then closes the popup, so
    // closure is also part of the happy path - give the BroadcastChannel message
    // a short grace period before treating it as a cancellation. Without this,
    // closing the sign-in window left the button stuck on "Authenticating..."
    // until the 10-minute timeout.
    let closeGraceTimer = null
    const popupWatcher = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupWatcher)
        closeGraceTimer = setTimeout(() => {
          if (!resultReceived) {
            cleanup()
            const error = {
              errorCode: 'popup_closed',
              errorMessage:
                'The sign-in window was closed before authentication completed. Please try again.',
              timestamp: new Date().toISOString(),
            }
            setAuthError(error)
            if (onAuthError) onAuthError(error)
            setAuthInProgress(false)
          }
        }, 2000)
      }
    }, 1000)

    const cleanup = () => {
      channel.close()
      clearTimeout(authTimeout)
      clearInterval(popupWatcher)
      // The grace timer was previously left running. On the happy path - where the
      // callback posts its result and then closes the popup - it would still be pending
      // after cleanup, and if the user started another attempt inside that window it
      // fired against the new one, clearing its progress state and reporting a
      // cancellation for a sign-in that was still going.
      clearTimeout(closeGraceTimer)
    }
  }

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
      retrieveDeviceCode()
    }
  }, [
    useDeviceCode,
    autoStartDeviceLogon,
    codeRetrievalInProgress,
    deviceCodeInfo,
    tokens.accessToken,
    appIdInfo?.data,
  ])

  return (
    <div>
      {!applicationId &&
        !appIdInfo.isLoading &&
        appIdInfo?.data?.applicationId && // Only check if applicationId is present in data
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          appIdInfo?.data?.applicationId
        ) && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            The Application ID is not valid. Please check your configuration.
          </Alert>
        )}

      {showResults && (
        <Box sx={{
          mb: 2
        }}>
          {deviceCodeInfo ? (
            <Alert severity="info">
              <Typography variant="subtitle2">Application Creation</Typography>
              <Typography variant="body2" gutterBottom>
                {authInProgress ? (
                  <>
                    When asked to log onto an account, please use a{' '}
                    <strong>CIPP Service Account</strong>. Enter this code to authenticate:{' '}
                  </>
                ) : (
                  <>
                    Click the button below to authenticate. When asked to log onto an account,
                    please use a <strong>CIPP Service Account</strong>. You will need to enter this
                    code:{' '}
                  </>
                )}
                <CippCopyToClipBoard text={deviceCodeInfo.user_code} type="chip" />
              </Typography>
              <Typography variant="body2" gutterBottom>
                {authInProgress && devicePopupClosed ? (
                  <>
                    The sign-in window was closed. If you are still finishing at{' '}
                    <strong>microsoft.com/devicelogin</strong> in another browser, CIPP is still
                    waiting. If you had already entered the code, it cannot be used again - start
                    over below to get a new one.
                  </>
                ) : authInProgress ? (
                  <>
                    If the popup was blocked or you closed it, you can also go to{' '}
                    <strong>microsoft.com/devicelogin</strong> manually and enter the code shown
                    above.
                  </>
                ) : (
                  <>
                    When you click the button below, a popup will open to{' '}
                    <strong>microsoft.com/devicelogin</strong> where you'll enter this code.
                  </>
                )}
              </Typography>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
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
                        {' '}
                        | Domain: <strong>{tokens.onmicrosoftDomain}</strong>
                      </>
                    )}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>
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
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                Time: {authError.timestamp}
              </Typography>
              <Box sx={{
                mt: 1
              }}>
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
          title={'Microsoft 365 Authentication'}
          createDialog={{
            open: promptDialog.open,
            handleClose: () => setPromptDialog({ open: false }),
          }}
          api={{
            type: 'POST',
            confirmText: promptBeforeAuth,
            noConfirm: false,
            customFunction: () => {
              setPromptDialog({ open: false })
              const authFunction = useDeviceCode
                ? handleDeviceCodeAuthentication
                : handleMsalAuthentication
              authFunction()
            },
          }}
          fields={[]}
        />
      )}

      <Button
        variant="contained"
        disabled={
          disabled ||
          (!canRestartDeviceLogin &&
            (appIdInfo.isLoading ||
              authInProgress ||
              codeRetrievalInProgress ||
              (!applicationId &&
                !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                  appIdInfo?.data?.applicationId
                ))))
        }
        onClick={() => {
          if (canRestartDeviceLogin) {
            restartDeviceLogin()
            return
          }
          if (promptBeforeAuth !== false) {
            setPromptDialog({ open: true })
          } else {
            const authFunction = useDeviceCode
              ? handleDeviceCodeAuthentication
              : handleMsalAuthentication
            authFunction()
          }
        }}
        color="primary"
        startIcon={
          canRestartDeviceLogin ? (
            <CippIcons.Refresh />
          ) : authInProgress || codeRetrievalInProgress ? (
            <CircularProgress size="1rem" color="inherit" />
          ) : tokens.accessToken ? (
            <CippIcons.Refresh />
          ) : (
            <CippIcons.Microsoft />
          )
        }
      >
        {canRestartDeviceLogin
          ? 'Start over with a new code'
          : authInProgress || codeRetrievalInProgress
            ? 'Authenticating...'
            : deviceCodeInfo && useDeviceCode
              ? 'Authenticate with Code'
              : buttonText}
      </Button>
    </div>
  );
}
