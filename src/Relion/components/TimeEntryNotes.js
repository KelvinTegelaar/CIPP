//import React
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setNotes } from '../store/features/ticketSlice'

//import MUI
import TextField from '@mui/material/TextField'

export default function TimeEntryNotes() {
  const dispatch = useDispatch()
  const notes = useSelector((state) => state.ticket.notes)

  const notesHandler = (event) => {
    dispatch(setNotes(event.target.value))
  }

  return (
    <TextField
      id="notes"
      label="Time Entry Notes"
      value={notes}
      onChange={notesHandler}
      multiline
      rows={6}
    />
  )
}
