import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import router from '../../mocks/next-router'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

try {
  TimeAgo.addDefaultLocale(en)
} catch (e) {
  /* already added */
}

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
import { api, getResult } from '../../mocks/api-call'
// MRT renders no rows in jsdom, so the table is stubbed and only the status cell renderer is real.
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ data, cellRenderers, actions }) => (
    <ul>
      {data.map((row) => (
        <li key={row.displayName}>
          {actions[0].condition(row) ? (
            <button
              onClick={() => actions[0].customFunction(row, actions[0], {})}
            >
              {row.displayName}
            </button>
          ) : (
            row.displayName
          )}{' '}
          {cellRenderers.status(row)}
        </li>
      ))}
    </ul>
  ),
}))
import { ApiGetCall } from '../../../src/api/ApiCall'
import { CippIntuneAssignmentsTable } from '../../../src/components/CippComponents/CippIntuneAssignmentsTable'

const rowsResult = getResult({
  data: [
    {
      category: 'Intune Settings Catalog Policy',
      displayName: 'Block USB',
      policyId: 'p-1',
      status: 'Excluded',
      assignedVia: 'All users',
      excludedVia: 'Sales',
      CacheTimestamp: '2026-11-16T18:00:00Z',
    },
    {
      category: 'Intune Application',
      displayName: 'Teams & Outlook',
      policyId: 'app/2',
      status: 'Applies',
    },
    {
      category: 'Apple Enrollment Profile',
      displayName: 'iPhone enrolment',
      policyId: 'p-3',
      status: 'Applies',
    },
  ],
})
const otherResult = getResult({ isSuccess: false })
const answer = (result) => (opts) =>
  opts?.url === '/api/ListIntuneAssignments' ? result : otherResult

describe('CippIntuneAssignmentsTable', () => {
  it('lists the assignments with their status', async () => {
    api.get = answer(rowsResult)
    renderWithProviders(
      <CippIntuneAssignmentsTable
        tenantFilter="contoso.com"
        type="user"
        id="u1"
      />
    )

    expect(await screen.findByText(/Block USB/)).toBeInTheDocument()
    expect(screen.getByText('Excluded')).toBeInTheDocument()
    expect(
      screen.queryByRole('switch', { name: /nested/ })
    ).not.toBeInTheDocument()
  })

  it('shows why nothing loaded when the tenant has no Intune data yet', async () => {
    api.get = answer(
      getResult({
        isSuccess: false,
        isError: true,
        error: {
          response: {
            data: { Results: 'No Intune data is cached for this tenant yet.' },
          },
        },
      })
    )
    renderWithProviders(
      <CippIntuneAssignmentsTable
        tenantFilter="contoso.com"
        type="user"
        id="u1"
      />
    )

    expect(
      await screen.findByText('No Intune data is cached for this tenant yet.')
    ).toBeInTheDocument()
  })

  it('asks for parent groups when the nested switch is turned on', async () => {
    const user = userEvent.setup()
    api.get = answer(rowsResult)
    renderWithProviders(
      <CippIntuneAssignmentsTable
        tenantFilter="contoso.com"
        type="group"
        id="g1"
        allowNested
      />
    )

    await user.click(
      screen.getByRole('switch', {
        name: 'Include groups this group is nested in',
      })
    )

    const requests = ApiGetCall.mock.calls
      .map(([opts]) => opts)
      .filter((opts) => opts?.url === '/api/ListIntuneAssignments')
    expect(requests.at(-1).data).toEqual(
      expect.objectContaining({ type: 'group', id: 'g1', includeNested: true })
    )
  })

  it('opens each policy in its list in the same tab, searched by its id', async () => {
    const user = userEvent.setup()
    const push = vi.spyOn(router, 'push')
    api.get = answer(rowsResult)
    renderWithProviders(
      <CippIntuneAssignmentsTable
        tenantFilter="contoso.com"
        type="user"
        id="u1"
      />
    )

    await user.click(await screen.findByRole('button', { name: 'Block USB' }))
    await user.click(screen.getByRole('button', { name: 'Teams & Outlook' }))

    expect(push.mock.calls).toEqual([
      [
        '/endpoint/MEM/list-policies?tenantFilter=contoso.com&search=p-1&open=p-1',
      ],
      [
        '/endpoint/applications/list?tenantFilter=contoso.com&search=app%2F2&open=app%2F2',
      ],
    ])
    expect(
      screen.queryByRole('button', { name: 'iPhone enrolment' })
    ).not.toBeInTheDocument()
    push.mockRestore()
  })
})
