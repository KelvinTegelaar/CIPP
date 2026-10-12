import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'

// Stable identities: a fresh object per call re-renders forever (tests/mocks/api-call.js)
const apiState = vi.hoisted(() => ({
  calls: [],
  issues: {
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
  ApiGetCall: (opts) => {
    apiState.calls.push(opts)
    return opts.url === '/api/ListServiceHealthIssues' ? apiState.issues : apiState.idle
  },
  ApiPostCall: () => apiState.idle,
  ApiGetCallWithPagination: () => ({
    ...apiState.idle,
    fetchNextPage: () => {},
  }),
}))

import { ServiceHealthCard } from '../../../src/components/CippComponents/ServiceHealthCard'

const tenant = 'contoso.onmicrosoft.com'
const hoursAgo = (hours) => new Date(Date.now() - hours * 3600000).toISOString()

// graph v1.0 admin/serviceAnnouncement/issues rows, as Invoke-ListServiceHealthIssues returns them
const issue = (overrides) => ({
  id: 'EX000001',
  title: 'Users may be unable to send email',
  service: 'Exchange Online',
  feature: 'Mailflow',
  featureGroup: 'E-Mail timely delivery',
  classification: 'incident',
  status: 'serviceDegradation',
  origin: 'microsoft',
  isResolved: false,
  startDateTime: hoursAgo(6),
  lastModifiedDateTime: hoursAgo(2),
  impactDescription: 'Users may be unable to send email.',
  details: [],
  posts: [],
  ...overrides,
})

// deliberately out of order: an advisory first, the newest incident last
const sampleIssues = [
  issue({
    id: 'TM000001',
    title: 'Teams meetings delayed',
    service: 'Microsoft Teams',
    classification: 'advisory',
    status: 'investigating',
    lastModifiedDateTime: hoursAgo(1),
  }),
  issue({ id: 'EX000001', lastModifiedDateTime: hoursAgo(5) }),
  issue({
    id: 'OD000001',
    title: 'OneDrive sync restored',
    service: 'OneDrive for Business',
    status: 'serviceRestored',
    isResolved: true,
    endDateTime: hoursAgo(1),
  }),
  issue({
    id: 'SP000001',
    title: 'SharePoint search degraded',
    service: 'SharePoint Online',
    lastModifiedDateTime: hoursAgo(2),
  }),
]

const rowTitles = () =>
  screen
    .getAllByText(/delayed|unable to send|search degraded|sync restored/)
    .map((el) => el.textContent)

describe('ServiceHealthCard', () => {
  beforeEach(() => {
    apiState.calls.length = 0
    apiState.issues.isLoading = false
    apiState.issues.isError = false
    apiState.issues.error = null
    apiState.issues.data = sampleIssues
  })

  it('asks the API for open issues only, for the selected tenant', () => {
    renderWithProviders(<ServiceHealthCard tenantFilter={tenant} />)

    const call = apiState.calls.find((c) => c.url === '/api/ListServiceHealthIssues')
    expect(call.data).toEqual({ tenantFilter: tenant, Open: true })
    expect(call.waiting).toBe(true)
  })

  it('lists incidents above advisories, newest update first, and never shows a resolved issue as open', () => {
    renderWithProviders(<ServiceHealthCard tenantFilter={tenant} />)

    expect(rowTitles()).toEqual([
      'SharePoint search degraded',
      'Users may be unable to send email',
      'Teams meetings delayed',
    ])
    expect(screen.queryByText('OneDrive sync restored')).not.toBeInTheDocument()
  })

  it('counts incidents and advisories separately, singular when there is one', () => {
    renderWithProviders(<ServiceHealthCard tenantFilter={tenant} />)

    expect(screen.getByText('2 Incidents')).toBeInTheDocument()
    expect(screen.getByText('1 Advisory')).toBeInTheDocument()
    expect(screen.getAllByText('Incident')).toHaveLength(2)
    expect(screen.getAllByText('Advisory')).toHaveLength(1)
  })

  it('says which service is hit, what Microsoft calls the state, and how long since the last update', () => {
    renderWithProviders(<ServiceHealthCard tenantFilter={tenant} />)

    expect(
      screen.getByTitle('Exchange Online · serviceDegradation · updated 5h ago')
    ).toBeInTheDocument()
  })

  it('shows how many tenants an AllTenants issue reached, naming the tenant when it is just one', () => {
    apiState.issues.data = [
      issue({ Tenant: '3 tenants', TenantCount: 3, Tenants: ['a.com', 'b.com', 'c.com'] }),
      issue({
        id: 'SP000001',
        title: 'SharePoint search degraded',
        Tenant: 'Contoso',
        TenantCount: 1,
        Tenants: ['Contoso'],
      }),
    ]
    renderWithProviders(<ServiceHealthCard tenantFilter="AllTenants" />)

    expect(screen.getByText('3 tenants')).toBeInTheDocument()
    expect(screen.getByText('Contoso')).toBeInTheDocument()
  })

  it('links View all to the Service Issues page filtered to open items', () => {
    renderWithProviders(<ServiceHealthCard tenantFilter={tenant} />)

    expect(screen.getByRole('link', { name: /View all/ })).toHaveAttribute(
      'href',
      '/tenant/administration/service-health/issues?filters=%5B%7B%22id%22%3A%22isResolved%22%2C%22value%22%3A%22No%22%7D%5D'
    )
  })

  it('shows the all-clear state when the request succeeded with nothing open', () => {
    apiState.issues.data = []
    renderWithProviders(<ServiceHealthCard tenantFilter={tenant} />)

    expect(screen.getByText('0 Incidents')).toBeInTheDocument()
    expect(screen.getByText('No open Microsoft service issues.')).toBeInTheDocument()
  })

  it('shows the API error instead of a false all-clear', () => {
    apiState.issues.isError = true
    apiState.issues.error = { message: 'Request failed with status code 500' }
    renderWithProviders(<ServiceHealthCard tenantFilter={tenant} />)

    expect(screen.queryByText('No open Microsoft service issues.')).not.toBeInTheDocument()
    expect(screen.getByText(/500/)).toBeInTheDocument()
  })

  it('keeps loading rather than reporting all-clear before a tenant is selected', () => {
    // a disabled query reports isLoading=false, so the guard has to come from the missing tenant
    apiState.issues.data = []
    renderWithProviders(<ServiceHealthCard tenantFilter={undefined} />)

    expect(screen.queryByText('No open Microsoft service issues.')).not.toBeInTheDocument()
    expect(screen.queryByText('0 Incidents')).not.toBeInTheDocument()
  })
})
