import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setNotes } from '../../store/features/ticketFormSlice'
import TextField from '@mui/material/TextField'

export default function TimeEntryNotes() {
  const dispatch = useDispatch()
  const notes = useSelector((state) => state.ticketForm.notes)

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
