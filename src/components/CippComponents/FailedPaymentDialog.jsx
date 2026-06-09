import { useEffect, useState, useCallback } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

const DISMISS_KEY = 'cipp_hosted_payment_dismissed'
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000 // 1 day

export const FailedPaymentDialog = ({ hostedFailedPayments }) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!hostedFailedPayments) return

    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS) return

    setOpen(true)
  }, [hostedFailedPayments])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setOpen(false)
  }, [])

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      slotProps={{ backdrop: { onClick: (e) => e.stopPropagation() } }}
    >
      <DialogTitle>Payment Issue</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          There is a payment issue with your CIPP subscription.
        </Alert>
        <Typography>
          A recent payment has failed. Please contact your account holder to update payment
          information and avoid service interruption.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismiss} variant="contained" color="warning">
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  )
}
