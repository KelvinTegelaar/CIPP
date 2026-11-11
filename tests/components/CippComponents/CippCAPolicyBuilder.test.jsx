import { useEffect } from 'react'
import { waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { apiCallMock } from '../../mocks/api-call'
import { ApiGetCallWithPagination } from '../../../src/api/ApiCall'
import CippCAPolicyBuilder, {
  extractCAPolicyJSON,
} from '../../../src/components/CippComponents/CippCAPolicyBuilder'

vi.mock('../../../src/api/ApiCall', () => apiCallMock())

// Graph stores authenticationFlows.transferMethods as one comma-separated flag string, in enum
// order. Shape taken from a live tenant's CA004 AuthenticationFlows policy.
const livePolicy = {
  displayName:
    'CA004-Global-IdentityProtection-AnyApp-AnyPlatform-AuthenticationFlows',
  state: 'disabled',
  conditions: {
    clientAppTypes: ['all'],
    applications: { includeApplications: ['All'] },
    users: { includeUsers: ['All'] },
    authenticationFlows: {
      transferMethods: 'deviceCodeFlow,authenticationTransfer',
    },
  },
  grantControls: { operator: 'OR', builtInControls: ['block'] },
}

let form
const Harness = ({ existingPolicy, live = false }) => {
  const formControl = useForm({ mode: 'onChange' })
  useEffect(() => {
    form = formControl
  }, [formControl])
  return (
    <CippCAPolicyBuilder
      formControl={formControl}
      existingPolicy={existingPolicy}
      showNamedLocations={!live}
      directorySearch={live}
    />
  )
}

// A template IP location whose ranges come from a list variable, written by hand as plain CIDR
// strings rather than Graph range objects.
const listRangeTemplate = {
  displayName: 'CA000-Global-Baseline-Block outside offices',
  state: 'disabled',
  conditions: {
    clientAppTypes: ['all'],
    applications: { includeApplications: ['All'] },
    users: { includeUsers: ['All'] },
    locations: { includeLocations: ['All'], excludeLocations: ['Office IPs'] },
  },
  grantControls: { operator: 'OR', builtInControls: ['block'] },
  LocationInfo: [
    {
      '@odata.type': '#microsoft.graph.ipNamedLocation',
      displayName: 'Office IPs',
      isTrusted: true,
      ipRanges: ['%officeips%'],
    },
  ],
}

describe('CippCAPolicyBuilder template named locations', () => {
  it('keeps an IP range list variable written as a plain string', async () => {
    renderWithProviders(<Harness existingPolicy={listRangeTemplate} />)

    await waitFor(() => expect(form.getValues('LocationInfo')).toHaveLength(1))
    expect(
      extractCAPolicyJSON(form.getValues()).LocationInfo[0].ipRanges
    ).toEqual([
      {
        '@odata.type': '#microsoft.graph.iPv4CidrRange',
        cidrAddress: '%officeips%',
      },
    ])
  })
})

// A template captured from a live policy keeps the strength as Graph expands it. Deploy matches
// a custom strength by displayName, so the source tenant's id alone cannot deploy anywhere else.
const authStrengthTemplate = {
  displayName: 'CTS008 - Require TAP to Register Devices',
  state: 'enabled',
  conditions: {
    clientAppTypes: ['all'],
    applications: { includeUserActions: ['urn:user:registersecurityinfo'] },
    users: { includeUsers: ['All'] },
  },
  grantControls: {
    operator: 'OR',
    authenticationStrength: {
      id: '6c5ea24f-7a1b-4c2d-bbc3-f5a8441dff78',
      displayName: 'TAP Only',
      description: '',
      policyType: 'custom',
      requirementsSatisfied: 'mfa',
      allowedCombinations: [
        'temporaryAccessPassOneTime',
        'temporaryAccessPassMultiUse',
      ],
    },
  },
}

describe('CippCAPolicyBuilder authentication strength', () => {
  it('saves a template with the captured strength intact', async () => {
    renderWithProviders(<Harness existingPolicy={authStrengthTemplate} />)

    await waitFor(() =>
      expect(
        form.getValues('grantControls.authenticationStrength.id')
      ).toBeTruthy()
    )
    expect(
      extractCAPolicyJSON(form.getValues(), authStrengthTemplate).grantControls
        .authenticationStrength
    ).toEqual(authStrengthTemplate.grantControls.authenticationStrength)
  })

  it('saves only the id once a different strength is picked', () => {
    const policy = extractCAPolicyJSON(
      {
        grantControls: {
          operator: 'OR',
          authenticationStrength: {
            id: {
              label: 'Phishing-resistant MFA',
              value: '00000000-0000-0000-0000-000000000004',
            },
          },
        },
      },
      authStrengthTemplate
    )

    expect(policy.grantControls.authenticationStrength).toEqual({
      id: '00000000-0000-0000-0000-000000000004',
    })
  })
})

describe('CippCAPolicyBuilder authentication flow transfer methods', () => {
  it('loads both methods of a live policy into the multi-select instead of dropping them', async () => {
    renderWithProviders(<Harness existingPolicy={livePolicy} />)

    await waitFor(() =>
      expect(
        form.getValues('conditions.authenticationFlows.transferMethods')
      ).toEqual(['deviceCodeFlow', 'authenticationTransfer'])
    )
  })

  it('saves the selection in Graph order so template drift matches the live policy', () => {
    const policy = extractCAPolicyJSON({
      conditions: {
        authenticationFlows: {
          transferMethods: [
            {
              label: 'Authentication transfer',
              value: 'authenticationTransfer',
            },
            { label: 'Device code flow', value: 'deviceCodeFlow' },
          ],
        },
      },
    })

    expect(policy.conditions.authenticationFlows.transferMethods).toBe(
      livePolicy.conditions.authenticationFlows.transferMethods
    )
  })
})

// A live policy that applies a Global Secure Access security profile. Graph mirrors the profile
// into networkAccessSecurity.
const profileId = '33333333-3333-3333-3333-333333333333'
const withSessionControls = (sessionControls) => ({
  displayName: 'Web filtering for staff',
  state: 'disabled',
  conditions: {
    clientAppTypes: ['all'],
    applications: { includeApplications: ['All'] },
    users: { includeUsers: ['None'] },
  },
  sessionControls,
})
const loadAndExtract = async (policy, live = false) => {
  renderWithProviders(<Harness existingPolicy={policy} live={live} />)
  await waitFor(() =>
    expect(form.getValues('displayName')).toBe('Web filtering for staff')
  )
  return extractCAPolicyJSON(form.getValues(), policy)
}

describe('CippCAPolicyBuilder session controls', () => {
  it('drops a disabled sign-in frequency and keeps an enabled one', () => {
    expect(
      extractCAPolicyJSON({
        sessionControls: {
          signInFrequency: { isEnabled: false, value: 4 },
          persistentBrowser: { isEnabled: true, mode: 'never' },
        },
      }).sessionControls
    ).toEqual({ persistentBrowser: { isEnabled: true, mode: 'never' } })
  })

  it('saves a live security profile by id and drops the mirror Graph adds', async () => {
    const policy = withSessionControls({
      globalSecureAccessFilteringProfile: { profileId, isEnabled: true },
      networkAccessSecurity: { policyId: profileId, isEnabled: true },
    })
    expect((await loadAndExtract(policy, true)).sessionControls).toEqual({
      globalSecureAccessFilteringProfile: { profileId, isEnabled: true },
    })
  })

  it('drops a disabled security profile session control', async () => {
    const policy = withSessionControls({
      globalSecureAccessFilteringProfile: { profileId, isEnabled: false },
    })
    expect((await loadAndExtract(policy)).sessionControls).toBeUndefined()
  })

  it('keeps a security profile template link as a link', async () => {
    const policy = withSessionControls({
      globalSecureAccessFilteringProfile: {
        profileId: { label: 'Staff', value: 'tpl-staff' },
        isEnabled: true,
      },
    })
    expect((await loadAndExtract(policy)).sessionControls).toEqual(
      policy.sessionControls
    )
  })

  it('keeps a security profile referred to by name as that name', async () => {
    const policy = withSessionControls({
      globalSecureAccessFilteringProfile: {
        profileId: 'Staff',
        isEnabled: true,
      },
    })
    expect((await loadAndExtract(policy)).sessionControls).toEqual(
      policy.sessionControls
    )
  })

  it('saves a typed profile name as a name and a picked template as a link', () => {
    const save = (picked) =>
      extractCAPolicyJSON({
        sessionControls: {
          globalSecureAccessFilteringProfile: {
            isEnabled: true,
            _profileTemplate: picked,
          },
        },
      }).sessionControls.globalSecureAccessFilteringProfile
    expect(save({ label: 'Contractors', value: 'Contractors' })).toEqual({
      isEnabled: true,
      profileId: 'Contractors',
    })
    expect(save({ label: 'Staff', value: 'tpl-staff' })).toEqual({
      isEnabled: true,
      profileId: { label: 'Staff', value: 'tpl-staff' },
    })
  })

  it('loads the reference into the field each mode edits', async () => {
    const policy = withSessionControls({
      globalSecureAccessFilteringProfile: { profileId, isEnabled: true },
    })
    await loadAndExtract(policy, true)
    expect(
      form.getValues('sessionControls.globalSecureAccessFilteringProfile')
    ).toEqual({
      isEnabled: true,
      profileId: { label: profileId, value: profileId },
    })
  })

  it('lists security profile templates without a tenant, and live profiles for the tenant', async () => {
    const requestFor = (url) =>
      ApiGetCallWithPagination.mock.calls
        .map(([options]) => options)
        .filter((options) => options?.url === url)
        .at(-1)
    renderWithProviders(<Harness />)
    await waitFor(() =>
      expect(requestFor('/api/ListGSASecurityProfileTemplates')).toBeDefined()
    )
    expect(
      requestFor('/api/ListGSASecurityProfileTemplates').data
    ).not.toHaveProperty('tenantFilter')
    renderWithProviders(<Harness live />)
    await waitFor(() =>
      expect(requestFor('/api/ListGSASecurityProfiles')).toBeDefined()
    )
    expect(requestFor('/api/ListGSASecurityProfiles').data).toHaveProperty(
      'tenantFilter'
    )
  })
})
