import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Chip } from '@mui/material'
import { resetForm } from '../../store/features/ticketFormSlice'

export default function SelectedTicket() {
  const dispatch = useDispatch()
  const editMode = useSelector((state) => state.ticketForm.editMode)
  const ticketId = useSelector((state) => state.ticketForm.ticketId)
  const label = 'Ticket # ' + ticketId
  const deleteHandler = () => {
    dispatch(resetForm())
  }

  // Ticket chip appears when you select a row from the ticket list
  // The chip also allows you to exit edit mode
  return (
    <>
      {editMode && <Chip label={label} onDelete={deleteHandler} color="primary" />}
      {!editMode && (
        <Chip label="New Ticket" onDelete={deleteHandler} color="primary" variant="outlined" />
      )}
    </>
  )
}
