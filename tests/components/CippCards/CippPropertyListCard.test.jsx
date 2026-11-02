import React from 'react'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippPropertyListCard } from '../../../src/components/CippCards/CippPropertyListCard'

const sampleItems = [
  { label: 'Display Name', value: 'Alice Smith' },
  { label: 'UPN', value: 'alice@contoso.com' },
]

describe('CippPropertyListCard', () => {
  it('renders title and property items', () => {
    renderWithProviders(
      <CippPropertyListCard title="User Details" propertyItems={sampleItems} />
    )
    expect(screen.getByText('User Details')).toBeInTheDocument()
    expect(screen.getByText('Display Name')).toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('UPN')).toBeInTheDocument()
    expect(screen.getByText('alice@contoso.com')).toBeInTheDocument()
  })

  it('renders skeletons when isFetching', () => {
    const { container } = renderWithProviders(
      <CippPropertyListCard title="Loading Card" propertyItems={sampleItems} isFetching={true} />
    )
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('splits items across two lists in dual-column layout', () => {
    const fourItems = [
      { label: 'Display Name', value: 'Alice Smith' },
      { label: 'UPN', value: 'alice@contoso.com' },
      { label: 'Department', value: 'Engineering' },
      { label: 'Office', value: 'Seattle' },
    ]
    const { container } = renderWithProviders(
      <CippPropertyListCard title="Dual Layout" propertyItems={fourItems} layout="dual" />
    )
    // scope to card content, the action list at the card bottom is also a MuiList
    const lists = container.querySelectorAll('.MuiCardContent-root .MuiList-root')
    expect(lists).toHaveLength(2)
    expect(within(lists[0]).getByText('Display Name')).toBeInTheDocument()
    expect(within(lists[0]).getByText('UPN')).toBeInTheDocument()
    expect(within(lists[0]).queryByText('Department')).not.toBeInTheDocument()
    expect(within(lists[1]).getByText('Department')).toBeInTheDocument()
    expect(within(lists[1]).getByText('Office')).toBeInTheDocument()
    expect(within(lists[1]).queryByText('Display Name')).not.toBeInTheDocument()
  })

  it('renders action button in card header', () => {
    renderWithProviders(
      <CippPropertyListCard
        title="Card With Action"
        propertyItems={sampleItems}
        actionButton={<button>Edit</button>}
      />
    )
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
  })

  it('renders card button in footer', () => {
    renderWithProviders(
      <CippPropertyListCard
        title="Card With Footer"
        propertyItems={sampleItems}
        cardButton={<button>View All</button>}
      />
    )
    expect(screen.getByRole('button', { name: /View All/i })).toBeInTheDocument()
  })

  it('opens confirmation dialog when action item is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippPropertyListCard
        title="User Details"
        propertyItems={sampleItems}
        data={{ id: '123' }}
        actionItems={[
          {
            label: 'Delete User',
            type: 'POST',
            url: '/api/RemoveUser',
            data: { ID: 'id' },
            confirmText: 'Are you sure you want to delete this user?',
          },
        ]}
      />
    )
    await user.click(screen.getByText('Delete User'))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Confirmation')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Are you sure you want to delete this user?')
    ).toBeInTheDocument()
  })

  it('disables action item when condition returns false', () => {
    renderWithProviders(
      <CippPropertyListCard
        title="User Details"
        propertyItems={sampleItems}
        data={{ id: '123' }}
        actionItems={[
          {
            label: 'Delete User',
            type: 'POST',
            url: '/api/RemoveUser',
            condition: () => false,
          },
        ]}
      />
    )
    expect(screen.getByRole('button', { name: 'Delete User' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})
