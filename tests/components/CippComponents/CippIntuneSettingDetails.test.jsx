import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ title, data, simpleColumns }) => (
    <pre data-testid={`table-${title}`}>
      {JSON.stringify({ columns: simpleColumns, data })}
    </pre>
  ),
}))
import { api, getResult } from '../../mocks/api-call'
import { ApiGetCall } from '../../../src/api/ApiCall'
import { getCippError } from '../../../src/utils/get-cipp-error'
import {
  CippIntuneSettingDetails,
  MAX_SETTING_DEVICE_POLICIES,
  buildSettingDeviceRequests,
  getSettingAlignment,
  mergeSettingDevices,
} from '../../../src/components/CippComponents/CippIntuneSettingDetails.jsx'

const POLICY_A = '11111111-1111-1111-1111-111111111111'
const POLICY_B = '22222222-2222-2222-2222-222222222222'
const POLICY_C = '33333333-3333-3333-3333-333333333333'

const row = {
  SettingId:
    'device_vendor_msft_policy_config_defender_allowrealtimemonitoring',
  SettingName: 'Allow Realtime Monitoring',
  Policies: [
    {
      Tenant: 'a.com',
      PolicyId: POLICY_A,
      PolicyName: 'Defender A',
      PolicyTypeName: 'Settings Catalog',
      URLName: 'ConfigurationPolicies',
      Value: 'Allowed',
      DeviceCount: 4,
    },
    {
      Tenant: 'a.com',
      PolicyId: POLICY_B,
      PolicyName: 'Restrictions A',
      PolicyTypeName: 'Device Configuration',
      URLName: 'DeviceConfigurations',
      Value: 'Allowed',
      DeviceCount: 0,
    },
    {
      Tenant: 'a.com',
      PolicyId: POLICY_C,
      PolicyName: 'Defender C',
      PolicyTypeName: 'Settings Catalog',
      URLName: 'ConfigurationPolicies',
      Value: 'Allowed',
      DeviceCount: null,
    },
  ],
}

const requests = buildSettingDeviceRequests('a.com', row.Policies)

const manyPolicies = (count) =>
  Array.from({ length: count }, (_, index) => ({
    Tenant: 'a.com',
    PolicyId: `${String(index).padStart(8, '0')}-0000-4000-8000-000000000000`,
    PolicyName: `Policy ${index}`,
    PolicyTypeName: 'Device Configuration',
    URLName: 'DeviceConfigurations',
    Value: 'Allowed',
  }))
const table = (title) =>
  JSON.parse(screen.getByTestId(`table-${title}`).textContent)

const device = (PolicyId, URLName, DeviceName, Source = 'Live') => ({
  PolicyId,
  URLName,
  DeviceName,
  UserPrincipalName: 'user@a.com',
  Status: 'Succeeded',
  StatusDetail: null,
  Platform: 'Windows10',
  LastReported: '2026-11-01T10:00:00Z',
  Source,
})

describe('buildSettingDeviceRequests', () => {
  it("makes one request for the selected tenant listing every policy's URLName:PolicyId pair", () => {
    expect(requests).toEqual([
      {
        tenantFilter: 'a.com',
        Policies: `ConfigurationPolicies:${POLICY_A},DeviceConfigurations:${POLICY_B},ConfigurationPolicies:${POLICY_C}`,
      },
    ])
  })

  it('lists a policy that appears twice only once', () => {
    expect(
      buildSettingDeviceRequests('a.com', [row.Policies[0], row.Policies[0]])
    ).toEqual([
      {
        tenantFilter: 'a.com',
        Policies: `ConfigurationPolicies:${POLICY_A}`,
      },
    ])
  })

  it('keeps exactly the policy limit in one request', () => {
    const chunked = buildSettingDeviceRequests(
      'a.com',
      manyPolicies(MAX_SETTING_DEVICE_POLICIES)
    )
    expect(chunked).toHaveLength(1)
    expect(chunked[0].Policies.split(',')).toHaveLength(
      MAX_SETTING_DEVICE_POLICIES
    )
  })

  it('splits policies over the limit into requests of at most the limit', () => {
    const policies = manyPolicies(MAX_SETTING_DEVICE_POLICIES + 1)
    const chunked = buildSettingDeviceRequests('a.com', policies)
    expect(chunked.map((request) => request.tenantFilter)).toEqual([
      'a.com',
      'a.com',
    ])
    expect(
      chunked.map((request) => request.Policies.split(',').length)
    ).toEqual([MAX_SETTING_DEVICE_POLICIES, 1])
    expect(chunked.flatMap((request) => request.Policies.split(','))).toEqual(
      policies.map((policy) => `${policy.URLName}:${policy.PolicyId}`)
    )
  })
})

