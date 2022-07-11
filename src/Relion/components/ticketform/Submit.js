import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Button from '@mui/material/Button'
import postTicket from '../../functions/postTicket'
import postTime from '../../functions/postTime'
import { resetForm } from '../../store/features/ticketFormSlice'
import { setTicketConfirmId, setTimeEntryConfirmId } from '../../store/features/ticketConfirmSlice'

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

    // Update if ticketId is supplied
    // Else create new ticket
    const tid = await postTicket(ticketJSON, ticketId)
    console.log('ticketId:')
    console.log(tid)

    // Post time entry
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
    const teid = await postTime(timeJSON, tid)
    console.log('timeEntryId:')
    console.log(teid)

    // values to display Confirm component
    dispatch(setTicketConfirmId(tid))
    dispatch(setTimeEntryConfirmId(teid))

    dispatch(resetForm())
  }

  return (
    <Button onClick={submitHandler} variant="contained">
      Submit
    </Button>
  )
}
