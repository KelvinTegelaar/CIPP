import React from 'react'
import { renderWithProviders } from '../test-utils'
import Page from '../../src/pages/cipp/settings/tenants.jsx'

vi.mock('../../src/api/ApiCall.jsx', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult } from '../mocks/api-call'

const permState = vi.hoisted(() => ({ checkRoles: vi.fn(() => true) }))
vi.mock('../../src/hooks/use-permissions', () => ({
  usePermissions: () => ({ checkRoles: permState.checkRoles }),
}))

const tableProps = vi.hoisted(() => ({ current: null }))
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tableProps.current = props
    return <div data-testid="table-page-stub" />
  },
}))

// unrelated to the reassign-partner action, cut its import tree
vi.mock('../../src/components/CippComponents/CippApiDialog', () => ({
  CippApiDialog: () => null,
}))

const flagsOnResult = getResult({ data: [{ Id: 'MultiPartner', Enabled: true }] })
const flagsOffResult = getResult({ data: [{ Id: 'MultiPartner', Enabled: false }] })

const reassignAction = () =>
  tableProps.current.actions.find((action) => action.label === 'Reassign Owning Partner')

const normalRow = {
  customerId: 'cust-1',
  displayName: 'Fabrikam Inc',
  isPartnerTenantRow: false,
  delegatedPrivilegeStatus: 'GDAP Tenant',
  // comma-joined GUID string, as Get-Tenants stores it on the row
  knownPartners: 'primary-1,partner-2',
}
const singlePartnerRow = { ...normalRow, knownPartners: 'primary-1' }
const noPartnersRow = { ...normalRow, knownPartners: '' }
const partnerTenantRow = { ...normalRow, isPartnerTenantRow: true }
const directTenantRow = { ...normalRow, delegatedPrivilegeStatus: 'directTenant' }

describe('tenants.js page - Reassign Owning Partner action (MultiPartner)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    permState.checkRoles.mockReturnValue(true)
    api.get = () => flagsOnResult
  })

  it('flag off: the action is absent from the table props entirely condition-wise (always false)', () => {
    api.get = () => flagsOffResult
    renderWithProviders(<Page />)

    expect(reassignAction().condition(normalRow)).toBe(false)
  })

  it('flag on without superadmin: condition is false', () => {
    permState.checkRoles.mockReturnValue(false)
    renderWithProviders(<Page />)

    expect(reassignAction().condition(normalRow)).toBe(false)
  })

  it('flag on + superadmin: condition is true for a normal GDAP tenant row', () => {
    renderWithProviders(<Page />)

    expect(reassignAction().condition(normalRow)).toBe(true)
  })

  it('flag on + superadmin: condition is false for a partner-tenant row and a direct-tenant row', () => {
    renderWithProviders(<Page />)

    expect(reassignAction().condition(partnerTenantRow)).toBe(false)
    expect(reassignAction().condition(directTenantRow)).toBe(false)
  })

  it('flag on + superadmin: condition is false when fewer than two partners know the customer', () => {
    renderWithProviders(<Page />)

    expect(reassignAction().condition(singlePartnerRow)).toBe(false)
    expect(reassignAction().condition(noPartnersRow)).toBe(false)
    expect(reassignAction().condition({ ...normalRow, knownPartners: undefined })).toBe(false)
  })

  it('posts ExecAssignPartnerTenant with { customerId, partnerTenantId } shaped from row + form data', () => {
    renderWithProviders(<Page />)

    const action = reassignAction()
    expect(action.url).toBe('/api/ExecAssignPartnerTenant')
    expect(action.type).toBe('POST')
    expect(
      action.customDataformatter(normalRow, undefined, { partnerTenantId: { value: 'partner-2' } }),
    ).toEqual({ customerId: 'cust-1', partnerTenantId: 'partner-2' })
  })

  it('offCanvas exposes knownPartners only when the flag is on', () => {
    renderWithProviders(<Page />)
    expect(tableProps.current.offCanvas.extendedInfoFields).toContain('knownPartners')

    api.get = () => flagsOffResult
    renderWithProviders(<Page />)
    expect(tableProps.current.offCanvas.extendedInfoFields).not.toContain('knownPartners')
  })
})
