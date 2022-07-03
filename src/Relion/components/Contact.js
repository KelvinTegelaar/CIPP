//import React
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setContact,
  setContactEmail,
  setContactId,
  setContactList,
} from '../store/features/ticketSlice'

//import functions
import getContactList from '../functions/getContactList'

//import mui
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function Contact() {
  const dispatch = useDispatch()
  const clientId = useSelector((state) => state.ticket.clientId)
  const contact = useSelector((state) => state.ticket.contact)
  const contactList = useSelector((state) => state.ticket.contactList)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getContactList(clientId)
      console.log('Contact List:')
      console.log(data)
      dispatch(setContactList(data))
    }
    fetchData().catch(console.error)
  }, [clientId, dispatch])

  const contactHandler = async (event, input) => {
    dispatch(setContact(input))
    dispatch(setContactId(input.id))
    dispatch(setContactEmail(input.email))
    console.log('Selected Contact:')
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
      options={contactList}
      onChange={contactHandler}
      isOptionEqualToValue={(option, value) => option.name === value.label}
      renderInput={(params) => <TextField {...params} label="Contact" />}
    />
  )
}
