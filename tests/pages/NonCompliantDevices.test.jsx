import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
vi.mock('../../src/components/CippComponents/CippReportDBControls', () => ({
  useCippReportDB: () => ({
    resolvedApiUrl: '/api/ListDeviceNonCompliance?UseReportDB=true',
    resolvedQueryKey: 'ListDeviceNonCompliance-test',
    cacheColumns: ['CacheTimestamp'],
    controls: null,
    syncDialog: null,
  }),
}))
// Each segment renders as a button, so a click stands in for an ApexCharts segment click
vi.mock('../../src/components/CippCards/CippChartCard', () => ({
  CippChartCard: ({ title, labels, customTotal, onSegmentClick }) => (
    <section aria-label={title}>
      <span>{`${title} total: ${customTotal ?? 'summed'}`}</span>
      {labels.map((label, index) => (
        <button key={label} onClick={() => onSegmentClick(label, index)}>
          {label}
        </button>
      ))}
    </section>
  ),
}))
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ data }) => (
    <>
      <pre data-testid="settings-table">
        {JSON.stringify(data.map(({ devices, ...setting }) => setting))}
      </pre>
      <pre data-testid="device-error-codes">
        {JSON.stringify(data.flatMap((setting) => setting.devices.map((device) => device.errorCode)))}
      </pre>
    </>
  ),
}))
import { api, getResult } from '../mocks/api-call'
import Page from '../../src/pages/endpoint/MEM/non-compliant-devices/index.jsx'

const row = (deviceId, os, policyName, settingName, settingStatus = 'Not compliant', errorCode = 0) => ({
  deviceId,
  deviceName: `PC-${deviceId}`,
  os,
  policyName,
  settingName,
  settingStatus,
  errorCode,
})
const reportResult = getResult({
  data: [
    row('d1', 'Windows', 'Baseline', 'Require BitLocker'),
    // Intune's "Remediation failed", as the export delivers it
    row('d2', 'Windows', 'Baseline', 'Require BitLocker', 'Error', -2016281112),
    // same setting under a second policy, on a device that already fails the first
    row('d1', 'Windows', 'Strict', 'Require BitLocker'),
    row('d3', 'iOS', 'Default Device Compliance Policy', 'Is active'),
  ],
})
const errorResult = getResult({
  isSuccess: false,
  isError: true,
  error: { message: 'Request failed', response: { data: 'Forbidden - caller lacks the required RBAC role' } },
})

const tableRows = () => JSON.parse(screen.getByTestId('settings-table').textContent)
const tableKeys = () => tableRows().map((setting) => `${setting.policyName}/${setting.settingName}`)

describe('Non-Compliant Devices page', () => {
  beforeEach(() => {
    api.get = reportResult
  })

  it('groups device rows into failing settings per policy, most devices first, flagging the built-in policy', () => {
    renderWithProviders(<Page />)
    expect(tableRows()).toEqual([
      {
        settingName: 'Require BitLocker',
        policyName: 'Baseline',
        builtInPolicy: false,
        errorCount: 1,
        deviceCount: 2,
      },
      {
        settingName: 'Require BitLocker',
        policyName: 'Strict',
        builtInPolicy: false,
        errorCount: 0,
        deviceCount: 1,
      },
      {
        settingName: 'Is active',
        policyName: 'Default Device Compliance Policy',
        builtInPolicy: true,
        errorCount: 0,
        deviceCount: 1,
      },
    ])
  })

  it('names the policy on bars whose setting names collide, and filters on that policy alone', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    expect(screen.getByRole('button', { name: 'Is active' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Require BitLocker (Strict)' }))
    expect(tableKeys()).toEqual(['Strict/Require BitLocker'])
    expect(screen.getByText('Filtered: Require BitLocker (Strict)')).toBeInTheDocument()
  })

  it('totals the failing-settings chart in distinct devices, not device x setting failures', () => {
    renderWithProviders(<Page />)
    // d1 fails two settings; three devices in all, matching the OS chart
    expect(screen.getByText('Top Failing Settings total: 3')).toBeInTheDocument()
  })

  it('filters the table from an OS segment and clears the filter from its chip', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    await user.click(screen.getByRole('button', { name: 'Windows' }))
    expect(tableKeys()).toEqual(['Baseline/Require BitLocker', 'Strict/Require BitLocker'])

    const chip = screen.getByText('Filtered: Windows').closest('.MuiChip-root')
    await user.click(chip.querySelector('.MuiChip-deleteIcon'))
    expect(tableRows()).toHaveLength(3)
  })

  it('shows device error codes as Intune hex alongside the raw decimal, leaving 0 alone', () => {
    renderWithProviders(<Page />)
    expect(JSON.parse(screen.getByTestId('device-error-codes').textContent)).toEqual([
      0,
      '0x87D1FDE8 (-2016281112)',
      0,
      0,
    ])
  })

  it('shows a load failure instead of the healthy empty state', () => {
    api.get = errorResult
    renderWithProviders(<Page />)
    expect(screen.getByText(/Could not load the non-compliant devices report/)).toHaveTextContent(
      'Forbidden - caller lacks the required RBAC role'
    )
    expect(screen.queryByText(/No failing compliance settings/)).not.toBeInTheDocument()
  })
})
