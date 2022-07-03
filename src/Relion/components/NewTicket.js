import React from 'react'
import { useDispatch } from 'react-redux'
import Button from '@mui/material/Button'
// import reducers
import {
  setActivities,
  setClient,
  setClientId,
  setContact,
  setContactId,
  setDetails,
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
    dispatch(setActivities([]))
    dispatch(setClient(''))
    dispatch(setClientId(''))
    dispatch(
      setContact({
        id: 0,
        label: '',
        email: '',
      }),
    )
    dispatch(setContactId(''))
    dispatch(setDetails(''))
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
