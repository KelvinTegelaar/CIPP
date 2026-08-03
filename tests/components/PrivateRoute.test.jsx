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
  it('shows unauthenticated page when the session request errors', async () => {
    // api reachable, session errored, unauthenticated page needs one settled query to render
    authState.swa = result({ isError: true, isSuccess: false, error: new Error('boom') })
    authState.me = result({ data: { message: 'Permission Denied' } })
    renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
    expect(screen.queryByText('app content')).not.toBeInTheDocument()
  })

  it('shows unauthenticated page when the session has no identity in either shape', async () => {
    // settled /.auth/me with neither clientPrincipal nor easyauth array
    authState.swa = result({ data: {} })
    authState.me = result({ isPending: true, isSuccess: false })
    renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
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

  it('shows unauthenticated page when only blocked roles remain', async () => {
    authState.swa = result({ data: swaPrincipal() })
    authState.me = result({ data: cippPrincipal(['anonymous', 'authenticated']) })
    renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
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

  it('stays latched unauthenticated while the session refetches', async () => {
    authState.swa = result({ data: {} })
    authState.me = result({ isPending: true, isSuccess: false })
    const { rerender } = renderRoute()

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
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

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Logging into CIPP')).not.toBeInTheDocument()
  })
})
