import { useEffect } from 'react'
import { Box, Typography, Alert, Skeleton, Chip } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings.js'
import CippFormComponent from './CippFormComponent'

// Maps a Graph authentication-method @odata.type to a friendly label and its MFA capabilities. The MFA
// connector verifies typed codes (software OATH or the Authenticator app's own code) and pushes to the
// Microsoft Authenticator app.
const MFA_METHOD_MAP = {
  '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod': {
    label: 'Microsoft Authenticator (push and code)',
    push: true,
    otp: true,
  },
  '#microsoft.graph.softwareOathAuthenticationMethod': {
    label: 'Authenticator app / software OATH code',
    push: false,
    otp: true,
  },
  '#microsoft.graph.phoneAuthenticationMethod': { label: 'Phone (SMS or call)' },
  '#microsoft.graph.fido2AuthenticationMethod': { label: 'FIDO2 security key' },
  '#microsoft.graph.windowsHelloForBusinessAuthenticationMethod': {
    label: 'Windows Hello for Business',
  },
  '#microsoft.graph.emailAuthenticationMethod': { label: 'Email' },
}

// Maps a Graph preferred-method value to the registered method @odata.type(s) it corresponds to, most
// specific first, so the matching registered chip can be flagged as the default.
const PREFERRED_TO_TYPE = {
  push: ['#microsoft.graph.microsoftAuthenticatorAuthenticationMethod'],
  oath: [
    '#microsoft.graph.softwareOathAuthenticationMethod',
    '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod',
  ],
  sms: ['#microsoft.graph.phoneAuthenticationMethod'],
  voiceMobile: ['#microsoft.graph.phoneAuthenticationMethod'],
  voiceAlternateMobile: ['#microsoft.graph.phoneAuthenticationMethod'],
  voiceOffice: ['#microsoft.graph.phoneAuthenticationMethod'],
}

// Renders inside the Send MFA Push dialog (via the action's children render-prop). Fetches the user's
// registered MFA methods and preferred method from Graph, shows them as chips (default first), and either
// lets the admin send a push (default) or, as a last resort for users without the Authenticator, verify a
// typed code. Blocks the dialog's Confirm when the user has no method that can be pushed or verified.
export const MfaVerifyForm = ({ formControl, row }) => {
  const tenantFilter = useSettings().currentTenant
  const rowData = Array.isArray(row) ? row[0] : row
  const tenant = tenantFilter === 'AllTenants' && rowData?.Tenant ? rowData.Tenant : tenantFilter
  const upn = rowData?.userPrincipalName ?? rowData?.UPN

  const methods = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `users/${upn}/authentication/methods`,
      tenantFilter: tenant,
    },
    queryKey: `MFAMethods-${tenant}-${upn}`,
  })
  const preferences = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `users/${upn}/authentication/signInPreferences`,
      tenantFilter: tenant,
    },
    queryKey: `MFAPreferred-${tenant}-${upn}`,
  })

  const registered = (methods.data?.Results ?? [])
    .map((m) => ({ type: m['@odata.type'], ...MFA_METHOD_MAP[m['@odata.type']] }))
    .filter((m) => m.label)
  const hasPush = registered.some((m) => m.push)
  const hasOtp = registered.some((m) => m.otp)

  const preferred = preferences.data?.Results?.[0]?.userPreferredMethodForSecondaryAuthentication
  const defaultType = (PREFERRED_TO_TYPE[preferred] ?? []).find((t) =>
    registered.some((m) => m.type === t)
  )
  const sortedMethods = [...registered].sort((a, b) =>
    a.type === defaultType ? -1 : b.type === defaultType ? 1 : 0
  )

  // Block the dialog's Confirm when there is no method to push or verify: register a field that never
  // validates so the form stays invalid (CippApiDialog disables Confirm while !isValid).
  const blockConfirm = methods.isSuccess && !hasPush && !hasOtp
  useEffect(() => {
    if (blockConfirm) {
      formControl.register('mfaMethodGuard', { validate: () => false })
      formControl.trigger('mfaMethodGuard')
    } else {
      formControl.unregister('mfaMethodGuard')
    }
    return () => formControl.unregister('mfaMethodGuard')
  }, [blockConfirm])

  if (methods.isLoading || preferences.isLoading) {
    return <Skeleton variant="rounded" height={80} />
  }

  return (
    <>
      {registered.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: 'block',
              mb: 0.5
            }}>
            Registered MFA methods
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {sortedMethods.map((m) => (
              <Chip
                key={m.type}
                label={m.type === defaultType ? `${m.label} (default)` : m.label}
                size="small"
                color={m.type === defaultType ? 'primary' : undefined}
                variant={m.type === defaultType ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      )}
      {hasPush && (
        <Alert severity="info" sx={{ mb: 2 }}>
          A push will be sent to the user&apos;s Microsoft Authenticator when you confirm.
        </Alert>
      )}
      {!hasPush && hasOtp && (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This user has no Microsoft Authenticator push method, so a push can&apos;t be sent. As a last
            resort, enter a code from their authenticator to verify it.
          </Alert>
          <CippFormComponent
            type="textField"
            name="OTP"
            label="OTP code from the user's authenticator"
            formControl={formControl}
            validators={{ required: 'Enter the OTP code to verify this user' }}
          />
        </>
      )}
      {methods.isSuccess && !hasPush && !hasOtp && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This user has no app-based MFA (push or authenticator OTP) registered, so a test push or code
          verification isn&apos;t possible.
        </Alert>
      )}
      {methods.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not retrieve the user&apos;s registered MFA methods. You can still send a push by
          confirming.
        </Alert>
      )}
    </>
  );
}
