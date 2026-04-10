import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Layout as DashboardLayout } from '../../layouts/index.js'
import { Box, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material'
import { ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../../components/CippComponents/CippApiResults'
import CippPageCard from '../../components/CippCards/CippPageCard'

const VALID_DURATIONS = [7, 14, 30, -1]

const durationLabel = (d) => {
  if (d === -1) return 'forever'
  return `${d} days`
}

const Page = () => {
  const router = useRouter()
  const { cmdlet, tenant, data, duration } = router.query
  const [submitted, setSubmitted] = useState(false)
  const [parseError, setParseError] = useState(null)

  const snoozeRequest = ApiPostCall({
    relatedQueryKeys: ['ListSnoozedAlerts'],
  })

  useEffect(() => {
    if (!router.isReady) return
    if (submitted) return

    if (!cmdlet || !tenant || !data || !duration) {
      setParseError('Missing required parameters (cmdlet, tenant, data, duration).')
      return
    }

    const durationNum = parseInt(duration, 10)
    if (!VALID_DURATIONS.includes(durationNum)) {
      setParseError(`Invalid duration: ${duration}. Must be 7, 14, 30, or -1.`)
      return
    }

    let alertItem
    try {
      alertItem = JSON.parse(data)
    } catch {
      setParseError('Failed to parse alert data from URL.')
      return
    }

    setSubmitted(true)
    snoozeRequest.mutate({
      url: '/api/ExecSnoozeAlert',
      data: {
        CmdletName: cmdlet,
        TenantFilter: tenant,
        AlertItem: alertItem,
        Duration: durationNum,
      },
    })
  }, [router.isReady, cmdlet, tenant, data, duration])

  const preview = (() => {
    if (!data) return null
    try {
      const item = JSON.parse(data)
      return item.UserPrincipalName || item.Message || item.DisplayName || null
    } catch {
      return null
    }
  })()

  return (
    <CippPageCard title="Snooze Alert">
      {parseError ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {parseError}
        </Alert>
      ) : !submitted ? (
        <Stack spacing={2} alignItems="center" sx={{ p: 4 }}>
          <CircularProgress />
          <Typography>Processing snooze request...</Typography>
        </Stack>
      ) : (
        <Stack spacing={2} sx={{ p: 2 }}>
          {preview && (
            <Alert severity="info">
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {preview}
              </Typography>
            </Alert>
          )}
          {tenant && (
            <Typography variant="body2" color="text.secondary">
              Tenant: {tenant}
            </Typography>
          )}
          {duration && (
            <Typography variant="body2" color="text.secondary">
              Duration: {durationLabel(parseInt(duration, 10))}
            </Typography>
          )}
          <CippApiResults apiObject={snoozeRequest} />
          <Box>
            <Button
              variant="outlined"
              onClick={() =>
                router.push('/tenant/administration/alert-configuration/snoozed-alerts')
              }
            >
              View Snoozed Alerts
            </Button>
          </Box>
        </Stack>
      )}
    </CippPageCard>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
