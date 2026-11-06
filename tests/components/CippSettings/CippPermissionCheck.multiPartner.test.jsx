import React from 'react'
import { renderWithProviders } from '../../test-utils'
import CippPermissionCheck from '../../../src/components/CippSettings/CippPermissionCheck'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult } from '../../mocks/api-call'
import { ApiGetCall } from '../../../src/api/ApiCall'

const resultsProps = vi.hoisted(() => ({ current: null }))
vi.mock('../../../src/components/CippSettings/CippPermissionResults', () => ({
  CippPermissionResults: (props) => {
    resultsProps.current = props
    return null
  },
}))

describe('CippPermissionCheck - partnerTenantId forwarding (MultiPartner)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resultsProps.current = null
    api.get = () => getResult({ data: { Metadata: {} } })
  })

  it('primary partner (no partnerTenantId prop): ExecAccessChecks call omits it, isPrimaryPartner is true', () => {
    renderWithProviders(<CippPermissionCheck type="Permissions" />)

    const call = ApiGetCall.mock.calls.at(-1)[0]
    expect(call.url).toBe('/api/ExecAccessChecks')
    expect(call.data).not.toHaveProperty('partnerTenantId')
    expect(call.queryKey).toBe('ExecAccessChecks-Permissions')
    expect(resultsProps.current.isPrimaryPartner).toBe(true)
  })

  it('additional partner: the picked partnerTenantId is forwarded to ExecAccessChecks, isPrimaryPartner is false', () => {
    renderWithProviders(<CippPermissionCheck type="Permissions" partnerTenantId="partner-2" />)

    const call = ApiGetCall.mock.calls.at(-1)[0]
    expect(call.data).toMatchObject({ Type: 'Permissions', partnerTenantId: 'partner-2' })
    expect(call.queryKey).toBe('ExecAccessChecks-Permissions-partner-2')
    expect(resultsProps.current.isPrimaryPartner).toBe(false)
  })
})
