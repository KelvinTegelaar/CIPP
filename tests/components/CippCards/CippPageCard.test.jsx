import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import CippPageCard from '../../../src/components/CippCards/CippPageCard'

describe('CippPageCard', () => {
  it('renders title and children', () => {
    renderWithProviders(
      <CippPageCard title="Test Page Title">
        <div>Child content</div>
      </CippPageCard>
    )
    expect(screen.getByText('Test Page Title')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('does not render heading when hideTitleText is true', () => {
    renderWithProviders(
      <CippPageCard title="Hidden Title" hideTitleText={true}>
        <div>Child content</div>
      </CippPageCard>
    )
    expect(screen.queryByRole('heading', { name: 'Hidden Title' })).not.toBeInTheDocument()
    expect(screen.queryByText('Hidden Title')).not.toBeInTheDocument()
  })

  it('renders infoBar when provided', () => {
    renderWithProviders(
      <CippPageCard title="Page With InfoBar" infoBar={<div>Info bar content</div>}>
        <div>Child content</div>
      </CippPageCard>
    )
    expect(screen.getByText('Info bar content')).toBeInTheDocument()
  })
})
