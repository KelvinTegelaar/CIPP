import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippBecContainmentDrawer } from '../../../src/components/CippComponents/CippBecContainmentDrawer'
import { ApiGetCall, ApiPostCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(),
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="CippDataTable" />,
  default: () => <div data-testid="CippDataTable" />,
}))
vi.mock('../../../src/components/CippFormPages/CippJSONView', () => ({
  default: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, children, footer }) =>
    visible ? (
      <div data-testid="CippOffCanvas">
        {children}
        {footer}
      </div>
    ) : null,
}))

const catalog = [
  {
    Id: 'ResetPassword',
    Label: 'Reset password',
    Description: 'd',
    Impact: 'Critical',
    Reversible: false,
    DefaultSelected: true,
    Order: 1,
  },
  {
    Id: 'RevokeSessions',
    Label: 'Revoke sessions',
    Description: 'd',
    Impact: 'High',
    Reversible: false,
    DefaultSelected: true,
    Order: 3,
  },
  {
    Id: 'ClearForwarding',
    Label: 'Clear mailbox forwarding',
    Description: 'd',
    Impact: 'High',
    Reversible: true,
    DefaultSelected: false,
    Order: 8,
  },
]

let runMutate

beforeEach(() => {
  runMutate = vi.fn()
  ApiPostCall.mockImplementation(() => ({
    mutate: runMutate,
    isPending: false,
    data: undefined,
  }))
  ApiGetCall.mockImplementation(() => ({
    isSuccess: true,
    isLoading: false,
    data: catalog,
    refetch: vi.fn(),
  }))
})

const renderDrawer = (props = {}) =>
  renderWithProviders(
    <CippBecContainmentDrawer
      userPrincipalName="victim@contoso.com"
      userId="u1"
      tenantFilter="contoso.com"
      caseId="BEC-1"
      becData={{
        Scope: 'Full',
        UserGrants: [],
        Delegations: [],
        NewRules: [],
        MFADevices: [],
      }}
      {...props}
    />
  )

describe('CippBecContainmentDrawer', () => {
  it('preselects the default actions and gates the run on the typed UPN when a Critical action is selected', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await user.click(screen.getByRole('button', { name: /contain user/i }))
    expect(await screen.findByTestId('CippOffCanvas')).toBeInTheDocument()

    const runButton = screen.getByRole('button', { name: /run containment/i })
    // default set selected => Critical (ResetPassword) => confirmation field shown, run disabled
    const confirmation = await screen.findByRole('textbox', {
      name: /type the user's upn/i,
    })
    expect(runButton).toBeDisabled()

    fireEvent.change(confirmation, { target: { value: 'wrong@contoso.com' } })
    await waitFor(() => expect(runButton).toBeDisabled())
    fireEvent.change(confirmation, { target: { value: 'VICTIM@contoso.com' } })
    await waitFor(() => expect(runButton).toBeEnabled())

    await user.click(runButton)
    await waitFor(() => expect(runMutate).toHaveBeenCalledTimes(1))
    const runPayload = runMutate.mock.calls[0][0].data
    expect(runMutate.mock.calls[0][0].url).toBe('/api/ExecBECRemediate')
    expect(runPayload.Confirmation).toBe('VICTIM@contoso.com')
    expect(runPayload.Actions).toEqual(['ResetPassword', 'RevokeSessions'])
    expect(runPayload.CaseId).toBe('BEC-1')
    expect(runPayload.userid).toBe('u1')
    expect(runPayload.DryRun).toBeFalsy()
  }, 30000)

  it('runs without a confirmation when only non-Critical actions are selected', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await user.click(screen.getByRole('button', { name: /contain user/i }))
    await screen.findByTestId('CippOffCanvas')
    // turn the Critical default off
    await user.click(screen.getByLabelText(/reset password/i))
    await waitFor(() =>
      expect(
        screen.queryByRole('textbox', { name: /type the user's upn/i })
      ).not.toBeInTheDocument()
    )
    const runButton = screen.getByRole('button', { name: /run containment/i })
    await waitFor(() => expect(runButton).toBeEnabled())
    await user.click(runButton)
    await waitFor(() => expect(runMutate).toHaveBeenCalledTimes(1))
    expect(runMutate.mock.calls[0][0].data.Actions).toEqual(['RevokeSessions'])
    expect(runMutate.mock.calls[0][0].data.Confirmation).toBe('')
  }, 30000)

  it('always runs the containment as a background job', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await user.click(screen.getByRole('button', { name: /contain user/i }))
    await screen.findByTestId('CippOffCanvas')
    expect(
      screen.queryByLabelText(/run in the background/i)
    ).not.toBeInTheDocument()
    await user.click(screen.getByLabelText(/reset password/i))
    const runButton = screen.getByRole('button', { name: /run containment/i })
    await waitFor(() => expect(runButton).toBeEnabled())
    await user.click(runButton)
    await waitFor(() => expect(runMutate).toHaveBeenCalledTimes(1))
    expect(runMutate.mock.calls[0][0].data.Async).toBe(true)
  }, 30000)

  it('disables the run when nothing is selected', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await user.click(screen.getByRole('button', { name: /contain user/i }))
    await screen.findByTestId('CippOffCanvas')
    await user.click(screen.getByLabelText(/reset password/i))
    await user.click(screen.getByLabelText(/revoke sessions/i))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /run containment/i })
      ).toBeDisabled()
    )
    expect(runMutate).not.toHaveBeenCalled()
  }, 30000)
})
