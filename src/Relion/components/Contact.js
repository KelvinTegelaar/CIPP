import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setContact } from '../store/features/ticketSlice'

//mui
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function Contact() {
  const dispatch = useDispatch()
  const contact = useSelector((state) => state.ticket.contact)
  const contactList = useSelector((state) => state.ticket.contactList)

  const contactHandler = async (event, newValue) => {
    dispatch(setContact(newValue))
    console.log(newValue)
  }
  return (
    <Autocomplete
      openOnFocus
      autoHighlight
      autoSelect
      id="contact"
      value={contact}
      options={contactList}
      onChange={contactHandler}
      renderInput={(params) => <TextField {...params} label="Contact" />}
    />
  )
}
