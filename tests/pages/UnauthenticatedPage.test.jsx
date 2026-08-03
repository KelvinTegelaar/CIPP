import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTheme } from '../../src/theme'
import UnauthenticatedPage from '../../src/pages/unauthenticated'

// mutable per-test auth responses, vi.mock factory is hoisted so state must be too
const authState = vi.hoisted(() => ({ me: {}, swa: {} }))

vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: ({ url }) => {
    if (url === '/api/me') {
      return authState.me
    }
    // /.auth/me and /version.json
    return authState.swa
  },
}))

const successResult = (data) => ({
  isSuccess: true,
  isFetched: true,
  isLoading: false,
  isFetching: false,
  data,
})

const theme = createTheme({
  colorPreset: 'orange',
  direction: 'ltr',
  paletteMode: 'light',
  contrast: 'high',
})

const mockStore = configureStore({
  reducer: {
    toasts: (state = { toasts: [] }) => state,
  },
})

const renderPage = (reason) => {
  const queryClient = new QueryClient()
  return render(
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <UnauthenticatedPage reason={reason} />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('UnauthenticatedPage, permissions', () => {
  it('renders access denied with login link', async () => {
    authState.me = successResult({ message: 'Permission Denied' })
    authState.swa = successResult({ clientPrincipal: null })
    renderPage('permissions')

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
    expect(screen.getByText('Permission Denied')).toBeInTheDocument()
    const loginButton = screen.getByRole('link', { name: /Login/i })
    expect(loginButton).toHaveAttribute(
      'href',
      expect.stringContaining('/.auth/login/aad?prompt=select_account&post_login_redirect_uri=')
    )
  })

  it('renders return home link when authenticated with roles', async () => {
    // canReturnHome needs swa clientPrincipal + non-blocked roles from /api/me
    authState.me = successResult({
      clientPrincipal: { userRoles: ['anonymous', 'authenticated', 'admin'] },
    })
    authState.swa = successResult({
      clientPrincipal: { userDetails: 'john@contoso.com' },
    })
    renderPage('permissions')

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
    const homeButton = screen.getByRole('link', { name: /Return to Home/i })
    expect(homeButton).toHaveAttribute('href', '/')
    expect(screen.queryByRole('link', { name: /Login/i })).not.toBeInTheDocument()
  })

  it('names the signed-in account and offers switching once the identity is known', async () => {
    authState.me = successResult({
      clientPrincipal: { userRoles: ['anonymous'] },
    })
    authState.swa = successResult({
      clientPrincipal: { userDetails: 'wrong.account@contoso.com' },
    })
    renderPage('permissions')

    await waitFor(() => {
      expect(screen.getByText('wrong.account@contoso.com')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('link', { name: 'Sign in with a different account' })
    ).toBeInTheDocument()
    // no usable roles, so there is nowhere to return to
    expect(screen.queryByRole('link', { name: /Return to Home/i })).not.toBeInTheDocument()
  })
})

describe('UnauthenticatedPage, session', () => {
  it('renders a sign-in screen rather than a denial', async () => {
    authState.me = successResult({ message: 'Permission Denied' })
    authState.swa = successResult({ clientPrincipal: null })
    renderPage('session')

    await waitFor(() => {
      expect(screen.getByText('Sign in to CIPP')).toBeInTheDocument()
    })
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
    // the /api/me denial message belongs to the permissions screen, not this one
    expect(screen.queryByText('Permission Denied')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sign in with Microsoft/i })).toHaveAttribute(
      'href',
      expect.stringContaining('/.auth/login/aad?prompt=select_account&post_login_redirect_uri=')
    )
  })

  it('says the session expired only when one existed on this device', async () => {
    authState.me = successResult({})
    authState.swa = successResult({ clientPrincipal: null })

    const first = renderPage('session')
    await waitFor(() => {
      expect(
        screen.getByText('Sign in with your Microsoft account to continue.')
      ).toBeInTheDocument()
    })
    first.unmount()

    window.localStorage.setItem('cipp.hasSession', '1')
    renderPage('session')
    await waitFor(() => {
      expect(
        screen.getByText('Your session has expired. Sign in again to continue.')
      ).toBeInTheDocument()
    })
  })
})
