import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippBulkRoomDrawer } from '../../../src/components/CippComponents/CippBulkRoomDrawer'
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
vi.mock('../../../src/components/CSVReader', () => ({
  default: ({ onDrop }) => (
    <div>
      <button type="button" onClick={() => onDrop(rows)}>
        drop csv
      </button>
      <button type="button" onClick={() => onDrop(badRows)}>
        drop bad csv
      </button>
    </div>
  ),
}))
const rows = [
  { displayName: 'Boardroom', username: 'boardroom', domain: 'contoso.onmicrosoft.com', resourceCapacity: '12' },
  { displayName: 'Huddle Room 1', username: 'huddle1', domain: 'contoso.onmicrosoft.com', resourceCapacity: '' },
]
const badRows = [
  { displayName: 'Lounge', username: 'lounge', domain: 'contoso.onmicrosoft.com', resourceCapacity: 'lots' },
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

async function openDrawer(user) {
  await user.click(screen.getByRole('button', { name: 'Bulk Add Rooms' }))
}

describe('CippBulkRoomDrawer', () => {
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
    renderWithProviders(<CippBulkRoomDrawer />, {
      settings: settingsWith({ currentTenant: 'contoso.onmicrosoft.com' }),
    })
  })

  it('ships an example CSV with the AddRoomMailbox columns', async () => {
    const user = userEvent.setup()
    await openDrawer(user)
    const href = screen.getByRole('link', { name: 'Download Example CSV' }).getAttribute('href')
    const csv = decodeURIComponent(href.split(',').slice(1).join(',')).replace(/^\uFEFF/, '')
    const [header, ...body] = csv.trim().split('\n')

    expect(header).toBe('displayName,username,domain,resourceCapacity')
    expect(body).toHaveLength(2)
  }, 30000)

  it('assembles the UPN and only sends resourceCapacity when the cell is filled', async () => {
    const user = userEvent.setup()
    await openDrawer(user)
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    await user.click(screen.getByRole('button', { name: 'Create Rooms' }))

    expect(mutateSpy).toHaveBeenCalledTimes(1)
    const call = mutateSpy.mock.calls[0][0]
    expect(call.url).toBe('/api/AddRoomMailbox')
    expect(call.bulkRequest).toBe(true)
    expect(call.data[0]).toEqual({
      tenantID: 'contoso.onmicrosoft.com',
      domain: 'contoso.onmicrosoft.com',
      displayName: 'Boardroom',
      username: 'boardroom',
      userPrincipalName: 'boardroom@contoso.onmicrosoft.com',
      resourceCapacity: '12',
    })
    // The backend treats an empty capacity as unset, so the key is left out like the single drawer does.
    expect(call.data[1]).not.toHaveProperty('resourceCapacity')
  }, 30000)

  it('flags a row whose resource capacity is not a whole number and blocks submit', async () => {
    const user = userEvent.setup()
    await openDrawer(user)
    await user.click(screen.getByRole('button', { name: 'drop bad csv' }))

    expect(screen.getByText(/1 row is missing .* whole number/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Rooms' })).toBeDisabled()
  }, 30000)
})
