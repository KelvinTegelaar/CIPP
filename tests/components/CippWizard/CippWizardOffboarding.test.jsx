import React, { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippWizardOffboarding } from '../../../src/components/CippWizard/CippWizardOffboarding'
import { ApiGetCall } from '../../../src/api/ApiCall'

// DeleteUser turning on visually disables the rest of the switches/fields, but until the fix
// their values were left in the form and still submitted as true - the backend then ran
// contradictory tasks (e.g. converting a mailbox to shared that is about to be deleted).

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(() => ({
    isSuccess: false,
    isFetching: false,
    data: undefined,
    refetch: vi.fn(),
  })),
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

// Not part of this component's own behaviour and heavy to load.
vi.mock('../../../src/components/CippWizard/CippWizardStepButtons', () => ({
  __esModule: true,
  default: () => <div data-testid="CippWizardStepButtons" />,
  CippWizardStepButtons: () => <div data-testid="CippWizardStepButtons" />,
}))

let formApi = null
function Harness({ defaultValues = {} }) {
  const formControl = useForm({ mode: 'onChange', defaultValues })
  useEffect(() => {
    formApi = formControl
  }, [formControl])
  return (
    <CippWizardOffboarding
      formControl={formControl}
      currentStep={0}
      onNextStep={() => {}}
      onPreviousStep={() => {}}
      postUrl="/api/ExecOffboardUser"
    />
  )
}

const setField = (name, value) => act(() => formApi.setValue(name, value, { shouldDirty: true }))

describe('CippWizardOffboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    formApi = null
    ApiGetCall.mockImplementation(() => ({
      isSuccess: false,
      isFetching: false,
      data: undefined,
      refetch: vi.fn(),
    }))
  })

  it('clears the fields the UI disables when Delete user is turned on, but leaves OnedriveAccess alone', async () => {
    const onedriveAccessValue = [{ value: 'user-guid-1', addedFields: { userPrincipalName: 'pat@contoso.com' } }]

    renderWithProviders(
      <Harness
        defaultValues={{
          tenantFilter: { value: 'contoso.com' },
          user: [{ value: 'user-guid-2' }],
          ConvertToShared: true,
          HideFromGAL: true,
          removeCalendarInvites: true,
          removePermissions: true,
          removeCalendarPermissions: true,
          RemoveRules: true,
          WipeMobile: true,
          RemoveMobile: true,
          RemoveGroups: true,
          RemoveLicenses: true,
          RevokeSessions: true,
          DisableSignIn: true,
          ClearImmutableId: true,
          ResetPass: true,
          RemoveMFADevices: true,
          RemoveTeamsPhoneDID: true,
          DisableOneDriveSharing: true,
          disableForwarding: true,
          KeepCopy: true,
          AccessNoAutomap: [{ value: 'a' }],
          AccessAutomap: [{ value: 'b' }],
          AccessSendAs: [{ value: 'c' }],
          AccessSendOnBehalf: [{ value: 'd' }],
          forward: { value: 'e' },
          OOO: '<p>Out until Monday</p>',
          OnedriveAccess: onedriveAccessValue,
          DeleteUser: false,
        }}
      />
    )

    await setField('DeleteUser', true)

    await waitFor(() => expect(formApi.getValues('ConvertToShared')).toBe(false))

    expect(formApi.getValues('HideFromGAL')).toBe(false)
    expect(formApi.getValues('removeCalendarInvites')).toBe(false)
    expect(formApi.getValues('removePermissions')).toBe(false)
    expect(formApi.getValues('removeCalendarPermissions')).toBe(false)
    expect(formApi.getValues('RemoveRules')).toBe(false)
    expect(formApi.getValues('WipeMobile')).toBe(false)
    expect(formApi.getValues('RemoveMobile')).toBe(false)
    expect(formApi.getValues('RemoveGroups')).toBe(false)
    expect(formApi.getValues('RemoveLicenses')).toBe(false)
    expect(formApi.getValues('RevokeSessions')).toBe(false)
    expect(formApi.getValues('DisableSignIn')).toBe(false)
    expect(formApi.getValues('ClearImmutableId')).toBe(false)
    expect(formApi.getValues('ResetPass')).toBe(false)
    expect(formApi.getValues('RemoveMFADevices')).toBe(false)
    expect(formApi.getValues('RemoveTeamsPhoneDID')).toBe(false)
    expect(formApi.getValues('DisableOneDriveSharing')).toBe(false)
    expect(formApi.getValues('disableForwarding')).toBe(false)
    expect(formApi.getValues('KeepCopy')).toBe(false)

    expect(formApi.getValues('AccessNoAutomap')).toBeNull()
    expect(formApi.getValues('AccessAutomap')).toBeNull()
    expect(formApi.getValues('AccessSendAs')).toBeNull()
    expect(formApi.getValues('AccessSendOnBehalf')).toBeNull()
    expect(formApi.getValues('forward')).toBeNull()

    expect(formApi.getValues('OOO')).toBe('')

    // OneDrive retention remains valid after the user is deleted, so this must stay untouched.
    expect(formApi.getValues('OnedriveAccess')).toEqual(onedriveAccessValue)
  })

  it('leaves the other fields alone when Delete user stays off', async () => {
    renderWithProviders(
      <Harness
        defaultValues={{
          tenantFilter: { value: 'contoso.com' },
          user: [{ value: 'user-guid-2' }],
          ConvertToShared: true,
          RemoveLicenses: true,
          disableForwarding: false,
          OOO: '<p>Out until Monday</p>',
          DeleteUser: false,
        }}
      />
    )

    await setField('RemoveLicenses', true)

    await waitFor(() => expect(formApi.getValues('RemoveLicenses')).toBe(true))
    expect(formApi.getValues('ConvertToShared')).toBe(true)
    expect(formApi.getValues('OOO')).toBe('<p>Out until Monday</p>')
  })
})
