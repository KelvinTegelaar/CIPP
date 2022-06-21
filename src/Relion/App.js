import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// mui
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'

// components
import TicketForm from './components/TicketForm'

// cipp component
import Users from 'src/views/identity/administration/Users.js'

const App = () => {
  // MUI dark mode
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

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
            <Users />
          </Stack>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
