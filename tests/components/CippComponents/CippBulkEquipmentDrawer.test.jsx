import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippBulkEquipmentDrawer } from '../../../src/components/CippComponents/CippBulkEquipmentDrawer'
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
    <button type="button" onClick={() => onDrop(rows)}>
      drop csv
    </button>
  ),
}))
const rows = [{ displayName: 'Projector 1', username: ' projector1 ', domain: 'contoso.onmicrosoft.com' }]
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

describe('CippBulkEquipmentDrawer', () => {
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
    renderWithProviders(<CippBulkEquipmentDrawer />, {
      settings: settingsWith({ currentTenant: 'contoso.onmicrosoft.com' }),
    })
  })

  it('ships an example CSV with the AddEquipmentMailbox columns', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Bulk Add Equipment' }))
    const href = screen.getByRole('link', { name: 'Download Example CSV' }).getAttribute('href')
    const csv = decodeURIComponent(href.split(',').slice(1).join(',')).replace(/^\uFEFF/, '')
    const [header, ...body] = csv.trim().split('\n')

    expect(header).toBe('displayName,username,domain')
    expect(body).toHaveLength(2)
  }, 30000)

  it('posts one AddEquipmentMailbox request per row with the UPN assembled from username and domain', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Bulk Add Equipment' }))
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    await user.click(screen.getByRole('button', { name: 'Create Equipment Mailboxes' }))

    expect(mutateSpy).toHaveBeenCalledTimes(1)
    const call = mutateSpy.mock.calls[0][0]
    expect(call.url).toBe('/api/AddEquipmentMailbox')
    expect(call.bulkRequest).toBe(true)
    // Whitespace around a CSV cell must not end up inside the address.
    expect(call.data).toEqual([
      {
        tenantID: 'contoso.onmicrosoft.com',
        domain: 'contoso.onmicrosoft.com',
        displayName: 'Projector 1',
        username: 'projector1',
        userPrincipalName: 'projector1@contoso.onmicrosoft.com',
      },
    ])
  }, 30000)
})
