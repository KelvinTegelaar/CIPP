import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import { CippStructuredTooltip } from '../../src/components/CippComponents/CippStructuredTooltip'

describe('CippStructuredTooltip', () => {
  it('renders the children alone when there is nothing to show', () => {
    renderWithProviders(
      <CippStructuredTooltip items={[{ label: 'Company', value: '' }]}>
        <span>Acme</span>
      </CippStructuredTooltip>
    )
    expect(screen.getByText('Acme').parentElement.tagName).not.toBe('SPAN')
  })

  it('shows the title, description and non-empty rows on hover', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippStructuredTooltip
        title="Acme"
        description="Backup vendor"
        items={[
          { label: 'Company', value: 'Acme Inc.' },
          { label: 'Tags', value: ['Backup', 'MSP'] },
          { label: 'Empty', value: null },
        ]}
      >
        <span>cell</span>
      </CippStructuredTooltip>
    )
    await user.hover(screen.getByText('cell'))
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Backup vendor')).toBeInTheDocument()
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument()
    expect(screen.getByText('Backup, MSP')).toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
  })

  it('links only http(s) hrefs', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippStructuredTooltip
        items={[
          { label: 'Website', value: 'https://acme.example', href: 'https://acme.example' },
          { label: 'Script', value: 'click me', href: 'javascript:alert(1)' },
        ]}
      >
        <span>cell</span>
      </CippStructuredTooltip>
    )
    await user.hover(screen.getByText('cell'))
    const link = await screen.findByRole('link', { name: 'https://acme.example' })
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('link', { name: 'click me' })).not.toBeInTheDocument()
  })
})
