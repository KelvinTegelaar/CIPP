import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import Page from '../../src/pages/cipp/settings/permissions.jsx'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult } from '../mocks/api-call'

// controllable superadmin gate, independent of the MultiPartner flag itself
const permState = vi.hoisted(() => ({ checkRoles: vi.fn(() => true) }))
vi.mock('../../src/hooks/use-permissions', () => ({
  usePermissions: () => ({ checkRoles: permState.checkRoles }),
}))

// keeps the picker's onChange reachable without the full CippAutocomplete tree
vi.mock('../../src/components/CippComponents/CippAutocomplete', () => ({
  CippAutoComplete: ({ options, value, onChange, label }) => (
    <div data-testid="partner-picker">
      <span>{label}</span>
      <span data-testid="picker-value">{value?.label ?? '(none)'}</span>
      {options.map((option) => (
        <button key={option.value || 'primary'} type="button" onClick={() => onChange(option)}>
          {option.label}
        </button>
      ))}
    </div>
  ),
}))

// report internals are unrelated to the multi-partner gating under test; render its
// actions slot only so the (possibly null) partner picker is visible
vi.mock('../../src/components/CippSettings/CippPermissionReport', () => ({
  CippPermissionReport: (props) => <div data-testid="report-actions">{props.actions}</div>,
}))

const checkCalls = vi.hoisted(() => ({ current: [] }))
vi.mock('../../src/components/CippSettings/CippPermissionCheck', () => ({
  default: (props) => {
    checkCalls.current.push({ type: props.type, partnerTenantId: props.partnerTenantId })
    return <div data-testid={`check-${props.type}`} />
  },
}))

const flagsOnResult = getResult({ data: [{ Id: 'MultiPartner', Enabled: true }] })
const flagsOffResult = getResult({ data: [{ Id: 'MultiPartner', Enabled: false }] })
const partnersResult = getResult({
  data: {
    Results: [
      { partnerTenantId: 'primary-1', displayName: 'Contoso MSP', IsPrimary: true },
      { partnerTenantId: 'partner-2', displayName: 'Fabrikam Partner', IsPrimary: false },
    ],
  },
})

let flagsResult = flagsOnResult
const routeGet = (opts) => {
  if (opts.url === '/api/ListFeatureFlags') return flagsResult
  if (opts.url === '/api/ListPartnerTenants') return partnersResult
  // organization/ListPartnerTenantInfo - not the focus here, keep it pending
  return getResult({ isSuccess: false })
}

describe('permissions.js page - MultiPartner picker gating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkCalls.current = []
    permState.checkRoles.mockReturnValue(true)
    flagsResult = flagsOnResult
    api.get = routeGet
  })

  it('flag off: no partner picker, checks run without a partnerTenantId', () => {
    flagsResult = flagsOffResult
    renderWithProviders(<Page />)

    expect(screen.queryByTestId('partner-picker')).not.toBeInTheDocument()
    expect(checkCalls.current.every((call) => call.partnerTenantId === undefined)).toBe(true)
    expect(checkCalls.current.map((call) => call.type)).toContain('Permissions')
  })

  it('flag on without superadmin: no partner picker', () => {
    permState.checkRoles.mockReturnValue(false)
    renderWithProviders(<Page />)

    expect(screen.queryByTestId('partner-picker')).not.toBeInTheDocument()
  })

  it('flag on + superadmin: picker renders, defaults to the primary partner (empty selection)', () => {
    renderWithProviders(<Page />)

    expect(screen.getByTestId('partner-picker')).toBeInTheDocument()
    // primary option carries value "" and is selected by default
    expect(screen.getByTestId('picker-value')).toHaveTextContent('Contoso MSP')
    expect(
      checkCalls.current.filter((call) => call.type === 'Permissions').at(-1).partnerTenantId,
    ).toBeUndefined()
  })

  it('picking a partner passes its id down to ExecAccessChecks via CippPermissionCheck', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    await user.click(screen.getByRole('button', { name: 'Fabrikam Partner' }))

    expect(
      checkCalls.current.filter((call) => call.type === 'Permissions').at(-1).partnerTenantId,
    ).toBe('partner-2')
  })
})
