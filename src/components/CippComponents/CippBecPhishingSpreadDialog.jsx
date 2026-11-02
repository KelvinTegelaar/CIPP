import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippDataTable } from '../CippTable/CippDataTable'

/**
 * "Who else got this?" - groups the recipients of a sender from message-trace metadata so a
 * phishing wave can be scoped before anyone is notified or anything is purged.
 */
export const CippBecPhishingSpreadDialog = ({
  open,
  onClose,
  tenantFilter,
  defaultSender = '',
  defaultSubject = '',
}) => {
  const [sender, setSender] = useState(defaultSender)
  const [subject, setSubject] = useState(defaultSubject)
  const [days, setDays] = useState(7)
  // Opened from a finding row (parent remounts by sender+subject): pre-fill the fields and run the
  // trace straight away so "who else got this" needs no extra click. The manual "Trace a sender's
  // spread" button opens with an empty sender, so the query stays null until the operator types one.
  const [query, setQuery] = useState(
    defaultSender
      ? { sender: defaultSender, subject: defaultSubject, days: 7 }
      : null
  )

  const spreadCall = ApiGetCall({
    url: '/api/ListBECPhishingSpread',
    data: {
      tenantFilter,
      sender: query?.sender,
      subject: query?.subject,
      days: query?.days,
    },
    queryKey: `ListBECPhishingSpread-${tenantFilter}-${query?.sender}-${query?.subject}-${query?.days}`,
    waiting: !!query?.sender,
  })

  const result = spreadCall.data

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Phishing spread from a sender</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">
            Lists every recipient of mail from the sender in the period, from
            message-trace metadata only, split into internal and external. Use
            it to scope a wave: who to warn, and which mailboxes a Purview
            search should cover.
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                label="Sender address"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Subject contains (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Days (1-90)"
                value={days}
                onChange={(e) => setDays(Number(e.target.value) || 7)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setQuery({ sender, subject, days })}
                disabled={!sender}
              >
                Trace
              </Button>
            </Grid>
          </Grid>
          {spreadCall.isFetching && (
            <Typography variant="body2">Tracing...</Typography>
          )}
          {result?.Recipients && (
            <>
              <Stack direction="row" spacing={1}>
                <Chip label={`${result.TotalMessages} message(s)`} />
                <Chip
                  color="warning"
                  label={`${result.InternalCount} internal recipient(s)`}
                />
                <Chip label={`${result.ExternalCount} external recipient(s)`} />
                {result.Complete === false && (
                  <Chip color="error" label="Partial - trace cap hit" />
                )}
              </Stack>
              <CippDataTable
                noCard={true}
                hideTitle={true}
                title="Recipients"
                data={result.Recipients}
                simpleColumns={[
                  'Recipient',
                  'Internal',
                  'MessageCount',
                  'FirstReceived',
                  'LastReceived',
                  'Statuses',
                  'Subjects',
                ]}
              />
            </>
          )}
          {result?.Results && typeof result.Results === 'string' && (
            <Typography color="error" variant="body2">
              {result.Results}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CippBecPhishingSpreadDialog
