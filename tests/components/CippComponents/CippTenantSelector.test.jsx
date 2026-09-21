import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippTenantSelector } from '../../../src/components/CippComponents/CippTenantSelector'
import { tenantsContosoFabrikam } from '../../mocks/fixtures'

// url-keyed api state + per-test router, both hoisted for the mock factories
const apiState = vi.hoisted(() => ({ tenants: {}, details: {}, urls: [] }))
const routerState = vi.hoisted(() => ({ router: null }))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiPostCall: () => ({
    mutate: () => {},
    isPending: false,
    isSuccess: false,
    isIdle: true,
    isError: false,
    data: undefined,
    reset: () => {},
  }),
  ApiGetCallWithPagination: () => ({
    isSuccess: false,
    isPending: true,
    isFetching: false,
    isError: false,
    data: undefined,
  }),
  ApiGetCall: ({ url }) => {
    apiState.urls.push(url)
    if (url === '/api/listTenants') {
      return apiState.tenants
    }
    return apiState.details
  },
}))

vi.mock('next/router', () => ({
  useRouter: () => routerState.router,
}))

const result = (overrides = {}) => ({
  isLoading: false,
  isFetching: false,
  isError: false,
  isSuccess: true,
  error: null,
  data: undefined,
  refetch: vi.fn(),
  ...overrides,
})

const makeSettings = (overrides = {}) => ({
  currentTenant: null,
  currentTheme: { value: 'light', label: 'light' },
  paletteMode: 'light',
  direction: 'ltr',
  pinNav: true,
  handleUpdate: vi.fn(),
  handleReset: () => {},
  isCustom: false,
  ...overrides,
})

describe('CippTenantSelector', () => {
  beforeEach(() => {
    apiState.tenants = result({ data: tenantsContosoFabrikam })
    apiState.details = result()
    apiState.urls = []
    routerState.router = {
      isReady: true,
      pathname: '/',
      query: {},
      replace: vi.fn(),
      push: vi.fn(),
      events: { on: () => {}, off: () => {}, emit: () => {} },
    }
  })

  it('resolves the url tenant to its display label and syncs settings', async () => {
    routerState.router.query = { tenantFilter: 'contoso.com' }
    const settings = makeSettings()
    renderWithProviders(<CippTenantSelector />, { settings })

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Contoso (contoso.com)')
    })
    expect(settings.handleUpdate).toHaveBeenCalledWith({ currentTenant: 'contoso.com' })
  })

  it('normalizes a customerId hotlink to the default domain in the url', async () => {
    routerState.router.query = {
      tenantFilter: '11111111-aaaa-bbbb-cccc-000000000001',
    }
    renderWithProviders(<CippTenantSelector />, { settings: makeSettings() })

    await waitFor(() => {
      expect(routerState.router.replace).toHaveBeenCalledWith(
        { pathname: '/', query: { tenantFilter: 'contoso.com' } },
        undefined,
        { shallow: true }
      )
    })
  })

  it('falls back to Invalid Tenant when the url tenant is unknown', async () => {
    routerState.router.query = { tenantFilter: 'nope.example.com' }
    renderWithProviders(<CippTenantSelector />, { settings: makeSettings() })

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Invalid Tenant')
    })
  })

  it('disables the selector and surfaces the error when the tenant list fails', () => {
    apiState.tenants = result({
      isSuccess: false,
      isError: true,
      error: { message: 'network down' },
    })
    renderWithProviders(<CippTenantSelector />, { settings: makeSettings() })

    const combobox = screen.getByRole('combobox')
    expect(combobox).toBeDisabled()
    expect(combobox.getAttribute('placeholder')).toMatch(/Error loading Tenants/)
  })

  it('refetches the tenant list from the refresh button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippTenantSelector refreshButton />, { settings: makeSettings() })

    await user.click(screen.getByRole('button', { name: 'refresh' }))
    expect(apiState.tenants.refetch).toHaveBeenCalledTimes(1)
  })

  it('filters portal links by settings in the tenant offcanvas', async () => {
    const user = userEvent.setup()
    routerState.router.query = { tenantFilter: 'contoso.com' }
    apiState.details = result({ data: { displayName: 'Contoso' } })
    const settings = makeSettings({
      currentTenant: 'contoso.com',
      portalLinks: { M365_Portal: false },
    })
    renderWithProviders(<CippTenantSelector tenantButton />, { settings })

    const infoButton = screen.getByRole('button', { name: 'tenantOffCanvas' })
    await waitFor(() => {
      expect(infoButton).toBeEnabled()
    })
    await user.click(infoButton)

    await waitFor(() => {
      expect(screen.getByText('Manage Tenant')).toBeInTheDocument()
    })
    expect(screen.getByText('Entra Portal')).toBeInTheDocument()
    expect(screen.queryByText('M365 Admin Portal')).not.toBeInTheDocument()
  })
})
