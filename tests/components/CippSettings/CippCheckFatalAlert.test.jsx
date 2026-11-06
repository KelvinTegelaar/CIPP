import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippCheckFatalAlert } from '../../../src/components/CippSettings/CippCheckFatalAlert'

// keeps the details panel light and inspectable without the lazy-loaded highlighter,
// see the flake note on CippCodeBlock in tests/components/CippComponents/CippCodeBlock.test.jsx
vi.mock('../../../src/components/CippComponents/CippCodeBlock', () => ({
  CippCodeBlock: ({ code }) => <pre data-testid="raw-details">{code}</pre>,
}))

const secretError =
  "Some check failed. The returned error is: AADSTS7000215: Invalid client secret provided. No other results on this card are valid."
const notFoundError =
  'Some check failed. The returned error is: AADSTS90002: Tenant not found. No other results on this card are valid.'
const unknownError = 'Some check failed. The returned error is: something unexpected happened.'

describe('CippCheckFatalAlert', () => {
  it('additional partner + a secret error: routes the fix link to the Setup Wizard', () => {
    renderWithProviders(<CippCheckFatalAlert message={secretError} isPrimaryPartner={false} />)

    const link = screen.getByRole('link', { name: 'Open Setup Wizard' })
    expect(link).toHaveAttribute('href', '/onboardingv2?selectedOption=UpdateTokens')
  })

  it('additional partner + a tenant-not-found error: routes the fix link to the Partner Tenants page', () => {
    renderWithProviders(<CippCheckFatalAlert message={notFoundError} isPrimaryPartner={false} />)

    const link = screen.getByRole('link', { name: 'Open Partner Tenants' })
    expect(link).toHaveAttribute('href', '/cipp/advanced/super-admin/partner-tenants')
  })

  // the primary partner's credentials live in the Setup Wizard regardless of which
  // known error matched - a Partner Tenants link would send the user to reassign a
  // partner instead of fixing the sign-in
  it('primary partner + a tenant-not-found error: still routes to the Setup Wizard, not Partner Tenants', () => {
    renderWithProviders(<CippCheckFatalAlert message={notFoundError} isPrimaryPartner={true} />)

    expect(screen.getByRole('link', { name: 'Open Setup Wizard' })).toHaveAttribute(
      'href',
      '/onboardingv2?selectedOption=UpdateTokens',
    )
    expect(screen.queryByRole('link', { name: 'Open Partner Tenants' })).not.toBeInTheDocument()
  })

  it('raw error is hidden behind Show Details and toggles on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippCheckFatalAlert message={secretError} isPrimaryPartner={false} />)

    expect(screen.queryByTestId('raw-details')).not.toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Show Details' }))

    // the "No other results..." trailer is stripped before use as the details text
    expect(screen.getByTestId('raw-details')).toHaveTextContent(
      'Some check failed. The returned error is: AADSTS7000215: Invalid client secret provided.',
    )
    expect(screen.getByRole('button', { name: 'Hide Details' })).toBeInTheDocument()
  })

  it('unknown error: no fix link, plain-language summary derived from text before the marker', () => {
    renderWithProviders(<CippCheckFatalAlert message={unknownError} isPrimaryPartner={false} />)

    expect(screen.getByText('Some check failed.')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
