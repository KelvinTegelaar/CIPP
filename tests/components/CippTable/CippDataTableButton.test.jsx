import React from 'react'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import CippDataTableButton from '../../../src/components/CippTable/CippDataTableButton'

describe('CippDataTableButton', () => {
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
})
