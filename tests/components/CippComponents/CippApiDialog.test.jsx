import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippApiDialog } from '../../../src/components/CippComponents/CippApiDialog'

// capture the action payload, network layer is not under test here
const apiState = vi.hoisted(() => ({ mutate: null }))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiPostCall: () => ({
    mutate: apiState.mutate,
    isPending: false,
    isSuccess: false,
    isIdle: true,
    isError: false,
    isFetching: false,
    data: undefined,
    reset: () => {},
  }),
  ApiGetCall: () => ({
    isSuccess: false,
    isPending: true,
    isFetching: false,
    isError: false,
    data: undefined,
  }),
}))

const row = {
  id: 'user-1',
  userPrincipalName: 'john@contoso.com',
}

const baseApi = {
  type: 'POST',
  url: '/api/ExecDisableUser',
  data: { ID: 'userPrincipalName', Action: '!Disable' },
  confirmText: 'Are you sure you want to disable [userPrincipalName]?',
}

const renderDialog = (overrides = {}) => {
  const createDialog = { open: true, handleClose: vi.fn() }
  renderWithProviders(
    <CippApiDialog
      createDialog={createDialog}
      title="Disable User"
      fields={[]}
      api={baseApi}
      row={row}
      {...overrides}
    />
  )
  return createDialog
}

describe('CippApiDialog', () => {
  beforeEach(() => {
    apiState.mutate = vi.fn()
  })

  it('substitutes row values into the confirm text', () => {
    renderDialog()

    expect(screen.getByText('Disable User')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to disable john@contoso.com?')
    ).toBeInTheDocument()
  })

  it('summarizes multi-row selections in the confirm text', () => {
    renderDialog({ row: [row, { ...row, id: 'user-2' }] })

    expect(
      screen.getByText('Are you sure you want to disable the 2 selected rows?')
    ).toBeInTheDocument()
  })

  it('posts the processed action payload on confirm', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(apiState.mutate).toHaveBeenCalledTimes(1)
    })
    // ID resolves through the row, !Disable is a literal, tenantFilter from settings
    expect(apiState.mutate).toHaveBeenCalledWith({
      url: '/api/ExecDisableUser',
      bulkRequest: false,
      data: {
        tenantFilter: 'testdomain.com',
        ID: 'john@contoso.com',
        Action: 'Disable',
      },
    })
  })

  it('disables confirm after submitting without allowResubmit', async () => {
    const user = userEvent.setup()
    renderDialog()

    const confirm = screen.getByRole('button', { name: 'Confirm' })
    await user.click(confirm)

    await waitFor(() => {
      expect(confirm).toBeDisabled()
    })
  })

  it('closes via the close button', async () => {
    const user = userEvent.setup()
    const createDialog = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(createDialog.handleClose).toHaveBeenCalledTimes(1)
  })
})
