import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
  Typography,
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

  const [cmdType, setCmdType] = useState('ad')
  const [cmd, setCmd] = useState()

  const [email, setEmail] = useState()
  const [userFnLi, setUserFnLi] = useState()
  const [userFiLn, setUserFiLn] = useState()
  const [userFn, setUserFn] = useState()
  const [userFnLn, setUserFnLn] = useState()
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
    const fullName = firstName + ' ' + lastName
    const email = `${username}@${domain}`
    if (cmdType === 'ad') {
      setCmd(
        `$secureStringPwd = "${password}" | ConvertTo-SecureString -AsPlainText -Force; New-ADUser -Name "${fullName}" -DisplayName "${fullName}" -GivenName "${firstName}" -Surname "${lastName}" -SamAccountName "${username}" -UserPrincipalName "${email}" -Accountpassword $secureStringPwd -Enabled $true; Start-ADSyncSyncCycle -PolicyType delta`,
      )
    } else {
      setCmd(
        `Connect-AzureAd; $PasswordProfile = New-Object -TypeName Microsoft.Open.AzureAD.Model.PasswordProfile; $PasswordProfile.Password = "${password}" ; New-AzureADUser -DisplayName "${fullName}" -PasswordProfile $PasswordProfile -UserPrincipalName "${email}" -AccountEnabled $true -MailNickName "${username}"`,
      )
    }
    setEmail(email)
    setUserFnLi(firstName.toLowerCase() + lastName.toLowerCase().charAt(0))
    setUserFiLn(firstName.toLowerCase().charAt(0) + lastName.toLowerCase())
    setUserFn(firstName.toLowerCase())
    setUserFnLn(firstName.toLowerCase() + lastName.toLowerCase())
    dispatch(setNotes(`${firstName}'s new login:\n\n${username}@${domain} / ${password}`))
  }, [firstName, lastName, domain, username, password, cmdType, dispatch])

  const firstNameHandler = (event) => {
    dispatch(setFirstName(event.target.value))
  }

  const lastNameHandler = (event) => {
    dispatch(setLastName(event.target.value))
  }

  const usernameHandler = (event) => {
    dispatch(setUsername(event.target.value))
  }

  const cmdTypeHandler = (event) => {
    dispatch(setCmdType(event.target.value))
  }

  const buttonHandler = async () => {
    // check for another user with same email address
    if (userList.find((item) => item.userPrincipalName === email)) {
      setMsg('Dupicate email found!')
    } else {
      // copy user creation script to clipboard
      navigator.clipboard.writeText(cmd).then(
        function () {
          setMsg(`Copied to clipboard`)
        },
        function (err) {
          setMsg('Copy failed: ', err)
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
        {firstName && (
          <FormControlLabel value={userFn} control={<Radio />} label={`${userFn}@${domain}`} />
        )}
        {firstName && lastName && (
          <>
            <FormControlLabel
              value={userFnLi}
              control={<Radio />}
              label={`${userFnLi}@${domain}`}
            />
            <FormControlLabel
              value={userFiLn}
              control={<Radio />}
              label={`${userFiLn}@${domain}`}
            />
          </>
        )}
        {firstName && lastName.length > 1 && (
          <FormControlLabel value={userFnLn} control={<Radio />} label={`${userFnLn}@${domain}`} />
        )}
      </RadioGroup>
      <br />
      <Password />
      <br />
      <RadioGroup row value={cmdType} name="cmd-group" onChange={cmdTypeHandler}>
        <FormControlLabel value="ad" control={<Radio />} label="AD" />
        <FormControlLabel value="az" control={<Radio />} label="Azure" />
      </RadioGroup>
      <Box
        sx={{
          p: 2,
          backgroundColor: '#013686',
        }}
      >
        <Typography>{cmd}</Typography>
      </Box>
      <br />
      <Button variant="contained" onClick={buttonHandler}>
        Copy
      </Button>
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} message={msg} />
    </>
  )
}
