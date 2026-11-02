import { Box, Button, Container, Stack, Typography } from '@mui/material'
import Head from 'next/head'
import { CippErrorState } from '../components/CippComponents/CippErrorState'
import { Layout as DashboardLayout } from '../layouts/index'
import { clearQueryCacheAndReload } from '../utils/clear-query-cache'
import { useEffect } from 'react'
import { useRouter } from 'next/router.js'
import { ErrorBoundary } from 'react-error-boundary'

// Minimal fallback if DashboardLayout itself crashes — breaks the infinite loop.
// Deliberately plain: no layout, no shared component, nothing that could be the
// thing that just threw.
const MinimalErrorFallback = ({ error, resetErrorBoundary, outerError }) => (
  <Box
    sx={{
      py: 4,
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Container maxWidth="sm">
      <Stack
        spacing={3}
        sx={{
          alignItems: "center",
          textAlign: "center"
        }}>
        <Typography variant="h4">Error 500 - Something went wrong</Typography>
        <Typography>Oh no! It seems something went wrong.</Typography>
        <Typography
          component="pre"
          sx={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {outerError?.message || error?.message}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={resetErrorBoundary}>
            Try again
          </Button>
          <Button variant="outlined" onClick={clearQueryCacheAndReload}>
            Clear cache &amp; reload
          </Button>
        </Stack>
      </Stack>
    </Container>
  </Box>
)

const Error500 = (props) => {
  //when we browse away from the page we want to reset the error boundary
  //this will prevent the error from showing on other pages
  const router = useRouter()
  useEffect(() => {
    // The app-level ErrorBoundary keeps showing this fallback across route
    // changes until it is reset, so an unmount cleanup never fires — reset when
    // navigation completes instead, letting the new route render. Guarded:
    // resetErrorBoundary is undefined when /500 is visited as a plain route.
    if (!props.resetErrorBoundary) return
    const handleRouteChange = () => props.resetErrorBoundary()
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ErrorBoundary
      FallbackComponent={(innerProps) => (
        <MinimalErrorFallback {...innerProps} outerError={props.error} />
      )}
    >
      <DashboardLayout showBreadcrumb={false}>
        <Head>
          <title>500 - Error</title>
        </Head>
        <CippErrorState
          code="500"
          title="Something went wrong"
          description="Head back to the dashboard — and if it keeps happening, clearing the cached data usually shakes it loose."
          detail={props.error?.message}
          imageUrl="/cippy-500.png"
          actionText="Return to Home"
          actionHref="/"
          secondaryText="Clear cache & reload"
          onSecondaryClick={clearQueryCacheAndReload}
        />
      </DashboardLayout>
    </ErrorBoundary>
  )
}

export default Error500
