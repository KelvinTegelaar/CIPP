import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../../test-utils'
import { CippInfoBar } from '../../../src/components/CippCards/CippInfoBar'

const sampleData = [
  { name: 'Total Users', data: '1,234' },
  { name: 'Licensed', data: '1,100' },
  { name: 'Guests', data: '134' },
  { name: 'Blocked', data: '12' },
]

describe('CippInfoBar', () => {
  it('renders all info items', () => {
    renderWithTheme(<CippInfoBar data={sampleData} isFetching={false} />)
    for (const item of sampleData) {
      expect(screen.getByText(item.name)).toBeInTheDocument()
      expect(screen.getByText(item.data)).toBeInTheDocument()
    }
  })

  it('renders skeletons when isFetching', () => {
    const { container } = renderWithTheme(<CippInfoBar data={sampleData} isFetching={true} />)
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBe(sampleData.length)
  })

  it('shows tooltip text on hover', async () => {
    const user = userEvent.setup()
    const dataWithTooltip = [
      { name: 'Total Users', data: '1,234', toolTip: 'Total number of users' },
      { name: 'Licensed', data: '1,100' },
    ]
    renderWithTheme(<CippInfoBar data={dataWithTooltip} isFetching={false} />)
    await user.hover(screen.getByText('Total Users'))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Total number of users')
  })

  it('opens offcanvas with property content when item is clicked', async () => {
    const user = userEvent.setup()
    const dataWithOffcanvas = [
      {
        name: 'Blocked',
        data: '12',
        offcanvas: {
          title: 'Blocked Users',
          propertyItems: [{ label: 'Most Recent', value: 'bob@contoso.com' }],
        },
      },
    ]
    renderWithTheme(<CippInfoBar data={dataWithOffcanvas} isFetching={false} />)
    expect(screen.queryByText('bob@contoso.com')).not.toBeInTheDocument()

    await user.click(screen.getByText('Blocked'))

    expect(await screen.findByText('bob@contoso.com')).toBeInTheDocument()
    expect(screen.getByText('Most Recent')).toBeInTheDocument()
    // title renders in drawer header and property card header
    expect(screen.getAllByText('Blocked Users').length).toBeGreaterThan(0)
  })
})
