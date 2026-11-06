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
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { tenantFilter: [] },
  })
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
    expect(value[0].addedFields.customerId).toBe(
      '11111111-aaaa-bbbb-cccc-000000000001'
    )
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

  it('replaces a picked group with its member tenants the user can access', async () => {
    const user = userEvent.setup()
    apiState.groups = result({
      data: {
        Results: [
          {
            Id: 'group-1',
            Name: 'VIP Clients',
            Members: [
              { customerId: '11111111-aaaa-bbbb-cccc-000000000001' },
              { customerId: '99999999-0000-0000-0000-000000000000' },
            ],
          },
        ],
      },
    })
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('VIP Clients (adds 1 tenant)'))

    await waitFor(() => {
      const value = controlRef.current.getValues('tenantFilter')
      expect(value.map((item) => item.value)).toEqual(['contoso.com'])
    })
    expect(controlRef.current.getValues('tenantFilter')[0].type).toBe('Tenant')
  })

  it('adds each tenant once when picked groups overlap each other and a tenant picked directly', async () => {
    const user = userEvent.setup()
    const contoso = { customerId: '11111111-aaaa-bbbb-cccc-000000000001' }
    const fabrikam = { customerId: '22222222-aaaa-bbbb-cccc-000000000002' }
    apiState.groups = result({
      data: {
        Results: [
          { Id: 'group-1', Name: 'Both', Members: [contoso, fabrikam] },
          { Id: 'group-2', Name: 'Contoso only', Members: [contoso] },
        ],
      },
    })
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Contoso (contoso.com)'))
    await user.click(await screen.findByText('Contoso only (adds 1 tenant)'))
    await user.click(await screen.findByText('Both (adds 2 tenants)'))

    await waitFor(() => {
      const value = controlRef.current.getValues('tenantFilter')
      expect(value.map((item) => item.value)).toEqual(['contoso.com', 'fabrikam.com'])
    })
  })

  it("leaves out a group with none of the user's tenants", async () => {
    const user = userEvent.setup()
    apiState.groups = result({
      data: {
        Results: [
          { Id: 'empty', Name: 'Empty Group', Members: [] },
          {
            Id: 'other',
            Name: 'Other Partner',
            Members: [{ customerId: 'not-mine' }],
          },
        ],
      },
    })
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByText('Contoso (contoso.com)')).toBeInTheDocument()
    expect(
      screen.queryByText(/Empty Group|Other Partner/)
    ).not.toBeInTheDocument()
  })

  it('keeps a picked group as a group selector when includeGroups is set', async () => {
    const user = userEvent.setup()
    apiState.groups = result({
      data: { Results: [{ Id: 'group-1', Name: 'VIP Clients', Members: [] }] },
    })
    renderWithProviders(<Harness includeGroups />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('VIP Clients'))

    expect(controlRef.current.getValues('tenantFilter')).toMatchObject([
      { value: 'group-1', type: 'Group' },
    ])
  })

  it('does not offer groups in a single-tenant picker', async () => {
    const user = userEvent.setup()
    apiState.groups = result({
      data: { Results: [{ Id: 'group-1', Name: 'VIP Clients', Members: [] }] },
    })
    renderWithProviders(<Harness type="single" />)

    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByText('Contoso (contoso.com)')).toBeInTheDocument()
    expect(screen.queryByText(/VIP Clients/)).not.toBeInTheDocument()
  })

  it('builds the api url from allTenants and tenant defaults flags', () => {
    renderWithProviders(<Harness allTenants includeTenantDefaults />)

    expect(apiState.urls).toContain(
      '/api/ListTenants?AllTenantSelector=true&IncludeTenantDefaults=true'
    )
  })

  it('still honours the deprecated includeOffboardingDefaults prop', () => {
    renderWithProviders(<Harness allTenants includeOffboardingDefaults />)

    expect(apiState.urls).toContain(
      '/api/ListTenants?AllTenantSelector=true&IncludeTenantDefaults=true'
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
