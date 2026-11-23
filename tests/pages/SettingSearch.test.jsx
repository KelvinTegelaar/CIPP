import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
const tablePage = vi.fn()
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tablePage(props)
    return <>{props.tableFilter}</>
  },
}))
import { api, getResult } from '../mocks/api-call'
import { ApiGetCall } from '../../src/api/ApiCall'
import Page from '../../src/pages/endpoint/MEM/setting-search/index.jsx'
import { getCippFormatting } from '../../src/utils/get-cipp-formatting'

const lastProps = () => tablePage.mock.calls.at(-1)[0]
const lastCall = () =>
  ApiGetCall.mock.calls
    .map(([opts]) => opts)
    .filter((opts) => opts.url === '/api/ListIntuneSettingSearch')
    .at(-1)
const searchBox = () =>
  screen.getByRole('textbox', { name: /Setting name or ID/ })

const rows = [{ SettingId: 'a', SettingName: 'A' }]

describe('Setting Search page', () => {
  beforeEach(() => {
    tablePage.mockClear()
    ApiGetCall.mockClear()
    api.get = getResult({ isSuccess: false })
  })

  it('does not query until the search is submitted', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await user.type(searchBox(), 'realtime')
    expect(lastCall().waiting).toBe(false)

    await user.click(screen.getByRole('button', { name: /Search/ }))
    expect(lastCall().data).toMatchObject({ search: 'realtime' })
    expect(lastCall().waiting).toBe(true)
  })

  it('searches on Enter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await user.type(searchBox(), ' password {Enter}')
    expect(lastCall().data).toMatchObject({ search: 'password' })
    expect(lastCall().waiting).toBe(true)
  })

  it('requires 3 characters before searching', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    expect(screen.getByText('Enter at least 3 characters.')).toBeInTheDocument()

    await user.type(searchBox(), ' ab {Enter}')
    expect(screen.getByRole('button', { name: /Search/ })).toBeDisabled()
    expect(lastCall().waiting).toBe(false)

    await user.type(searchBox(), 'c{Enter}')
    expect(screen.getByRole('button', { name: /Search/ })).toBeEnabled()
    expect(lastCall().data).toMatchObject({ search: 'ab c' })
    expect(lastCall().waiting).toBe(true)
  })

  it('passes the Results rows to the table', () => {
    api.get = getResult({
      data: { Results: rows, Metadata: { Truncated: false } },
    })
    renderWithProviders(<Page />)
    expect(lastProps().data).toEqual(rows)
    expect(screen.queryByText(/Refine your search/)).not.toBeInTheDocument()
  })

  it('tells the user when the results were truncated', () => {
    api.get = getResult({
      data: { Results: rows, Metadata: { Truncated: true } },
    })
    renderWithProviders(<Page />)
    expect(
      screen.getByText(
        'Showing the first 1 matching settings. Refine your search to see the rest.'
      )
    ).toBeInTheDocument()
  })

  it('opens the details drawer on row click', () => {
    renderWithProviders(<Page />)
    expect(lastProps().offCanvasOnRowClick).toBe(true)
    expect(lastProps().offCanvas.size).toBe('lg')
  })

  it('shows the setting columns', () => {
    renderWithProviders(<Page />)
    expect(lastProps().simpleColumns).toEqual([
      'SettingName',
      'Category',
      'PolicyTypes',
      'PolicyCount',
      'DeviceCount',
    ])
  })

  it('searches the selected tenant', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await user.type(searchBox(), 'realtime{Enter}')
    expect(lastCall().data).toEqual({
      tenantFilter: 'testdomain.com',
      search: 'realtime',
    })
  })

  it('renders as a standalone page for a single tenant', () => {
    renderWithProviders(Page.getLayout(<Page />))
    expect(
      screen.getByRole('textbox', { name: /Setting name or ID/ })
    ).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it.each([
    ['All Tenants', 'AllTenants'],
    ['a tenant group', 'group:g1'],
  ])(
    'asks for a single tenant and does not search for %s',
    (_, currentTenant) => {
      renderWithProviders(Page.getLayout(<Page />), {
        settings: settingsWith({ currentTenant }),
      })
      expect(screen.getByText('Pick a tenant')).toBeInTheDocument()
      expect(
        screen.queryByRole('textbox', { name: /Setting name or ID/ })
      ).not.toBeInTheDocument()
      expect(tablePage).not.toHaveBeenCalled()
      expect(lastCall()).toBeUndefined()
    }
  )

  it('passes DeviceCount values, including null, to the grid unchanged', () => {
    const counted = [
      { SettingId: 'a', SettingName: 'A', PolicyCount: 2, DeviceCount: 7 },
      { SettingId: 'b', SettingName: 'B', PolicyCount: 1, DeviceCount: 0 },
      { SettingId: 'c', SettingName: 'C', PolicyCount: 1, DeviceCount: null },
    ]
    api.get = getResult({
      data: { Results: counted, Metadata: { Truncated: false } },
    })
    renderWithProviders(<Page />)
    expect(lastProps().data.map((row) => row.DeviceCount)).toEqual([7, 0, null])
    expect(lastProps().offCanvas.extendedInfoFields).toContain('DeviceCount')
  })

  it('renders a null DeviceCount as No data and 0 as 0', () => {
    expect(getCippFormatting(null, 'DeviceCount', 'text')).toBe('No data')
    render(getCippFormatting(null, 'DeviceCount'))
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(getCippFormatting(0, 'DeviceCount', 'text')).toBe('0')
    expect(getCippFormatting(7, 'DeviceCount', 'text')).toBe('7')
  })
})
