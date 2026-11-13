import React from 'react'
import { renderWithProviders } from '../../test-utils'
import { screen, waitFor } from '@testing-library/react'
import { CippMobileTenantPicker } from '../../../src/components/CippComponents/CippMobileTenantPicker'
import { tenantsContosoFabrikam } from '../../mocks/fixtures'

const routerState = vi.hoisted(() => ({ router: null }))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: ({ url }) => ({
    isSuccess: true,
    isFetching: false,
    isError: false,
    data:
      url === '/api/ListTenantGroups'
        ? { Results: [{ Id: 'g1', Name: 'Managed' }] }
        : tenantsContosoFabrikam,
  }),
}))

vi.mock('next/router', () => ({
  useRouter: () => routerState.router,
}))

const makeSettings = (overrides = {}) => ({
  currentTenant: 'fabrikam.com',
  currentTheme: { value: 'light', label: 'light' },
  paletteMode: 'light',
  direction: 'ltr',
  pinNav: true,
  handleUpdate: vi.fn(),
  handleReset: () => {},
  isCustom: false,
  ...overrides,
})

describe('CippMobileTenantPicker', () => {
  beforeEach(() => {
    routerState.router = {
      isReady: true,
      pathname: '/',
      query: {},
      replace: vi.fn(),
    }
  })

  it.each([
    ['default domain', 'contoso.com'],
    ['customerId', '11111111-aaaa-bbbb-cccc-000000000001'],
    ['initial domain', 'contoso.onmicrosoft.com'],
  ])(
    'applies a deep-linked tenant (%s) to settings',
    async (_kind, urlTenant) => {
      routerState.router.query = { tenantFilter: urlTenant }
      const settings = makeSettings()
      renderWithProviders(<CippMobileTenantPicker />, { settings })

      await waitFor(() => {
        expect(settings.handleUpdate).toHaveBeenCalledWith({
          currentTenant: 'contoso.com',
        })
      })
    }
  )

  it('applies a deep-linked tenant group to settings and shows its name', async () => {
    routerState.router.query = { tenantGroup: 'g1' }
    const settings = makeSettings()
    renderWithProviders(<CippMobileTenantPicker />, { settings })

    await waitFor(() => {
      expect(settings.handleUpdate).toHaveBeenCalledWith({
        currentTenant: 'group:g1',
      })
    })
    expect(screen.getByRole('button', { name: 'Select tenant' })).toHaveTextContent('Managed')
  })

  it('leaves settings alone for an unknown or already-current tenant', () => {
    for (const urlTenant of ['nope.example.com', 'fabrikam.com']) {
      routerState.router.query = { tenantFilter: urlTenant }
      const settings = makeSettings()
      renderWithProviders(<CippMobileTenantPicker />, { settings })
      expect(settings.handleUpdate).not.toHaveBeenCalled()
    }
  })
})
