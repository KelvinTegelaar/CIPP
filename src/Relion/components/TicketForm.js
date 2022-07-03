// import React
import React from 'react'

// import MUI
import { Stack } from '@mui/material'

// import components
import GetTechId from './GetTechId'
import Client from './Client'
import Contact from './Contact'
import NewContact from './NewContact'
import NewTicket from './NewTicket'
import IssueType from './IssueType'
import Title from './Title'
import TimeEntryNotes from './TimeEntryNotes'
import Status from './Status'
import TimeEntry from './TimeEntry'
import Submit from './Submit'
import TicketConfirm from './TicketConfirm'

export default function TicketForm() {
  return (
    <Stack spacing={2}>
      <NewTicket />
      <GetTechId />
      <Client />
      <Contact />
      <NewContact />
      <IssueType />
      <Title />
      <TimeEntry />
      <br />
      <TimeEntryNotes />
      <Status />
      <Submit />
      <TicketConfirm />
    </Stack>
  )
}
