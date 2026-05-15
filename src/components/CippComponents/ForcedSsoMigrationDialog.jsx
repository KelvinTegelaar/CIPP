import { useCallback, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Typography,
  Button,
} from '@mui/material'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'

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

  const open = !!(currentRole.isSuccess && hasPermission && forceSsoMigration?.status === 'pending')

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
      disableEscapeKeyDown
      slotProps={{ backdrop: { onClick: (e) => e.stopPropagation() } }}
    >
      <DialogTitle>Complete Authentication Setup</DialogTitle>
      <DialogContent>
        {!submitted ? (
          <>
            <Typography sx={{ mb: 2 }}>
              Your CIPP instance requires a dedicated <strong>CIPP-SSO</strong> app registration in
              your tenant for authentication. This gives you full control over Conditional Access
              policies, MFA requirements, and session management for your CIPP users.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              The app will only require minimal permissions (OpenID, Profile, Email).
            </Typography>
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
            <Typography variant="body2" color="text.secondary">
              If this error persists, contact your CIPP administrator.
            </Typography>
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
  )
}
