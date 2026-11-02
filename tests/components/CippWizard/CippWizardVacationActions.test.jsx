import React, { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippWizardVacationActions } from '../../../src/components/CippWizard/CippWizardVacationActions'
import { ApiGetCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  })),
  ApiGetCallWithPagination: vi.fn(() => ({
    isSuccess: false,
    isFetching: false,
    isError: false,
    data: undefined,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  })),
}))

// Not part of vacation actions and heavy to load.
vi.mock('../../../src/components/CippComponents/CippFormUserSelector', () => ({
  CippFormUserSelector: () => <div data-testid="CippFormUserSelector" />,
  default: () => <div data-testid="CippFormUserSelector" />,
}))
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="CippDataTable" />,
  default: () => <div data-testid="CippDataTable" />,
}))

const OOO_DATA = {
  InternalMessage: 'Existing internal',
  ExternalMessage: 'Existing external',
  CreateOOFEvent: true,
}

// One stable result object per url. react-query hands back the same reference while the data is
// unchanged; a fresh object per render would re-fire the prefill effect on every render and spin
// the component forever, which is a property of the mock rather than of the code under test.
function mockApis({ ooo = OOO_DATA, policies = [] } = {}) {
  const cache = new Map()
  ApiGetCall.mockImplementation(({ url, queryKey }) => {
    const key = `${url}|${queryKey}`
    if (!cache.has(key)) {
      cache.set(
        key,
        url === '/api/ListOoO'
          ? { isSuccess: !!ooo, isFetching: false, data: ooo, refetch: vi.fn() }
          : {
              isSuccess: true,
              isFetching: false,
              data: {
                Results: String(queryKey).startsWith('ListConditionalAccessPolicies')
                  ? policies
                  : [],
              },
              refetch: vi.fn(),
            }
      )
    }
    return cache.get(key)
  })
}

let formApi = null
function Harness({ defaultValues = {} }) {
  const formControl = useForm({ mode: 'onChange', defaultValues })
  useEffect(() => {
    formApi = formControl
  }, [formControl])
  return (
    <CippWizardVacationActions
      formControl={formControl}
      currentStep={1}
      lastStep={3}
      onNextStep={() => {}}
      onPreviousStep={() => {}}
      postUrl="/api/ExecVacationMode"
    />
  )
}

const setField = (name, value) => act(() => formApi.setValue(name, value))

