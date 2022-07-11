import React from 'react'
import { Stack } from '@mui/material'
import GetTechId from './GetTechId'
import SelectedTicket from './SelectedTicket'
import Client from './Client'
import Contact from './Contact'
import NewContact from './NewContact'
import IssueType from './IssueType'
import Title from './Title'
import TimeEntryNotes from './TimeEntryNotes'
import Status from './Status'
import TimeEntry from './TimeEntry'
import Submit from './Submit'
import Confirm from './Confirm'

export default function TicketForm() {
  return (
    <Stack spacing={2}>
      <GetTechId />
      <SelectedTicket />
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
      <Confirm />
    </Stack>
  )
}
