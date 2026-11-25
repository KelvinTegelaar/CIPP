import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult, postResult } from '../mocks/api-call'
import { CippApiDialog } from '../../src/components/CippComponents/CippApiDialog'

const tableProps = vi.hoisted(() => ({ current: null }))
const permissions = vi.hoisted(() => ({ granted: [] }))

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
  useCippReportDB: () => ({ cacheColumns: [] }),
}))
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tableProps.current = props
    return null
  },
}))

import Page from '../../src/pages/security/defender/devices'

const machineId = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
const deviceWithoutTenant = {
  id: machineId,
  computerDnsName: 'mde-lab-w11',
  onboardingStatus: 'Onboarded',
}
const device = { ...deviceWithoutTenant, Tenant: 'contoso.com' }
const writeActions = [
  'Isolate device',
  'Release from isolation',
  'Run antivirus scan',
]

const pageActions = (
  currentTenant,
  granted = ['Security.Defender.ReadWrite']
) => {
  permissions.granted = granted
  const { unmount } = renderWithProviders(<Page />, {
    settings: settingsWith({ currentTenant }),
  })
  unmount()
  return Object.fromEntries(
    tableProps.current.actions.map((action) => [action.label, action])
  )
}

const submit = async (
  action,
  row,
  { currentTenant = 'contoso.com', fill } = {}
) => {
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
  if (fill) await fill(user)
  await user.click(screen.getByRole('button', { name: 'Confirm' }))
  await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
  return api.post.mutate.mock.calls[0][0]
}

beforeEach(() => {
  api.post = postResult()
  api.get = getResult({ isSuccess: false })
})

describe('Defender devices row actions', () => {
  it('offers only the history to a read-only technician', () => {
    const actions = pageActions('contoso.com', ['Security.Defender.Read'])
    for (const label of writeActions) {
      expect(actions[label].condition(device)).toBe(false)
    }
    expect(actions['Action history'].condition(device)).toBe(true)
  })

  it('offers isolate and scan only on onboarded devices, and release on any device', () => {
    const actions = pageActions('contoso.com')
    const stale = { ...device, onboardingStatus: 'InsufficientInfo' }
    expect(actions['Isolate device'].condition(device)).toBe(true)
    expect(actions['Run antivirus scan'].condition(device)).toBe(true)
    expect(actions['Isolate device'].condition(stale)).toBe(false)
    expect(actions['Run antivirus scan'].condition(stale)).toBe(false)
    expect(actions['Release from isolation'].condition(stale)).toBe(true)
    expect(actions['Action history'].condition(stale)).toBe(true)
  })

  it('acts on one device at a time and refreshes the history after a write', () => {
    const actions = pageActions('contoso.com')
    for (const action of Object.values(actions)) {
      expect(action.hideBulk).toBe(true)
    }
    for (const label of writeActions) {
      expect(actions[label].relatedQueryKeys).toContain(
        'ListDefenderMachineActions-*'
      )
    }
  })

  it('isolates fully by default in the selected tenant and names the device and tenant', async () => {
    const actions = pageActions('contoso.com')
    const call = await submit(actions['Isolate device'], device)
    expect(
      screen.getByText(/Isolate mde-lab-w11 in contoso\.com\?/)
    ).toBeTruthy()
    expect(call).toEqual({
      url: '/api/ExecDefenderMachineAction',
      bulkRequest: false,
      data: {
        tenantFilter: 'contoso.com',
        machineId,
        Action: 'Isolate',
        IsolationType: 'Full',
        Comment: '',
      },
    })
  })

  it('sends a selective isolation with the comment typed', async () => {
    const actions = pageActions('contoso.com')
    const call = await submit(actions['Isolate device'], device, {
      fill: async (user) => {
        await user.click(screen.getByLabelText(/^Selective/))
        await user.type(screen.getByRole('textbox'), 'Ticket 4411')
      },
    })
    expect(call.data).toMatchObject({
      Action: 'Isolate',
      IsolationType: 'Selective',
      Comment: 'Ticket 4411',
    })
  })

  it('releases without an isolation or scan type', async () => {
    const actions = pageActions('contoso.com')
    const call = await submit(actions['Release from isolation'], device)
    expect(call.data).toEqual({
      tenantFilter: 'contoso.com',
      machineId,
      Action: 'Release',
      Comment: '',
    })
  })

  it('runs a quick scan by default', async () => {
    const actions = pageActions('contoso.com')
    const quick = await submit(actions['Run antivirus scan'], device)
    expect(quick.data).toMatchObject({ Action: 'Scan', ScanType: 'Quick' })
    expect(quick.data).not.toHaveProperty('IsolationType')
  })

  it('runs a full scan when chosen', async () => {
    const actions = pageActions('contoso.com')
    const full = await submit(actions['Run antivirus scan'], device, {
      fill: (user) => user.click(screen.getByLabelText('Full scan')),
    })
    expect(full.data).toMatchObject({ Action: 'Scan', ScanType: 'Full' })
  })

  it.each([['AllTenants'], ['group:7f1c']])(
    'sends the row tenant, not the %s selection',
    async (selection) => {
      const actions = pageActions(selection)
      const row = tableProps.current.dataMap({
        ...device,
        Tenant: 'fabrikam.com',
      })
      const call = await submit(actions['Isolate device'], row, {
        currentTenant: selection,
      })
      expect(
        screen.getByText(/Isolate mde-lab-w11 in fabrikam\.com\?/)
      ).toBeTruthy()
      expect(call.data.tenantFilter).toBe('fabrikam.com')
      expect(call.data.machineId).toBe(machineId)
    }
  )

  it('keeps the tenant captured when the dialog opened if the selector changes', async () => {
    const actions = pageActions('contoso.com')
    const call = await submit(actions['Run antivirus scan'], device, {
      currentTenant: 'other.com',
    })
    expect(call.data.tenantFilter).toBe('contoso.com')
  })

  it('disables actions on rows left over after a switch to a different tenant', () => {
    pageActions('contoso.com')
    const row = tableProps.current.dataMap(deviceWithoutTenant)
    expect(row.Tenant).toBe('contoso.com')

    const actions = pageActions('other.com', [
      'Security.Defender.Read',
      'Security.Defender.ReadWrite',
    ])
    for (const action of Object.values(actions)) {
      expect(action.condition(row)).toBe(false)
    }
  })

  it('hides every action from an All Tenants row that names no tenant', () => {
    const actions = pageActions('AllTenants', [
      'Security.Defender.Read',
      'Security.Defender.ReadWrite',
    ])
    for (const action of Object.values(actions)) {
      expect(action.condition(deviceWithoutTenant)).toBe(false)
      expect(action.condition({ ...device, Tenant: 'fabrikam.com' })).toBe(true)
    }
  })
})

