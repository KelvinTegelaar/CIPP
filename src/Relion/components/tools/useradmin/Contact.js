import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Autocomplete, TextField } from '@mui/material'
import getUsers from '../../../functions/getUsers'
import { setContact } from '../../../store/features/userAdminSlice'

export default function Contact() {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const contact = useSelector((state) => state.userAdmin.contact)
  const [contactList, setContactList] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsers(tenant.defaultDomainName)
      setContactList(data)
      console.log('User List:')
      console.log(data)
    }
    fetchData().catch(console.error)
  }, [tenant])

  const contactHandler = async (event, input) => {
    dispatch(setContact(input))
    console.log('User to administor:')
    console.log(input)
  }

  return (
    <Autocomplete
      autoHighlight
      autoSelect
      id="useradmin-contact"
      value={contact}
      getOptionLabel={(option) => option.displayName + '  <' + option.userPrincipalName + '>'}
      options={contactList}
      onChange={contactHandler}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      renderInput={(params) => <TextField {...params} label="Contact" />}
    />
  )
}
