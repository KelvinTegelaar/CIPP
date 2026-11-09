import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'

const apiState = vi.hoisted(() => ({ current: null, calls: [] }))
vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: (args) => {
    apiState.calls.push(args)
    return apiState.current
  },
}))

// MRT cells never render in jsdom; the table's input is what matters here
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ data, simpleColumns }) => (
    <div data-testid="table" data-columns={simpleColumns.join(',')}>
      {data.map((row) => row.DeviceName ?? row.UserPrincipalName).join('|')}
    </div>
  ),
}))

import { CippIntuneDeploymentStatus } from '../../../src/components/CippComponents/CippIntuneDeploymentStatus'

const loaded = (Results) => ({
  isSuccess: true,
  isLoading: false,
  isFetching: false,
  isError: false,
  data: { Results },
  refetch: () => {},
})

const row = { id: 'policy-1', URLName: 'ConfigurationPolicies' }

describe('CippIntuneDeploymentStatus', () => {
  beforeEach(() => {
    apiState.calls = []
  })

  it('asks for the row type and counts statuses on the active tab', () => {
    apiState.current = loaded({
      Devices: [
        { DeviceName: 'PC1', Status: 'Succeeded' },
        { DeviceName: 'PC2', Status: 'Error' },
        { DeviceName: 'PC3', Status: 'Succeeded' },
      ],
      Users: [{ UserPrincipalName: 'a@contoso.com', Status: 'Error' }],
    })

    renderWithProviders(<CippIntuneDeploymentStatus row={row} tenant="contoso.com" />)

    expect(apiState.calls[0].url).toBe('/api/ListIntuneDeploymentStatus')
    expect(apiState.calls[0].data).toEqual({ tenantFilter: 'contoso.com', ID: 'policy-1', Type: 'ConfigurationPolicies' })
    expect(screen.getByRole('tab', { name: 'Devices (3)' })).toBeInTheDocument()
    expect(screen.getByText('Succeeded: 2')).toBeInTheDocument()
    expect(screen.getByText('Error: 1')).toBeInTheDocument()
    expect(screen.getByTestId('table')).toHaveTextContent('PC1|PC2|PC3')

    fireEvent.click(screen.getByRole('tab', { name: 'Users (1)' }))
    expect(screen.getByTestId('table')).toHaveTextContent('a@contoso.com')
    expect(screen.getByTestId('table').dataset.columns).toContain('DeviceCount')
    expect(screen.queryByText('Succeeded: 2')).not.toBeInTheDocument()
  })

  it('hides the side Intune has no status for', () => {
    apiState.current = loaded({ Devices: null, Users: [{ UserPrincipalName: 'a@contoso.com', Status: 'Checked in' }] })

    renderWithProviders(<CippIntuneDeploymentStatus row={row} tenant="contoso.com" type="iosManagedAppProtection" />)

    expect(apiState.calls[0].data.Type).toBe('iosManagedAppProtection')
    expect(screen.queryByRole('tab', { name: /Devices/ })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Users (1)' })).toBeInTheDocument()
  })

  it('says so when the type has no status at all', () => {
    apiState.current = loaded({ Devices: null, Users: null })

    renderWithProviders(<CippIntuneDeploymentStatus row={row} tenant="contoso.com" />)

    expect(screen.getByText('Intune has no deployment status for this type.')).toBeInTheDocument()
  })

  it('queries the row tenant on All Tenants lists and stays idle without one', () => {
    apiState.current = loaded({ Devices: [], Users: [] })

    renderWithProviders(<CippIntuneDeploymentStatus row={{ ...row, Tenant: 'fabrikam.com' }} tenant="AllTenants" />)
    expect(apiState.calls.at(-1).data.tenantFilter).toBe('fabrikam.com')
    expect(apiState.calls.at(-1).waiting).toBe(true)

    const { container } = renderWithProviders(<CippIntuneDeploymentStatus row={row} tenant="AllTenants" />)
    expect(apiState.calls.at(-1).waiting).toBe(false)
    expect(container).toBeEmptyDOMElement()
  })
})
