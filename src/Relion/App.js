// import React
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'

// import MUI
import Grid from '@mui/material/Grid'

// import Relion components
import Details from './components/tools/activities/Details'
import TicketActivities from './components/tools/activities/Activities'
import TicketForm from './components/ticketForm/TicketForm'
import TicketList from './components/ticketList/TicketList'
import UserAdmin from './components/tools/userAdmin/UserAdmin'
import BMSTest from './components/tools/BMSTest'
import IssueTypeCount from './components/tools/issueTypeCount/IssueTypeCount'

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
          <TicketActivities />
          <Details />
        </Grid>
        <Grid item xs={6}>
          <BMSTest />
          <IssueTypeCount />
          {issueType === 'User Administration' && (
            <>
              <UserAdmin />
            </>
          )}
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
