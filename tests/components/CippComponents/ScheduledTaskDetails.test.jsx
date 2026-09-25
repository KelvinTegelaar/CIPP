import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { api, getResult } from '../../mocks/api-call'
import ScheduledTaskDetails from '../../../src/components/CippComponents/ScheduledTaskDetails'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)

// every result renders through CippDataTable (the producer always wraps Results in an array);
// a full MRT instance per tenant is what locked the browser, so count mounts instead of rendering it
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ data }) => (
    <div data-testid="result-table">{data.length} rows</div>
  ),
}))

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
try {
  TimeAgo.addDefaultLocale(en)
} catch (e) {
  /* already added */
}

// Invoke-ListScheduledItemDetails: { Task, Details: [{ Timestamp, Tenant, Results: @(...) }] }
const tenants = [
  'contoso.onmicrosoft.com',
  'fabrikam.onmicrosoft.com',
  'tailspin.onmicrosoft.com',
]
const details = {
  Task: {
    RowKey: 'task-1',
    Name: 'List mailbox rules',
    TaskState: 'Completed',
    Command: 'Get-CIPPMailboxRules',
    Tenant: [{ label: 'All Tenants', value: 'AllTenants', type: 'Tenant' }],
    Recurrence: 'Once',
    Parameters: {},
  },
  Details: tenants.map((Tenant) => ({
    Timestamp: '2026-09-24T10:00:00Z',
    Tenant,
    Results: [{ UserPrincipalName: `user@${Tenant}`, RuleName: 'Forward' }],
  })),
}
const detailsResult = getResult({ data: details })
const progressResult = getResult({ data: [] })

beforeEach(() => {
  api.get = (opts) =>
    opts.url === '/api/ListScheduledItemDetails'
      ? detailsResult
      : progressResult
})

const renderDetails = () =>
  renderWithProviders(
    <ScheduledTaskDetails data={{ RowKey: 'task-1' }} showActions={false} />
  )

describe('ScheduledTaskDetails execution results', () => {
  it('does not mount a result table for collapsed tenants on an AllTenants task', async () => {
    renderDetails()
    expect(await screen.findByText('(3 of 3)')).toBeInTheDocument()
    expect(screen.queryAllByTestId('result-table')).toHaveLength(0)
  })

  it('mounts only the expanded tenant table and drops it again on collapse', async () => {
    renderDetails()
    const summary = await screen.findByText('fabrikam.onmicrosoft.com')

    fireEvent.click(summary)
    expect(await screen.findAllByTestId('result-table')).toHaveLength(1)

    fireEvent.click(summary)
    await waitFor(() =>
      expect(screen.queryAllByTestId('result-table')).toHaveLength(0)
    )
  })
})
