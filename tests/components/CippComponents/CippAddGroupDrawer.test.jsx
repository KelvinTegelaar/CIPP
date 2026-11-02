import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippAddGroupDrawer } from '../../../src/components/CippComponents/CippAddGroupDrawer'
import { ApiGetCall, ApiPostCall, ApiGetCallWithPagination } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(),
}))

// Same stubs as CippAddUserDrawer.test.jsx: the user/license pickers and the data-table and
// JSON-view graphs exhaust the test worker and play no part in the submit flow. The domain
// selector stays real.
vi.mock('../../../src/components/CippComponents/CippFormUserSelector', () => ({
  CippFormUserSelector: () => <div data-testid="CippFormUserSelector" />,
  default: () => <div data-testid="CippFormUserSelector" />,
}))
vi.mock('../../../src/components/CippComponents/CippFormLicenseSelector', () => ({
  CippFormLicenseSelector: () => <div data-testid="CippFormLicenseSelector" />,
  default: () => <div data-testid="CippFormLicenseSelector" />,
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="CippDataTable" />,
  default: () => <div data-testid="CippDataTable" />,
}))
vi.mock('../../../src/components/CippFormPages/CippJSONView', () => ({
  default: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, children, footer }) =>
    visible ? (
      <div data-testid="CippOffCanvas">
        {children}
        {footer}
      </div>
    ) : null,
}))

const idleGet = { isSuccess: false, isFetching: false, isError: false, data: undefined, refetch: vi.fn() }
const tenantDomains = {
  isSuccess: true,
  isFetching: false,
  isError: false,
  data: {
    pages: [{ Results: [{ id: 'testdomain.com', isDefault: true, isInitial: false, isVerified: true }] }],
  },
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
}

let mutateSpy

describe('CippAddGroupDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutateSpy = vi.fn()
    ApiGetCall.mockImplementation(() => idleGet)
    ApiGetCallWithPagination.mockImplementation(({ url }) =>
      url === '/api/ListGraphRequest' ? tenantDomains : { ...idleGet, fetchNextPage: vi.fn() }
    )
    ApiPostCall.mockImplementation(() => ({
      isPending: false,
      isSuccess: false,
      isError: false,
      mutate: mutateSpy,
    }))
  })

  const openAndFill = async (user) => {
    await user.click(screen.getByRole('button', { name: 'Add Group' }))
    await waitFor(() => {
      expect(screen.getByLabelText(/Primary Domain name/i, { selector: 'input' })).toHaveValue(
        'testdomain.com'
      )
    })
    await user.type(screen.getByLabelText(/Display Name/i, { selector: 'input' }), 'Sales')
  }

  it('posts to /api/AddGroup for the current tenant and refreshes the Groups list key', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippAddGroupDrawer />, { settings: settingsWith({}) })
    await openAndFill(user)

    const createButton = screen.getByRole('button', { name: 'Create Group' })
    await waitFor(() => expect(createButton).toBeEnabled())
    await user.click(createButton)

    expect(mutateSpy).toHaveBeenCalledTimes(1)
    const { url, data } = mutateSpy.mock.calls[0][0]
    const tenant = data.tenantFilter
    expect(url).toBe('/api/AddGroup')
    expect(tenant).toBeTruthy()
    expect(tenant).not.toBe('AllTenants')
    expect(data).toMatchObject({ displayName: 'Sales', primDomain: { value: 'testdomain.com' } })
    // Must match the Groups list queryKey (lowercase), or new groups never appear
    expect(ApiPostCall).toHaveBeenCalledWith(
      expect.objectContaining({ relatedQueryKeys: [`groups-${tenant}`] })
    )
  }, 30000)

  it('warns and keeps Create disabled under All Tenants', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippAddGroupDrawer />, {
      settings: settingsWith({ currentTenant: 'AllTenants' }),
    })
    await openAndFill(user)

    expect(screen.getByText(/single-tenant only/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Group' })).toBeDisabled()
  }, 30000)
})
