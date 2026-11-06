import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithTheme } from '../../test-utils'
import { CippTenantModeDeploy } from '../../../src/components/CippWizard/CippTenantModeDeploy'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../../mocks/api-call'

// controllable superadmin gate - the component's own gating combines this with the
// MultiPartner flag, so tests can flip either independently
const permState = vi.hoisted(() => ({ checkRoles: vi.fn(() => true) }))
vi.mock('../../../src/hooks/use-permissions', () => ({
  usePermissions: () => ({ checkRoles: permState.checkRoles }),
}))

// oauth button pulls the CippApiDialog tree, stub keeps the render light while still
// exposing onAuthSuccess/tokenUpdateBody so the add-partner call shape can be exercised
vi.mock('../../../src/components/CippComponents/CIPPM365OAuthButton', () => ({
  CIPPM365OAuthButton: ({ buttonText, onAuthSuccess, tokenUpdateBody }) => (
    <button
      type="button"
      data-token-update-body={JSON.stringify(tokenUpdateBody ?? {})}
      onClick={() => onAuthSuccess?.({ tid: 'new-tenant-id', access_token: 'token' })}
    >
      {buttonText}
    </button>
  ),
}))

vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))

// imported by the component but never rendered, cut the MRT import tree
vi.mock('../../../src/components/CippWizard/CippTenantTable', () => ({
  CippTenantTable: () => null,
}))

const primaryConnected = {
  applicationId: 'f8b2c3d4-9e01-4a23-8b45-6c7d8e9f0a1b',
  tenantId: 'c7e9a1b2-3d45-4f67-89ab-cdef01234567',
  orgName: 'Contoso MSP',
  authenticatedUserDisplayName: 'CIPP Service Account',
  authenticatedUserPrincipalName: 'cipp-sa@contosomsp.onmicrosoft.com',
  isPartnerTenant: true,
  partnerTenantType: 'resellerPartnerDelegatedAdmin',
}

const primaryNotConnected = {
  ...primaryConnected,
  orgName: null,
  authenticatedUserDisplayName: null,
  authenticatedUserPrincipalName: null,
  isPartnerTenant: false,
  partnerTenantType: null,
}

// stable refs across renders - see tests/mocks/api-call.js
const flagsOnResult = getResult({ data: [{ Id: 'MultiPartner', Enabled: true }] })
const flagsOffResult = getResult({ data: [{ Id: 'MultiPartner', Enabled: false }] })
const partnersResult = getResult({
  data: {
    Results: [
      {
        partnerTenantId: 'primary-1',
        displayName: 'Contoso MSP',
        IsPrimary: true,
        tenantCount: 40,
      },
      {
        partnerTenantId: 'partner-2',
        displayName: 'Fabrikam Partner',
        IsPrimary: false,
        tenantCount: 12,
        authenticatedUserPrincipalName: 'svc@fabrikam.onmicrosoft.com',
      },
    ],
  },
})
const samSecretReadyResult = getResult({ data: { ready: true } })

let partnerTenantInfoResult = getResult({ data: primaryConnected })
let flagsResult = flagsOnResult

const routeGet = (opts) => {
  if (opts.url === '/api/ListFeatureFlags') return flagsResult
  if (opts.url === '/api/ListPartnerTenants') return partnersResult
  if (opts.url === '/api/ExecListAppId') return partnerTenantInfoResult
  if (opts.url === '/api/ExecSamSecretStatus') return samSecretReadyResult
  return getResult({ isSuccess: false })
}

const addPartnerPost = postResult()
const otherPost = postResult()
const routePost = (opts) => {
  if (opts.relatedQueryKeys?.[0] === 'partnerTenants') return addPartnerPost
  return otherPost
}

const Harness = () => {
  const formControl = useForm({ mode: 'onChange' })
  return (
    <CippTenantModeDeploy
      formControl={formControl}
      currentStep={1}
      onPreviousStep={() => {}}
      onNextStep={() => {}}
    />
  )
}

describe('CippTenantModeDeploy multi-partner (MultiPartner flag)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    permState.checkRoles.mockReturnValue(true)
    flagsResult = flagsOnResult
    partnerTenantInfoResult = getResult({ data: primaryConnected })
    api.get = routeGet
    api.post = routePost
  })

  it('flag off: renders only the legacy single-partner card, no partner list', () => {
    flagsResult = flagsOffResult
    renderWithTheme(<Harness />)

    expect(screen.getByText('Partner Tenant')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change Partner Tenant' })).toBeInTheDocument()
    expect(screen.queryByText('Additional Partner Tenants')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add Partner Tenant' })).not.toBeInTheDocument()
  })

  it('flag on without superadmin: still renders only the legacy card', () => {
    permState.checkRoles.mockReturnValue(false)
    renderWithTheme(<Harness />)

    expect(screen.queryByText('Additional Partner Tenants')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add Partner Tenant' })).not.toBeInTheDocument()
  })

  it('flag on + superadmin: renders the additional-partner list with per-partner status and Add Partner Tenant', () => {
    renderWithTheme(<Harness />)

    expect(screen.getByText('Additional Partner Tenants')).toBeInTheDocument()
    // the primary partner (IsPrimary: true) is filtered out of the additional list -
    // only the non-primary Fabrikam entry gets a card there
    expect(screen.getByText('Fabrikam Partner')).toBeInTheDocument()
    expect(screen.getByText('svc@fabrikam.onmicrosoft.com')).toBeInTheDocument()
    expect(screen.getByText('12 tenant(s)')).toBeInTheDocument()
    expect(screen.queryByText('40 tenant(s)')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Partner Tenant' })).toBeInTheDocument()
  })

  it('add flow posts ExecUpdateRefreshToken with tenantMode GDAP and addPartner true', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Add Partner Tenant' }))

    expect(addPartnerPost.mutate).toHaveBeenCalledTimes(1)
    expect(addPartnerPost.mutate).toHaveBeenCalledWith({
      url: '/api/ExecUpdateRefreshToken',
      data: { tid: 'new-tenant-id', access_token: 'token', tenantMode: 'GDAP', addPartner: true },
    })
  })

  it('add flow is inert until the primary partner is connected', async () => {
    partnerTenantInfoResult = getResult({ data: primaryNotConnected })
    const user = userEvent.setup()
    renderWithTheme(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Add Partner Tenant' }))

    expect(addPartnerPost.mutate).not.toHaveBeenCalled()
  })
})