describe('mergeSettingDevices', () => {
  it('joins PolicyName by PolicyId', () => {
    const results = [
      {
        Results: [
          device(POLICY_B, 'DeviceConfigurations', 'PC-1', 'Cache'),
          device(POLICY_C, 'ConfigurationPolicies', 'PC-2'),
        ],
        Metadata: { Warnings: [] },
      },
    ]
    const { devices, warnings } = mergeSettingDevices(results, row.Policies)
    expect(warnings).toEqual([])
    expect(devices).toEqual([
      {
        ...device(POLICY_B, 'DeviceConfigurations', 'PC-1', 'Cache'),
        PolicyName: 'Restrictions A',
      },
      {
        ...device(POLICY_C, 'ConfigurationPolicies', 'PC-2'),
        PolicyName: 'Defender C',
      },
    ])
  })

  it('keeps the rows and reports Metadata.Warnings', () => {
    const results = [
      {
        Results: [device(POLICY_A, 'ConfigurationPolicies', 'PC-1')],
        Metadata: {
          Warnings: [
            `Failed to load deployment status for deviceConfigurations ${POLICY_B}: Forbidden`,
          ],
        },
      },
    ]
    const { devices, warnings } = mergeSettingDevices(results, row.Policies)
    expect(devices.map((row) => row.DeviceName)).toEqual(['PC-1'])
    expect(warnings).toEqual([
      `Failed to load deployment status for deviceConfigurations ${POLICY_B}: Forbidden`,
    ])
  })

  it('merges the devices and warnings of every request the policies were split into', () => {
    const policies = manyPolicies(MAX_SETTING_DEVICE_POLICIES + 1)
    const first = policies[0].PolicyId
    const last = policies.at(-1).PolicyId
    const results = [
      {
        Results: [device(first, 'DeviceConfigurations', 'PC-1')],
        Metadata: { Warnings: ['Forbidden'] },
      },
      {
        Results: [device(last, 'DeviceConfigurations', 'PC-2')],
        Metadata: { Warnings: ['Throttled'] },
      },
    ]
    const { devices, warnings } = mergeSettingDevices(results, policies)
    expect(devices.map((row) => [row.DeviceName, row.PolicyName])).toEqual([
      ['PC-1', 'Policy 0'],
      ['PC-2', `Policy ${MAX_SETTING_DEVICE_POLICIES}`],
    ])
    expect(warnings).toEqual(['Forbidden', 'Throttled'])
  })

  it('keeps the other requests when one returns an HTTP error and reports it as a warning', () => {
    const httpError = {
      response: {
        status: 400,
        data: { Results: 'Too many policies.' },
      },
    }
    const results = [
      { Results: [{ resultText: getCippError(httpError), state: 'error' }] },
      {
        Results: [device(POLICY_C, 'ConfigurationPolicies', 'PC-2')],
        Metadata: { Warnings: [] },
      },
    ]
    const { devices, warnings } = mergeSettingDevices(results, row.Policies)
    expect(devices.map((row) => row.DeviceName)).toEqual(['PC-2'])
    expect(warnings).toEqual(['Too many policies.'])
  })
})

const ALLOWED = 'Allowed. Turns on and runs the real-time monitoring service.'
const NOT_ALLOWED = 'Not allowed. Turns off the real-time monitoring service.'

const withValues = (...values) =>
  row.Policies.map((policy, index) => ({ ...policy, Value: values[index] }))

