import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test-utils'
import { CippPropertyList } from '../../../src/components/CippComponents/CippPropertyList'

const sampleItems = [
  { label: 'Name', value: 'John Doe' },
  { label: 'Email', value: 'john@contoso.com' },
  { label: 'Department', value: 'Engineering' },
  { label: 'Location', value: 'Seattle' },
]

describe('CippPropertyList', () => {
  it('renders all property items in single layout', () => {
    renderWithTheme(<CippPropertyList propertyItems={sampleItems} layout="single" />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('john@contoso.com')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Seattle')).toBeInTheDocument()
  })

  it('renders skeletons when isFetching', () => {
    // Use layout="dual", in that branch the Skeleton is not overridden by item spread,
    // so MuiSkeleton-root elements are reliably rendered (one per item across both columns).
    const { container } = renderWithTheme(
      <CippPropertyList propertyItems={sampleItems} isFetching={true} layout="dual" />
    )

    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBe(sampleItems.length)
  })

  it('renders in dual-column layout with all items present', () => {
    renderWithTheme(<CippPropertyList propertyItems={sampleItems} layout="dual" />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('john@contoso.com')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Seattle')).toBeInTheDocument()
  })

  it('renders empty when no items provided', () => {
    const { container } = renderWithTheme(<CippPropertyList propertyItems={[]} />)

    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBe(0)
    sampleItems.forEach((item) => {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument()
      expect(screen.queryByText(item.value)).not.toBeInTheDocument()
    })
  })
})
