import React from 'react'
import { useDispatch } from 'react-redux'
import Button from '@mui/material/Button'
// import reducers
import {
  setClient,
  setClientId,
  setContact,
  setContactId,
  setIssueType,
  setIssueTypeId,
  setLocationId,
  setNotes,
  setStatus,
  setTicketId,
  setTimeEntry,
  setTitle,
} from '../store/features/ticketSlice'

export default function NewTicket() {
  const dispatch = useDispatch()
  const resetForm = () => {
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
    <Button onClick={resetForm} variant="contained">
      New Ticket
    </Button>
  )
}
