import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'

const routerState = vi.hoisted(() => ({ push: vi.fn(), pathname: '/' }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerState.push }),
  usePathname: () => routerState.pathname,
  useSearchParams: () => new URLSearchParams(''),
}))
vi.mock('next/router', () => ({
  useRouter: () => ({ push: routerState.push, back: vi.fn(), query: {} }),
}))

// Stable identities: a fresh object per call re-renders forever (tests/mocks/api-call.js)
const apiState = vi.hoisted(() => ({
  results: {
    isSuccess: true,
    isLoading: false,
    isFetching: false,
    isPending: false,
    isError: false,
    error: null,
    data: [],
    refetch: () => {},
  },
  idle: {
    isSuccess: false,
    isFetching: false,
    isPending: false,
    isError: false,
    data: undefined,
    mutate: () => {},
    reset: () => {},
    refetch: () => {},
  },
}))
vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: ({ url }) =>
    url === '/api/ListAlertResults' ? apiState.results : apiState.idle,
  ApiPostCall: () => apiState.idle,
  ApiGetCallWithPagination: () => ({
    ...apiState.idle,
    fetchNextPage: () => {},
  }),
}))

import { AlertsOverviewCard } from '../../../src/components/CippComponents/AlertsOverviewCard'

const tenant = 'contoso.onmicrosoft.com'
const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60000).toISOString()

const item = (overrides) => ({
  PartitionKey: tenant,
  RowKey: `Get-CIPPAlertMFAAdmins-${overrides.ContentHash}`,
  CmdletName: 'Get-CIPPAlertMFAAdmins',
  AlertComment: '',
  Tenant: tenant,
  ContentPreview: overrides.AlertItem?.UserPrincipalName ?? 'item',
  Status: 'Open',
  FirstSeen: minutesAgo(3 * 24 * 60),
  LastSeen: minutesAgo(5),
  LastChecked: minutesAgo(5),
  ResolvedAt: '',
  ReopenCount: 0,
  SnoozeUntil: '',
  SnoozedBy: '',
  SnoozeReason: '',
  SnoozeVisible: false,
  SnoozeUntilResolved: false,
  SnoozePartitionKey: 'Get-CIPPAlertMFAAdmins',
  SnoozeRowKey: `${tenant}-${overrides.ContentHash}`,
  ...overrides,
})

const sampleItems = [
  item({
    ContentHash: 'alice',
    AlertItem: {
      UserPrincipalName: `alice@${tenant}`,
      Message: 'Alice has no MFA',
    },
  }),
  item({
    ContentHash: 'bob',
    AlertItem: {
      UserPrincipalName: `bob@${tenant}`,
      Message: 'Bob has no MFA',
    },
    ReopenCount: 4,
  }),
  item({
    ContentHash: 'carol',
    AlertItem: {
      UserPrincipalName: `carol@${tenant}`,
      Message: 'Carol has no MFA',
    },
    Status: 'Snoozed',
    SnoozeUntilResolved: true,
    SnoozeVisible: true,
    SnoozedBy: 'ops@contoso.com',
    SnoozeReason: 'ticket 42',
  }),
  item({
    ContentHash: 'dave',
    AlertItem: {
      UserPrincipalName: `dave@${tenant}`,
      Message: 'Dave has no MFA',
    },
    Status: 'Snoozed',
    SnoozeUntil: String(Math.round(Date.now() / 1000) + 7 * 86400),
    SnoozedBy: 'ops@contoso.com',
  }),
  item({
    ContentHash: 'erin',
    AlertItem: {
      UserPrincipalName: `erin@${tenant}`,
      Message: 'Erin has no MFA',
    },
    Status: 'Resolved',
    ResolvedAt: minutesAgo(90),
  }),
]

describe('AlertsOverviewCard', () => {
  beforeEach(() => {
    apiState.results.isLoading = false
    apiState.results.isError = false
    apiState.results.error = null
    apiState.results.data = sampleItems
  })

  it('counts each status and groups the rows into active, snoozed and recently resolved', () => {
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    expect(screen.getByText('2 Open')).toBeInTheDocument()
    expect(screen.getByText('2 Snoozed')).toBeInTheDocument()
    expect(screen.getByText('1 Resolved (48h)')).toBeInTheDocument()

    expect(screen.getByText('Recently resolved')).toBeInTheDocument()
    expect(screen.getByText(`erin@${tenant}`)).toBeInTheDocument()
    expect(
      screen.queryByText('No open alerts for this tenant.')
    ).not.toBeInTheDocument()
  })

  it('keeps a visible snooze in the main list and hides the others in the snoozed section', () => {
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    const titles = screen
      .getAllByTitle(/@contoso\.onmicrosoft\.com$/)
      .map((el) => el.textContent)
    // bob (flapping) first, then alice, then carol (visible snooze), then the hidden dave, then erin
    expect(titles).toEqual([
      `bob@${tenant}`,
      `alice@${tenant}`,
      `carol@${tenant}`,
      `dave@${tenant}`,
      `erin@${tenant}`,
    ])
    expect(screen.getByText('Until resolved')).toBeInTheDocument()
    // the section heading for hidden snoozes, distinct from the count chip
    expect(
      screen.getByText('Snoozed', { selector: 'span.MuiTypography-overline' })
    ).toBeInTheDocument()
  })

  it('shows how long an item has been open, and why a snoozed one is snoozed', () => {
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    expect(
      screen.getAllByTitle(/First seen 3d ago · checked 5m ago/)
    ).toHaveLength(2)
    expect(
      screen.getByTitle(
        /Snoozed until it resolves · by ops@contoso.com · ticket 42 · checked 5m ago/
      )
    ).toBeInTheDocument()
  })

  it('flags flapping items', () => {
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    expect(screen.getByText('Flapping')).toBeInTheDocument()
  })

  it('offers snooze on open items, remove-snooze on snoozed ones, and opens the snooze dialog', () => {
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    const snoozeButtons = screen.getAllByLabelText('Snooze this alert')
    expect(snoozeButtons).toHaveLength(2)
    expect(screen.getAllByLabelText('Remove snooze')).toHaveLength(2)

    fireEvent.click(snoozeButtons[0])
    expect(screen.getByText('Snooze Alert')).toBeInTheDocument()
    expect(
      screen.getByText('Snooze until it resolves')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Keep it visible on the dashboard/)
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/forever/i)).not.toBeInTheDocument()
  })

  it('links to the history page', () => {
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    expect(screen.getByRole('link', { name: /History/ })).toHaveAttribute(
      'href',
      '/tenant/administration/alert-configuration/history'
    )
  })

  it('shows the empty state when nothing is tracked', () => {
    apiState.results.data = []
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    expect(screen.getByText('0 Open')).toBeInTheDocument()
    expect(
      screen.getByText('No open alerts for this tenant.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Recently resolved')).not.toBeInTheDocument()
  })

  it('shows the API error instead of a false empty state', () => {
    apiState.results.isError = true
    apiState.results.error = { message: 'Request failed with status code 500' }
    renderWithProviders(<AlertsOverviewCard tenantFilter={tenant} />)

    expect(
      screen.queryByText('No open alerts for this tenant.')
    ).not.toBeInTheDocument()
    expect(screen.getByText(/500/)).toBeInTheDocument()
  })
})
