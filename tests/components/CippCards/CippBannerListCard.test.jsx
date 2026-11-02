import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippBannerListCard } from '../../../src/components/CippCards/CippBannerListCard'

const sampleItems = [
  {
    id: '1',
    cardLabelBox: 'A',
    text: 'First Item',
    subtext: 'Description of first item',
    statusText: 'Active',
    statusColor: 'success.main',
  },
  {
    id: '2',
    cardLabelBox: { cardLabelBoxHeader: 'B', cardLabelBoxText: 'Label' },
    text: 'Second Item',
    subtext: 'Description of second item',
  },
]

describe('CippBannerListCard', () => {
  it('renders all items with text and subtext', () => {
    renderWithProviders(<CippBannerListCard items={sampleItems} />)
    expect(screen.getByText('First Item')).toBeInTheDocument()
    expect(screen.getByText('Description of first item')).toBeInTheDocument()
    expect(screen.getByText('Second Item')).toBeInTheDocument()
    expect(screen.getByText('Description of second item')).toBeInTheDocument()
  })

  it('renders status text when provided', () => {
    renderWithProviders(<CippBannerListCard items={sampleItems} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders object-style cardLabelBox with header and text', () => {
    renderWithProviders(<CippBannerListCard items={sampleItems} />)
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('renders "No items available." when items is empty', () => {
    renderWithProviders(<CippBannerListCard items={[]} />)
    expect(screen.getByText('No items available.')).toBeInTheDocument()
  })

  it('renders skeletons when isFetching', () => {
    const { container } = renderWithProviders(
      <CippBannerListCard items={sampleItems} isFetching={true} />
    )
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('handles checkbox selection and calls onSelectionChange with selected id', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    renderWithProviders(
      <CippBannerListCard
        items={sampleItems}
        onSelectionChange={onSelectionChange}
        selectedItems={[]}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(onSelectionChange).toHaveBeenCalledWith(['1'])
  })

  it('deselects a checked item and calls onSelectionChange with empty array', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    renderWithProviders(
      <CippBannerListCard
        items={sampleItems}
        onSelectionChange={onSelectionChange}
        selectedItems={['1']}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    await user.click(checkboxes[0])

    expect(onSelectionChange).toHaveBeenCalledWith([])
  })
})
