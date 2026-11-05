import React from 'react'
import { renderWithProviders } from '../../test-utils'
import { waitFor } from '@testing-library/react'
import { CippMobileTenantPicker } from '../../../src/components/CippComponents/CippMobileTenantPicker'
import { tenantsContosoFabrikam } from '../../mocks/fixtures'

const routerState = vi.hoisted(() => ({ router: null }))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: () => ({
    isSuccess: true,
    isFetching: false,
    isError: false,
    data: tenantsContosoFabrikam,
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

  it('leaves settings alone for an unknown or already-current tenant', () => {
    for (const urlTenant of ['nope.example.com', 'fabrikam.com']) {
      routerState.router.query = { tenantFilter: urlTenant }
      const settings = makeSettings()
      renderWithProviders(<CippMobileTenantPicker />, { settings })
      expect(settings.handleUpdate).not.toHaveBeenCalled()
    }
  })
})
