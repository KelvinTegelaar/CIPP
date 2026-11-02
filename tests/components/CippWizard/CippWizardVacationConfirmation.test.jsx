import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippWizardVacationConfirmation } from '../../../src/components/CippWizard/CippWizardVacationConfirmation'

const mutate = vi.fn()
vi.mock('../../../src/api/ApiCall', () => ({
  ApiPostCall: vi.fn(() => ({
    mutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  })),
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))

const USERS = [{ label: 'Sam', value: 'sam@contoso.com' }]
const GROUPS = [{ label: 'Travel Exclusions', value: 'group-1' }]

function Harness({ defaultValues }) {
  const formControl = useForm({
    defaultValues: {
      tenantFilter: { value: 'contoso.com' },
      Users: USERS,
      startDate: 1785000000,
      endDate: 1786000000,
      ...defaultValues,
    },
  })
  return (
    <CippWizardVacationConfirmation
      formControl={formControl}
      currentStep={2}
      lastStep={2}
      onPreviousStep={() => {}}
    />
  )
}

const groupPosts = () =>
  mutate.mock.calls.filter(([req]) => req.url === '/api/ExecScheduleGroupMembershipVacation')

describe('CippWizardVacationConfirmation group membership', () => {
  beforeEach(() => mutate.mockClear())

  it('schedules the selected groups when group membership is enabled', () => {
    renderWithProviders(
      <Harness defaultValues={{ enableGroupMembership: true, vacationGroups: GROUPS }} />
    )
    expect(screen.getByText('Travel Exclusions')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(groupPosts()).toHaveLength(1)
    expect(groupPosts()[0][0].data).toMatchObject({
      tenantFilter: 'contoso.com',
      Users: USERS,
      Groups: GROUPS,
      startDate: 1785000000,
      endDate: 1786000000,
    })
  })

  it('does not post group membership when it is disabled', () => {
    renderWithProviders(
      <Harness
        defaultValues={{ enableGroupMembership: false, vacationGroups: GROUPS, enableOOO: true }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(mutate).toHaveBeenCalled()
    expect(groupPosts()).toHaveLength(0)
  })
})
