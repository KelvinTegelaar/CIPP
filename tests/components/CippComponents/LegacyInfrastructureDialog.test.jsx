import React from 'react'
import { act, fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { LegacyInfrastructureDialog } from '../../../src/components/CippComponents/LegacyInfrastructureDialog'

// Exact JSON Invoke-GetCippAlerts returns on a legacy Function App instance
// (Get-CIPPLegacyInfrastructureNotice), after serialisation by the Functions worker.
const legacyNotice = {
  Alert:
    'This CIPP instance is running on the legacy Function App infrastructure, which no longer receives updates starting December 2026. The new infrastructure is a single container that is faster, more reliable, cheaper to run and keeps itself up to date automatically. Migrate now to keep receiving new features and fixes. The migration keeps your storage account and Key Vault, so your configuration carries across.',
  active: false,
  linkText: 'Migration guide',
  endTime: null,
  noticeId: 'legacy-function-app-infrastructure',
  startTime: null,
  maintenance: true,
  title: 'Legacy infrastructure',
  dismissible: false,
  prominent: true,
  blocking: true,
  cutoff: '2026-12-01T00:00:00Z',
  type: 'warning',
  link: 'https://docs.cipp.app/setup/maintaining-cipp/migrating-to-the-new-infrastructure',
}

const SNOOZE_KEY = 'cipp_legacy_infrastructure_snoozed:legacy-function-app-infrastructure'

describe('LegacyInfrastructureDialog', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-14T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens for a blocking notice and only lets people continue after the countdown', () => {
    renderWithProviders(<LegacyInfrastructureDialog alert={legacyNotice} />)

    const dialog = screen.getByRole('dialog', { name: 'This CIPP instance must be migrated' })
    expect(dialog).toHaveTextContent(/no longer receives updates starting December 2026/)
    expect(dialog).toHaveTextContent(/faster/)

    const guide = screen.getByRole('link', { name: 'Migration guide' })
    expect(guide).toHaveAttribute('href', legacyNotice.link)
    expect(guide).toHaveAttribute('target', '_blank')

    const continueButton = screen.getByRole('button', { name: /Continue without migrating/ })
    expect(continueButton).toBeDisabled()
    expect(continueButton).toHaveTextContent('(10)')

    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(screen.getByRole('button', { name: /Continue without migrating/ })).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    const unlocked = screen.getByRole('button', { name: 'Continue without migrating' })
    expect(unlocked).toBeEnabled()

    fireEvent.click(unlocked)
    expect(Number(window.localStorage.getItem(SNOOZE_KEY))).toBe(Date.now())
  })

  it('stays closed while a recent snooze is in force', () => {
    window.localStorage.setItem(SNOOZE_KEY, String(Date.now() - 60 * 60 * 1000))
    renderWithProviders(<LegacyInfrastructureDialog alert={legacyNotice} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('comes back once the snooze has expired', () => {
    window.localStorage.setItem(SNOOZE_KEY, String(Date.now() - 9 * 60 * 60 * 1000))
    renderWithProviders(<LegacyInfrastructureDialog alert={legacyNotice} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('gets more insistent once the cutoff has passed', () => {
    vi.setSystemTime(new Date('2026-12-02T12:00:00Z'))
    renderWithProviders(<LegacyInfrastructureDialog alert={legacyNotice} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent(/no longer receives updates\./)
    expect(dialog).toHaveTextContent(/returns every 1 hour/)
    expect(screen.getByRole('button', { name: /Continue without migrating/ })).toHaveTextContent(
      '(30)'
    )
  })

  it('renders nothing for a notice that is not blocking, or no notice at all', () => {
    const { unmount } = renderWithProviders(
      <LegacyInfrastructureDialog alert={{ ...legacyNotice, blocking: false }} />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    unmount()

    renderWithProviders(<LegacyInfrastructureDialog alert={null} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
