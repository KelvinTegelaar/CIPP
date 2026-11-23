import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import { api, getResult, paginatedResult, postResult } from '../mocks/api-call'
import { CippApiDialog } from '../../src/components/CippComponents/CippApiDialog'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
// The form page chrome is irrelevant here; render the page body only.
vi.mock('../../src/components/CippFormPages/CippFormPage', () => ({
  default: (props) => <div>{props.children}</div>,
}))
// MRT renders no cells in jsdom, so capture what the page hands to the address table and
// run its real row actions through the real dialog instead.
const addressTable = vi.hoisted(() => ({ current: null }))
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: (props) => {
    if (props.title === 'Email Addresses') addressTable.current = props
    return <div data-testid="table-stub">{props.cardButton}</div>
  },
}))

import Page from '../../src/pages/identity/administration/groups/edit.jsx'

// Stable result identities - a fresh literal per call loops the autocomplete mapping effect
const groupResult = (group) =>
  getResult({
    data: {
      groupInfo: { id: 'group-1', displayName: 'Sales', mail: 'sales@contoso.com', ...group },
      members: [],
      owners: [],
      // Exchange's list: aliases first, upper-case SMTP: is the primary, plus non-SMTP entries
      emailAddresses: [
        'smtp:info@contoso.com',
        'SPO:SPO_abc@SPO_def',
        'SMTP:sales@contoso.com',
      ],
    },
  })
const m365Group = groupResult({ groupTypes: ['Unified'], mailEnabled: true })
const securityGroup = groupResult({ groupTypes: [], mailEnabled: false, securityEnabled: true })
const emptyList = paginatedResult([])

const renderPage = async (groupType, result) => {
  addressTable.current = null
  router.query = { groupId: 'group-1', groupType }
  api.get = () => result
  api.paginated = () => emptyList
  const view = renderWithProviders(<Page />)
  await screen.findByText('Group Properties')
  return view
}

const group = {
  groupId: 'group-1',
  groupType: 'Microsoft 365',
  groupName: 'Sales',
  tenantFilter: 'testdomain.com',
}

describe('Edit Group page - email addresses', () => {
  let post

  beforeEach(() => {
    post = postResult()
    api.post = () => post
  })

  it('lists the SMTP addresses of a Microsoft 365 group, primary first', async () => {
    await renderPage('Microsoft 365', m365Group)

    expect(addressTable.current.data).toEqual([
      { Address: 'sales@contoso.com', Type: 'Primary' },
      { Address: 'info@contoso.com', Type: 'Alias' },
    ])
    expect(screen.getByRole('button', { name: 'Add Alias' })).toBeInTheDocument()
  })

  it('offers no email address management on a security group', async () => {
    await renderPage('Security', securityGroup)

    expect(addressTable.current).toBeNull()
    expect(screen.queryByRole('button', { name: 'Add Alias' })).not.toBeInTheDocument()
  })

  it('only offers Make Primary and Remove Alias on aliases, never on the primary', async () => {
    await renderPage('Microsoft 365', m365Group)
    const [primary, alias] = addressTable.current.data

    for (const action of addressTable.current.actions) {
      expect(action.condition(alias)).toBe(true)
      expect(action.condition(primary)).toBe(false)
      // Only the address list may refetch: the page query resets the form's unsaved edits
      expect(action.relatedQueryKeys).toEqual(['GroupEmailAddresses-group-1'])
    }
  })

  it.each([
    ['Make Primary', { PrimarySmtpAddress: 'info@contoso.com' }],
    ['Remove Alias', { RemovedAliases: 'info@contoso.com' }],
  ])('%s posts the clicked address to EditGroup', async (label, expected) => {
    const user = userEvent.setup()
    const { unmount } = await renderPage('Microsoft 365', m365Group)
    const action = addressTable.current.actions.find((entry) => entry.label === label)
    const alias = addressTable.current.data[1]
    unmount()

    renderWithProviders(
      <CippApiDialog
        createDialog={{ open: true, handleClose: vi.fn() }}
        title={label}
        api={action}
        row={alias}
      />
    )
    expect(screen.getByText(/info@contoso\.com/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(post.mutate).toHaveBeenCalledTimes(1)
    })
    const sent = post.mutate.mock.calls[0][0]
    expect(sent.url).toBe('/api/EditGroup')
    expect(sent.data).toMatchObject({ ...group, ...expected })
  })
})
