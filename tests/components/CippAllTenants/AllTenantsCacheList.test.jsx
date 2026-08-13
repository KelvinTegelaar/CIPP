import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../../test-utils'
import { AllTenantsCacheList } from '../../../src/components/CippAllTenants/AllTenantsPrimitives'

const staleRow = {
  name: 'Contoso',
  domain: 'contoso.onmicrosoft.com',
  detail: 'Oldest collection 9 days old',
  severity: 'critical',
  ageHours: 216,
  collections: [
    {
      type: 'SPOTenant',
      lastRefresh: '2026-08-04T19:07:27.869Z',
      ageHours: 216,
    },
    {
      type: 'SiteActivity',
      lastRefresh: '2026-08-10T11:15:01.329Z',
      ageHours: 60,
    },
  ],
}

const neverCachedRow = {
  name: 'Fabrikam',
  domain: 'fabrikam.onmicrosoft.com',
  detail: 'No cached collections found',
  severity: 'critical',
  ageHours: null,
  collections: [],
}

describe('AllTenantsCacheList', () => {
  it('renders the empty text when nothing is behind', () => {
    renderWithTheme(<AllTenantsCacheList rows={[]} emptyText="All fresh" />)
    expect(screen.getByText('All fresh')).toBeInTheDocument()
  })

  it('keeps the collection detail hidden until the row is expanded', async () => {
    renderWithTheme(<AllTenantsCacheList rows={[staleRow]} />)

    expect(screen.getByText('Contoso')).toBeInTheDocument()
    expect(screen.getByText('2 stale')).toBeInTheDocument()
    expect(screen.queryByText('SPOTenant')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { expanded: false }))

    expect(screen.getByText('SPOTenant')).toBeInTheDocument()
    expect(screen.getByText('SiteActivity')).toBeInTheDocument()
  })

  it('shows each collection with its own last refresh time', async () => {
    renderWithTheme(<AllTenantsCacheList rows={[staleRow]} />)
    await userEvent.click(screen.getByRole('button', { expanded: false }))

    // The absolute stamp is locale-formatted, so assert on the age suffix the row appends to it.
    expect(screen.getByText(/9 days ago/)).toBeInTheDocument()
    expect(screen.getByText(/60 hours ago/)).toBeInTheDocument()
  })

  it('does not offer an expander for a tenant with nothing cached', () => {
    renderWithTheme(<AllTenantsCacheList rows={[neverCachedRow]} />)

    expect(screen.getByText('Fabrikam')).toBeInTheDocument()
    expect(screen.getByText('No cached collections found')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders every stale tenant rather than the first few', () => {
    const rows = Array.from({ length: 9 }, (_, index) => ({
      ...staleRow,
      name: `Tenant ${index}`,
      domain: `tenant${index}.onmicrosoft.com`,
    }))
    renderWithTheme(<AllTenantsCacheList rows={rows} />)

    expect(screen.getByText('Tenant 0')).toBeInTheDocument()
    expect(screen.getByText('Tenant 8')).toBeInTheDocument()
  })
})
