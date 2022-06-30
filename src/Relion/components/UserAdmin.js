// React
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// MUI
import { Autocomplete, Box, Button, Stack, Tab, TextField, Typography } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'

// Components
import ResetPass from './ResetPass'

// reducers
import { setContactAZ } from '../store/features/azSlice'

// functions
import getUsers from '../functions/getUsers'
import execOffboardUser from '../functions/execOffboardUser'

export default function UserAdmin() {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const contactAZ = useSelector((state) => state.az.contactAZ)
  const [contactList, setContactList] = useState([])
  const [result, setResult] = useState([])

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
    dispatch(setContactAZ(input))
    console.log('User to administor:')
    console.log(input)
  }

  const offboardHandler = async (event, input) => {
    const r = await execOffboardUser(tenant.defaultDomainName, contactAZ.userPrincipalName)
    console.log(r)
    setResult(r)
    dispatch(setContactAZ({ id: 0, displayName: '', userPrincipalName: '' }))
  }

  const [value, setValue] = React.useState('one')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">User Administration Tools</Typography>
      <Autocomplete
        autoHighlight
        autoSelect
        id="useradmin-contact"
        value={contactAZ}
        getOptionLabel={(option) => option.displayName + '  <' + option.userPrincipalName + '>'}
        options={contactList}
        onChange={contactHandler}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        renderInput={(params) => <TextField {...params} label="Contact" />}
      />

      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Reset Password" value="1" />
            <Tab label="Add to Group" value="2" />
            <Tab label="Offboard" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <ResetPass />
        </TabPanel>
        <TabPanel value="2"></TabPanel>
        <TabPanel value="3">
          <Button onClick={offboardHandler} variant="contained" color="error">
            Offboard
          </Button>
        </TabPanel>
      </TabContext>

      <Typography>
        {result.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Typography>
    </Stack>
  )
}
