import Head from 'next/head'
import { useMemo } from 'react'
import { Box, Stack, SvgIcon, Typography } from '@mui/material'
import { Microsoft, PersonOutlineOutlined } from '@mui/icons-material'
import { CippAuthShell } from '../components/CippComponents/CippAuthShell'
import { ApiGetCall } from '../api/ApiCall'
import { hasSeenSession } from '../utils/auth-session'

const LOGIN_BASE = '/.auth/login/aad?prompt=select_account'

// This page prerenders in Node during `next build` (next.config.js sets
// output: 'export'), so window can't be read unconditionally.
const loginUrl = () =>
  typeof window === 'undefined'
    ? LOGIN_BASE
    : `${LOGIN_BASE}&post_login_redirect_uri=${encodeURIComponent(window.location.href)}`

// Two different failures wearing one face until now. No identity at all is not a
// denial — there is nothing to explain and one thing to do. A real identity CIPP
// won't let through is, and it needs the account named.
const Page = ({ reason = 'session' }) => {
  const orgData = ApiGetCall({
    url: '/api/me',
    queryKey: 'authmecipp',
  })

  const swaStatus = ApiGetCall({
    url: '/.auth/me',
    queryKey: 'authmeswa',
    staleTime: 120000,
    refetchOnWindowFocus: true,
  })

  const version = ApiGetCall({
    url: '/version.json',
    queryKey: 'LocalVersion',
  })

  const blockedRoles = ['anonymous', 'authenticated']
  // Use useMemo to derive userRoles directly
  const userRoles = useMemo(() => {
    if (orgData.isSuccess && orgData.data?.clientPrincipal?.userRoles) {
      return orgData.data.clientPrincipal.userRoles.filter((role) => !blockedRoles.includes(role))
    }
    return []
  }, [orgData.isSuccess, orgData.data?.clientPrincipal?.userRoles])

  const canReturnHome =
    swaStatus.isSuccess && !!swaStatus?.data?.clientPrincipal && userRoles.length > 0
  const signedInAs = swaStatus?.data?.clientPrincipal?.userDetails

  const isSessionEnded = reason === 'session'

  const sessionProps = {
    title: 'Sign in to CIPP',
    // reading localStorage during render is safe here: the gate below keeps this
    // subtree off the prerender and off the first client render, so the server
    // and client can never disagree on the wording
    description: hasSeenSession()
      ? 'Your session has expired. Sign in again to continue.'
      : 'Sign in with your Microsoft account to continue.',
    actionText: 'Sign in with Microsoft',
    actionIcon: <Microsoft />,
    actionHref: loginUrl(),
  }

  const permissionProps = {
    title: 'Access Denied',
    // denied gets the 401 Cippy; the sign-in state keeps the shell's default
    cippyImage: '/cippy-401.png',
    description: (
      <>
        <Typography variant="body1">
          {orgData?.data?.message || "Your account doesn't have permission to view this page."}
        </Typography>
        {signedInAs && (
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              mt: 2.5,
              px: 1.5,
              py: 1.25,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
              color: 'text.primary',
            }}
          >
            <SvgIcon fontSize="small" sx={{ color: 'text.secondary' }}>
              <PersonOutlineOutlined />
            </SvgIcon>
            <Typography variant="body2">
              Signed in as{' '}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {signedInAs}
              </Box>
            </Typography>
          </Stack>
        )}
      </>
    ),
    // switching account is only offerable once we know which account is signed in
    actionText: signedInAs ? 'Sign in with a different account' : 'Login',
    actionIcon: <Microsoft />,
    actionHref: loginUrl(),
    secondaryText: canReturnHome ? 'Return to Home' : undefined,
    secondaryHref: canReturnHome ? '/' : undefined,
  }

  return (
    <>
      <Head>
        <title>{isSessionEnded ? 'Sign in - CIPP' : '401 - Access Denied'}</title>
      </Head>
      {(orgData.isSuccess || swaStatus.isSuccess) && Array.isArray(userRoles) && (
        <CippAuthShell
          version={version?.data?.version}
          {...(isSessionEnded ? sessionProps : permissionProps)}
        />
      )}
    </>
  )
}

export default Page
