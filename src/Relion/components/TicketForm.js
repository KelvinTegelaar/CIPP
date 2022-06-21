import React from 'react'

// functions
import GetTechId from '../functions/getTechId'

// components
import Client from './Client'
import Contact from './Contact'
import IssueType from './IssueType'
import Title from './Title'
import Notes from './Notes'
import Status from './Status'
import TimeEntry from './TimeEntry'
import Submit from './Submit'
import TicketCard from './TicketCard'

export default function TicketForm() {
  // match logged in user with BMS techId
  GetTechId()

  return (
    <>
      <Client />
      <Contact />
      <IssueType />
      <Title />
      <Notes />
      <TimeEntry />
      <br />
      <Status />
      <Submit />
      <TicketCard />
    </>
  )
}
