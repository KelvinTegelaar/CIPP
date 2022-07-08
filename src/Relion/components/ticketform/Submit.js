import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Button from '@mui/material/Button'
import postTicket from '../../functions/postTicket'
import postTime from '../../functions/postTime'
import {
  setClientValue,
  setClientId,
  setConfirmedTicketId,
  setContactValue,
  setContactId,
  setIssueType,
  setIssueTypeId,
  setLocationId,
  setNotes,
  setTicketId,
  setTimeEntry,
  setTimeEntryId,
  setTitle,
  setStatusId,
} from '../../store/features/ticketFormSlice'

export default function Submit() {
  const dispatch = useDispatch()
  const clientId = useSelector((state) => state.ticketForm.clientId)
  const contactId = useSelector((state) => state.ticketForm.contactId)
  const dueDateISO = useSelector((state) => state.ticketForm.dueDateISO)
  const issueTypeId = useSelector((state) => state.ticketForm.issueTypeId)
  const locationId = useSelector((state) => state.ticketForm.locationId)
  const notes = useSelector((state) => state.ticketForm.notes)
  const openDate = useSelector((state) => state.ticketForm.openDate)
  const priority = useSelector((state) => state.ticketForm.priority)
  const queue = useSelector((state) => state.ticketForm.queue)
  const statusId = useSelector((state) => state.ticketForm.statusId)
  const techId = useSelector((state) => state.ticketForm.techId)
  const ticketId = useSelector((state) => state.ticketForm.ticketId)
  const title = useSelector((state) => state.ticketForm.title)
  const timeEntry = useSelector((state) => state.ticketForm.timeEntry)

  const submitHandler = async () => {
    const now = new Date()
    const nowISO = now.toISOString()
    const startTime = new Date(now.getTime() - timeEntry * 60000)
    const startTimeUTC = startTime.toLocaleTimeString('en-GB', { timeZone: 'UTC' })
    const endTimeUTC = now.toLocaleTimeString('en-GB', { timeZone: 'UTC' }) // format time in GMT for start/end time
    const date = ticketId ? openDate : nowISO // determine openDate for new vs. existing ticket
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
      statusId: statusId,
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
    dispatch(setClientValue(''))
    dispatch(setClientId(''))
    dispatch(setContactValue(''))
    dispatch(setContactId(''))
    dispatch(setIssueType(''))
    dispatch(setIssueTypeId(''))
    dispatch(setLocationId(''))
    dispatch(setNotes(''))
    dispatch(setStatusId('36708'))
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
