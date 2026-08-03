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
    // /.auth/me
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

const renderPage = () => {
  const queryClient = new QueryClient()
  return render(
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <UnauthenticatedPage />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

describe('UnauthenticatedPage', () => {
  it('renders access denied with login link', async () => {
    authState.me = successResult({ message: 'Permission Denied' })
    authState.swa = successResult({ clientPrincipal: null })
    renderPage()

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
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
    const homeButton = screen.getByRole('link', { name: /Return to Home/i })
    expect(homeButton).toHaveAttribute('href', '/')
    expect(screen.queryByRole('link', { name: /Login/i })).not.toBeInTheDocument()
  })
})
