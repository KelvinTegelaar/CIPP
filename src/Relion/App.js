// import React
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'

// import MUI
import Grid from '@mui/material/Grid'

// import Relion components
import Details from './components/tools/activities/Details'
import TicketActivities from './components/tools/activities/Activities'
import TicketForm from './components/ticketform/TicketForm'
import TicketList from './components/ticketlist/TicketList'
import UserAdmin from './components/tools/useradmin/UserAdmin'

const App = () => {
  // MUI dark mode
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  const issueType = useSelector((state) => state.ticketForm.issueType)

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
          {issueType === 'User Administration' && (
            <>
              <UserAdmin />
            </>
          )}
          <Details />
          <TicketActivities />
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
