import React from 'react'
import { useSelector } from 'react-redux'
import { Alert, Stack } from '@mui/material'

export default function TicketCount() {
  const myCount = useSelector((state) => state.ticket.ticketMyCount)
  const newCount = useSelector((state) => state.ticket.ticketNewCount)
  const respondedCount = useSelector((state) => state.ticket.ticketRespondedCount)
  console.log(`myCount: ${myCount}`)

  return (
    <Stack spacing={2}>
      {newCount > 0 && <Alert severity="error">New Tickets: {newCount}</Alert>}
      {respondedCount > 0 && <Alert severity="warning">Client Responded: {respondedCount}</Alert>}
      {myCount > 0 && <Alert severity="info">My Tickets: {myCount}</Alert>}
      {newCount + respondedCount + myCount === 0 && (
        <Alert severity="success">No open tickets. Wowsome!</Alert>
      )}
    </Stack>
  )
}
