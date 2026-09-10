import Head from 'next/head.js'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { Layout as DashboardLayout } from '../layouts/index'

const FullPageLoading = () => {
  return (
    <DashboardLayout>
      <Head>
        <title>Loading</title>
      </Head>
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading...
          </Typography>
        </Stack>
      </Box>
    </DashboardLayout>
  )
}

export default FullPageLoading
