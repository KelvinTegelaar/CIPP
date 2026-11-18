import React, { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { api, getResult } from '../../mocks/api-call'
import CippAddEditUser from '../../../src/components/CippFormPages/CippAddEditUser'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
vi.mock(
  '../../../src/components/CippComponents/CippFormLicenseSelector',
  () => ({
    CippFormLicenseSelector: () => (
      <div data-testid="CippFormLicenseSelector" />
    ),
    default: () => <div data-testid="CippFormLicenseSelector" />,
  })
)
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

const emptyGet = getResult({ data: [] })

let formApi = null
function Harness() {
  const formControl = useForm({ mode: 'onChange' })
  useEffect(() => {
    formApi = formControl
  }, [formControl])
  return (
    <CippAddEditUser
      formControl={formControl}
      formType="add"
      userSettingsDefaults={{
        userAttributes: [{ label: 'sponsor', value: 'sponsor' }],
      }}
    />
  )
}

describe('CippAddEditUser - manager and sponsor from a user template', () => {
  beforeEach(() => {
    formApi = null
    api.get = emptyGet
  })

  it('fills Set Manager and Set Sponsor with the template values', async () => {
    renderWithProviders(<Harness />)
    await waitFor(() => expect(formApi).not.toBeNull())

    await act(() => {
      formApi.setValue('userTemplate', {
        label: 'Sales',
        value: 'template-a',
        addedFields: {
          GUID: 'template-a',
          templateName: 'Sales',
          setManager: '%salesmanager%',
          setSponsor: '%salessponsor%',
        },
      })
    })

    await waitFor(() =>
      expect(formApi.getValues('setManager')).toEqual({
        label: '%salesmanager%',
        value: '%salesmanager%',
      })
    )
    expect(formApi.getValues('setSponsor')).toEqual({
      label: '%salessponsor%',
      value: '%salessponsor%',
    })
    expect(screen.getByRole('combobox', { name: 'Set Manager' })).toHaveValue(
      '%salesmanager%'
    )
    expect(screen.getByRole('combobox', { name: 'Set Sponsor' })).toHaveValue(
      '%salessponsor%'
    )
  })
})
