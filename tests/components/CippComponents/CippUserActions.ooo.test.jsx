import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { CippApiDialog } from '../../../src/components/CippComponents/CippApiDialog'
import { OutOfOfficeForm } from '../../../src/components/CippComponents/CippUserActions'

// capture the action payload and the ListOoO lookups, network layer is not under test here
const apiState = vi.hoisted(() => ({ mutate: null, getCalls: [], oooData: undefined }))

// The tiptap editor tree cannot load in jsdom; prefill goes through setValue, not the editor
vi.mock('../../../src/components/CippComponents/CippRichTextField', () => ({
  default: () => null,
}))

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
    apiState.getCalls.push(args)
    if (args?.url === '/api/ListOoO' && args?.waiting) {
      return {
        isSuccess: true,
        isLoading: false,
        isFetching: false,
        isError: false,
        data: apiState.oooData,
        dataUpdatedAt: 1,
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

// Mirrors the Set Out of Office action in useCippUserActions
const oooApi = {
  type: 'POST',
  url: '/api/ExecSetOoO',
  data: { userId: 'userPrincipalName', tenantFilter: 'Tenant' },
  confirmText: 'Are you sure you want to set the out of office?',
  multiPost: false,
}

const renderOooDialog = (rowOverride = row) => {
  const createDialog = { open: true, handleClose: vi.fn() }
  renderWithProviders(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CippApiDialog
        createDialog={createDialog}
        title="Set Out of Office"
        fields={[]}
        api={oooApi}
        row={rowOverride}
      >
        {({ formHook, row: dialogRow }) => (
          <OutOfOfficeForm formControl={formHook} row={dialogRow} />
        )}
      </CippApiDialog>
    </LocalizationProvider>
  )
  return createDialog
}

describe('Set Out of Office action prefill', () => {
  beforeEach(() => {
    apiState.mutate = vi.fn()
    apiState.getCalls = []
    apiState.oooData = {
      AutoReplyState: 'Scheduled',
      StartTime: '2026-09-01T08:00:00Z',
      EndTime: '2026-09-15T17:00:00Z',
      InternalMessage: '<p>Internal reply</p>',
      ExternalMessage: '<p>External reply</p>',
      CreateOOFEvent: true,
      OOFEventSubject: 'Away',
      AutoDeclineFutureRequestsWhenOOF: false,
      DeclineEventsForScheduledOOF: false,
      DeclineMeetingMessage: '',
    }
  })

  it('prefills the form from ListOoO for a single user and submits those values', async () => {
    const user = userEvent.setup()
    renderOooDialog()

    // The prefill lands a tick after mount (deferred past the dialog's form reset)
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Scheduled')
    })

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(apiState.mutate).toHaveBeenCalledTimes(1)
    })
    const payload = apiState.mutate.mock.calls[0][0]
    expect(payload.url).toBe('/api/ExecSetOoO')
    expect(payload.data.userId).toBe('john@contoso.com')
    expect(payload.data.tenantFilter).toBe('contoso.com')
    expect(payload.data.AutoReplyState).toMatchObject({ value: 'Scheduled' })
    expect(payload.data.InternalMessage).toBe('<p>Internal reply</p>')
    expect(payload.data.ExternalMessage).toBe('<p>External reply</p>')
    expect(payload.data.StartTime).toBe(new Date('2026-09-01T08:00:00Z').getTime() / 1000)
    expect(payload.data.EndTime).toBe(new Date('2026-09-15T17:00:00Z').getTime() / 1000)
    expect(payload.data.CreateOOFEvent).toBe(true)
    expect(payload.data.OOFEventSubject).toBe('Away')
  })

  it('requests ListOoO for the selected user and tenant', async () => {
    renderOooDialog()

    await waitFor(() => {
      const call = apiState.getCalls.find((c) => c?.url === '/api/ListOoO')
      expect(call).toBeTruthy()
      expect(call.waiting).toBe(true)
      expect(call.data).toMatchObject({ UserId: 'john@contoso.com' })
    })
  })

  it('does not prefill when multiple users are selected', async () => {
    renderOooDialog([row, { ...row, id: 'user-2', userPrincipalName: 'jane@contoso.com' }])

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    // The lookup is parked (waiting: false) and the form stays blank
    const call = apiState.getCalls.find((c) => c?.url === '/api/ListOoO')
    expect(call.waiting).toBe(false)
    expect(screen.getByRole('combobox')).toHaveValue('')
  })
})
