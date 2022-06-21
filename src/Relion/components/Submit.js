import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

// mui
import Button from '@mui/material/Button'

// functions
import postTicket from '../functions/postTicket'
import postTime from '../functions/postTime'

// reducers
import {
  setClient,
  setContact,
  setClientId,
  setLocationId,
  setIssueType,
  setTitle,
  setNotes,
  setStatus,
  setTimeEntry,
  setTicketId,
} from '../store/features/ticketSlice'

export default function Submit() {
  const dispatch = useDispatch()
  const techId = useSelector((state) => state.ticket.techId)
  const title = useSelector((state) => state.ticket.title)
  const clientId = useSelector((state) => state.ticket.clientId)
  const locationId = useSelector((state) => state.ticket.locationId)
  const contact = useSelector((state) => state.ticket.contact)
  const status = useSelector((state) => state.ticket.status)
  const issueType = useSelector((state) => state.ticket.issueType)
  const priority = useSelector((state) => state.ticket.priority)
  const notes = useSelector((state) => state.ticket.notes)
  const dueDateISO = useSelector((state) => state.ticket.dueDateISO)
  const queue = useSelector((state) => state.ticket.queue)
  const timeEntry = useSelector((state) => state.ticket.timeEntry)

  const submitHandler = async () => {
    const now = new Date()
    const nowISO = now.toISOString()

    const ticketJSON = JSON.stringify({
      assigneeId: techId,
      title: title,
      details: title,
      accountId: clientId,
      locationId: locationId,
      contactId: contact.id,
      statusId: status,
      issueTypeID: issueType.id,
      priorityId: priority, //2-day SLA
      typeId: 28, //Service Request
      sourceId: 4, //Email
      openDate: nowISO,
      dueDate: dueDateISO,
      queueID: queue,
    })
    const tid = await postTicket(ticketJSON)
    dispatch(setTicketId(tid))

    // format time in GMT for start/end time
    const startTimeUTC = now.toLocaleTimeString('en-GB', { timeZone: 'UTC' })
    const endTime = new Date(now.getTime() + timeEntry * 60000)
    const endTimeUTC = endTime.toLocaleTimeString('en-GB', { timeZone: 'UTC' })
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
    await postTime(tid, timeJSON)

    //reset form
    dispatch(setClient(''))
    dispatch(setContact(''))
    dispatch(setIssueType(''))
    dispatch(setTitle(''))
    dispatch(setNotes(''))
    dispatch(setTimeEntry(15))
    dispatch(setStatus('36708'))
    dispatch(setLocationId(''))
    dispatch(setClientId(''))
  }

  return (
    <Button onClick={submitHandler} variant="contained">
      Submit
    </Button>
  )
}