describe('CippWizardVacationActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    formApi = null
    mockApis()
  })

  describe('gating each vacation action', () => {
    it('hides the conditional detail of every action until it is switched on', () => {
      renderWithProviders(<Harness />)

      // The Conditional Access branch is the one that schedules the group membership
      // add/remove, so it must not be configurable while the toggle is off.
      expect(
        screen.queryByText(/uses group-based exclusions/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Forward to Internal Address')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/Out of office will be enabled/i)
      ).not.toBeInTheDocument()
    })

    it('reveals the policy picker once Conditional Access exclusion is enabled', async () => {
      renderWithProviders(<Harness />)

      await setField('enableCAExclusion', true)

      await waitFor(() =>
        expect(
          screen.getByText(/uses group-based exclusions/i)
        ).toBeInTheDocument()
      )
    })

    it('reveals the forwarding fields once forwarding is enabled', async () => {
      renderWithProviders(<Harness />)

      await setField('enableForwarding', true)

      await waitFor(() =>
        expect(
          screen.getByText('Forward to Internal Address')
        ).toBeInTheDocument()
      )
    })

    it('keeps the actions independent of one another', async () => {
      renderWithProviders(<Harness />)

      await setField('enableForwarding', true)

      await waitFor(() =>
        expect(
          screen.getByText('Forward to Internal Address')
        ).toBeInTheDocument()
      )
      // Enabling forwarding must not drag the Conditional Access branch in with it - that branch
      // is what schedules the group membership either side of the trip.
      expect(
        screen.queryByText(/uses group-based exclusions/i)
      ).not.toBeInTheDocument()
      expect(formApi.getValues('enableCAExclusion')).toBeFalsy()
    })

    it('offers the location alert exclusion without Conditional Access', async () => {
      // Tenants without CA policies still get location-based audit alerts, so this switch
      // must stand on its own rather than hide inside the CA branch.
      renderWithProviders(<Harness />)

      expect(
        screen.getByText('Exclude from location-based audit log alerts')
      ).toBeInTheDocument()

      await setField('excludeLocationAuditAlerts', true)

      await waitFor(() =>
        expect(
          screen.getByText(/does not require a Conditional Access policy/i)
        ).toBeInTheDocument()
      )
      expect(
        screen.queryByText(/uses group-based exclusions/i)
      ).not.toBeInTheDocument()
      expect(formApi.getValues('enableCAExclusion')).toBeFalsy()
    })

    it('reveals the group picker once group membership is enabled', async () => {
      renderWithProviders(<Harness defaultValues={{ tenantFilter: { value: 'contoso.com' } }} />)

      expect(screen.queryByText(/Group\(s\) in contoso.com/)).not.toBeInTheDocument()

      await setField('enableGroupMembership', true)

      await waitFor(() =>
        expect(screen.getAllByText(/Group\(s\) in contoso.com/)[0]).toBeInTheDocument()
      )
      expect(screen.getByText(/already members of a group are left untouched/i)).toBeInTheDocument()
    })

    it('warns when a selected group uses dynamic membership', async () => {
      renderWithProviders(<Harness defaultValues={{ tenantFilter: { value: 'contoso.com' } }} />)

      await setField('enableGroupMembership', true)
      await setField('vacationGroups', [
        { label: 'Static', value: 'g1', addedFields: { groupTypes: [] } },
        { label: 'All Staff', value: 'g2', addedFields: { groupTypes: ['DynamicMembership'] } },
      ])

      await waitFor(() =>
        expect(screen.getByText(/All Staff use dynamic membership/)).toBeInTheDocument()
      )
      expect(screen.queryByText(/Static.*dynamic membership/)).not.toBeInTheDocument()
    })
  })

  // The out-of-office branch renders a rich-text editor that does not mount under jsdom
  // (mui-tiptap pulls an optional peer at runtime), so its behaviour is covered on the backend
  // by Set-CIPPVacationOOO.Tests.ps1 instead. Only its gating is asserted here, by absence.

  describe('choosing where mail is forwarded', () => {
    it('asks for an internal recipient when forwarding internally', async () => {
      renderWithProviders(<Harness />)

      await setField('enableForwarding', true)
      await setField('forwardOption', 'internalAddress')

      // With no tenant chosen the internal picker renders its "pick a tenant" placeholder label;
      // its presence is what marks the internal branch as the one on screen.
      await waitFor(() =>
        expect(screen.getByText('Select a tenant first')).toBeInTheDocument()
      )
      expect(
        screen.queryByText('External Email Address')
      ).not.toBeInTheDocument()
    })

    it('asks for an external address when forwarding externally', async () => {
      renderWithProviders(<Harness />)

      await setField('enableForwarding', true)
      await setField('forwardOption', 'ExternalAddress')

      await waitFor(() =>
        expect(screen.getByText('External Email Address')).toBeInTheDocument()
      )
      expect(
        screen.queryByText('Select a tenant first')
      ).not.toBeInTheDocument()
    })
  })

  describe('prefilling the out-of-office messages', () => {
    it('leaves a message the operator already typed in place', async () => {
      // Asserted on form state rather than through the editor, which does not mount here.
      renderWithProviders(
        <Harness
          defaultValues={{
            tenantFilter: 'contoso.com',
            Users: [
              {
                value: 'user-guid',
                addedFields: { userPrincipalName: 'sseck@contoso.com' },
              },
            ],
            oooInternalMessage: 'Mine, do not touch',
          }}
        />
      )

      await waitFor(() =>
        expect(formApi.getValues('oooExternalMessage')).toBe(
          'Existing external'
        )
      )
      expect(formApi.getValues('oooInternalMessage')).toBe('Mine, do not touch')
    })

    it('fills a message the operator has not written yet', async () => {
      renderWithProviders(
        <Harness
          defaultValues={{
            tenantFilter: 'contoso.com',
            Users: [
              {
                value: 'user-guid',
                addedFields: { userPrincipalName: 'sseck@contoso.com' },
              },
            ],
          }}
        />
      )

      await waitFor(() =>
        expect(formApi.getValues('oooInternalMessage')).toBe(
          'Existing internal'
        )
      )
    })
  })

  describe('tenant vacation defaults', () => {
    const tenantWith = (vacationDefaults) => ({
      value: 'contoso.com',
      addedFields: { vacationDefaults },
    })
    const defaults = {
      PolicyId: [{ value: 'p1', label: 'CA001' }],
      createTravelPolicy: true,
      addUsageLocation: true,
      excludeLocationAuditAlerts: true,
    }

    it('pre-fills the form from the tenant defaults and shows the chip', async () => {
      mockApis({ policies: [{ id: 'p1', displayName: 'CA001' }] })
      renderWithProviders(<Harness defaultValues={{ tenantFilter: tenantWith(defaults) }} />)

      await waitFor(() => expect(formApi.getValues('enableCAExclusion')).toBe(true))
      expect(formApi.getValues('PolicyId')).toEqual(defaults.PolicyId)
      expect(formApi.getValues('createTravelPolicy')).toBe(true)
      expect(formApi.getValues('addUsageLocation')).toBe(true)
      expect(formApi.getValues('excludeLocationAuditAlerts')).toBe(true)
      expect(screen.getByText('Using Tenant Defaults')).toBeInTheDocument()
    })

    it('leaves the form alone when the tenant has no defaults', async () => {
      renderWithProviders(
        <Harness defaultValues={{ tenantFilter: tenantWith(null), PolicyId: [] }} />
      )

      await waitFor(() =>
        expect(formApi.getValues('HIDDEN_appliedDefaultsForTenant')).toBe('contoso.com')
      )
      expect(formApi.getValues('enableCAExclusion')).toBeFalsy()
      expect(formApi.getValues('PolicyId')).toEqual([])
      expect(formApi.getValues('createTravelPolicy')).toBeFalsy()
      expect(screen.queryByText('Using Tenant Defaults')).not.toBeInTheDocument()
    })

    it('drops a default policy that is not in the loaded list and warns', async () => {
      mockApis({ policies: [{ id: 'p1', displayName: 'CA001' }] })
      renderWithProviders(
        <Harness
          defaultValues={{
            tenantFilter: tenantWith({
              ...defaults,
              PolicyId: [
                { value: 'p1', label: 'CA001' },
                { value: 'gone', label: 'Deleted policy' },
              ],
            }),
          }}
        />
      )

      await waitFor(() =>
        expect(formApi.getValues('PolicyId')).toEqual([{ value: 'p1', label: 'CA001' }])
      )
      expect(await screen.findByText(/Deleted policy/)).toBeInTheDocument()
    })

    it('keeps default policies while the policy list is empty', async () => {
      mockApis({ policies: [] })
      renderWithProviders(<Harness defaultValues={{ tenantFilter: tenantWith(defaults) }} />)

      await waitFor(() => expect(formApi.getValues('enableCAExclusion')).toBe(true))
      expect(formApi.getValues('PolicyId')).toEqual(defaults.PolicyId)
    })
  })

  describe('usage location seeding', () => {
    const user = (usageLocation) => ({
      value: `${usageLocation}@contoso.com`,
      addedFields: { userPrincipalName: `${usageLocation}@contoso.com`, usageLocation },
    })

    it('adds each valid home country once and does not re-add a removed one', async () => {
      renderWithProviders(
        <Harness
          defaultValues={{
            tenantFilter: 'contoso.com',
            Users: [user('us'), user('US'), user('ZZ'), user(null)],
            travelCountries: [{ value: 'FR', label: 'France' }],
            createTravelPolicy: true,
            addUsageLocation: true,
          }}
        />
      )

      await waitFor(() =>
        expect(formApi.getValues('travelCountries').map((c) => c.value)).toEqual(['FR', 'US'])
      )

      await setField('travelCountries', [{ value: 'FR', label: 'France' }])
      await setField('Users', [user('US'), user('DE')])

      await waitFor(() =>
        expect(formApi.getValues('travelCountries').map((c) => c.value)).toEqual(['FR', 'DE'])
      )
    })

    it('does nothing while the switch is off', async () => {
      renderWithProviders(
        <Harness
          defaultValues={{
            tenantFilter: 'contoso.com',
            Users: [user('US')],
            travelCountries: [],
            createTravelPolicy: true,
            addUsageLocation: false,
          }}
        />
      )

      await setField('Users', [user('US'), user('DE')])
      expect(formApi.getValues('travelCountries')).toEqual([])
    })
  })
})
