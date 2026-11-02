import React, { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippSharedMailboxLicenseAlert } from '../../../src/components/CippComponents/CippSharedMailboxLicenseAlert'
import { ApiGetCall } from '../../../src/api/ApiCall'
import { CippApiDialog } from '../../../src/components/CippComponents/CippApiDialog'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: () => ({ mutate: vi.fn(), isPending: false, isSuccess: false, isIdle: true, isError: false, reset: () => {} }),
  ApiGetCallWithPagination: () => ({ isSuccess: false, isFetching: false, isError: false, data: undefined, fetchNextPage: () => {} }),
}))
vi.mock('../../../src/hooks/use-settings', () => ({
  useSettings: () => ({ currentTenant: 'contoso.com' }),
}))

const GB = 1024 ** 3
const mailboxes = [
  { UPN: 'archive@contoso.com', storageUsedInBytes: GB, ArchiveEnabled: true, ArchiveSize: 75 * GB },
  { UPN: 'small@contoso.com', storageUsedInBytes: GB, ArchiveEnabled: true, ArchiveSize: 2 * GB },
]

let formApi = null
function Harness({ row }) {
  const formControl = useForm()
  useEffect(() => {
    formApi = formControl
  }, [formControl])
  return <CippSharedMailboxLicenseAlert formControl={formControl} row={row} />
}

describe('CippSharedMailboxLicenseAlert', () => {
  beforeEach(() => {
    ApiGetCall.mockImplementation(() => ({ isSuccess: true, data: mailboxes }))
  })

  it('warns once Shared is picked for a mailbox that still needs a license', async () => {
    renderWithProviders(<Harness row={{ userPrincipalName: 'Archive@contoso.com' }} />)
    expect(screen.queryByText(/Keep a license/)).not.toBeInTheDocument()

    await act(() => formApi.setValue('MailboxType', 'Shared'))
    expect(await screen.findByText(/This mailbox has 75\.0 GB archive/)).toBeInTheDocument()

    await act(() => formApi.setValue('MailboxType', 'Room'))
    expect(screen.queryByText(/Keep a license/)).not.toBeInTheDocument()
  })

  it('stays hidden for a mailbox under every limit', async () => {
    renderWithProviders(<Harness row={{ UPN: 'small@contoso.com' }} />)
    await act(() => formApi.setValue('MailboxType', 'Shared'))
    expect(screen.queryByText(/Keep a license/)).not.toBeInTheDocument()
  })

  it('renders below the mailbox type choice in the Convert Mailbox dialog', async () => {
    // Mirrors the Convert Mailbox action fields in useCippUserActions and CippExchangeActions
    const fields = [
      {
        type: 'radio',
        name: 'MailboxType',
        label: 'Mailbox Type',
        options: [
          { label: 'User Mailbox', value: 'Regular' },
          { label: 'Shared Mailbox', value: 'Shared' },
        ],
      },
      { name: 'sharedMailboxLicenseWarning', component: CippSharedMailboxLicenseAlert },
    ]
    renderWithProviders(
      <CippApiDialog
        createDialog={{ open: true, handleClose: vi.fn() }}
        title="Convert Mailbox"
        fields={fields}
        api={{ type: 'POST', url: '/api/ExecConvertMailbox', data: { ID: 'userPrincipalName' }, confirmText: 'Convert?' }}
        row={{ userPrincipalName: 'archive@contoso.com' }}
      />,
    )

    await userEvent.click(screen.getByLabelText('Shared Mailbox'))
    expect(await screen.findByText(/This mailbox has 75\.0 GB archive/)).toBeInTheDocument()
  })
})
