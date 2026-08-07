import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import { CippDataTable } from '../../../src/components/CippTable/CippDataTable'

const basicData = [
  { displayName: 'Alice Smith', mail: 'alice@contoso.com', department: 'IT', accountEnabled: true },
  { displayName: 'Bob Johnson', mail: 'bob@contoso.com', department: 'Sales', accountEnabled: true },
  { displayName: 'Carol Williams', mail: 'carol@contoso.com', department: 'HR', accountEnabled: false },
]

describe('CippDataTable', () => {
  it('renders table with static data', async () => {
    renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail', 'department']}
        maxHeightOffset="100px"
      />
    )

    // MRT uses row virtualization; jsdom has no layout engine so individual cells
    // are not rendered. Verify the table mounted and pagination reflects the 3 rows.
    await waitFor(() => {
      expect(screen.getByText('1-3 of 3')).toBeInTheDocument()
    })
  })

  it('renders title in card header', async () => {
    renderWithProviders(
      <CippDataTable
        data={basicData}
        title="User List"
        simpleColumns={['displayName', 'mail']}
        maxHeightOffset="100px"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('User List')).toBeInTheDocument()
    })
  })

  it('renders without card when noCard is true', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        noCard={true}
        simpleColumns={['displayName', 'mail']}
        maxHeightOffset="100px"
      />
    )

    expect(container.querySelector('.MuiCardHeader-root')).toBeNull()
  })

  it('renders in simple mode', async () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simple={true}
        simpleColumns={['displayName', 'mail', 'department']}
        maxHeightOffset="100px"
      />
    )

    // In simple mode the toolbar is hidden; the table element itself should still mount.
    await waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull()
    })

    expect(container.querySelector('tbody')).not.toBeNull()
  })

  // Loading skeleton test covered in CippDataTable.browser.test.jsx (requires real DOM layout)

  it('renders with actions menu button on rows', async () => {
    const mockFn = vi.fn()
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail', 'department']}
        actions={[{ label: 'View User', noConfirm: true, customFunction: mockFn }]}
        maxHeightOffset="100px"
      />
    )

    // When actions are provided, MRT renders a row-actions column.
    await waitFor(() => {
      const table = container.querySelector('table')
      expect(table).not.toBeNull()
    })

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders with hideTitle and no cardButton, no CardHeader', async () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        hideTitle={true}
        simpleColumns={['displayName', 'mail']}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('.MuiCardHeader-root')).toBeNull()
  })

  it('renders cardButton in card header', async () => {
    renderWithProviders(
      <CippDataTable
        data={basicData}
        title="Users"
        cardButton={<button>Add User</button>}
        simpleColumns={['displayName']}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument()
    })
  })

  it('renders ResourceUnavailable for non-array data', async () => {
    renderWithProviders(
      <CippDataTable
        data="not an array"
        incorrectDataMessage="Custom error message"
        simpleColumns={['displayName']}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
  })

  it('renders with offCanvas config', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail']}
        offCanvas={{
          title: 'User Details',
          extendedInfoFields: ['displayName', 'mail', 'department'],
        }}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('renders with custom columns instead of simpleColumns', async () => {
    // MRT uses virtualization and doesn't render column header text in jsdom (no layout engine).
    // Verify the table mounts without error when `columns` is provided instead of `simpleColumns`.
    const customColumns = [
      { id: 'displayName', header: 'Full Name', accessorKey: 'displayName' },
      { id: 'mail', header: 'Email Address', accessorKey: 'mail' },
    ]
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        columns={customColumns}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull()
    })
  })

  it('renders with defaultSorting', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail', 'department']}
        defaultSorting={[{ id: 'displayName', desc: true }]}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('renders noCard with non-array data shows ResourceUnavailable', () => {
    renderWithProviders(
      <CippDataTable
        data="invalid"
        noCard={true}
        incorrectDataMessage="Bad data format"
        simpleColumns={['displayName']}
        maxHeightOffset="100px"
      />
    )
    expect(screen.getByText('Bad data format')).toBeInTheDocument()
  })

  it('renders with nested property data', async () => {
    const nestedData = [
      { displayName: 'Alice', info: { email: 'alice@test.com' } },
      { displayName: 'Bob', info: { email: 'bob@test.com' } },
    ]
    const { container } = renderWithProviders(
      <CippDataTable
        data={nestedData}
        simpleColumns={['displayName', 'info.email']}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull()
    })
  })

  it('renders with offCanvas and actions combined', () => {
    const mockFn = vi.fn()
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail']}
        actions={[{ label: 'Edit', noConfirm: true, customFunction: mockFn }]}
        offCanvas={{
          title: 'Details',
          extendedInfoFields: ['displayName', 'mail'],
        }}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('renders with empty data array', async () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={[]}
        simpleColumns={['displayName', 'mail']}
        title="Empty Table"
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(screen.getByText('Empty Table')).toBeInTheDocument()
    })
  })

  it('renders with filters', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'department']}
        filters={[{ id: 'department', value: 'IT' }]}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  // slot semantics: cross-type table preset switch clears the outgoing type
  it('column preset clears a stale global filter left by a legacy untyped preset', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'department']}
        filters={[
          // untyped preset = legacy shape, lands its column array in the GLOBAL filter slot
          { filterName: 'Legacy IT', value: [{ id: 'department', value: 'IT' }] },
          { filterName: 'IT only', value: [{ id: 'department', value: 'IT' }], type: 'column' },
        ]}
        maxHeightOffset="100px"
      />
    )
    await screen.findByText('1-3 of 3')

    // legacy preset stringifies to "[object Object]" in the global filter, matches zero rows
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Legacy IT' }))
    await waitFor(() => {
      expect(screen.queryByText('1-3 of 3')).not.toBeInTheDocument()
    })

    // the column preset must not leave the stale global filter in place
    // Legacy IT preset is active here, button label is 'Filters (1)'
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))
    await waitFor(() => {
      expect(screen.getByText('1-1 of 1')).toBeInTheDocument()
    })
  }, 20000)

  it('renders with conditional actions', () => {
    const mockFn = vi.fn()
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'accountEnabled']}
        actions={[
          {
            label: 'Disable Account',
            noConfirm: true,
            customFunction: mockFn,
            condition: (row) => row.accountEnabled === true,
          },
        ]}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })
})
