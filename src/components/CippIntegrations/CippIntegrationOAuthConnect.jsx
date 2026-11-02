import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippCopyToClipBoard } from '../CippComponents/CippCopyToClipboard'

// Signs a technician in to an integration whose writes need a user-context token. The vendor
// sends the code back to /authredirect, which relays it over the cipp_auth BroadcastChannel
// exactly as the SAM setup wizard's popup does; the backend owns state and the token exchange.
const CippIntegrationOAuthConnect = ({ extension, label = extension }) => {
  const statusKey = `ExtensionOAuthStatus-${extension}`
  const status = ApiGetCall({
    url: '/api/ExecExtensionOAuth',
    data: { Extension: extension, Action: 'status' },
    queryKey: statusKey,
  })
  const oauth = ApiPostCall({ relatedQueryKeys: [statusKey] })
  const [message, setMessage] = useState(null)
  const popupRef = useRef(null)

  const fail = (error) =>
    setMessage({
      severity: 'error',
      text:
        error?.response?.data?.Results ?? error?.message ?? 'Sign-in failed.',
    })

  const connect = () => {
    // window.open only succeeds inside the click's user activation and the URL arrives async,
    // so open a blank window first and navigate it once the backend answers.
    const popup = window.open('', 'extensionOAuthPopup', 'width=500,height=650')
    if (!popup) {
      setMessage({
        severity: 'error',
        text: 'The sign-in popup was blocked by the browser. Allow popups for this site and try again.',
      })
      return
    }
    popupRef.current = popup
    setMessage(null)
    oauth.mutate(
      {
        url: '/api/ExecExtensionOAuth',
        data: { Extension: extension, Action: 'start' },
      },
      {
        onSuccess: (response) => {
          const url = response?.data?.authorizeUrl
          if (url) {
            popup.location = url
          } else {
            popup.close()
            setMessage({
              severity: 'error',
              text: response?.data?.Results ?? 'Could not start the sign-in.',
            })
          }
        },
        onError: (error) => {
          popup.close()
          fail(error)
        },
      }
    )
  }

  useEffect(() => {
    const channel = new BroadcastChannel('cipp_auth')
    channel.onmessage = (event) => {
      const data = event.data
      if (data?.type === 'auth_code') {
        oauth.mutate(
          {
            url: '/api/ExecExtensionOAuth',
            data: {
              Extension: extension,
              Action: 'exchange',
              code: data.code,
              state: data.state,
            },
          },
          {
            onSuccess: (response) => {
              const text = response?.data?.Results ?? ''
              setMessage({
                severity: text.startsWith('Failed') ? 'error' : 'success',
                text,
              })
            },
            onError: fail,
          }
        )
      } else if (data?.type === 'auth_error') {
        setMessage({
          severity: 'error',
          text: `${data.error}${data.errorDescription ? `: ${data.errorDescription}` : ''}`,
        })
      }
    }
    return () => channel.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extension])

  const disconnect = () =>
    oauth.mutate(
      {
        url: '/api/ExecExtensionOAuth',
        data: { Extension: extension, Action: 'disconnect' },
      },
      {
        onSuccess: (response) =>
          setMessage({
            severity: 'info',
            text: response?.data?.Results ?? 'Disconnected.',
          }),
        onError: fail,
      }
    )

  const connected = status.data?.connected === true
  const connectedAt = status.data?.connectedAt
    ? new Date(status.data.connectedAt).toLocaleString()
    : null

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        useFlexGap
      >
        <Button
          variant={connected ? 'outlined' : 'contained'}
          color="primary"
          onClick={connect}
          disabled={oauth.isPending || status.isFetching}
        >
          {connected ? `Reconnect ${label}` : `Connect ${label}`}
        </Button>
        {connected && (
          <Button
            variant="outlined"
            color="warning"
            onClick={disconnect}
            disabled={oauth.isPending}
          >
            Disconnect
          </Button>
        )}
        <Typography variant="body2" color="text.secondary">
          {status.isFetching
            ? 'Checking sign-in...'
            : connected
              ? `Ticketing signed in${connectedAt ? ` since ${connectedAt}` : ''}.`
              : 'Ticketing is not signed in. Tickets cannot be raised until a technician connects.'}
        </Typography>
      </Stack>
      {status.data?.redirectUri && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            Register this redirect URI on the {label} API client and allow the
            Authorization Code grant:
          </Typography>
          <CippCopyToClipBoard text={status.data.redirectUri} type="chip" />
        </Box>
      )}
      {message && <Alert severity={message.severity}>{message.text}</Alert>}
    </Stack>
  )
}

export default CippIntegrationOAuthConnect
