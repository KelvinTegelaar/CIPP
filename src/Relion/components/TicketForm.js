// import React
import React from 'react'

// import functions
import GetTechId from '../functions/GetTechId'

// import components
import Client from './Client'
import Contact from './Contact'
import NewContact from './NewContact'
import IssueType from './IssueType'
import Title from './Title'
import TimeEntryNotes from './TimeEntryNotes'
import Status from './Status'
import TimeEntry from './TimeEntry'
import Submit from './Submit'
import TicketConfirm from './TicketConfirm'

export default function TicketForm() {
  // match logged in user with BMS techId
  GetTechId()

  return (
    <>
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
    </>
  )
}
