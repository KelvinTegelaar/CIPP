import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippAuditLogSearchDrawer } from '../../../src/components/CippComponents/CippAuditLogSearchDrawer'
import { ApiGetCall, ApiPostCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(),
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, title, children, footer }) =>
    visible ? (
      <div data-testid="CippOffCanvas">
        <h2>{title}</h2>
        {children}
        {footer}
      </div>
    ) : null,
}))
// The real pickers (date-time, API-backed autocompletes) are not what is under test here; a
// field that just prints its form value lets the assertions read exactly what the copy seeded.
vi.mock('../../../src/components/CippComponents/CippFormComponent', async () => {
  const { useWatch } = await import('react-hook-form')
  const Field = ({ name, formControl }) => {
    const value = useWatch({ control: formControl.control, name })
    return <div data-testid={'field-' + name}>{JSON.stringify(value ?? null)}</div>
  }
  return { default: Field, CippFormComponent: Field }
})

const tenants = {
  isSuccess: true,
  isFetching: false,
  isError: false,
  data: [{ displayName: 'Test Domain', defaultDomainName: 'testdomain.com' }],
  refetch: vi.fn(),
}
const idleGet = { isSuccess: false, isFetching: false, isError: false, data: undefined, refetch: vi.fn() }

// Shape of a Graph security/auditLog/queries object, as listed on the manual-searches page.
const existingSearch = {
  id: 'f1b2',
  displayName: 'Suspicious sign-ins',
  status: 'succeeded',
  filterStartDateTime: '2026-11-01T00:00:00Z',
  filterEndDateTime: '2026-11-02T00:00:00Z',
  recordTypeFilters: ['azureActiveDirectory', 'kaizala'],
  keywordFilter: 'foo bar',
  operationFilters: ['UserLoggedIn'],
  userPrincipalNameFilters: ['alice@testdomain.com'],
  ipAddressFilters: ['10.0.0.1'],
  objectIdFilters: [],
  administrativeUnitIdFilters: ['au-1'],
}

const startUnix = Math.floor(Date.parse('2026-11-01T00:00:00Z') / 1000)
const endUnix = Math.floor(Date.parse('2026-11-02T00:00:00Z') / 1000)
const currentTenantOption = { label: 'Test Domain (testdomain.com)', value: 'testdomain.com' }

const field = (name) => JSON.parse(screen.getByTestId('field-' + name).textContent)

let mutateAsync

describe('CippAuditLogSearchDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutateAsync = vi.fn(() => Promise.resolve({}))
    ApiGetCall.mockImplementation(({ url }) => (url === '/api/ListTenants' ? tenants : idleGet))
    ApiPostCall.mockImplementation(() => ({ isPending: false, mutateAsync, reset: vi.fn() }))
  })

  it('opens empty for a new search', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippAuditLogSearchDrawer />)
    expect(screen.queryByTestId('CippOffCanvas')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'New Search' }))
    expect(screen.getByRole('heading', { name: 'Create New Audit Log Search' })).toBeInTheDocument()
    expect(field('DisplayName')).toBeNull()
    expect(field('RecordTypeFilters')).toEqual([])
    expect(field('TenantFilter')).toEqual(currentTenantOption)
  })

  it('opens prefilled with every filter of the search being copied', async () => {
    renderWithProviders(<CippAuditLogSearchDrawer copySource={existingSearch} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Copy Audit Log Search' })).toBeInTheDocument()
    })
    expect(field('DisplayName')).toBe('Suspicious sign-ins - Copy')
    expect(field('StartTime')).toBe(startUnix)
    expect(field('EndTime')).toBe(endUnix)
    // known values get their friendly label, unknown ones still round-trip by value
    expect(field('RecordTypeFilters')).toEqual([
      { label: 'Azure Active Directory', value: 'azureActiveDirectory' },
      { label: 'kaizala', value: 'kaizala' },
    ])
    expect(field('KeywordFilters')).toEqual([
      { label: 'foo', value: 'foo' },
      { label: 'bar', value: 'bar' },
    ])
    expect(field('OperationsFilters')).toEqual([{ label: 'User Logged In', value: 'UserLoggedIn' }])
    expect(field('UserPrincipalNameFilters')).toEqual([
      { label: 'alice@testdomain.com', value: 'alice@testdomain.com' },
    ])
    expect(field('IPAddressFilters')).toEqual([{ label: '10.0.0.1', value: '10.0.0.1' }])
    expect(field('ObjectIdFilters')).toEqual([])
    expect(field('AdministrativeUnitFilters')).toEqual([{ label: 'au-1', value: 'au-1' }])
    expect(field('ProcessLogs')).toBe(false)
    expect(field('TenantFilter')).toEqual(currentTenantOption)
  })

  it('submits the copied search with the backend parameter names', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippAuditLogSearchDrawer copySource={existingSearch} />)
    await screen.findByRole('heading', { name: 'Copy Audit Log Search' })

    await user.click(screen.getByRole('button', { name: 'Create Search' }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    const { url, data } = mutateAsync.mock.calls[0][0]
    expect(url).toBe('/api/ExecAuditLogSearch')
    expect(data).toEqual({
      DisplayName: 'Suspicious sign-ins - Copy',
      TenantFilter: 'testdomain.com',
      StartTime: startUnix,
      EndTime: endUnix,
      RecordTypeFilters: ['azureActiveDirectory', 'kaizala'],
      KeywordFilters: 'foo bar',
      OperationsFilters: ['UserLoggedIn'],
      UserPrincipalNameFilters: ['alice@testdomain.com'],
      IPAddressFilters: ['10.0.0.1'],
      AdministrativeUnitFilters: ['au-1'],
      ProcessLogs: false,
    })
    expect(data).not.toHaveProperty('KeywordFilter')
  })

  it('tells the page the copy was dismissed and clears the form on cancel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<CippAuditLogSearchDrawer copySource={existingSearch} onClose={onClose} />)
    await screen.findByRole('heading', { name: 'Copy Audit Log Search' })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('CippOffCanvas')).toBeNull()
  })
})
