import React from 'react'
import { within, expect } from 'storybook/test'
import { Alert, Button, SvgIcon, Typography } from '@mui/material'
import { ErrorOutlineOutlined } from '@mui/icons-material'
import { CippAuthShell } from '../../../src/components/CippComponents/CippAuthShell'

export default {
  title: 'Components/CippAuthShell',
  component: CippAuthShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

// the four states PrivateRoute can put a signed-out user in

export const SignIn = {
  args: {
    title: 'Sign in to CIPP',
    description: 'Your session has expired. Sign in again to continue.',
    actionText: 'Sign in with Microsoft',
    actionHref: '/.auth/login/aad?prompt=select_account',
    version: '10.7.5',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Sign in to CIPP' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Sign in with Microsoft' })).toBeInTheDocument()
  },
}

export const SignInDark = {
  ...SignIn,
  globals: { theme: 'dark' },
}

export const AccessDenied = {
  args: {
    title: 'Access Denied',
    description: (
      <>
        <Typography variant="body1">
          Your account doesn&apos;t have permission to view this page.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Signed in as <strong>john@contoso.com</strong>
        </Typography>
      </>
    ),
    actionText: 'Sign in with a different account',
    actionHref: '/.auth/login/aad?prompt=select_account',
    secondaryText: 'Return to Home',
    secondaryHref: '/',
    version: '10.7.5',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Return to Home' })).toBeInTheDocument()
    await expect(
      canvas.getByRole('link', { name: 'Sign in with a different account' })
    ).toBeInTheDocument()
  },
}

export const Busy = {
  args: {
    busy: true,
    title: 'Logging into CIPP',
    description: 'Please wait while we log you in...',
    version: '10.7.5',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('progressbar')).toBeInTheDocument()
  },
}

export const ApiOffline = {
  args: {
    title: 'CIPP API Unreachable',
    titleIcon: (
      <SvgIcon sx={{ color: 'error.main' }}>
        <ErrorOutlineOutlined />
      </SvgIcon>
    ),
    description: (
      <>
        <Typography variant="body1">The CIPP API appears to be offline or out of date.</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          If you are self-hosting CIPP, please ensure your Function App is running and up to date.
        </Typography>
      </>
    ),
    actionText: 'Test API Connection',
    onActionClick: () => {},
    version: '10.7.5',
    children: (
      <Alert severity="error">
        <Typography variant="body2">
          No response received from API. Check if your Function App is running.
        </Typography>
        <Button variant="outlined" color="primary" sx={{ mt: 1 }}>
          Refresh Page
        </Button>
      </Alert>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Test API Connection' })).toBeInTheDocument()
    await expect(
      canvas.getByText('No response received from API. Check if your Function App is running.')
    ).toBeInTheDocument()
  },
}

export const ApiOfflineDark = {
  ...ApiOffline,
  globals: { theme: 'dark' },
}
