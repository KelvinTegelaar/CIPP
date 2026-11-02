import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import CippIntegrationTenantMapping from '../../../src/components/CippIntegrations/CippIntegrationTenantMapping'
import { api, getResult, postResult } from '../../mocks/api-call'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
vi.mock('next/router', () => ({ useRouter: () => ({ query: routerQuery }) }))
vi.mock('../../../src/components/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock(
  '../../../src/components/CippComponents/CippFormTenantSelector',
  () => ({
    CippFormTenantSelector: () => null,
  })
)
vi.mock('../../../src/components/CippComponents/CippFormComponent', () => ({
  CippFormComponent: () => null,
}))
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: (props) => {
    tableProps = props
    return <div data-testid="CippDataTable" />
  },
}))

let routerQuery = { id: 'Hudu' }
let tableProps
const post = postResult()
const mappingsResult = getResult({
  data: {
    Companies: [],
    Mappings: [
      {
        TenantId: 't1',
        Tenant: 'One',
        TenantDomain: 'one.test',
        IntegrationId: '1',
        IntegrationName: 'A',
        SyncPasswords: true,
      },
    ],
  },
})

beforeEach(() => {
  routerQuery = { id: 'Hudu' }
  post.mutate.mockClear()
  api.get = mappingsResult
  api.post = post
})

describe('CippIntegrationTenantMapping SyncPasswords', () => {
  it('toggles SyncPasswords on the row and saves it in the payload', async () => {
    renderWithProviders(<CippIntegrationTenantMapping />)
    expect(tableProps.simpleColumns).toContain('SyncPasswords')

    const exclude = tableProps.actions.find((a) =>
      a.label.startsWith('Exclude password data')
    )
    const include = tableProps.actions.find(
      (a) => a.label === 'Include password data'
    )
    expect(exclude.condition(tableProps.data[0])).toBe(true)
    expect(include.condition(tableProps.data[0])).toBe(false)

    act(() => exclude.customFunction(tableProps.data[0]))
    expect(tableProps.data[0].SyncPasswords).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await vi.waitFor(() => expect(post.mutate).toHaveBeenCalled())
    expect(post.mutate.mock.calls[0][0].data[0].SyncPasswords).toBe(false)
  })

  it('has no SyncPasswords column or actions for a non-Hudu extension', () => {
    routerQuery = { id: 'NinjaOne' }
    renderWithProviders(<CippIntegrationTenantMapping />)
    expect(tableProps.simpleColumns).not.toContain('SyncPasswords')
    expect(tableProps.actions.some((a) => /password data/.test(a.label))).toBe(
      false
    )
  })
})

describe('CippIntegrationTenantMapping automap', () => {
  it('keeps unsaved local name matches when the server automap refetch lands', async () => {
    routerQuery = { id: 'HaloPSA' }
    const tenants = [
      {
        customerId: 't2',
        displayName: 'Contoso',
        defaultDomainName: 'contoso.test',
      },
      {
        customerId: 't4',
        displayName: 'Fabrikam',
        defaultDomainName: 'fabrikam.test',
      },
    ]
    const companies = [
      { name: 'Contoso', value: '2' },
      { name: 'Fabrikam', value: '4' },
    ]
    let current = getResult({
      data: {
        Companies: companies,
        Mappings: [
          {
            TenantId: 't1',
            Tenant: 'One',
            TenantDomain: 'one.test',
            IntegrationId: '1',
            IntegrationName: 'A',
          },
        ],
      },
    })
    api.get = () => current
    api.paginated = getResult({ data: { pages: [tenants] } })
    let bump
    const Harness = () => {
      const [, setN] = React.useState(0)
      React.useEffect(() => {
        bump = () => setN((n) => n + 1)
      }, [])
      return <CippIntegrationTenantMapping />
    }
    renderWithProviders(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Automap Companies' }))
    expect(post.mutate.mock.calls[0][0].url).toBe(
      '/api/ExecExtensionMapping?AutoMapping=HaloPSA'
    )
    expect(tableProps.data.map((r) => r.TenantId)).toEqual(['t1', 't2', 't4'])

    // the server mapped t3 by tenant ID and t4 to a different client than the local name match
    current = getResult({
      data: {
        Companies: companies,
        Mappings: [
          {
            TenantId: 't1',
            Tenant: 'One',
            TenantDomain: 'one.test',
            IntegrationId: '1',
            IntegrationName: 'A',
          },
          {
            TenantId: 't3',
            Tenant: 'Three',
            TenantDomain: 'three.test',
            IntegrationId: '3',
            IntegrationName: 'C',
          },
          {
            TenantId: 't4',
            Tenant: 'Fabrikam',
            TenantDomain: 'fabrikam.test',
            IntegrationId: '9',
            IntegrationName: 'Fabrikam Group',
          },
        ],
      },
    })
    act(() => bump())

    expect(tableProps.data.map((r) => r.TenantId).sort()).toEqual([
      't1',
      't2',
      't3',
      't4',
    ])
    expect(tableProps.data.find((r) => r.TenantId === 't4').IntegrationId).toBe(
      '9'
    )
  })
})
