import { Alert, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'

export const SubscriptionEndedDialog = ({ hostedSubscriptionEnded }) => {
  const open = !!hostedSubscriptionEnded

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      slotProps={{ backdrop: { onClick: (e) => e.stopPropagation() } }}
    >
      <DialogTitle>Subscription Ended</DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          Your CIPP subscription has ended. Access to this instance is no longer available.
        </Alert>
        <Typography>
          Please contact your account holder to renew the subscription and restore access.
        </Typography>
      </DialogContent>
    </Dialog>
  )
}
