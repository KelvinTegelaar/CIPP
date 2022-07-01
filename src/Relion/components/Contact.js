import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setContact,
  setContactEmail,
  setContactId,
  setContactList,
} from '../store/features/ticketSlice'

//functions
import getContactList from '../functions/getContactList'

//mui
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function Contact() {
  const dispatch = useDispatch()
  const clientId = useSelector((state) => state.ticket.clientId)
  const contact = useSelector((state) => state.ticket.contact)
  const [cl, setCl] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getContactList(clientId)
      setCl(data)
      console.log('Contact List:')
      console.log(data)
    }
    fetchData().catch(console.error)
  }, [clientId])

  const contactHandler = async (event, input) => {
    dispatch(setContact(input))
    dispatch(setContactId(input.id))
    dispatch(setContactEmail(input.email))
    dispatch(setContactList(cl))
    console.log(input)
  }
  return (
    <Autocomplete
      openOnFocus
      autoHighlight
      autoSelect
      id="contact"
      value={contact}
      getOptionLabel={(option) => option.label + '  <' + option.email + '>'}
      options={cl}
      onChange={contactHandler}
      isOptionEqualToValue={(option, value) => option.name === value.label}
      renderInput={(params) => <TextField {...params} label="Contact" />}
    />
  )
}
