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
function mockApis({ ooo = OOO_DATA } = {}) {
  const cache = new Map()
  ApiGetCall.mockImplementation(({ url }) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        url === '/api/ListOoO'
          ? { isSuccess: !!ooo, isFetching: false, data: ooo, refetch: vi.fn() }
          : {
              isSuccess: true,
              isFetching: false,
              data: { Results: [] },
              refetch: vi.fn(),
            }
      )
    }
    return cache.get(url)
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
})
