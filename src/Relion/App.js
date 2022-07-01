// import React
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'

// import MUI
import Grid from '@mui/material/Grid'

// import Relion components
import TicketActivities from './components/TicketActivities'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import TicketCount from './components/TicketCount'
import UserAdmin from './components/UserAdmin'

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
        <Grid item xs={12}>
          <TicketList />
        </Grid>
        <Grid item xs={6}>
          <TicketForm />
        </Grid>
        <Grid item xs={6}>
          <TicketCount />
          <br />
          {issueType === 'User Administration' && (
            <>
              <UserAdmin />
            </>
          )}
          <TicketActivities />
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
