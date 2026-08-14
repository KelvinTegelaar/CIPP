import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippSSOSettings } from '../../../src/components/CippSettings/CippSSOSettings'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../../mocks/api-call'

// not under test, pulls clipboard/codeblock trees
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))

// effect deps on the ssoStatus.data ref, one stable object per test or the reset loop spins
api.get = null
api.post = postResult()
api.paginated = paginatedResult([], { isSuccess: false, data: undefined })

// callbacks as Get-CIPPSiteHostname builds them: https://<host>/.auth/login/aad/callback
const AZURE_CB = 'https://cippabc.azurewebsites.net/.auth/login/aad/callback'
const CUSTOM_CB = 'https://cipp.contoso.com/.auth/login/aad/callback'

// Invoke-ExecSSOSetup.ps1 Status action, CIPPNG easyauth branch + $GetRedirectUriState fields
const statusResults = (overrides) => ({
  configured: true,
  status: 'complete',
  appId: '5f9c2d1e-8f30-4c9e-9d5a-1b2c3d4e5f60',
  multiTenant: false,
  tenantId: '11111111-2222-3333-4444-555555555555',
  issuer: 'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/v2.0',
  audiences: ['api://5f9c2d1e-8f30-4c9e-9d5a-1b2c3d4e5f60'],
  allowedApps: ['5f9c2d1e-8f30-4c9e-9d5a-1b2c3d4e5f60'],
  excludedPaths: [],
  easyAuthActive: true,
  lastError: '',
  canRepair: false,
  preconsented: true,
  preconsentError: null,
  redirectUris: [AZURE_CB, CUSTOM_CB],
  missingRedirectUris: [],
  domainsVerified: true,
  domainsError: null,
  ...overrides,
})

const seedStatus = (results) => {
  api.get = getResult({ isSuccess: true, data: { Results: results } })
}

const chipRoot = (label) => screen.getByText(label).closest('.MuiChip-root')

describe('CippSSOSettings sign-in URL state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get = null
  })

  it('unregistered hosts render warning chips labeled by hostname, not callback uri', () => {
    // graph app read failed -> RedirectUris falls back to the required set, every required uri listed missing
    seedStatus(statusResults({ missingRedirectUris: [AZURE_CB, CUSTOM_CB] }))
    renderWithProviders(<CippSSOSettings />)
    expect(chipRoot('cippabc.azurewebsites.net')).toHaveClass('MuiChip-colorWarning')
    expect(chipRoot('cipp.contoso.com')).toHaveClass('MuiChip-colorWarning')
    // hostFromUri applied to the chip side, raw uri never shown
    expect(screen.queryByText(AZURE_CB)).not.toBeInTheDocument()
  })

  it('caption names every missing host and points at the refresh button', () => {
    seedStatus(statusResults({ missingRedirectUris: [AZURE_CB, CUSTOM_CB] }))
    renderWithProviders(<CippSSOSettings />)
    expect(
      screen.getByText(/bound to this instance but not registered on the app/)
    ).toHaveTextContent(
      'cippabc.azurewebsites.net, cipp.contoso.com are bound to this instance but not registered on the app. Click Refresh Sign-in URLs to add them.'
    )
  })

  it('refresh button turns warning-colored and posts RefreshRedirectUris', async () => {
    const user = userEvent.setup()
    seedStatus(statusResults({ missingRedirectUris: [CUSTOM_CB] }))
    renderWithProviders(<CippSSOSettings />)
    const button = screen.getByRole('button', { name: 'Refresh Sign-in URLs' })
    expect(button).toHaveClass('MuiButton-colorWarning')
    await user.click(button)
    expect(api.post.mutate).toHaveBeenCalledWith({
      url: '/api/ExecSSOSetup',
      data: { Action: 'RefreshRedirectUris' },
    })
  })

  it('fully registered hosts stay default chips with no missing caption', () => {
    seedStatus(statusResults())
    renderWithProviders(<CippSSOSettings />)
    expect(chipRoot('cippabc.azurewebsites.net')).toHaveClass('MuiChip-colorDefault')
    expect(chipRoot('cipp.contoso.com')).not.toHaveClass('MuiChip-colorWarning')
    expect(
      screen.queryByText(/bound to this instance but not registered/)
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh Sign-in URLs' })).not.toHaveClass(
      'MuiButton-colorWarning'
    )
    expect(screen.queryByText(/This list may be incomplete/)).not.toBeInTheDocument()
  })

  it('missing host absent from the registered list still surfaces through the caption', () => {
    // app readable -> redirectUris is the registered set only, the caption is the missing host's only trace
    seedStatus(statusResults({ redirectUris: [AZURE_CB], missingRedirectUris: [CUSTOM_CB] }))
    renderWithProviders(<CippSSOSettings />)
    expect(screen.queryByText('cipp.contoso.com')).not.toBeInTheDocument()
    expect(
      screen.getByText(/bound to this instance but not registered on the app/)
    ).toHaveTextContent(
      'cipp.contoso.com is bound to this instance but not registered on the app. Click Refresh Sign-in URLs to add it.'
    )
    expect(screen.getByRole('button', { name: 'Refresh Sign-in URLs' })).toHaveClass(
      'MuiButton-colorWarning'
    )
  })

  it('unverified domain discovery shows the may-be-incomplete warning with the arm error', () => {
    seedStatus(
      statusResults({
        domainsVerified: false,
        domainsError: 'No managed identity is available to query ARM.',
      })
    )
    renderWithProviders(<CippSSOSettings />)
    expect(screen.getByText(/This list may be incomplete/)).toHaveTextContent(
      '(No managed identity is available to query ARM.)'
    )
  })
})
