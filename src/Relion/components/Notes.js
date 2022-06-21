import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setNotes } from '../store/features/ticketSlice'

//mui
import TextField from '@mui/material/TextField'

export default function Notes() {
  const dispatch = useDispatch()
  const notes = useSelector((state) => state.ticket.notes)

  const notesHandler = (event) => {
    dispatch(setNotes(event.target.value))
  }

  return (
    <TextField id="notes" label="Notes" value={notes} onChange={notesHandler} multiline rows={6} />
  )
}
