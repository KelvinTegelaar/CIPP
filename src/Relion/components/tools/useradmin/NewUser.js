import React, { useState, useEffect } from 'react'
import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material'
import { setNotes } from '../../../store/features/ticketFormSlice'
import { setFirstName, setLastName, setUsername } from '../../../store/features/userAdminSlice'
import { useSelector, useDispatch } from 'react-redux'
import Password from './Password'
import getUsers from 'src/Relion/functions/getUsers'

export default function NewUser() {
  const dispatch = useDispatch()
  const firstName = useSelector((state) => state.userAdmin.firstName)
  const lastName = useSelector((state) => state.userAdmin.lastName)
  const username = useSelector((state) => state.userAdmin.username)
  const password = useSelector((state) => state.userAdmin.password)
  const domain = useSelector((state) => state.ticketForm.domain)
  const tenant = useSelector((state) => state.app.currentTenant)

  const [userFnLi, setUserFnLi] = useState()
  const [userFiLn, setUserFiLn] = useState()
  const [userFn, setUserFn] = useState()
  const [userFnLi2, setUserFnLi2] = useState()
  const [userList, setUserList] = useState(false)

  // control snackbar
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const result = await getUsers(tenant.defaultDomainName)
      setUserList(result)
      console.log('userList:')
      console.log(result)
    }
    fetch()
  }, [tenant])

  useEffect(() => {
    setUserFnLi(firstName.toLowerCase() + lastName.toLowerCase().charAt(0))
    setUserFiLn(firstName.toLowerCase().charAt(0) + lastName.toLowerCase())
    setUserFn(firstName.toLowerCase())
    setUserFnLi2(firstName.toLowerCase() + lastName.toLowerCase().slice(0, 2))
    dispatch(setNotes(`${firstName}'s new login:\n\n${username}@${domain} / ${password}`))
  }, [firstName, lastName, domain, username, password, dispatch])

  const firstNameHandler = (event) => {
    dispatch(setFirstName(event.target.value))
  }

  const lastNameHandler = (event) => {
    dispatch(setLastName(event.target.value))
  }

  const usernameHandler = (event) => {
    dispatch(setUsername(event.target.value))
  }

  const adHandler = async () => {
    const fullName = firstName + ' ' + lastName
    const email = `${username}@${domain}`
    const cmd = `$secureStringPwd = "${password}" | ConvertTo-SecureString -AsPlainText -Force; New-ADUser -Name "${fullName}" -DisplayName "${fullName}" -GivenName "${firstName}" -Surname "${lastName}" -SamAccountName "${username}" -UserPrincipalName "${email}" -Accountpassword $secureStringPwd -Enabled $true; Start-ADSyncSyncCycle -PolicyType delta`

    // check for another user with same email address
    if (userList.find((item) => item.userPrincipalName === email)) {
      setMsg('Dupicate email found!')
    } else {
      // copy user creation script to clipboard
      navigator.clipboard.writeText(cmd).then(
        function () {
          setMsg(`Script copied to clipboard: ${email}`)
        },
        function (err) {
          setMsg('Could not copy to clipboard: ', err)
        },
      )
    }

    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <>
      <Stack spacing={2} direction="row">
        <TextField
          value={firstName}
          onChange={firstNameHandler}
          id="first-name"
          label="First Name"
        />
        <TextField value={lastName} onChange={lastNameHandler} id="last-name" label="Last Name" />
      </Stack>
      <RadioGroup value={username} name="username-group" onChange={usernameHandler}>
        <FormControlLabel value={userFnLi} control={<Radio />} label={`${userFnLi}@${domain}`} />
        <FormControlLabel value={userFiLn} control={<Radio />} label={`${userFiLn}@${domain}`} />
        <FormControlLabel value={userFn} control={<Radio />} label={`${userFn}@${domain}`} />
        <FormControlLabel value={userFnLi2} control={<Radio />} label={`${userFnLi2}@${domain}`} />
      </RadioGroup>
      <br />
      <Password />
      <br />
      <Button variant="contained" onClick={adHandler}>
        Generate AD Script
      </Button>
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} message={msg} />
    </>
  )
}
