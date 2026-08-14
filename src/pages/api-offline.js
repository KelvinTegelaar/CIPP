import { Alert, Box, Button, SvgIcon, Typography } from '@mui/material'
import Head from 'next/head'
import { useState } from 'react'
import axios from 'axios'
import { ErrorOutlineOutlined } from '@mui/icons-material'
import { CippAuthShell } from '../components/CippComponents/CippAuthShell'
import { ApiGetCall } from '../api/ApiCall'

// Reached almost exclusively from legacy Function App deployments, which are
// still supported — hence the wording here.
const ApiOfflinePage = () => {
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const version = ApiGetCall({
    url: '/version.json',
    queryKey: 'LocalVersion',
  })

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult(null)

    try {
      // Try to ping the API
      const testCall = await axios.get('/api/me', { timeout: 45000 })
      console.log('API Test Call Response:', testCall)
      if (!testCall.headers['content-type']?.includes('application/json')) {
        throw new Error('API did not return the expected response.')
      }
      setTestResult({
        success: true,
        message: 'Connection successful! Try refreshing the page.',
      })
    } catch (error) {
      let errorMessage = 'Connection failed.'

      if (error.response) {
        // Request was made and server responded with a status code outside of 2xx range
        errorMessage = `API responded with status: ${error.response.status}`
        if (error.response.status === 404) {
          errorMessage +=
            ' (API endpoint not found, this can be the case if your Function App is on Version 7 or below)'
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response received from API. Check if your Function App is running.'
      } else {
        // Error in setting up the request
        errorMessage = `Error: ${error.message}`
      }

      setTestResult({ success: false, message: errorMessage })
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <>
      <Head>
        <title>API Offline</title>
      </Head>
      <CippAuthShell
        busy={testingConnection}
        version={version?.data?.version}
        titleIcon={
          <SvgIcon sx={{ color: 'error.main' }}>
            <ErrorOutlineOutlined />
          </SvgIcon>
        }
        title="CIPP API Unreachable"
        description={
          <>
            <Typography variant="body1">
              The CIPP API appears to be offline or out of date.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              If you are self-hosting CIPP, please ensure your Function App is running and up to
              date.
            </Typography>
          </>
        }
        actionText={testingConnection ? 'Testing Connection...' : 'Test API Connection'}
        onActionClick={handleTestConnection}
        actionDisabled={testingConnection}
      >
        {testResult && (
          <Alert severity={testResult.success ? 'success' : 'error'}>
            <Typography variant="body2">{testResult.message}</Typography>
            {testResult.success && (
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1 }}
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </Box>
            )}
          </Alert>
        )}
      </CippAuthShell>
    </>
  )
}

export default ApiOfflinePage
