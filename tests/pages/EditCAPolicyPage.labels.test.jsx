import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderWithProviders, settingsWith } from '../test-utils'
import router from '../mocks/next-router'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
import { api, getResult, postResult } from '../mocks/api-call'

// The page hands the builder a policy whose stored IDs are already { label, value } options: the
// builder's pickers only label a stored value from the options they have when they mount.
const builderProps = vi.fn()
vi.mock(
  '../../src/components/CippComponents/CippCAPolicyBuilder',
  async (importOriginal) => ({
    ...(await importOriginal()),
    default: (props) => {
      builderProps(props)
      return null
    },
  })
)
vi.mock('../../src/components/CippFormPages/CippFormPage', () => ({
  default: ({ children }) => <>{children}</>,
}))

import EditCAPolicy from '../../src/pages/tenant/conditional/list-policies/edit.jsx'

const TENANT = 'contoso.onmicrosoft.com'
const LOCATION = '11111111-1111-1111-1111-111111111111'
const DELETED_LOCATION = '99999999-9999-9999-9999-999999999999'
const APP = '22222222-2222-2222-2222-222222222222'
const ROLE = '33333333-3333-3333-3333-333333333333'

const policy = {
  id: 'policy-1',
  displayName: 'CA100',
  conditions: {
    users: { includeUsers: ['All'], excludeRoles: [ROLE] },
    applications: {
      includeApplications: ['Office365'],
      excludeApplications: [APP],
    },
    locations: {
      includeLocations: ['All'],
      excludeLocations: ['AllTrusted', LOCATION, DELETED_LOCATION],
    },
  },
}

// Built once: a fresh result per call loops the effects that key off it (see mocks/api-call.js).
const results = {
  policies: getResult({
    data: { Results: [{ id: 'policy-1', rawjson: JSON.stringify(policy) }] },
  }),
  locations: getResult({
    data: [{ id: LOCATION, displayName: 'CT-CA-Anthropic' }],
  }),
  apps: getResult({
    data: { Results: [{ appId: APP, displayName: 'Salesforce' }] },
  }),
  roles: getResult({
    data: { Results: [{ templateId: ROLE, displayName: 'Custom Helpdesk' }] },
  }),
  none: getResult({ isSuccess: false }),
}

const lastBuilderPolicy = () =>
  builderProps.mock.calls.at(-1)?.[0]?.existingPolicy

describe('Edit CA policy page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    router.query = { id: 'policy-1' }
    api.post = postResult()
    api.get = (opts) => {
      if (opts?.url?.startsWith('/api/ListConditionalAccessPolicies'))
        return results.policies
      if (opts?.waiting === false) return results.none
      if (opts?.url === '/api/ListNamedLocations') return results.locations
      if (opts?.data?.Endpoint === 'servicePrincipals') return results.apps
      if (opts?.data?.Endpoint === 'roleManagement/directory/roleDefinitions')
        return results.roles
      return results.none
    }
  })

  it('shows stored named locations, applications and roles by name, keeping the ID as the value', async () => {
    renderWithProviders(<EditCAPolicy />, {
      settings: settingsWith({ currentTenant: TENANT }),
    })
    await waitFor(() => expect(lastBuilderPolicy()).toBeTruthy())

    const { conditions } = lastBuilderPolicy()
    expect(conditions.locations.excludeLocations).toEqual([
      'AllTrusted',
      { label: 'CT-CA-Anthropic', value: LOCATION },
      // Deleted since it was assigned: stays the bare ID rather than a made-up label
      DELETED_LOCATION,
    ])
    expect(conditions.locations.includeLocations).toEqual(['All'])
    expect(conditions.applications.excludeApplications).toEqual([
      { label: 'Salesforce', value: APP },
    ])
    expect(conditions.applications.includeApplications).toEqual(['Office365'])
    expect(conditions.users.excludeRoles).toEqual([
      { label: 'Custom Helpdesk', value: ROLE },
    ])
  })

  it('reads each list for the selected tenant, under the key the builder pickers use', async () => {
    renderWithProviders(<EditCAPolicy />, {
      settings: settingsWith({ currentTenant: TENANT }),
    })
    await waitFor(() => expect(lastBuilderPolicy()).toBeTruthy())

    const { ApiGetCall } = await import('../../src/api/ApiCall')
    const locationCall = ApiGetCall.mock.calls
      .map(([opts]) => opts)
      .find((opts) => opts.url === '/api/ListNamedLocations' && opts.waiting)
    expect(locationCall.data.tenantFilter).toBe(TENANT)
    expect(locationCall.queryKey).toBe(`CANamedLocations-${TENANT}-labels`)
  })

  it('does not fetch a list the policy has no IDs for', async () => {
    const onlyKeywords = {
      ...policy,
      conditions: {
        users: { includeUsers: ['All'] },
        applications: { includeApplications: ['All'] },
      },
    }
    const onlyKeywordsResult = getResult({
      data: {
        Results: [{ id: 'policy-1', rawjson: JSON.stringify(onlyKeywords) }],
      },
    })
    const routed = api.get
    api.get = (opts) =>
      opts?.url?.startsWith('/api/ListConditionalAccessPolicies')
        ? onlyKeywordsResult
        : routed(opts)

    renderWithProviders(<EditCAPolicy />, {
      settings: settingsWith({ currentTenant: TENANT }),
    })
    await waitFor(() => expect(lastBuilderPolicy()).toBeTruthy())

    const { ApiGetCall } = await import('../../src/api/ApiCall')
    const enabledLookups = ApiGetCall.mock.calls
      .map(([opts]) => opts)
      .filter(
        (opts) =>
          !opts.url.startsWith('/api/ListConditionalAccessPolicies') &&
          opts.waiting
      )
    expect(enabledLookups).toEqual([])
  })
})
