import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import { ApiPostCall } from '../../api/ApiCall'

const DISMISS_KEY = 'cipp_sso_migration_dismissed'

export const SsoMigrationDialog = ({ meData }) => {
  const [open, setOpen] = useState(false)
  const [multiTenant, setMultiTenant] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const ssoSetup = ApiPostCall({
    relatedQueryKeys: 'authmecipp',
  })

  const permissions = meData?.permissions || []
  const ssoMigration = meData?.ssoMigration
  const hasPermission = permissions.includes('CIPP.AppSettings.ReadWrite')

  useEffect(() => {
    if (!meData || !ssoMigration) return
    if (ssoMigration.status !== 'none') return

    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) return

    setOpen(true)
  }, [meData, ssoMigration])

  const handleApprove = useCallback(() => {
    setSubmitted(true)
    ssoSetup.mutate({
      url: '/api/ExecSSOSetup',
      data: {
        Action: 'Create',
        multiTenant,
      },
    })
  }, [multiTenant, ssoSetup])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setOpen(false)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const result = ssoSetup.data?.data?.Results ?? ssoSetup.data?.Results
  const isSuccess = result?.severity === 'success'
  const isError = ssoSetup.isError || result?.severity === 'failed'

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Prepare for CIPP Single Sign-On</DialogTitle>
      <DialogContent>
        {!submitted ? (
          <>
            <Typography sx={{ mb: 2 }}>
              CIPP will soon be moving to a dedicated Single Sign-On model, giving you full control
              over Conditional Access policies, MFA requirements, and session management for your
              CIPP users.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              To get ready, CIPP needs to create an app registration in your tenant called
              <strong> CIPP-SSO </strong> with minimal permissions (OpenID, Profile, Email only).
              This won&apos;t change how you log in today — it just prepares your tenant for when
              the update rolls out.
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Review the options below and click &quot;Create App Registration&quot; to get set up
              ahead of time.
            </Typography>

            {!hasPermission && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Only users with App Settings permissions can create the SSO app registration.
                Please ask an administrator to complete this step.
              </Alert>
            )}

            <FormControlLabel
              disabled={!hasPermission}
              control={
                <Switch checked={multiTenant} onChange={(e) => setMultiTenant(e.target.checked)} />
              }
              label="Multi-tenant mode (allow users from multiple Entra ID tenants to log in)"
              sx={{ mb: 1 }}
            />
          </>
        ) : ssoSetup.isPending ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1, display: 'inline-flex' }} />
            <Typography component="span">Creating CIPP-SSO app registration...</Typography>
          </>
        ) : isSuccess ? (
          <Alert severity="success" sx={{ mb: 1 }}>
            {result.message}
          </Alert>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 1 }}>
            {result?.message || ssoSetup.error?.message || 'SSO setup failed. It will be retried automatically.'}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        {!submitted ? (
          <>
            <Button onClick={handleDismiss} color="inherit">
              Remind Me Later
            </Button>
            <Button onClick={handleApprove} variant="contained" color="primary" disabled={!hasPermission}>
              Create App Registration
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            variant="contained"
            disabled={ssoSetup.isPending}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
