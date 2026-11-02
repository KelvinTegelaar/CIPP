import React from 'react'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import CippDataTableButton from '../../../src/components/CippTable/CippDataTableButton'
import { ApiGetCallWithPagination } from '../../../src/api/ApiCall'
import { api, paginatedResult } from '../../mocks/api-call'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())

const idlePaginated = paginatedResult([], { isSuccess: false })
const relatedRows = [{ id: 'rel-1', name: 'Related one' }]
const relatedResult = paginatedResult(relatedRows)

describe('CippDataTableButton', () => {
  beforeEach(() => {
    ApiGetCallWithPagination.mockClear()
    api.paginated = (opts) =>
      opts?.url === '/api/TestRelated' ? relatedResult : idlePaginated
  })

  it('shows item count and opens dialog on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTableButton
        title="View List"
        data={[
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ]}
        tableTitle="Items List"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('2 items')

    await user.click(button)

    const root = within(document.body)
    await waitFor(() => {
      expect(root.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('shows item count for object data', () => {
    renderWithProviders(
      <CippDataTableButton
        title="View Details"
        data={{
          'Display Name': 'John Doe',
          Email: 'john@example.com',
        }}
        tableTitle="User Details"
      />
    )
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('maps object entries to key/value rows in the dialog', async () => {
    // MRT virtualization renders no body cells in jsdom, so pin the row count via
    // pagination; the translated key text is asserted in the ObjectData story play
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTableButton
        title="View Details"
        data={{
          userPrincipalName: 'john@example.com',
          displayName: 'John Doe',
        }}
        tableTitle="User Details"
      />
    )

    await user.click(screen.getByRole('button'))

    const root = within(document.body)
    await waitFor(() => {
      expect(root.getByRole('dialog')).toBeInTheDocument()
    })

    // 2 object keys -> 2 key/value rows
    const dialog = within(root.getByRole('dialog'))
    await waitFor(() => {
      expect(dialog.getByText('1-2 of 2')).toBeInTheDocument()
    })
  })

  it('shows disabled button for empty data', () => {
    renderWithProviders(
      <CippDataTableButton title="No Data" data={null} />
    )
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('No items')
    expect(button).toBeDisabled()
  })

  it('does not fetch live related data until the button is clicked', async () => {
    const user = userEvent.setup()
    const parentRow = { id: 'parent-1', displayName: 'Finance' }

    renderWithProviders(
      <CippDataTableButton
        row={parentRow}
        label="View"
        title="Related for [displayName]"
        queryKey="related-[id]"
        api={{
          url: '/api/TestRelated',
          data: { someId: '[id]' },
          dataKey: 'Results',
        }}
        simpleColumns={['name']}
      />
    )

    expect(screen.getByRole('button', { name: 'View' })).toBeEnabled()
    expect(
      ApiGetCallWithPagination.mock.calls.some((call) => call[0]?.url === '/api/TestRelated')
    ).toBe(false)

    await user.click(screen.getByRole('button', { name: 'View' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    await waitFor(() => {
      expect(
        ApiGetCallWithPagination.mock.calls.some((call) => call[0]?.url === '/api/TestRelated')
      ).toBe(true)
    })

    const relatedCall = ApiGetCallWithPagination.mock.calls.find(
      (call) => call[0]?.url === '/api/TestRelated'
    )
    expect(relatedCall[0].data.someId).toBe('parent-1')
    expect(relatedCall[0].queryKey).toBe('related-parent-1')
  })

  it('disables the live button when condition is false', () => {
    renderWithProviders(
      <CippDataTableButton
        row={{ id: 'parent-1' }}
        label="View"
        condition={(row) => row.id === 'other'}
        api={{ url: '/api/TestRelated', dataKey: 'Results' }}
      />
    )
    expect(screen.getByRole('button', { name: 'View' })).toBeDisabled()
  })
})