describe('Defender action history', () => {
  const openHistory = (selection, row, result) => {
    const actions = pageActions(selection, ['Security.Defender.Read'])
    const calls = []
    api.get = (opts) => {
      calls.push(opts)
      return result
    }
    renderWithProviders(
      actions['Action history'].customComponent(row, {
        drawerVisible: true,
        setDrawerVisible: vi.fn(),
      })
    )
    return calls
  }

  it('reads the row tenant and device live, keyed by both', () => {
    const result = getResult({ data: [] })
    const calls = openHistory(
      'AllTenants',
      { ...device, Tenant: 'fabrikam.com' },
      result
    )
    expect(calls[0]).toMatchObject({
      url: '/api/ListDefenderMachineActions',
      data: { tenantFilter: 'fabrikam.com', machineId },
      queryKey: `ListDefenderMachineActions-fabrikam.com-${machineId}`,
      waiting: true,
      staleTime: 0,
    })
  })

  it('lists the actions with status, requestor and comment, and refreshes on request', async () => {
    const result = getResult({
      data: [
        {
          id: 'act-1',
          type: 'Isolate',
          scope: 'Full',
          status: 'Succeeded',
          requestor: 'CIPP-SAM',
          requestorComment: 'tech@msp.example via CIPP: Ticket 4411',
          creationDateTimeUtc: '2026-11-23T19:30:00Z',
          lastUpdateDateTimeUtc: '2026-11-23T19:30:30Z',
          errorHResult: 0,
        },
        {
          id: 'act-2',
          type: 'RunAntiVirusScan',
          status: 'Failed',
          requestor: 'CIPP-SAM',
          requestorComment: 'tech@msp.example via CIPP',
          creationDateTimeUtc: '2026-11-23T19:00:00Z',
          lastUpdateDateTimeUtc: '2026-11-23T19:05:00Z',
          errorHResult: -2147020579,
        },
      ],
    })
    openHistory('contoso.com', device, result)
    expect(screen.getByText('Isolate (Full)')).toBeTruthy()
    expect(screen.getByText('Succeeded')).toBeTruthy()
    expect(screen.getByText('Failed (error 0x800710DD)')).toBeTruthy()
    expect(screen.getAllByText('CIPP-SAM')).toHaveLength(2)
    expect(
      screen.getByText('tech@msp.example via CIPP: Ticket 4411')
    ).toBeTruthy()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Refresh' }))
    expect(result.refetch).toHaveBeenCalledTimes(1)
  })

  it('says when the device has no actions', () => {
    openHistory('contoso.com', device, getResult({ data: [] }))
    expect(
      screen.getByText(
        /Defender has no isolation, release or antivirus scan actions/
      )
    ).toBeTruthy()
  })

  it('shows the read error', () => {
    openHistory(
      'contoso.com',
      device,
      getResult({
        isSuccess: false,
        isError: true,
        error: {
          response: {
            data: { Results: 'Failed to read the Defender action history' },
          },
        },
      })
    )
    expect(
      screen.getByText(/Could not read the action history from Defender/)
    ).toBeTruthy()
  })
})
