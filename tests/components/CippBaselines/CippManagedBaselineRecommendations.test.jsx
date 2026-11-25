import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
// MRT rows do not render in jsdom: the stub shows the rows and hands the first two back as ticked.
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ data, cardButton, actions, offCanvas }) => (
    <div>
      {cardButton}
      {data[0] && offCanvas.children(data[0])}
      {data.map((row) => (
        <div key={row.rowKey}>{row.recommendation}</div>
      ))}
      <button onClick={() => actions[0].customFunction(data.slice(0, 2))}>
        {actions[0].label} (two ticked)
      </button>
      <button onClick={() => actions[0].customFunction(data[2])}>
        {actions[0].label} (one row)
      </button>
    </div>
  ),
}))
const push = vi.fn()
vi.mock('next/router', () => ({ useRouter: () => ({ push, query: {} }) }))
import { api, getResult, postResult } from '../../mocks/api-call'
import { ApiGetCall } from '../../../src/api/ApiCall'
import { CippManagedBaselineRecommendations } from '../../../src/components/CippBaselines/CippManagedBaselineRecommendations'

const tenants = getResult({
  data: [
    {
      defaultDomainName: 'testdomain.com',
      displayName: 'Contoso',
      customerId: 'tenant-1',
    },
  ],
})
const scanned = (scan) =>
  getResult({
    data: {
      Results: [
        {
          rowKey: 'rec-AuditLog',
          recommendation: 'Enable the Unified Audit Log',
          status: 'Recommended',
          // What an empty list used to arrive as.
          differences: [null],
        },
        {
          rowKey: 'rec-OauthConsent',
          recommendation: 'Require admin consent for applications',
          status: 'Covered by a baseline',
        },
        {
          rowKey: 'rec-SmartLockout',
          recommendation: 'Set the Smart Lockout threshold',
          status: 'Recommended',
        },
      ],
      Metadata: {
        scan: { status: 'Finished', total: 3, ...scan },
      },
    },
  })
let listResult
const listCalls = () =>
  ApiGetCall.mock.calls
    .map(([options]) => options)
    .filter(
      (options) => options.url === '/api/ListManagedBaselineRecommendations'
    )

describe('Managed baseline recommendations', () => {
  beforeEach(() => {
    ApiGetCall.mockClear()
    push.mockClear()
    listResult = scanned()
    api.get = (options) =>
      options?.url === '/api/ListTenants'
        ? tenants
        : options?.waiting
          ? listResult
          : getResult({ isSuccess: false })
    api.post = postResult()
  })

  it('asks for nothing while more than one tenant is selected', () => {
    renderWithProviders(<CippManagedBaselineRecommendations />, {
      settings: settingsWith({ currentTenant: 'AllTenants' }),
    })

    expect(listCalls().every((options) => options.waiting === false)).toBe(true)
    expect(
      screen.getByText(
        'Choose one tenant in the tenant selector to see its recommendations.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Scan/ })).toBeNull()
  })

  it('shows the findings of the tenant selected at the top of the page', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippManagedBaselineRecommendations />)

    expect(listCalls().at(-1)).toMatchObject({
      data: { tenantFilter: 'testdomain.com' },
      waiting: true,
    })
    expect(
      screen.getAllByText('Enable the Unified Audit Log').length
    ).toBeGreaterThan(0)
    expect(
      screen.getByText('Set the Smart Lockout threshold')
    ).toBeInTheDocument()
  })

  it('starts a scan', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippManagedBaselineRecommendations />)

    await user.click(screen.getByRole('button', { name: 'Scan testdomain.com' }))
    expect(api.post.mutate).toHaveBeenLastCalledWith({
      url: '/api/ExecManagedBaselineRecommendation',
      data: { tenantFilter: 'testdomain.com', Action: 'Scan' },
    })

    expect(screen.queryByText('Scan Every Week')).toBeNull()
  })

  it('shows how far a running scan is', async () => {
    listResult = scanned({ status: 'Running', compared: 132, total: 181 })
    const user = userEvent.setup()
    renderWithProviders(<CippManagedBaselineRecommendations />)

    expect(
      screen.getByText('132 of 181 recommendations compared.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scanning testdomain.com...' })).toBeDisabled()
  })

  it('generates from every recommended row, from the ticked rows, or from one row', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippManagedBaselineRecommendations />)
    const sent = (rows) => ({
      url: '/api/ExecManagedBaselineRecommendation',
      data: { tenantFilter: 'testdomain.com', Action: 'Generate', rows },
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Generate Baseline for All Recommendations (2)',
      })
    )
    expect(api.post.mutate).toHaveBeenLastCalledWith(sent([]))

    await user.click(
      screen.getByRole('button', {
        name: 'Generate Baseline for Selection (two ticked)',
      })
    )
    expect(api.post.mutate).toHaveBeenLastCalledWith(
      sent(['rec-AuditLog', 'rec-OauthConsent'])
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Generate Baseline for Selection (one row)',
      })
    )
    expect(api.post.mutate).toHaveBeenLastCalledWith(sent(['rec-SmartLockout']))
  })

  it('opens the editor once the baseline is prepared', async () => {
    api.post = postResult({
      isSuccess: true,
      data: { data: { Results: 'Prepared.', Metadata: { failed: [] } } },
    })
    const user = userEvent.setup()
    renderWithProviders(<CippManagedBaselineRecommendations />)

    expect(push).toHaveBeenCalledWith(
      '/tenant/baselines/template?recommendation=testdomain.com'
    )
  })
})
