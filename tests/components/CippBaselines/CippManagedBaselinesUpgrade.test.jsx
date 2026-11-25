import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippManagedBaselinesUpgrade } from '../../../src/components/CippBaselines/CippManagedBaselinesUpgrade'
import extensions from '../../../src/data/Extensions.json'

// The component reads the payment portal address from the extension's own entry.
const entry = extensions.find(
  (extension) => extension.id === 'CyberDrainManagedBaselines'
)

describe('CippManagedBaselinesUpgrade', () => {
  afterEach(() => {
    entry.upgradeUrl = ''
  })

  it('explains the service and sends a partner who has a key to the extension', () => {
    renderWithProviders(<CippManagedBaselinesUpgrade />)

    expect(
      screen.getByRole('heading', {
        name: 'Let CyberDrain manage your baselines',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('A custom baseline for your MSP')
    ).toBeInTheDocument()
    expect(screen.getByText('How it works')).toBeInTheDocument()
    expect(
      screen.getByText('Turn on the integration and enter your key.')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'I already have a key' })
    ).toHaveAttribute(
      'href',
      '/cipp/integrations/configure?id=CyberDrainManagedBaselines'
    )
  })

  it('keeps the upgrade button disabled while there is no payment portal address', () => {
    renderWithProviders(<CippManagedBaselinesUpgrade />)

    expect(
      screen.getByRole('button', { name: 'Upgrade to Managed Baselines' })
    ).toBeDisabled()
  })

  it('opens the payment portal in a new tab once its address is set', () => {
    entry.upgradeUrl = 'https://buy.example/portal'

    renderWithProviders(<CippManagedBaselinesUpgrade />)

    const link = screen.getByRole('link', {
      name: 'Upgrade to Managed Baselines',
    })
    expect(link).toHaveAttribute('href', 'https://buy.example/portal')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