describe('getSettingAlignment', () => {
  it('is aligned when every policy sets the same value', () => {
    expect(getSettingAlignment(row.Policies)).toEqual({
      status: 'aligned',
      maskedCount: 0,
      values: [{ Value: 'Allowed', count: 3 }],
    })
  })

  it('reports a conflict when policies set different values', () => {
    expect(
      getSettingAlignment(withValues(ALLOWED, NOT_ALLOWED, ALLOWED))
    ).toEqual({
      status: 'conflict',
      maskedCount: 0,
      values: [
        { Value: ALLOWED, count: 2 },
        { Value: NOT_ALLOWED, count: 1 },
      ],
    })
  })

  it('leaves masked values out of the comparison and counts them', () => {
    const masked = getSettingAlignment(
      withValues('(encrypted)', 'Allowed', 'Allowed')
    )
    expect(masked.status).toBe('aligned')
    expect(masked.maskedCount).toBe(1)

    const conflict = getSettingAlignment([
      ...withValues('(secret)', '(hidden)', 'Allowed'),
      { ...row.Policies[2], PolicyId: POLICY_A, Value: 'Blocked' },
    ])
    expect(conflict.status).toBe('conflict')
    expect(conflict.maskedCount).toBe(2)
  })

  it('is aligned for a single policy', () => {
    expect(getSettingAlignment([row.Policies[0]]).status).toBe('aligned')
    expect(getSettingAlignment([]).status).toBe('aligned')
  })
})

describe('CippIntuneSettingDetails', () => {
  beforeEach(() => {
    ApiGetCall.mockClear()
    api.get = getResult({
      data: [
        {
          Results: [device(POLICY_A, 'ConfigurationPolicies', 'PC-1')],
          Metadata: { Warnings: [] },
        },
      ],
    })
  })

  it('calls ListIntuneSettingDevices for the selected tenant through a bulk request', () => {
    renderWithProviders(<CippIntuneSettingDetails row={row} tenant="a.com" />)
    const call = ApiGetCall.mock.calls.at(-1)[0]
    expect(call.url).toBe('/api/ListIntuneSettingDevices')
    expect(call.bulkRequest).toBe(true)
    expect(call.data).toEqual(requests)
  })

  it('shows the policies and devices without Tenant columns', () => {
    renderWithProviders(<CippIntuneSettingDetails row={row} tenant="a.com" />)
    expect(table('Policies').columns).toEqual([
      'PolicyName',
      'PolicyTypeName',
      'Value',
      'DeviceCount',
    ])
    expect(table('Policies').data.map((policy) => policy.DeviceCount)).toEqual([
      4,
      0,
      null,
    ])
    expect(table('Devices').columns).toEqual([
      'DeviceName',
      'Status',
      'LastReported',
      'UserPrincipalName',
      'PolicyName',
    ])
    expect(table('Devices').data).toEqual([
      {
        ...device(POLICY_A, 'ConfigurationPolicies', 'PC-1'),
        PolicyName: 'Defender A',
      },
    ])
  })

  it('shows warnings above the devices it could load', () => {
    api.get = getResult({
      data: [
        {
          Results: [device(POLICY_A, 'ConfigurationPolicies', 'PC-1')],
          Metadata: { Warnings: ['Forbidden'] },
        },
        { Results: [{ resultText: 'Throttled', state: 'error' }] },
      ],
    })
    renderWithProviders(<CippIntuneSettingDetails row={row} tenant="a.com" />)
    expect(screen.getByText('Forbidden')).toBeInTheDocument()
    expect(screen.getByText('Throttled')).toBeInTheDocument()
    expect(table('Devices').data.map((row) => row.DeviceName)).toEqual(['PC-1'])
  })

  it('shows a load failure instead of the devices table', () => {
    api.get = getResult({
      isSuccess: false,
      isError: true,
      error: { message: 'Request failed', response: { data: 'Network down' } },
    })
    renderWithProviders(<CippIntuneSettingDetails row={row} tenant="a.com" />)
    expect(screen.getByText('Network down')).toBeInTheDocument()
    expect(screen.queryByTestId('table-Devices')).not.toBeInTheDocument()
  })

  it('shows no alignment callout when every policy sets the same value', () => {
    renderWithProviders(<CippIntuneSettingDetails row={row} tenant="a.com" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('warns when policies set different values', () => {
    const conflicting = {
      ...row,
      Policies: [
        ...withValues(ALLOWED, ALLOWED, NOT_ALLOWED),
        { ...row.Policies[1], PolicyId: POLICY_C, Value: '(encrypted)' },
      ],
    }
    renderWithProviders(
      <CippIntuneSettingDetails row={conflicting} tenant="a.com" />
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('MuiAlert-colorWarning')
    expect(alert).toHaveTextContent("This setting isn't aligned")
    expect(alert).toHaveTextContent(
      "2 policies set 'Allowed. Turns on and runs the real-time…', 1 sets 'Not allowed. Turns off the real-time…'."
    )
    expect(alert).not.toHaveTextContent('a.com')
    expect(alert).toHaveTextContent(
      '1 encrypted, secret or hidden value was not compared.'
    )
  })
})
