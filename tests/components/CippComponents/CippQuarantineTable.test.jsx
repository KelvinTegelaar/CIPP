import React from 'react'
import { act, screen } from '@testing-library/react'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { api, apiCallMock, getResult, postResult } from '../../mocks/api-call'
import { CippQuarantineTable } from '../../../src/components/CippComponents/CippQuarantineTable'

const tableProps = vi.hoisted(() => ({ current: null }))
vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
vi.mock('../../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tableProps.current = props
    return <div data-testid="table-page-stub" />
  },
}))

const quarantineRow = {
  Identity:
    '5e5e5e5e-1111-2222-3333-444455556666\\c81d4a2e-1111-2222-3333-444455556666',
  NetworkMessageId: '5e5e5e5e-1111-2222-3333-444455556666',
  Tenant: 'fabrikam.com',
  Subject: 'Suspicious invoice',
  MessageId: '<id@mail.evil.example>',
  ReceivedTime: '2026-06-01T10:00:00Z',
  RecipientAddress: ['user@fabrikam.com'],
  ReleaseStatus: 'NOTRELEASED',
}

describe('CippQuarantineTable', () => {
  it('gates email-only actions to the Email tab and passes the entity type to the API', () => {
    api.get = () => getResult()
    const { unmount } = renderWithProviders(
      <CippQuarantineTable entityType="Teams" />
    )
    const { actions, apiData } = tableProps.current
    const labels = actions.map((action) => action.label)

    expect(labels).toContain('Release')
    expect(labels).toContain('Delete from Quarantine')
    expect(labels).not.toContain('Preview Message')
    expect(labels).not.toContain('Deny')
    expect(labels).not.toContain('Block Sender')
    expect(labels).not.toContain('Submit to Microsoft for Review')
    expect(labels).not.toContain('Open Email Entity in Defender')
    expect(apiData.EntityType).toBe('Teams')
    unmount()

    renderWithProviders(<CippQuarantineTable entityType="Email" />)
    const emailLabels = tableProps.current.actions.map((action) => action.label)
    expect(emailLabels).toContain('Preview Message')
    expect(emailLabels).toContain('Deny')
    expect(emailLabels).toContain('Submit to Microsoft for Review')
    expect(emailLabels).toContain('Block Sender')
    expect(emailLabels).toContain('Open Email Entity in Defender')
  })

  it('targets the row tenant for per-message calls in the AllTenants view', async () => {
    const callOpts = []
    api.get = (opts) => {
      callOpts.push(opts)
      return getResult()
    }
    renderWithProviders(<CippQuarantineTable entityType="Email" />, {
      settings: settingsWith({ currentTenant: 'AllTenants' }),
    })

    const preview = tableProps.current.actions.find(
      (action) => action.label === 'Preview Message'
    )
    await act(async () => preview.customFunction(quarantineRow))

    const contentsCall = callOpts.find(
      (opts) =>
        opts.url === '/api/ListMailQuarantineMessage' &&
        opts.data?.Identity === quarantineRow.Identity
    )
    expect(contentsCall).toBeTruthy()
    expect(contentsCall.data.tenantFilter).toBe('fabrikam.com')
  })

  it('renders the raw message headers in the headers dialog', async () => {
    const headerText =
      'Received: from mail.evil.example\r\nX-CIPP-Test: present'
    api.get = (opts) =>
      opts.url === '/api/ListMailQuarantineMessageHeader'
        ? getResult({ data: { Header: headerText } })
        : getResult()
    renderWithProviders(<CippQuarantineTable entityType="Email" />)

    const viewHeaders = tableProps.current.actions.find(
      (action) => action.label === 'View Message Headers'
    )
    await act(async () => viewHeaders.customFunction(quarantineRow))

    expect(screen.getByText(/X-CIPP-Test: present/)).toBeInTheDocument()
  })

  it('requests a message trace window pinned to the received time, not the ~48h Graph default', async () => {
    const mutate = vi.fn()
    api.get = () => getResult()
    api.post = postResult({ mutate })
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    const row = { ...quarantineRow, ReceivedTime: fiveDaysAgo }
    renderWithProviders(<CippQuarantineTable entityType="Email" />)

    const trace = tableProps.current.actions.find(
      (action) => action.label === 'View Message Trace'
    )
    await act(async () => trace.customFunction(row))

    const call = mutate.mock.calls.find(
      ([opts]) => opts.url === '/api/ListMessageTrace'
    )
    expect(call).toBeTruthy()
    const { data } = call[0]
    expect(data.messageId).toBe(row.MessageId)
    expect(data.endDate - data.startDate).toBe(172800)
    const expectedStart = Math.floor(new Date(fiveDaysAgo).getTime() / 1000) - 86400
    expect(Math.abs(data.startDate - expectedStart)).toBeLessThan(60)
  })
})
