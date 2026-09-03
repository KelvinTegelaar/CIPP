import { useCallback, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  Switch,
  Typography,
  Button,
} from '@mui/material'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'

const SSO_DOCS_URL = 'https://docs.cipp.app/user-documentation/cipp/advanced/authentication/sso'

export const ForcedSsoMigrationDialog = () => {
  const [multiTenant, setMultiTenant] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const currentRole = ApiGetCall({
    url: '/api/me',
    queryKey: 'authmecipp',
  })

  const ssoSetup = ApiPostCall({
    relatedQueryKeys: 'authmecipp',
  })

  const permissions = currentRole.data?.permissions || []
  const forceSsoMigration = currentRole.data?.forceSsoMigration
  const hasPermission = permissions.includes('CIPP.AppSettings.ReadWrite')
  // Same response computes both flags from the same backend check, so this can
  // never disagree with the setup gate. Strict !== false: absent means complete.
  const setupCompleted = currentRole.data?.initialSetupComplete !== false

  // Hold the forced migration behind initial setup — the setup wizard must be
  // reachable (and the SAM app configured) before SSO migration can succeed.
  const open = !!(
    currentRole.isSuccess &&
    hasPermission &&
    forceSsoMigration?.status === 'pending' &&
    setupCompleted
  )

  const result = ssoSetup.data?.data?.Results ?? ssoSetup.data?.Results
  const isSuccess = result?.severity === 'success'
  const isError = ssoSetup.isError || result?.severity === 'failed'

  const handleMigrate = useCallback(() => {
    setSubmitted(true)
    ssoSetup.mutate({
      url: '/api/ExecSSOSetup',
      data: {
        Action: 'Migrate',
        multiTenant,
      },
    })
  }, [multiTenant, ssoSetup])

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{ backdrop: { onClick: (e) => e.stopPropagation() } }}
    >
      <DialogTitle>Complete Authentication Setup</DialogTitle>
      <DialogContent>
        {!submitted ? (
          <>
            <Typography sx={{ mb: 2 }}>
              Your CIPP instance requires a dedicated <strong> CIPP-SSO </strong> app registration in
              your tenant for authentication. Sign-in used to be handled by the hosting platform&apos;s
              built-in Entra ID provider, which is why you are seeing this after the upgrade — your
              instance now needs its own app registration to sign in against. This also gives you
              full control over Conditional Access policies, MFA requirements, and session management
              for your CIPP users.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Clicking the button below is all that is needed. You do <strong>not</strong> need Entra
              ID Global Administrator, and there is no enterprise app for anyone else to approve —
              CIPP creates the app itself using permissions your tenant consented to when CIPP was
              installed.
            </Alert>

            {/* The permission detail lives behind a summary rather than in the body: most admins
                just click through, but the ones who have to justify it to a security team need the
                scopes and the reason for each without leaving the dialog. */}
            <Accordion disableGutters elevation={0} sx={{ mb: 2, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<CippIcons.ExpandMore />} sx={{ px: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  What gets created, and what permissions it asks for
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  An app registration named <strong>CIPP-SSO</strong> in your partner tenant,
                  requesting three delegated Microsoft Graph permissions and no application
                  permissions at all:
                </Typography>
                <Typography component="ul" variant="body2" sx={{ pl: 3, mb: 1 }}>
                  <li>
                    <strong>openid</strong> — signs the user in and issues an ID token.
                  </li>
                  <li>
                    <strong>profile</strong> — reads display name, object ID and tenant ID so CIPP
                    knows which account signed in.
                  </li>
                  <li>
                    <strong>email</strong> — reads the UPN, which CIPP matches against the CIPP Users
                    list to decide their roles.
                  </li>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 1
                  }}>
                  These grant no access to mail, files, Teams or directory data, and the app cannot
                  act without a signed-in user. Everything CIPP does against Microsoft 365 continues
                  to run through the existing CIPP-SAM app.
                </Typography>
                <Link href={SSO_DOCS_URL} target="_blank" rel="noopener noreferrer" variant="body2">
                  Full documentation, including permission justifications for your security team
                </Link>
              </AccordionDetails>
            </Accordion>

            <Alert severity="warning" sx={{ mb: 2 }}>
              This step is required before you can use CIPP.
            </Alert>

            <FormControlLabel
              control={
                <Switch checked={multiTenant} onChange={(e) => setMultiTenant(e.target.checked)} />
              }
              label="Multi-tenant mode (allow users from multiple Entra ID tenants to log in)"
              sx={{ mb: 1 }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: 'block'
              }}>
              Leave this off unless the people who sign in to CIPP have accounts in a tenant other
              than your partner tenant.
            </Typography>
          </>
        ) : isSuccess ? (
          <Alert severity="success" sx={{ mb: 1 }}>
            SSO migration complete. The application will restart to apply the new authentication
            configuration. This may take a couple of minutes — you will be prompted to log in again
            once the restart is finished.
          </Alert>
        ) : ssoSetup.isPending ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Creating CIPP-SSO app and configuring authentication...</Typography>
          </Box>
        ) : isError ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {result?.message ||
                ssoSetup.error?.message ||
                'SSO migration failed. Please try again.'}
            </Alert>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The app registration may have been created already — clicking <strong>Try Again</strong>{' '}
              will pick up where it left off rather than starting over.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              If it keeps failing
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 1
              }}>
              The usual cause is a policy in your own tenant, not a problem with CIPP. Two to check
              with your Entra administrator:
            </Typography>
            <Typography
              component="ul"
              variant="body2"
              sx={{
                color: "text.secondary",
                pl: 3,
                mb: 2
              }}>
              <li>
                An <strong>app management policy</strong> that blocks adding client secrets. CIPP
                tries to exempt itself from it; where that is also blocked, an administrator has to
                create the secret manually.
              </li>
              <li>
                An out-of-date <strong>CIPP-SAM consent</strong> that predates the permissions CIPP
                needs to create the app. Re-consenting CIPP-SAM resolves it.
              </li>
            </Typography>
            {/* This dialog can't be dismissed, so a policy-blocked secret leaves the admin with
                nowhere to go. Resetting from the management portal drops the instance back to its
                setup wizard, which is the only route to entering a hand-made app's credentials. */}
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 2
              }}>
              If neither applies, or your administrator has to create the app registration by hand,
              use <strong>Reset SSO</strong> in the{' '}
              <Link
                href="https://management.cipp.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                management portal
              </Link>
              . That returns this instance to its setup wizard, where you can supply an Application
              ID and client secret directly.
            </Typography>
            <Link href={SSO_DOCS_URL} target="_blank" rel="noopener noreferrer" variant="body2">
              Troubleshooting steps and how to create the app registration manually
            </Link>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        {!submitted ? (
          <Button onClick={handleMigrate} variant="contained" color="primary">
            Set Up Authentication
          </Button>
        ) : isSuccess ? (
          <Button onClick={() => window.location.reload()} variant="contained">
            Reload Page
          </Button>
        ) : isError ? (
          <Button
            onClick={() => {
              setSubmitted(false)
            }}
            variant="contained"
          >
            Try Again
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
