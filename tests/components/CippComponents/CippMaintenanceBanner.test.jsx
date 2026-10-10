import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippMaintenanceBanner } from '../../../src/components/CippComponents/CippMaintenanceBanner'

// Exact JSON Invoke-GetCippAlerts returns on a legacy Function App instance
// (Get-CIPPLegacyInfrastructureNotice), after serialisation by the Functions worker.
const legacyNotice = {
  Alert:
    'This CIPP instance is running on the legacy Function App infrastructure, which will soon stop receiving updates. Migrate to the new infrastructure to keep receiving new features and fixes. The migration keeps your storage account and Key Vault, so your configuration carries across.',
  active: false,
  linkText: 'Migration guide',
  endTime: null,
  noticeId: 'legacy-function-app-infrastructure',
  startTime: null,
  maintenance: true,
  title: 'Legacy infrastructure',
  dismissible: false,
  type: 'warning',
  link: 'https://docs.cipp.app/setup/maintaining-cipp/migrating-to-the-new-infrastructure',
}

describe('CippMaintenanceBanner', () => {
  it('renders the legacy infrastructure notice without a dismiss control', () => {
    renderWithProviders(<CippMaintenanceBanner alert={legacyNotice} />)

    const banner = screen.getByRole('status', { name: 'Maintenance notice' })
    expect(banner).toHaveTextContent('Legacy infrastructure')
    expect(banner).toHaveTextContent(/legacy Function App infrastructure/)

    const guide = screen.getByRole('link', { name: 'Migration guide' })
    expect(guide).toHaveAttribute('href', legacyNotice.link)
    expect(guide).toHaveAttribute('target', '_blank')

    expect(
      screen.queryByRole('button', { name: 'Dismiss maintenance notice for 24 hours' })
    ).not.toBeInTheDocument()
    // No start/end time, so no "Live" chip or window text.
    expect(screen.queryByText('Live')).not.toBeInTheDocument()
  })

  it('renders nothing when there is no notice', () => {
    renderWithProviders(<CippMaintenanceBanner alert={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('is picked out of the alerts list the same way the layout does', () => {
    const alerts = [
      legacyNotice,
      { title: 'CIPP API Out of Date', Alert: 'x', type: 'warning' },
    ]
    expect(alerts.find((alert) => alert.maintenance === true)).toBe(legacyNotice)
    expect(alerts.filter((alert) => !alert.maintenance)).toHaveLength(1)
  })
})
