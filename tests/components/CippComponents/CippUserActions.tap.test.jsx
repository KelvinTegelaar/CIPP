import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { CippApiDialog } from '../../../src/components/CippComponents/CippApiDialog'
import { TemporaryAccessPassForm } from '../../../src/components/CippComponents/CippUserActions'

// capture the action payload and the TAP policy lookup, network layer is not under test here
const apiState = vi.hoisted(() => ({ mutate: null, policy: undefined }))

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
  ApiGetCallWithPagination: () => ({
    isSuccess: false,
    isPending: true,
    isFetching: false,
    isError: false,
    data: undefined,
    fetchNextPage: () => {},
  }),
  ApiGetCall: (args) => {
    if (args?.url === '/api/ListGraphRequest') {
      return {
        isSuccess: true,
        isLoading: false,
        isFetching: false,
        isError: false,
        data: { Results: [apiState.policy] },
        dataUpdatedAt: 1,
        refetch: () => {},
      }
    }
    return {
      isSuccess: false,
      isLoading: false,
      isPending: true,
      isFetching: false,
      isError: false,
      data: undefined,
      dataUpdatedAt: 0,
    }
  },
}))

const row = {
  id: 'user-1',
  userPrincipalName: 'john@contoso.com',
  Tenant: 'contoso.com',
}

// Mirrors the Create Temporary Access Pass action in useCippUserActions
const tapApi = {
  type: 'POST',
  url: '/api/ExecCreateTAP',
  data: { ID: 'userPrincipalName' },
  confirmText:
    'Are you sure you want to create a Temporary Access Pass for [userPrincipalName]?',
  multiPost: false,
  allowResubmit: true,
}

const renderTapDialog = () => {
  const createDialog = { open: true, handleClose: vi.fn() }
  renderWithProviders(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CippApiDialog
        createDialog={createDialog}
        title="Create Temporary Access Pass"
        fields={[]}
        api={tapApi}
        row={row}
      >
        {({ formHook, row: dialogRow }) => (
          <TemporaryAccessPassForm formControl={formHook} row={dialogRow} />
        )}
      </CippApiDialog>
    </LocalizationProvider>
  )
  return createDialog
}

describe('Create Temporary Access Pass action', () => {
  beforeEach(() => {
    apiState.mutate = vi.fn()
    apiState.policy = {
      state: 'enabled',
      isUsableOnce: false,
      minimumLifetimeInMinutes: 10,
      maximumLifetimeInMinutes: 480,
      defaultLifetimeInMinutes: 60,
    }
  })

  it('offers a PwPush link switch that is off by default', async () => {
    renderTapDialog()

    const pwpush = await screen.findByRole('switch', {
      name: 'Generate PwPush link',
    })
    expect(pwpush).not.toBeChecked()
  })

  it('submits generatePwPushLink=false when the switch is left off', async () => {
    const user = userEvent.setup()
    renderTapDialog()

    await screen.findByRole('switch', { name: 'Generate PwPush link' })
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(apiState.mutate).toHaveBeenCalledTimes(1)
    })
    const payload = apiState.mutate.mock.calls[0][0]
    expect(payload.url).toBe('/api/ExecCreateTAP')
    expect(payload.data.ID).toBe('john@contoso.com')
    expect(payload.data.generatePwPushLink).toBe(false)
  })

  it('submits generatePwPushLink=true when the switch is turned on', async () => {
    const user = userEvent.setup()
    renderTapDialog()

    const pwpush = await screen.findByRole('switch', {
      name: 'Generate PwPush link',
    })
    await user.click(pwpush)
    expect(pwpush).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(apiState.mutate).toHaveBeenCalledTimes(1)
    })
    const payload = apiState.mutate.mock.calls[0][0]
    expect(payload.data.generatePwPushLink).toBe(true)
    // The existing one-time-use switch keeps working alongside the new one
    expect(payload.data.isUsableOnce).toBe(false)
  })
})
