import React, { useEffect } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippFormTenantSelector } from '../../../src/components/CippComponents/CippFormTenantSelector'
import { tenantsContosoFabrikam } from '../../mocks/fixtures'

// url-keyed api state, hoisted for the mock factory
const apiState = vi.hoisted(() => ({ tenants: {}, groups: {}, urls: [] }))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiPostCall: () => ({
    mutate: () => {},
    isPending: false,
    isSuccess: false,
    isIdle: true,
    isError: false,
    data: undefined,
    reset: () => {},
  }),
  ApiGetCallWithPagination: () => ({
    isSuccess: false,
    isPending: true,
    isFetching: false,
    isError: false,
    data: undefined,
  }),
  ApiGetCall: ({ url }) => {
    apiState.urls.push(url)
    if (url === '/api/ListTenantGroups') {
      return apiState.groups
    }
    return apiState.tenants
  },
}))

const result = (overrides = {}) => ({
  isLoading: false,
  isFetching: false,
  isError: false,
  isSuccess: true,
  error: null,
  data: undefined,
  refetch: vi.fn(),
  ...overrides,
})

// capture formControl so tests can read values and trigger validation
const controlRef = { current: null }

const Harness = (props) => {
  const formControl = useForm({ mode: 'onChange', defaultValues: { tenantFilter: [] } })
  useEffect(() => {
    controlRef.current = formControl
  }, [formControl])
  return <CippFormTenantSelector formControl={formControl} {...props} />
}

describe('CippFormTenantSelector', () => {
  beforeEach(() => {
    apiState.tenants = result({ data: tenantsContosoFabrikam })
    apiState.groups = result({ data: { Results: [] } })
    apiState.urls = []
    controlRef.current = null
  })

  it('maps the tenant list into labeled options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByText('Contoso (contoso.com)')).toBeInTheDocument()
    expect(screen.getByText('Fabrikam (fabrikam.com)')).toBeInTheDocument()
  })

  it('stores the selected tenant under the valueField in the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Contoso (contoso.com)'))

    const value = controlRef.current.getValues('tenantFilter')
    expect(value).toHaveLength(1)
    expect(value[0]).toMatchObject({
      value: 'contoso.com',
      label: 'Contoso (contoso.com)',
      type: 'Tenant',
    })
    expect(value[0].addedFields.customerId).toBe('11111111-aaaa-bbbb-cccc-000000000001')
  })

  it('merges tenant groups into the options when includeGroups is set', async () => {
    const user = userEvent.setup()
    apiState.groups = result({
      data: { Results: [{ Id: 'group-1', Name: 'VIP Clients' }] },
    })
    renderWithProviders(<Harness includeGroups />)

    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByText('VIP Clients')).toBeInTheDocument()
    expect(screen.getByText('Contoso (contoso.com)')).toBeInTheDocument()
  })

  it('builds the api url from allTenants and offboarding flags', () => {
    renderWithProviders(<Harness allTenants includeOffboardingDefaults />)

    expect(apiState.urls).toContain(
      '/api/ListTenants?AllTenantSelector=true&IncludeOffboardingDefaults=true'
    )
  })

  it('requests the plain tenant list by default', () => {
    renderWithProviders(<Harness />)

    expect(apiState.urls).toContain('/api/ListTenants')
  })

  // no required-validator test: the component passes `validators` as a function and
  // CippFormComponent spreads it ({...fn} -> {}), so the rule is silently dropped.
  // add the test when the component bug is fixed
})
