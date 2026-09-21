import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippTablePage } from '../../../src/components/CippComponents/CippTablePage'

// capture the props CippTablePage wires into the table, the wrapper's whole job
const captured = vi.hoisted(() => ({ props: null }))

vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: (props) => {
    captured.props = props
    return <div data-testid="cipp-data-table" />
  },
}))

const noTenantSettings = {
  currentTenant: null,
  currentTheme: { value: 'light', label: 'light' },
  paletteMode: 'light',
  direction: 'ltr',
  pinNav: true,
  handleUpdate: () => {},
  handleReset: () => {},
  isCustom: false,
}

describe('CippTablePage', () => {
  beforeEach(() => {
    captured.props = null
  })

  it('appends the tenant to the table title and passes the api wiring', () => {
    renderWithProviders(
      <CippTablePage
        title="Users"
        apiUrl="/api/ListUsers"
        apiData={{ Extra: '1' }}
        apiDataKey="Results"
        queryKey="Users"
      />
    )

    expect(captured.props.title).toBe('Users - testdomain.com')
    expect(captured.props.api).toEqual({
      url: '/api/ListUsers',
      data: { tenantFilter: 'testdomain.com', Extra: '1' },
      dataKey: 'Results',
    })
    expect(screen.queryByText(/No tenant selected/)).not.toBeInTheDocument()
  })

  it('warns when no tenant is selected and keeps the plain title', () => {
    renderWithProviders(<CippTablePage title="Users" apiUrl="/api/ListUsers" />, {
      settings: noTenantSettings,
    })

    expect(screen.getByText(/No tenant selected/)).toBeInTheDocument()
    expect(captured.props.title).toBe('Users')
  })

  it('suppresses the tenant warning and suffix with tenantInTitle=false', () => {
    renderWithProviders(
      <CippTablePage title="Users" apiUrl="/api/ListUsers" tenantInTitle={false} />,
      { settings: noTenantSettings }
    )

    expect(screen.queryByText(/No tenant selected/)).not.toBeInTheDocument()
    expect(captured.props.title).toBe('Users')
  })

  it('prefers initialFilters over filters', () => {
    const initialFilters = [{ id: 'a' }]
    const filters = [{ id: 'b' }]
    renderWithProviders(
      <CippTablePage
        title="Users"
        apiUrl="/api/ListUsers"
        initialFilters={initialFilters}
        filters={filters}
      />
    )

    expect(captured.props.filters).toBe(initialFilters)
  })
})
