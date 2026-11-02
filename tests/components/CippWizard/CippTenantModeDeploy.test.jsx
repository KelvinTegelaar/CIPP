import React from 'react'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithTheme } from '../../test-utils'
import { CippTenantModeDeploy } from '../../../src/components/CippWizard/CippTenantModeDeploy'
import { ApiGetCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../../mocks/api-call'

// shape from Invoke-ExecListAppId.ps1 $Results
const mocks = (() => {
  const partnerInfo = {
    applicationId: 'f8b2c3d4-9e01-4a23-8b45-6c7d8e9f0a1b',
    tenantId: 'c7e9a1b2-3d45-4f67-89ab-cdef01234567',
    orgName: 'Contoso MSP',
    authenticatedUserDisplayName: 'CIPP Service Account',
    authenticatedUserPrincipalName: 'cipp-sa@contosomsp.onmicrosoft.com',
    isPartnerTenant: true,
    partnerTenantType: 'resellerPartnerDelegatedAdmin',
    refreshUrl:
      'https://login.microsoftonline.com/c7e9a1b2-3d45-4f67-89ab-cdef01234567/oauth2/v2.0/authorize?client_id=f8b2c3d4-9e01-4a23-8b45-6c7d8e9f0a1b&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2Fapi%2FExecSAMSetup&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default+offline_access+profile+openid&state=1&prompt=select_account',
  }
  // component effects key off these objects, keep references stable across renders
  return {
    pendingQuery: getResult({ isLoading: true, isFetching: true, isSuccess: false }),
    loadedQuery: getResult({ data: partnerInfo }),
    // ExecListAppId catch path: graph bulk request failed, org fields come back null
    noOrgQuery: getResult({
      data: {
        ...partnerInfo,
        orgName: null,
        authenticatedUserDisplayName: null,
        authenticatedUserPrincipalName: null,
        isPartnerTenant: false,
        partnerTenantType: null,
      },
    }),
    postResult: postResult({ isFetching: false }),
  }
})()

api.post = mocks.postResult
api.paginated = paginatedResult([], { isSuccess: false, data: undefined })

// oauth button pulls the CippApiDialog tree, stub keeps the render light
vi.mock('../../../src/components/CippComponents/CIPPM365OAuthButton', () => ({
  CIPPM365OAuthButton: ({ buttonText }) => <button type="button">{buttonText}</button>,
}))

vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))

// imported by the component but never rendered, cut the MRT import tree
vi.mock('../../../src/components/CippWizard/CippTenantTable', () => ({
  CippTenantTable: () => null,
}))

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

// tooltip title lands as aria-label on the span wrapper, the icon button sits inside
const refreshWrapper = () => screen.getByLabelText('Refresh partner tenant information')

describe('CippTenantModeDeploy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ApiGetCall.mockReturnValue(mocks.pendingQuery)
  })

  it('pending query: refresh button disabled without the MUI disabled-child Tooltip warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderWithTheme(<Harness />)

    expect(within(refreshWrapper()).getByRole('button')).toBeDisabled()
    // unwrapping the span puts the disabled button directly under Tooltip, mui warns and drops hover events
    const disabledChildWarnings = warnSpy.mock.calls.filter((args) =>
      String(args[0]).includes('disabled `button` child to the Tooltip'),
    )
    expect(disabledChildWarnings).toEqual([])
    warnSpy.mockRestore()
  })

  it('tooltip opens on hover while the refresh button is disabled', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Harness />)

    await user.hover(refreshWrapper())

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Refresh partner tenant information')
  })

  it('refresh click refetches partner tenant info once loaded', async () => {
    ApiGetCall.mockReturnValue(mocks.loadedQuery)
    const user = userEvent.setup()
    renderWithTheme(<Harness />)

    const button = within(refreshWrapper()).getByRole('button')
    expect(button).toBeEnabled()
    await user.click(button)

    expect(mocks.loadedQuery.refetch).toHaveBeenCalledTimes(1)
  })

  it('loaded partner info renders org, tenant id, service account, and partner type chip', () => {
    ApiGetCall.mockReturnValue(mocks.loadedQuery)
    renderWithTheme(<Harness />)

    expect(screen.getByText('Contoso MSP')).toBeInTheDocument()
    expect(screen.getByText('c7e9a1b2-3d45-4f67-89ab-cdef01234567')).toBeInTheDocument()
    expect(screen.getByText('CIPP Service Account')).toBeInTheDocument()
    expect(screen.getByText('cipp-sa@contosomsp.onmicrosoft.com')).toBeInTheDocument()
    // resellerPartnerDelegatedAdmin -> CippTranslations
    expect(screen.getByText('Direct Reseller')).toBeInTheDocument()
    expect(screen.queryByText(/No partner tenant connected/)).not.toBeInTheDocument()
  })

  it('pending query does not flash the no-partner warning', () => {
    renderWithTheme(<Harness />)

    expect(screen.queryByText(/No partner tenant connected/)).not.toBeInTheDocument()
  })

  it('org lookup failure (null orgName) shows both no-partner warnings', () => {
    ApiGetCall.mockReturnValue(mocks.noOrgQuery)
    renderWithTheme(<Harness />)

    expect(screen.getByText(/No partner tenant connected/)).toBeInTheDocument()
    expect(
      screen.getByText('Please connect to your partner tenant first before adding separate tenants.'),
    ).toBeInTheDocument()
  })
})
