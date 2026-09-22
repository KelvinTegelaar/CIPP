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
  Checkbox,
  TextField,
  Typography,
  Box,
  Stack,
} from '@mui/material'
import { ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from './CippApiResults'
import {
  describeAlertItem,
  getAlertItemFields,
  humanizeCmdlet,
} from '../../utils/format-alert-item'

export const UNTIL_RESOLVED = 'until-resolved'

const SNOOZE_OPTIONS = [
  { value: '7', label: 'Snooze for 7 days' },
  { value: '14', label: 'Snooze for 14 days' },
  { value: '30', label: 'Snooze for 30 days' },
  { value: '90', label: 'Snooze for 90 days' },
  {
    value: UNTIL_RESOLVED,
    label: 'Snooze until it resolves',
    hint: 'Lifts itself once the alert stops reporting this item, so it notifies again if it ever comes back.',
  },
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
  const [keepVisible, setKeepVisible] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const snoozeRequest = ApiPostCall({
    relatedQueryKeys: relatedQueryKeys ?? ['ListSnoozedAlerts'],
  })

  const handleSnooze = () => {
    setSubmitted(true)
    const untilResolved = duration === UNTIL_RESOLVED
    snoozeRequest.mutate({
      url: '/api/ExecSnoozeAlert',
      data: {
        CmdletName: cmdletName,
        TenantFilter: tenantFilter,
        AlertItem: alertItem,
        Duration: untilResolved ? null : parseInt(duration, 10),
        UntilResolved: untilResolved,
        KeepVisible: keepVisible,
        Reason: reason,
      },
    })
  }

  const handleClose = () => {
    setSubmitted(false)
    snoozeRequest.reset()
    setDuration('7')
    setKeepVisible(false)
    setReason('')
    onClose()
  }

  const fields = getAlertItemFields(alertItem)
  const { title } = describeAlertItem(alertItem)
  const alertLabel = humanizeCmdlet(cmdletName)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Snooze Alert</DialogTitle>
      <DialogContent>
        {alertItem && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              borderLeft: 4,
              borderLeftColor: 'primary.main',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              {alertLabel}
            </Typography>
            {fields.length > 0 ? (
              <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                {fields.map((field) => (
                  <Box key={field.label} sx={{ display: 'flex', gap: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        minWidth: 104,
                        flexShrink: 0,
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {field.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography
                variant="body2"
                sx={{ mt: 0.5, wordBreak: 'break-word' }}
              >
                {title}
              </Typography>
            )}
          </Box>
        )}
        {!submitted ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Choose how long to snooze this specific alert item. It will not
              trigger notifications until the snooze ends. CIPP keeps checking
              it either way.
            </Typography>
            <RadioGroup
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {SNOOZE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    option.hint ? (
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {option.hint}
                        </Typography>
                      </Box>
                    ) : (
                      option.label
                    )
                  }
                />
              ))}
            </RadioGroup>
            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox
                  checked={keepVisible}
                  onChange={(e) => setKeepVisible(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">
                    Keep it visible on the dashboard
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    Stays in the open list marked as snoozed, so it is not
                    forgotten. Unticked, it moves to the snoozed section.
                  </Typography>
                </Box>
              }
            />
            <TextField
              label="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2 }}
              placeholder="Why is this alert being snoozed?"
            />
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
