import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult, postResult } from '../mocks/api-call'
import { CippApiDialog } from '../../src/components/CippComponents/CippApiDialog'

const tableProps = vi.hoisted(() => ({ current: null }))
const permissions = vi.hoisted(() => ({ granted: [] }))
const reportDB = vi.hoisted(() => ({ resolvedQueryKey: undefined }))

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/layouts/index', () => ({ Layout: vi.fn() }))
vi.mock('../../src/hooks/use-permissions', () => ({
  usePermissions: () => ({
    checkPermissions: (required) =>
      required.some((entry) => permissions.granted.includes(entry)),
  }),
}))
vi.mock('../../src/components/CippComponents/CippReportDBControls', () => ({
  useCippReportDB: () => ({
    cacheColumns: [],
    resolvedQueryKey: reportDB.resolvedQueryKey,
  }),
}))
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tableProps.current = props
    return null
  },
}))

import Page from '../../src/pages/security/defender/indicators'

const indicator = {
  id: '995',
  indicatorValue: 'bad.example',
  indicatorType: 'DomainName',
  action: 'Block',
  Tenant: 'contoso.com',
}

const removeAction = (
  currentTenant,
  granted = ['Security.Defender.ReadWrite']
) => {
  permissions.granted = granted
  const { unmount } = renderWithProviders(<Page />, {
    settings: settingsWith({ currentTenant }),
  })
  unmount()
  return tableProps.current.actions.find((action) => action.label === 'Remove')
}

const submit = async (action, row, currentTenant) => {
  const user = userEvent.setup()
  renderWithProviders(
    <CippApiDialog
      createDialog={{ open: true, handleClose: vi.fn() }}
      title="Confirmation"
      api={action}
      fields={action.fields}
      row={row}
    />,
    { settings: settingsWith({ currentTenant }) }
  )
  await user.click(screen.getByRole('button', { name: 'Confirm' }))
  await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
  return api.post.mutate.mock.calls[0][0]
}

beforeEach(() => {
  api.post = postResult()
  api.get = getResult({ isSuccess: false })
})

describe('Defender indicators remove action', () => {
  it('is hidden from a read-only technician', () => {
    const action = removeAction('contoso.com', ['Security.Defender.Read'])
    expect(action.condition(indicator)).toBe(false)
  })

  it('removes the indicator from the selected tenant and names it', async () => {
    const action = removeAction('contoso.com')
    const row = indicator
    expect(action.condition(row)).toBe(true)
    const call = await submit(action, row, 'contoso.com')
    expect(
      screen.getByText(
        /Remove the Block indicator for bad\.example from contoso\.com\?/
      )
    ).toBeTruthy()
    expect(call).toEqual({
      url: '/api/RemoveDefenderIndicator',
      bulkRequest: true,
      data: [{ tenantFilter: 'contoso.com', IndicatorIds: ['995'] }],
    })
    expect(action.relatedQueryKeys).toContain('ListDefenderIndicators*')
  })

  it.each([['AllTenants'], ['group:7f1c']])(
    'sends the row tenant, not the %s selection',
    async (selection) => {
      const action = removeAction(selection)
      const row = {
        ...indicator,
        Tenant: 'fabrikam.com',
      }
      const call = await submit(action, row, selection)
      expect(screen.getByText(/from fabrikam\.com\?/)).toBeTruthy()
      expect(call.data).toEqual([
        { tenantFilter: 'fabrikam.com', IndicatorIds: ['995'] },
      ])
    }
  )

  it('groups selected rows by their own tenant, drops repeats and splits at 500', () => {
    const action = removeAction('AllTenants')
    const rows = [
      ...Array.from({ length: 1001 }, (_, index) => ({
        ...indicator,
        id: String(index),
      })),
      { ...indicator, id: '0' },
      { ...indicator, id: 7, Tenant: 'fabrikam.com' },
    ]
    const batches = action.customDataformatter(rows)
    expect(
      batches.map((batch) => [batch.tenantFilter, batch.IndicatorIds.length])
    ).toEqual([
      ['contoso.com', 500],
      ['contoso.com', 500],
      ['contoso.com', 1],
      ['fabrikam.com', 1],
    ])
    expect(batches[3].IndicatorIds).toEqual(['7'])
    expect(
      new Set(batches.slice(0, 3).flatMap((batch) => batch.IndicatorIds)).size
    ).toBe(1001)
  })

  it('never sends a row without a concrete tenant', () => {
    const action = removeAction('AllTenants')
    const rows = [
      { ...indicator, Tenant: undefined },
      { ...indicator, Tenant: 'AllTenants' },
      { ...indicator, Tenant: 'group:7f1c' },
      { ...indicator, id: undefined },
    ]
    for (const row of rows) expect(action.condition(row)).toBe(false)
    expect(action.customDataformatter(rows)).toEqual([])
  })

  it('never assigns rows to the newly selected tenant', () => {
    const action = removeAction('other.com')
    const row = tableProps.current.dataMap?.(indicator) ?? indicator
    expect(row.Tenant).toBe('contoso.com')
    expect(action.condition(row)).toBe(false)
    expect(action.customDataformatter([row])).toEqual([])
  })
})

describe('Defender indicators page', () => {
  it('does not offer the add drawer to a read-only technician', () => {
    removeAction('contoso.com', ['Security.Defender.Read'])
    expect(tableProps.current.cardButton).toBeFalsy()
  })

  it('offers the add drawer to writers and shows the Allowed filter', () => {
    removeAction('contoso.com')
    expect(tableProps.current.cardButton).toBeTruthy()
    expect(
      tableProps.current.filters.find(
        ({ filterName }) => filterName === 'Allowed'
      )
    ).toMatchObject({
      filterType: 'equal',
      value: [{ id: 'action', value: 'Allowed' }],
    })
  })

  it.each([
    ['live', 'ListDefenderIndicators-contoso.com'],
    ['cached', 'ListDefenderIndicators-AllTenants-true'],
  ])(
    'gives the add drawer the %s table query to refresh',
    (_mode, queryKey) => {
      reportDB.resolvedQueryKey = queryKey
      removeAction('contoso.com')
      expect(tableProps.current.cardButton.props.queryKey).toBe(queryKey)
    }
  )
})
