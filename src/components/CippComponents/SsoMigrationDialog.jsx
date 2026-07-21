import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
const ERROR_DISMISS_KEY = 'cipp_sso_migration_error_dismissed'
const SSO_SETTINGS_PATH = '/cipp/advanced/super-admin/sso'

export const SsoMigrationDialog = ({ meData }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [multiTenant, setMultiTenant] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const ssoSetup = ApiPostCall({
    relatedQueryKeys: 'authmecipp',
  })

  const permissions = meData?.permissions || []
  const ssoMigration = meData?.ssoMigration
  const hasPermission = permissions.includes('CIPP.AppSettings.ReadWrite')
  const status = ssoMigration?.status
  const isErrorState = status === 'error'

  useEffect(() => {
    if (!meData || !ssoMigration) return
    if (status !== 'none' && status !== 'error') return

    // Dismissals are tracked per state so hiding the "get ready" nag doesn't also
    // hide a migration that later fails.
    const dismissKey = status === 'error' ? ERROR_DISMISS_KEY : DISMISS_KEY
    const dismissedAt = localStorage.getItem(dismissKey)
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) return

    setOpen(true)
  }, [meData, ssoMigration, status])

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
    localStorage.setItem(isErrorState ? ERROR_DISMISS_KEY : DISMISS_KEY, String(Date.now()))
    setOpen(false)
  }, [isErrorState])

  const handleGoToSsoSettings = useCallback(() => {
    setOpen(false)
    router.push(SSO_SETTINGS_PATH)
  }, [router])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  // A failed migration can't be retried from here — the SSO settings page surfaces the
  // underlying error and the Repair action that resumes from where setup stopped.
  if (isErrorState) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>CIPP Single Sign-On Setup Incomplete</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            The CIPP-SSO app registration could not be set up automatically, so the migration is
            incomplete.
          </Alert>
          <Typography sx={{ mb: 2 }}>
            The SSO settings page shows the specific error and lets you finish setup manually. In
            most cases <strong>Repair</strong> picks up from where it stopped, so the existing app
            registration is reused rather than recreated.
          </Typography>
          {!hasPermission && (
            <Alert severity="info">
              Only users with App Settings permissions can complete the SSO setup. Please ask an
              administrator to finish this step.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDismiss} color="inherit">
            Remind Me Later
          </Button>
          {hasPermission && (
            <Button onClick={handleGoToSsoSettings} variant="contained" color="primary">
              Go to SSO Settings
            </Button>
          )}
        </DialogActions>
      </Dialog>
    )
  }

  const result = ssoSetup.data?.data?.Results ?? ssoSetup.data?.Results
  const isSuccess = result?.severity === 'success'
  const isPartial = result?.severity === 'warning' && result?.canRepair
  const isError = ssoSetup.isError || result?.severity === 'failed' || (result?.severity === 'warning' && !result?.canRepair)

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
        ) : isPartial ? (
          <Alert severity="warning" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              App created — secret creation failed
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              The CIPP-SSO app registration ({result.appId}) was created successfully, but the
              client secret could not be generated. The app ID is saved.
            </Typography>
            <Typography variant="body2">
              Open <strong>Advanced &rarr; Super Admin &rarr; SSO</strong> and click{' '}
              <strong>Repair</strong> to finish setup.
            </Typography>
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
