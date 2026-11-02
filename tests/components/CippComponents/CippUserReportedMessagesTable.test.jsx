import React from 'react'
import { act, screen } from '@testing-library/react'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { api, apiCallMock, getResult, postResult } from '../../mocks/api-call'
import { CippUserReportedMessagesTable } from '../../../src/components/CippComponents/CippUserReportedMessagesTable'

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

const reportedRow = {
  InternetMessageId: '<id@mail.evil.example>',
  Tenant: 'fabrikam.com',
  Subject: 'Suspicious invoice',
  Sender: 'billing@mail.evil.example',
  RecipientEmail: 'user@fabrikam.com',
  ReporterEmail: 'user@fabrikam.com',
  Category: 'phishing',
}

describe('CippUserReportedMessagesTable', () => {
  it('exposes the message content actions and gates them on the message id', () => {
    api.get = () => getResult()
    renderWithProviders(<CippUserReportedMessagesTable />)
    const { actions, apiUrl } = tableProps.current
    const labels = actions.map((action) => action.label)

    expect(apiUrl).toBe('/api/ListUserReportedMessages')
    expect(labels).toContain('Preview Message')
    expect(labels).toContain('View Message Headers')
    expect(labels).toContain('Download Message (.eml)')
    expect(labels).toContain('View Message Trace')
    expect(labels).toContain('Block Sender')

    const preview = actions.find((action) => action.label === 'Preview Message')
    expect(preview.condition(reportedRow)).toBe(true)
    expect(preview.condition({ ...reportedRow, InternetMessageId: null })).toBe(
      false
    )
  })

  it('targets the row tenant for per-message calls in the AllTenants view', async () => {
    const callOpts = []
    api.get = (opts) => {
      callOpts.push(opts)
      return getResult()
    }
    renderWithProviders(<CippUserReportedMessagesTable />, {
      settings: settingsWith({ currentTenant: 'AllTenants' }),
    })

    const preview = tableProps.current.actions.find(
      (action) => action.label === 'Preview Message'
    )
    await act(async () => preview.customFunction(reportedRow))

    const contentsCall = callOpts.find(
      (opts) =>
        opts.url === '/api/ListUserReportedMessage' &&
        opts.data?.InternetMessageId === reportedRow.InternetMessageId
    )
    expect(contentsCall).toBeTruthy()
    expect(contentsCall.data.tenantFilter).toBe('fabrikam.com')
    expect(contentsCall.data.RecipientEmail).toBe('user@fabrikam.com')
  })

  it('renders the raw message headers in the headers dialog', async () => {
    const headerText =
      'Received: from mail.evil.example\r\nX-CIPP-Test: present'
    api.get = (opts) =>
      opts.url === '/api/ListUserReportedMessage'
        ? getResult({ data: { Header: headerText } })
        : getResult()
    renderWithProviders(<CippUserReportedMessagesTable />)

    const viewHeaders = tableProps.current.actions.find(
      (action) => action.label === 'View Message Headers'
    )
    await act(async () => viewHeaders.customFunction(reportedRow))

    expect(screen.getByText(/X-CIPP-Test: present/)).toBeInTheDocument()
  })

  it('shows the API error in the preview dialog when retrieval fails', async () => {
    api.get = (opts) =>
      opts.url === '/api/ListUserReportedMessage'
        ? getResult({
            isSuccess: false,
            isError: true,
            error: {
              response: { data: 'The reported message could not be retrieved' },
            },
          })
        : getResult()
    renderWithProviders(<CippUserReportedMessagesTable />)

    const preview = tableProps.current.actions.find(
      (action) => action.label === 'Preview Message'
    )
    await act(async () => preview.customFunction(reportedRow))

    expect(screen.getByText(/could not be retrieved/)).toBeInTheDocument()
  })

  it('requests a message trace window pinned to the received time, not the ~48h Graph default', async () => {
    const mutate = vi.fn()
    api.get = () => getResult()
    api.post = postResult({ mutate })
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    const row = { ...reportedRow, ReceivedDateTime: fiveDaysAgo }
    renderWithProviders(<CippUserReportedMessagesTable />)

    const trace = tableProps.current.actions.find(
      (action) => action.label === 'View Message Trace'
    )
    await act(async () => trace.customFunction(row))

    const call = mutate.mock.calls.find(
      ([opts]) => opts.url === '/api/ListMessageTrace'
    )
    expect(call).toBeTruthy()
    const { data } = call[0]
    expect(data.messageId).toBe(row.InternetMessageId)
    expect(data.endDate - data.startDate).toBe(172800)
    const expectedStart = Math.floor(new Date(fiveDaysAgo).getTime() / 1000) - 86400
    expect(Math.abs(data.startDate - expectedStart)).toBeLessThan(60)
  })
})
