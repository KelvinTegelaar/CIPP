import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setStatus,
  setDueDate,
  setDueDateISO,
  setQueue,
  setPriority,
} from '../store/features/ticketSlice'

// mui
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'

export default function Status() {
  const dispatch = useDispatch()
  const status = useSelector((state) => state.ticket.status)
  const dueDate = useSelector((state) => state.ticket.dueDate)

  const statusHandler = (event) => {
    dispatch(setStatus(event.target.value))
  }

  // ---- Due Date -----
  const dueDateHandler = (event) => {
    dispatch(setDueDate(event.target.value))
    dispatch(setDueDateISO(new Date(event.target.value).toISOString()))
    dispatch(setQueue('28295')) //change queue to Back Buner
    dispatch(setPriority('28789')) //change SLA to 2 days
  }

  return (
    <RadioGroup value={status} name="status-buttons-group" onChange={statusHandler}>
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
      {['37182'].includes(status) && ( //show date picker for scheduled tickets
        <TextField type="date" id="due-date" value={dueDate} onChange={dueDateHandler} />
      )}
      <FormControlLabel value="37097" control={<Radio />} label="Onsite Scheduled" />
      {['37097'].includes(status) && ( //show date picker for scheduled tickets
        <TextField type="date" id="due-date" value={dueDate} onChange={dueDateHandler} />
      )}
    </RadioGroup>
  )
}
