// import React
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

// import MUI
import Button from '@mui/material/Button'

// import Relion functions
import postTicket from '../functions/postTicket'
import postTime from '../functions/postTime'

// import reducers
import {
  setClient,
  setClientId,
  setConfirmedTicketId,
  setContact,
  setContactId,
  setIssueType,
  setIssueTypeId,
  setLocationId,
  setNotes,
  setTicketId,
  setTimeEntry,
  setTimeEntryId,
  setTitle,
  setStatus,
} from '../store/features/ticketSlice'

export default function Submit() {
  const dispatch = useDispatch()
  const clientId = useSelector((state) => state.ticket.clientId)
  const contactId = useSelector((state) => state.ticket.contactId)
  const dueDateISO = useSelector((state) => state.ticket.dueDateISO)
  const issueTypeId = useSelector((state) => state.ticket.issueTypeId)
  const locationId = useSelector((state) => state.ticket.locationId)
  const notes = useSelector((state) => state.ticket.notes)
  const openDate = useSelector((state) => state.ticket.openDate)
  const priority = useSelector((state) => state.ticket.priority)
  const queue = useSelector((state) => state.ticket.queue)
  const status = useSelector((state) => state.ticket.status)
  const techId = useSelector((state) => state.ticket.techId)
  const ticketId = useSelector((state) => state.ticket.ticketId)
  const title = useSelector((state) => state.ticket.title)
  const timeEntry = useSelector((state) => state.ticket.timeEntry)

  const submitHandler = async () => {
    const now = new Date()
    const nowISO = now.toISOString()
    const startTime = new Date(now.getTime() - timeEntry * 60000)
    const startTimeUTC = startTime.toLocaleTimeString('en-GB', { timeZone: 'UTC' })
    const endTimeUTC = now.toLocaleTimeString('en-GB', { timeZone: 'UTC' }) // format time in GMT for start/end time
    const date = ticketId ? nowISO : openDate // determine openDate for new vs. existing ticket
    const ticketJSON = JSON.stringify({
      accountId: clientId,
      assigneeId: techId,
      contactId: contactId,
      details: title,
      dueDate: dueDateISO,
      issueTypeID: issueTypeId,
      locationId: locationId,
      openDate: date,
      priorityId: priority, //2-day SLA
      sourceId: 4, //Email
      statusId: status,
      title: title,
      typeId: 28, //Service Request
      queueID: queue,
    })
    const timeHours = timeEntry / 60 // convert to hours in decimal
    const timeJSON = JSON.stringify({
      startDate: nowISO,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      timespent: timeHours,
      notes: notes,
      userId: techId,
      workTypeId: 19558,
      roleId: 15324,
    })

    // param ticketId is optional for updating existing ticket
    const tid = await postTicket(ticketJSON, ticketId)
    // confirmedTicketId is necessary for TicketConfirm component because ticketId will be reset
    dispatch(setConfirmedTicketId(tid))
    const teid = await postTime(timeJSON, tid)
    dispatch(setTimeEntryId(teid))

    // reset form
    dispatch(setClient(''))
    dispatch(setClientId(''))
    dispatch(setContact(''))
    dispatch(setContactId(''))
    dispatch(setIssueType(''))
    dispatch(setIssueTypeId(''))
    dispatch(setLocationId(''))
    dispatch(setNotes(''))
    dispatch(setStatus('36708'))
    dispatch(setTicketId(''))
    dispatch(setTitle(''))
    dispatch(setTimeEntry(15))
  }

  return (
    <Button onClick={submitHandler} variant="contained">
      Submit
    </Button>
  )
}
