import { useEffect } from 'react'
import { waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { apiCallMock } from '../../mocks/api-call'
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
const Harness = ({ existingPolicy }) => {
  const formControl = useForm({ mode: 'onChange' })
  useEffect(() => {
    form = formControl
  }, [formControl])
  return (
    <CippCAPolicyBuilder
      formControl={formControl}
      existingPolicy={existingPolicy}
      showNamedLocations
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
