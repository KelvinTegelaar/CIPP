import React from 'react'
import { Box, Stack, Tab, Typography } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import Contact from './Contact'
import NewUser from './NewUser'
import Offboard from './Offboard'
import License from './License'
import ResetPass from './ResetPass'

export default function UserAdmin() {
  const [value, setValue] = React.useState('one')
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Stack spacing={4} sx={{ p: 2, bgcolor: '#242c2c', border: '1px dashed grey' }}>
      <Typography variant="h5" color="primary">
        User Administration Tools
      </Typography>
      <Contact />

      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} variant="scrollable">
            <Tab label="Reset Password" value="1" />
            <Tab label="New User" value="2" />
            <Tab label="License" value="3" />
            <Tab label="Add to Group" value="4" />
            <Tab label="Offboard" value="5" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <ResetPass />
        </TabPanel>
        <TabPanel value="2">
          <NewUser />
        </TabPanel>
        <TabPanel value="3">
          <License />
        </TabPanel>
        <TabPanel value="4"></TabPanel>
        <TabPanel value="5">
          <Offboard />
        </TabPanel>
      </TabContext>
    </Stack>
  )
}
