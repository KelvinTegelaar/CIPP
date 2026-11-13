import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippBulkSharedMailboxDrawer } from '../../../src/components/CippComponents/CippBulkSharedMailboxDrawer'
import { ApiGetCall, ApiPostCall, ApiGetCallWithPagination } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(),
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
// The reader is reduced to its drop callback; one row is CSV-shaped, the other carries the
// { label, value } object the manual dialog's domain selector produces.
vi.mock('../../../src/components/CSVReader', () => ({
  default: ({ onDrop }) => (
    <button type="button" onClick={() => onDrop(rows)}>
      drop csv
    </button>
  ),
}))
const rows = [
  { displayName: 'Sales', username: 'sales', domain: 'contoso.onmicrosoft.com' },
  {
    displayName: 'Support Desk',
    username: 'support',
    domain: { label: 'contoso.com', value: 'contoso.com' },
  },
]
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
let mutateSpy

const renderDrawer = (currentTenant = 'contoso.onmicrosoft.com') =>
  renderWithProviders(<CippBulkSharedMailboxDrawer />, {
    settings: settingsWith({ currentTenant }),
  })

describe('CippBulkSharedMailboxDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutateSpy = vi.fn()
    ApiGetCall.mockImplementation(() => idleGet)
    ApiGetCallWithPagination.mockImplementation(() => ({ ...idleGet, fetchNextPage: vi.fn() }))
    ApiPostCall.mockImplementation(() => ({
      isPending: false,
      isSuccess: false,
      isError: false,
      mutate: mutateSpy,
      reset: vi.fn(),
    }))
  })

  it('ships an example CSV with the AddSharedMailbox columns', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await user.click(screen.getByRole('button', { name: 'Bulk Add Shared Mailboxes' }))
    const href = screen.getByRole('link', { name: 'Download Example CSV' }).getAttribute('href')
    const csv = decodeURIComponent(href.split(',').slice(1).join(',')).replace(/^\uFEFF/, '')
    const [header, ...body] = csv.trim().split('\n')

    expect(header).toBe('displayName,username,domain')
    expect(body).toHaveLength(2)
  }, 30000)

  it('posts one AddSharedMailbox request per row with the single-drawer payload', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await user.click(screen.getByRole('button', { name: 'Bulk Add Shared Mailboxes' }))
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    await user.click(screen.getByRole('button', { name: 'Create Shared Mailboxes' }))

    expect(mutateSpy).toHaveBeenCalledTimes(1)
    const call = mutateSpy.mock.calls[0][0]
    expect(call.url).toBe('/api/AddSharedMailbox')
    expect(call.bulkRequest).toBe(true)
    expect(call.data[0]).toEqual({
      tenantID: 'contoso.onmicrosoft.com',
      displayName: 'Sales',
      username: 'sales',
      domain: 'contoso.onmicrosoft.com',
    })
    // A domain picked in the manual dialog is an option object; the backend wants the string.
    expect(call.data[1].domain).toBe('contoso.com')
  }, 30000)

  it('warns and blocks submit under All Tenants, where no tenant resolves for the create', async () => {
    const user = userEvent.setup()
    renderDrawer('AllTenants')

    await user.click(screen.getByRole('button', { name: 'Bulk Add Shared Mailboxes' }))
    await user.click(screen.getByRole('button', { name: 'drop csv' }))

    expect(screen.getByText(/single-tenant only/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Shared Mailboxes' })).toBeDisabled()
  }, 30000)
})
