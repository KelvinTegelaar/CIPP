import React, { useState } from 'react'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'

// Storybook stand-in for CIPPM365OAuthButton: real Microsoft auth (MSAL popups,
// device codes, BroadcastChannel callbacks) cannot run in the sandbox, so
// clicking the button resolves instantly. Wired in via a resolveId plugin in
// .storybook/main.mjs.
//
// Mirrors the real device-code presentation: with useDeviceCode a fake code is
// "retrieved" (immediately on autoStartDeviceLogon, otherwise on first click)
// and shown in the same info card, and the button label switches to
// "Authenticate with Code" - so the SAM step looks like the real first-run.
//
// Stories steer the outcome through window.__cippMockM365Auth (reset it in a
// loader to avoid bleed between stories):
//   { outcome: 'success' }                          - default
//   { outcome: 'error', errorCode?, errorMessage? } - auth fails; mirrors the
//       real button's error alert + Dismiss retry affordance and onAuthError.
//       The device code card stays visible, like the real poll-failure path.
//   { outcome: 'nonServiceAccount', username? }     - token succeeds but for a
//       non service account; mirrors the real behavior where onAuthSuccess
//       STILL fires and only an advisory warning is shown
const readConfig = () =>
  (typeof window !== 'undefined' && window.__cippMockM365Auth) || {}

const FAKE_DEVICE_CODE = 'STORYBOOK1'

const MOCK_TOKENS = {
  accessToken: 'storybook-access-token',
  refreshToken: 'storybook-refresh-token',
  tenantId: '99999999-8888-7777-6666-555555555555',
  onmicrosoftDomain: 'contoso.onmicrosoft.com',
}

// same heuristic the real button warns on: "service" or "cipp" in the username
const looksLikeServiceAccount = (username) => /service|cipp/i.test(username || '')

export const CIPPM365OAuthButton = ({
  onAuthSuccess,
  onAuthError,
  buttonText = 'Login with Microsoft',
  showSuccessAlert = true,
  useDeviceCode = false,
  autoStartDeviceLogon = false,
}) => {
  const [username, setUsername] = useState(null)
  const [authError, setAuthError] = useState(null)
  // auto-start "retrieves" the code immediately; without it the first click does
  const [deviceCode, setDeviceCode] = useState(
    useDeviceCode && autoStartDeviceLogon ? FAKE_DEVICE_CODE : null,
  )

  const handleClick = () => {
    // real flow: the first click only retrieves the device code
    if (useDeviceCode && !deviceCode) {
      setDeviceCode(FAKE_DEVICE_CODE)
      return
    }

    const config = readConfig()
    const outcome = config.outcome || 'success'

    if (outcome === 'error') {
      const error = {
        errorCode: config.errorCode || 'access_denied',
        errorMessage:
          config.errorMessage || 'The user cancelled the authentication flow (storybook mock).',
        timestamp: new Date().toISOString(),
      }
      setUsername(null)
      setAuthError(error)
      onAuthError?.(error)
      return
    }

    const user =
      outcome === 'nonServiceAccount'
        ? config.username || 'john.admin@contoso.com'
        : 'cipp-service@contoso.onmicrosoft.com'

    setAuthError(null)
    setDeviceCode(null) // real handleTokenResponse clears the code card on success
    setUsername(user)
    onAuthSuccess?.({
      ...MOCK_TOKENS,
      username: user,
      accessTokenExpiresOn: new Date(Date.now() + 3600 * 1000),
      refreshTokenExpiresOn: new Date(Date.now() + 90 * 24 * 3600 * 1000),
    })
  }

  return (
    <Stack spacing={1}>
      {deviceCode && (
        <Alert severity="info">
          <Typography variant="subtitle2">Application Creation</Typography>
          <Typography component="div" variant="body2" gutterBottom>
            Click the button below to authenticate. When asked to log onto an account, please use a{' '}
            <strong>CIPP Service Account</strong>. You will need to enter this code:{' '}
            <Chip size="small" label={deviceCode} />
          </Typography>
          <Typography variant="body2" gutterBottom>
            When you click the button below, a popup would open to{' '}
            <strong>microsoft.com/devicelogin</strong> where you'd enter this code. Storybook mock:
            no popup opens, the outcome is simulated.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Code expires in 15 minutes
          </Typography>
        </Alert>
      )}
      {username && showSuccessAlert && (
        <Alert severity="success">Authentication successful (storybook mock)</Alert>
      )}
      {username && !looksLikeServiceAccount(username) && (
        <Alert severity="warning">
          <Typography variant="subtitle2">Service Account Required</Typography>
          <Typography variant="body2">
            CIPP requires a service account for authentication. The account you're using (
            <strong>{username}</strong>) does not appear to be a service account.
          </Typography>
          <Typography variant="body2">
            Please redo authentication using an account with "service" or "cipp" in the username.
          </Typography>
        </Alert>
      )}
      {authError && (
        <Alert severity="error">
          <Typography variant="subtitle2">Authentication Error: {authError.errorCode}</Typography>
          <Typography variant="body2">{authError.errorMessage}</Typography>
          <Box mt={1}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => setAuthError(null)}
            >
              Dismiss
            </Button>
          </Box>
        </Alert>
      )}
      <Button variant="contained" onClick={handleClick} sx={{ alignSelf: 'flex-start' }}>
        {useDeviceCode && deviceCode ? 'Authenticate with Code' : buttonText}
      </Button>
    </Stack>
  )
}

export default CIPPM365OAuthButton
