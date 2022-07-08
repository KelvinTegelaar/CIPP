import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setContactEmail,
  setContactId,
  setContactValue,
  setContactList,
} from '../../store/features/ticketFormSlice'
import getContactList from '../../functions/getContactList'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function Contact() {
  const dispatch = useDispatch()
  const clientId = useSelector((state) => state.ticketForm.clientId)
  const contactValue = useSelector((state) => state.ticketForm.contactValue)
  const contactList = useSelector((state) => state.ticketForm.contactList)

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
    dispatch(setContactId(input.id))
    dispatch(setContactEmail(input.email))
    dispatch(
      setContactValue({
        id: input.id,
        label: input.label,
        email: input.email,
      }),
    )
    console.log('Selected Contact:')
    console.log(input)
  }
  return (
    <Autocomplete
      openOnFocus
      autoHighlight
      autoSelect
      id="contact"
      value={contactValue}
      getOptionLabel={(option) => option.label + '  <' + option.email + '>'}
      options={contactList}
      onChange={contactHandler}
      isOptionEqualToValue={(option, value) => option.name === value.label}
      renderInput={(params) => <TextField {...params} label="Contact" />}
    />
  )
}
