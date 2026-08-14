import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Alert, Box, Container, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { ApiGetCall } from '../../api/ApiCall'

const OnboardingWizardPage = dynamic(() => import('../CippWizard/OnboardingWizardPage.jsx'), {
  ssr: false,
})

// The persister in _app.js keeps listAppId/TenantSelector/AllTenantsDashboard-Tenants
// for 24h in localStorage; everything cached before setup completed is junk, so the
// gate drops the persisted store both when it mounts and when the user enters CIPP.
const purgePersistedCache = () => {
  if (typeof window === 'undefined') return
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('REACT_QUERY_OFFLINE_CACHE')) localStorage.removeItem(key)
  })
}

// Full-screen blocking host for the setup wizard, rendered by PrivateRoute in place
// of the entire app while /api/me reports initialSetupComplete: false. Not hosted in
// CippAuthShell - its 520px card is far too narrow for the wizard's stepper forms.
const SetupGatePage = () => {
  const queryClient = useQueryClient()
  useEffect(() => {
    purgePersistedCache()
    // The persister already rehydrated pre-setup queries into memory at app start,
    // so purging localStorage alone still leaves e.g. a stale listAppId showing
    // yesterday's partner tenant inside the wizard. Drop everything except the
    // auth queries the gate itself depends on.
    queryClient.removeQueries({
      predicate: (query) =>
        !['authmecipp', 'authmeswa'].includes(String(query.queryKey?.[0] ?? '')),
    })
  }, [queryClient])

  // Cache read only - PrivateRoute already fetched authmecipp before rendering this.
  // samAppPresent means an app registration exists but the refresh token is missing,
  // so the wizard also offers the token-reset path.
  const me = ApiGetCall({ url: '/api/me', queryKey: 'authmecipp' })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflowY: 'auto',
        py: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box component="img" src="/logo.png" alt="CIPP" sx={{ display: 'block', height: 40 }} />
            <Typography variant="h4">Welcome to CIPP</Typography>
          </Stack>
          <Alert severity="info">
            CIPP needs to be connected to your Microsoft tenants before it can be used. Complete
            this setup wizard to unlock the rest of the application.
          </Alert>
          <OnboardingWizardPage
            mode="setupGate"
            samAppPresent={me.data?.samAppPresent === true}
            completionButton={{
              label: 'Enter CIPP',
              onClick: () => {
                purgePersistedCache()
                // Refetching authmecipp makes PrivateRoute re-evaluate the gate; if a
                // worker still reports setup incomplete this screen simply stays up,
                // results intact, and the button doubles as the retry.
                queryClient.invalidateQueries()
              },
            }}
          />
        </Stack>
      </Container>
    </Box>
  )
}

export default SetupGatePage
