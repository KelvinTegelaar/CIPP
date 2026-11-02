import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from 'next/router'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Capture what the page asks ListLogs for; the table itself is not under test.
const tableProps = vi.hoisted(() => ({ current: null }))
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tableProps.current = props
    return <div>{props.tableFilter}</div>
  },
}))
const settingsState = vi.hoisted(() => ({ currentTenant: 'contoso.com' }))
vi.mock('../../src/hooks/use-settings.js', () => ({ useSettings: () => settingsState }))

import Page from '../../src/pages/cipp/logs/index.jsx'

const renderPage = () =>
  renderWithProviders(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Page />
    </LocalizationProvider>
  )

describe('Logbook filters', () => {
  beforeEach(() => {
    tableProps.current = null
    settingsState.currentTenant = 'contoso.com'
    router.query = {}
  })

  it('spans every tenant until the tenant switch is turned on, even with other filters applied', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(tableProps.current.apiData.Tenant).toBeNull()

    await user.click(screen.getByText('Logbook Filters'))
    await user.type(screen.getByRole('textbox', { name: 'Filter by Username' }), 'tech@msp.com')
    await user.click(screen.getByRole('button', { name: /apply filters/i }))
    await waitFor(() => expect(tableProps.current.apiData.Filter).toBe(true))
    expect(tableProps.current.apiData.Tenant).toBeNull()

    await user.click(screen.getByText('Logbook Filters'))
    await user.click(screen.getByLabelText('Only show logs for contoso.com'))
    await user.click(screen.getByRole('button', { name: /apply filters/i }))
    await waitFor(() => expect(tableProps.current.apiData.Tenant).toBe('contoso.com'))

    await user.click(screen.getByText('Logbook Filters'))
    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    await waitFor(() => expect(tableProps.current.apiData.Tenant).toBeNull())
  }, 30000)

  it('cannot limit to a tenant while All Tenants is selected', async () => {
    settingsState.currentTenant = 'AllTenants'
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('Logbook Filters'))
    expect(screen.getByLabelText(/select a tenant first/i)).toBeDisabled()
    expect(tableProps.current.apiData.Tenant).toBeNull()
  }, 30000)

  it('loads every filter from the URL, so a filtered view can be shared or linked to', async () => {
    router.query = {
      search: 'Hudu Extension Sync',
      days: '7',
      severity: 'Error,Warn',
      ip: '203.0.113.10',
      appId: 'aaaaaaaa-0000-0000-0000-000000000001',
      tenantOnly: 'true',
    }
    renderPage()
    await waitFor(() =>
      expect(tableProps.current.apiData).toMatchObject({
        Search: 'Hudu Extension Sync',
        Days: 7,
        Severity: 'Error,Warn',
        IP: '203.0.113.10',
        AppId: 'aaaaaaaa-0000-0000-0000-000000000001',
        Tenant: 'contoso.com',
        Filter: true,
      })
    )
  }, 30000)

  it('sends search, IP and app ID and writes the applied filters back to the URL', async () => {
    const replace = vi.spyOn(router, 'replace')
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('Logbook Filters'))
    await user.type(screen.getByRole('textbox', { name: 'Search messages' }), 'failed')
    await user.type(screen.getByRole('textbox', { name: 'Filter by IP address' }), '198.51.100')
    await user.type(screen.getByRole('textbox', { name: 'Filter by App ID' }), 'app-1')
    await user.click(screen.getByRole('button', { name: /apply filters/i }))
    await waitFor(() =>
      expect(tableProps.current.apiData).toMatchObject({
        Search: 'failed',
        IP: '198.51.100',
        AppId: 'app-1',
        Filter: true,
      })
    )
    expect(replace).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: { search: 'failed', ip: '198.51.100', appId: 'app-1' } }),
      undefined,
      { shallow: true }
    )
    replace.mockRestore()
  }, 30000)

  it('applies a quick range from the button group', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('Logbook Filters'))
    await user.click(screen.getByRole('button', { name: '7d' }))
    await user.click(screen.getByRole('button', { name: /apply filters/i }))
    await waitFor(() => expect(tableProps.current.apiData).toMatchObject({ Days: 7, Filter: true }))
    expect(tableProps.current.apiData.StartDate).toBeNull()
    expect(screen.getByText(/Last 7 days/)).toBeInTheDocument()
  }, 30000)
})
