import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import postContact from '../../functions/postContact'
import { setContactValue } from '../../store/features/ticketFormSlice'

export default function NewContact() {
  const dispatch = useDispatch()
  const [fn, setFn] = useState()
  const [ln, setLn] = useState()
  const [em, setEm] = useState()
  const clientId = useSelector((state) => state.ticketForm.clientId)
  const locationId = useSelector((state) => state.ticketForm.locationId)

  const firstNameHandler = (event) => {
    setFn(event.target.value)
  }

  const lastNameHandler = (event) => {
    setLn(event.target.value)
  }

  const emailHandler = (event) => {
    setEm(event.target.value)
  }

  const submitHandler = async () => {
    const contactJSON = {
      firstName: fn,
      lastName: ln,
      accountId: clientId,
      locationId: locationId,
      emails: [
        {
          emailAddress: em,
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
    const cv = await postContact(contactJSON)
    dispatch(setContactValue(cv))

    // reset form
    setFn('')
    setLn('')
    setEm('')
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
              value={fn}
              onChange={firstNameHandler}
            />
            <TextField
              id="lastname"
              label="Last Name"
              variant="standard"
              value={ln}
              onChange={lastNameHandler}
            />
            <TextField
              id="email"
              label="Email"
              variant="standard"
              value={em}
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
