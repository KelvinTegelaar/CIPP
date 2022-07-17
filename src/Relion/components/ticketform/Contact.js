import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()
  const caller = searchParams.get('caller')
  const clientId = useSelector((state) => state.ticketForm.clientId)
  const contactValue = useSelector((state) => state.ticketForm.contactValue)
  const contactList = useSelector((state) => state.ticketForm.contactList)

  const contactHandler = useCallback(
    (event, input) => {
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
    },
    [dispatch],
  )

  useEffect(() => {
    const fetch = async () => {
      // get contactList from BMS
      const result = await getContactList(clientId)
      dispatch(setContactList(result))
      console.log('contactList:')
      console.log(result)

      // match contact with parameter if supplied
      // skip if contact is already selected
      if (caller) {
        const ln = caller.substring(caller.indexOf(' ') + 1, caller.length)
        console.log('Caller Last Name:')
        console.log(ln)

        const match = result.filter((item) => item.label === ln)
        console.log('Contact Match:')
        console.log(match[0])
        if (match[0]) {
          contactHandler(null, match[0])
        }
      }
    }
    fetch()
  }, [caller, clientId, contactHandler, dispatch])

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
      isOptionEqualToValue={(option, value) => option.label === value.label}
      renderInput={(params) => <TextField {...params} label="Contact" />}
    />
  )
}
