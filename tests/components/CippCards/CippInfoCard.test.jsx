import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test-utils'
import { CippInfoCard } from '../../../src/components/CippCards/CippInfoCard'

describe('CippInfoCard', () => {
  it('renders label and value', () => {
    renderWithTheme(<CippInfoCard label="Total Users" value={1234} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('renders action link with href', () => {
    renderWithTheme(
      <CippInfoCard label="Total Users" value={1234} actionLink="/users" actionText="View All" />
    )
    const link = screen.getByRole('link', { name: /View All/i })
    expect(link).toHaveAttribute('href', '/users')
  })

  it('renders skeletons when isFetching', () => {
    const { container } = renderWithTheme(
      <CippInfoCard label="Total Users" value={1234} isFetching={true} />
    )
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
