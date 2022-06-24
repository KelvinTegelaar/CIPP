// import React
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'

// import MUI
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'

// import Relion components
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'

// import CIPP components
import Users from 'src/views/identity/administration/Users.js'

const App = () => {
  // MUI dark mode
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  const issueType = useSelector((state) => state.ticket.issueType)
  //const ticketId = useSelector((state) => state.ticket.ticketId)

  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <Stack spacing={2}>
            <TicketForm />
          </Stack>
        </Grid>
        <Grid item xs={8}>
          <Stack spacing={2}>
            <TicketList />
            {issueType === 'User Administration' && <Users />}
          </Stack>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
