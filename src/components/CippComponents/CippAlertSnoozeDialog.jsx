import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from './CippApiResults'

const SNOOZE_OPTIONS = [
  { value: '7', label: 'Snooze for 7 days' },
  { value: '14', label: 'Snooze for 14 days' },
  { value: '30', label: 'Snooze for 30 days' },
]

export const CippAlertSnoozeDialog = ({
  open,
  onClose,
  alertItem,
  cmdletName,
  tenantFilter,
  relatedQueryKeys,
}) => {
  const [duration, setDuration] = useState('7')
  const [submitted, setSubmitted] = useState(false)

  const snoozeRequest = ApiPostCall({
    relatedQueryKeys: relatedQueryKeys ?? ['ListSnoozedAlerts'],
  })

  const handleSnooze = () => {
    setSubmitted(true)
    snoozeRequest.mutate({
      url: '/api/ExecSnoozeAlert',
      data: {
        CmdletName: cmdletName,
        TenantFilter: tenantFilter,
        AlertItem: alertItem,
        Duration: parseInt(duration, 10),
      },
    })
  }

  const handleClose = () => {
    setSubmitted(false)
    snoozeRequest.reset()
    setDuration('7')
    onClose()
  }

  // Build a preview of the alert item
  const preview =
    alertItem?.UserPrincipalName ||
    alertItem?.Message ||
    alertItem?.DisplayName ||
    (alertItem ? JSON.stringify(alertItem).substring(0, 120) : '')

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Snooze Alert</DialogTitle>
      <DialogContent>
        {preview && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {preview}
            </Typography>
          </Alert>
        )}
        {!submitted ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Choose how long to snooze this specific alert item. It will not trigger notifications
              until the snooze expires.
            </Typography>
            <RadioGroup value={duration} onChange={(e) => setDuration(e.target.value)}>
              {SNOOZE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </Box>
        ) : (
          <CippApiResults apiObject={snoozeRequest} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{submitted ? 'Close' : 'Cancel'}</Button>
        {!submitted && (
          <Button variant="contained" onClick={handleSnooze}>
            Snooze
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
