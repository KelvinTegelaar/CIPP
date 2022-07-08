import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Chip } from '@mui/material'
import { resetForm } from '../../store/features/ticketFormSlice'

export default function SelectedTicket() {
  const dispatch = useDispatch()
  const ticketId = useSelector((state) => state.ticketForm.ticketId)
  const label = 'Ticket # ' + ticketId
  const deleteHandler = () => {
    dispatch(resetForm())
  }

  return ticketId && <Chip label={label} onDelete={deleteHandler} color="primary" />
}
