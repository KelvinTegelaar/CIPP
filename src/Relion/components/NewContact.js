import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

//mui
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// functions
import postContact from '../functions/postContact'

// reducers
import { setContact } from '../store/features/ticketSlice'

export default function NewContact() {
  const dispatch = useDispatch()
  const [firstName, setFirstName] = useState()
  const [lastName, setlastName] = useState()
  const [email, setEmail] = useState()
  const clientId = useSelector((state) => state.ticket.clientId)
  const locationId = useSelector((state) => state.ticket.locationId)

  const firstNameHandler = (event) => {
    setFirstName(event.target.value)
  }
  const lastNameHandler = (event) => {
    setlastName(event.target.value)
  }
  const emailHandler = (event) => {
    setEmail(event.target.value)
  }

  const submitHandler = async () => {
    const contactJSON = {
      firstName: firstName,
      lastName: lastName,
      accountId: clientId,
      locationId: locationId,
      emails: [
        {
          emailAddress: email,
          emailTypeId: 1,
          isDefault: true,
        },
      ],
      phones: [
        {
          phoneNumber: '000-000-0000',
          phoneTypeId: 2,
          isDefault: true,
        },
      ],
    }
    const selectedContact = await postContact(contactJSON)
    console.log(selectedContact)
    dispatch(setContact(selectedContact))

    // reset form
    setFirstName('')
    setlastName('')
    setEmail('')
    setFormVisible(false)
  }

  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [formVisible, setFormVisible] = useState(false)

  useEffect(() => {
    if (!clientId) {
      setButtonDisabled(true)
    } else {
      setButtonDisabled(false)
    }
  }, [clientId])

  return (
    <>
      <Button
        disabled={buttonDisabled}
        variant="outlined"
        onClick={() => {
          setFormVisible(!formVisible)
        }}
      >
        New Contact
      </Button>
      {formVisible && (
        <Box
          sx={{
            p: 2,
            bgcolor: '#242c2c',
            border: '1px dashed grey',
            gap: 2,
          }}
        >
          <Stack spacing={2}>
            <TextField
              id="firstname"
              label="First Name"
              variant="standard"
              value={firstName}
              onChange={firstNameHandler}
            />
            <TextField
              id="lastname"
              label="Last Name"
              variant="standard"
              value={lastName}
              onChange={lastNameHandler}
            />
            <TextField
              id="email"
              label="Email"
              variant="standard"
              value={email}
              onChange={emailHandler}
            />
            <Button variant="contained" onClick={submitHandler}>
              Add
            </Button>
          </Stack>
        </Box>
      )}
    </>
  )
}
