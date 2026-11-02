import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTheme } from '../../src/theme'
import { PrivateRoute } from '../../src/components/PrivateRoute'
import { swaPrincipal, cippPrincipal } from '../mocks/fixtures'

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
  ApiPostCall: () => ({ mutate: vi.fn(), isPending: false }),
}))

// the gate page hosts the entire setup wizard via next/dynamic - the routing
// decision is what's under test here, so stand in a marker for it. the non-admin
// hold page is light enough to render for real.
vi.mock('../../src/components/CippComponents/SetupGatePage.jsx', () => ({
  default: () => <div>setup gate wizard</div>,
}))

// full react-query result shape PrivateRoute reads
const result = (overrides = {}) => ({
  isLoading: false,
  isFetching: false,
  isPending: false,
  isError: false,
  isSuccess: true,
  error: null,
  data: undefined,
  refetch: vi.fn(),
  ...overrides,
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

const renderRoute = (routeType) => {
  const queryClient = new QueryClient()
  return render(
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <PrivateRoute routeType={routeType}>
            <div>app content</div>
          </PrivateRoute>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

describe('PrivateRoute', () => {
  it('shows the sign-in page when the session request errors', async () => {
    // api reachable, session errored, sign-in page needs one settled query to render
    authState.swa = result({ isError: true, isSuccess: false, error: new Error('boom') })
    authState.me = result({ data: { message: 'Permission Denied' } })
    renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Sign in to CIPP')).toBeInTheDocument()
    })
    // no identity means nothing was denied
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
    expect(screen.queryByText('app content')).not.toBeInTheDocument()
  })

  it('shows the server explanation when a signed-in identity is denied (e.g. IP blocked)', async () => {
    // real SWA session, but CIPP refused the caller and said why - the wording must
    // surface instead of the misleading "session expired" prompt
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({
      data: {
        clientPrincipal: null,
        permissions: [],
        message: 'Your IP address (203.0.113.7) is not in the allowed range for your role(s)',
      },
    })
    renderRoute()

    await waitFor(() => {
      expect(screen.getByText(/not in the allowed range/)).toBeInTheDocument()
    })
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Sign in to CIPP')).not.toBeInTheDocument()
  })

  it('shows the sign-in page when the session has no identity in either shape', async () => {
    // settled /.auth/me with neither clientPrincipal nor easyauth array
    authState.swa = result({ data: {} })
    authState.me = result({ isPending: true, isSuccess: false })
    renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Sign in to CIPP')).toBeInTheDocument()
    })
  })

  it('shows loading page while roles are resolving', () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({ isLoading: true, isPending: true, isSuccess: false })
    renderRoute()

    expect(screen.getByText('Logging into CIPP')).toBeInTheDocument()
    expect(screen.queryByText('app content')).not.toBeInTheDocument()
  })

  it('shows api offline page when /api/me 404s', () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({
      isSuccess: false,
      isError: true,
      error: { response: { status: 404 } },
    })
    renderRoute()

    expect(screen.getByText('CIPP API Unreachable')).toBeInTheDocument()
  })

  it('shows api offline page when /api/me succeeds with no data', () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({ data: undefined })
    renderRoute()

    expect(screen.getByText('CIPP API Unreachable')).toBeInTheDocument()
  })

  it('shows access denied, naming the account, when only blocked roles remain', async () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({ data: cippPrincipal(['anonymous', 'authenticated']) })
    renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
    // a real identity was denied, so say which one
    expect(screen.getByText('john@contoso.com')).toBeInTheDocument()
    expect(screen.queryByText('Sign in to CIPP')).not.toBeInTheDocument()
    expect(screen.queryByText('app content')).not.toBeInTheDocument()
  })

  it('renders children for an swa session with a real role', () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({ data: cippPrincipal(['anonymous', 'authenticated', 'editor']) })
    renderRoute()

    expect(screen.getByText('app content')).toBeInTheDocument()
  })

  it('renders children for an easyauth array session with a real role', () => {
    // app service easyauth shape, no clientPrincipal wrapper
    authState.swa = result({ data: [{ user_id: 'abc', user_claims: [] }] })
    authState.me = result({ data: cippPrincipal(['anonymous', 'authenticated', 'editor']) })
    renderRoute()

    expect(screen.getByText('app content')).toBeInTheDocument()
  })

  it('gates admin routes on the admin role', async () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({ data: cippPrincipal(['anonymous', 'authenticated', 'editor']) })
    renderRoute('admin')

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })

    authState.me = result({ data: cippPrincipal(['anonymous', 'authenticated', 'admin']) })
    renderRoute('admin')
    expect(screen.getByText('app content')).toBeInTheDocument()
  })

  it('blocks admins behind the setup wizard while initial setup is incomplete', () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({
      data: {
        ...cippPrincipal(['anonymous', 'authenticated', 'admin']),
        initialSetupComplete: false,
        samAppPresent: false,
      },
    })
    renderRoute()

    expect(screen.getByText('setup gate wizard')).toBeInTheDocument()
    expect(screen.queryByText('app content')).not.toBeInTheDocument()
  })

  it('holds non-admins on the pending page while initial setup is incomplete', () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({
      data: {
        ...cippPrincipal(['anonymous', 'authenticated', 'editor']),
        initialSetupComplete: false,
        samAppPresent: false,
      },
    })
    renderRoute()

    expect(screen.getByText('CIPP is being set up')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
    expect(screen.queryByText('setup gate wizard')).not.toBeInTheDocument()
    expect(screen.queryByText('app content')).not.toBeInTheDocument()
  })

  it('lets everyone through once initial setup is complete or unreported', () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({
      data: {
        ...cippPrincipal(['anonymous', 'authenticated', 'editor']),
        initialSetupComplete: true,
        samAppPresent: true,
      },
    })
    renderRoute()
    expect(screen.getByText('app content')).toBeInTheDocument()

    // absent field (older api, early-return /api/me shapes) must never gate
    authState.me = result({ data: cippPrincipal(['anonymous', 'authenticated', 'editor']) })
    renderRoute()
    expect(screen.getAllByText('app content').length).toBeGreaterThan(0)
  })

  it('stays latched unauthenticated while the session refetches', async () => {
    authState.swa = result({ data: {} })
    authState.me = result({ isPending: true, isSuccess: false })
    const { rerender } = renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Sign in to CIPP')).toBeInTheDocument()
    })

    // refetch in flight must not flip back to the loading page
    authState.swa = result({ isFetching: true, data: {} })
    rerender(
      <Provider store={mockStore}>
        <QueryClientProvider client={new QueryClient()}>
          <ThemeProvider theme={theme}>
            <PrivateRoute>
              <div>app content</div>
            </PrivateRoute>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    )

    expect(screen.getByText('Sign in to CIPP')).toBeInTheDocument()
    expect(screen.queryByText('Logging into CIPP')).not.toBeInTheDocument()
  })
})
