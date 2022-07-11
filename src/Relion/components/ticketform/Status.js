import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setStatusId,
  setDueDate,
  setDueDateISO,
  setQueue,
  setPriority,
} from '../../store/features/ticketFormSlice'
import { FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material'

export default function Status() {
  const dispatch = useDispatch()
  const statusId = useSelector((state) => state.ticketForm.statusId)
  const dueDate = useSelector((state) => state.ticketForm.dueDate)

  const statusHandler = (event) => {
    dispatch(setStatusId(event.target.value))
  }

  // ---- Due Date -----
  const dueDateHandler = (event) => {
    dispatch(setDueDate(event.target.value))
    dispatch(setDueDateISO(new Date(event.target.value).toISOString()))
    dispatch(setQueue('28295')) //change queue to Back Buner
    dispatch(setPriority('28789')) //change SLA to 2 days
  }

  return (
    <RadioGroup value={statusId} name="status-buttons-group" onChange={statusHandler}>
      <FormControlLabel
        value="36708"
        control={<Radio onChange={() => setDueDate('')} />} //reset DueDate
        label="Closed"
      />
      <FormControlLabel
        value="36709"
        control={<Radio onChange={() => setDueDate('')} />} //reset DueDate
        label="In Progress"
      />
      <FormControlLabel
        value="36707"
        control={<Radio onChange={() => setDueDate('')} />} //reset DueDate
        label="Waiting For Customer"
      />
      <FormControlLabel value="37182" control={<Radio />} label="Follow-up Scheduled" />
      {['37182'].includes(statusId) && ( //show date picker for scheduled tickets
        <TextField type="date" id="due-date" value={dueDate} onChange={dueDateHandler} />
      )}
      <FormControlLabel value="37097" control={<Radio />} label="Onsite Scheduled" />
      {['37097'].includes(statusId) && ( //show date picker for scheduled tickets
        <TextField type="date" id="due-date" value={dueDate} onChange={dueDateHandler} />
      )}
    </RadioGroup>
  )
}
