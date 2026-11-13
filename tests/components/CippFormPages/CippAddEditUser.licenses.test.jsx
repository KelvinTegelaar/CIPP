import React, { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippAddEditUser from '../../../src/components/CippFormPages/CippAddEditUser'
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

// The licence picker pulls in the 2.2 MB M365Licenses dataset, so it is stubbed and the field is
// driven through setValue, which is what the picker's onChange does.
vi.mock(
  '../../../src/components/CippComponents/CippFormLicenseSelector',
  () => ({
    CippFormLicenseSelector: () => (
      <div data-testid="CippFormLicenseSelector" />
    ),
    default: () => <div data-testid="CippFormLicenseSelector" />,
  })
)
vi.mock('../../../src/components/CippComponents/CippFormUserSelector', () => ({
  CippFormUserSelector: () => <div data-testid="CippFormUserSelector" />,
  default: () => <div data-testid="CippFormUserSelector" />,
}))
vi.mock(
  '../../../src/components/CippComponents/CippFormDomainSelector',
  () => ({
    CippFormDomainSelector: () => <div data-testid="CippFormDomainSelector" />,
    default: () => <div data-testid="CippFormDomainSelector" />,
  })
)
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="CippDataTable" />,
  default: () => <div data-testid="CippDataTable" />,
}))

const E3 = { label: 'Microsoft 365 E3', value: 'sku-e3' }
const VISIO = { label: 'Visio Plan 2', value: 'sku-visio' }

let formApi = null
function Harness({ defaultValues = {}, formType = 'edit' }) {
  const formControl = useForm({ mode: 'onChange', defaultValues })
  useEffect(() => {
    formApi = formControl
  }, [formControl])
  return (
    <CippAddEditUser
      formControl={formControl}
      formType={formType}
      userSettingsDefaults={{ userAttributes: [] }}
    />
  )
}

const setLicenses = (licenses) =>
  act(() => {
    formApi.setValue('licenses', licenses, { shouldDirty: true })
  })

describe('CippAddEditUser - removing the last license', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    formApi = null
    ApiGetCall.mockImplementation(() => ({
      isSuccess: true,
      isFetching: false,
      data: [],
      refetch: vi.fn(),
    }))
  })

  it('turns on Remove all licenses when the last license is cleared', async () => {
    renderWithProviders(<Harness defaultValues={{ licenses: [E3] }} />)
    await waitFor(() => expect(formApi).not.toBeNull())

    await setLicenses([])

    await waitFor(() =>
      expect(formApi.getValues('removeLicenses')).toBe(true)
    )
    expect(
      screen.getByText(/All licenses will be removed from this user/i)
    ).toBeInTheDocument()
  })

  it('leaves the switch alone while other licenses remain', async () => {
    renderWithProviders(<Harness defaultValues={{ licenses: [E3, VISIO] }} />)
    await waitFor(() => expect(formApi).not.toBeNull())

    await setLicenses([E3])

    await waitFor(() => expect(formApi.getValues('licenses')).toEqual([E3]))
    expect(formApi.getValues('removeLicenses')).toBeFalsy()
  })

  it('turns the switch back off when a license is added back', async () => {
    renderWithProviders(<Harness defaultValues={{ licenses: [E3] }} />)
    await waitFor(() => expect(formApi).not.toBeNull())

    await setLicenses([])
    await waitFor(() =>
      expect(formApi.getValues('removeLicenses')).toBe(true)
    )

    await setLicenses([VISIO])
    await waitFor(() =>
      expect(formApi.getValues('removeLicenses')).toBe(false)
    )
  })

  it('respects the operator turning the switch off again', async () => {
    renderWithProviders(<Harness defaultValues={{ licenses: [E3] }} />)
    await waitFor(() => expect(formApi).not.toBeNull())

    await setLicenses([])
    await waitFor(() =>
      expect(formApi.getValues('removeLicenses')).toBe(true)
    )

    await act(() => {
      formApi.setValue('removeLicenses', false, { shouldDirty: true })
    })

    await waitFor(() =>
      expect(screen.getByText(/Licenses will not be changed/i)).toBeInTheDocument()
    )
    expect(formApi.getValues('removeLicenses')).toBe(false)
  })

  it('does nothing for a user who had no licenses', async () => {
    renderWithProviders(<Harness defaultValues={{ licenses: [] }} />)
    await waitFor(() => expect(formApi).not.toBeNull())

    await setLicenses([])

    expect(formApi.getValues('removeLicenses')).toBeFalsy()
    expect(
      screen.queryByText(/All licenses will be removed/i)
    ).not.toBeInTheDocument()
  })

  it('does nothing on the add form', async () => {
    renderWithProviders(
      <Harness formType="add" defaultValues={{ licenses: [E3] }} />
    )
    await waitFor(() => expect(formApi).not.toBeNull())

    await setLicenses([])

    expect(formApi.getValues('removeLicenses')).toBeFalsy()
  })
})
