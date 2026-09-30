import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import { api, getResult, paginatedResult, postResult } from '../mocks/api-call'
import { CippApiDialog } from '../../src/components/CippComponents/CippApiDialog'

// Capture the action list the page hands to its table so the dialog under test runs the
// real action definition rather than a copy of it.
const tableProps = vi.hoisted(() => ({ current: null }))
vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tableProps.current = props
    return <div data-testid="table-page-stub" />
  },
}))

import Page from '../../src/pages/identity/administration/groups/index.jsx'

const group = {
  id: 'group-1',
  displayName: 'Finance',
  groupType: 'Security',
}

const groupMembers = [
  {
    id: 'user-1',
    displayName: 'Jane Doe',
    userPrincipalName: 'jane@contoso.com',
  },
  {
    id: 'user-2',
    displayName: 'John Roe',
    userPrincipalName: 'john@contoso.com',
  },
]

// Stable result identities - a fresh literal per call loops the autocomplete mapping effect
const membersResult = paginatedResult([], {
  data: { pages: [{ members: groupMembers }] },
})
const tenantUsersResult = paginatedResult([
  {
    id: 'user-9',
    displayName: 'Outsider',
    userPrincipalName: 'outsider@contoso.com',
  },
])
const emptyGet = getResult()

const getRemoveMemberAction = () => {
  api.get = () => emptyGet
  const { unmount } = renderWithProviders(<Page />)
  const action = tableProps.current.actions.find(
    (entry) => entry.label === 'Remove Member'
  )
  unmount()
  return action
}

describe('Groups page - Remove Member action', () => {
  let action
  let post

  beforeEach(() => {
    post = postResult()
    api.post = () => post
    api.paginated = (opts) =>
      opts?.url === '/api/ListGroups' && opts?.data?.members === true
        ? membersResult
        : tenantUsersResult
    action = getRemoveMemberAction()
  })

  it('is offered as a single-row action only, next to Add Member', () => {
    expect(action).toBeDefined()
    expect(action.hideBulk).toBe(true)
    expect(action.url).toBe('/api/ExecGroupMembers')
    expect(action.condition(group)).toBe(true)
    // Membership on these groups is not manually editable
    expect(
      action.condition({ ...group, membershipRule: 'user.department -eq "x"' })
    ).toBe(false)
    expect(action.condition({ ...group, onPremisesSyncEnabled: true })).toBe(
      false
    )
  })

  it('lists the current members of the clicked group and posts the selected ids', async () => {
    const user = userEvent.setup()
    const createDialog = { open: true, handleClose: vi.fn() }
    renderWithProviders(
      <CippApiDialog
        createDialog={createDialog}
        title="Remove Member"
        fields={action.fields}
        api={action}
        row={group}
      />
    )

    expect(
      screen.getByText('Select the members to remove from Finance.')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('combobox'))
    await screen.findByRole('option', { name: 'Jane Doe (jane@contoso.com)' })
    expect(
      screen.getByRole('option', { name: 'John Roe (john@contoso.com)' })
    ).toBeInTheDocument()
    // The picker must be scoped to this group's members, not the tenant user list
    expect(
      screen.queryByRole('option', { name: /Outsider/ })
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('option', { name: 'Jane Doe (jane@contoso.com)' })
    )
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(post.mutate).toHaveBeenCalledTimes(1)
    })
    expect(post.mutate).toHaveBeenCalledWith({
      url: '/api/ExecGroupMembers',
      bulkRequest: false,
      data: {
        action: 'removeMember',
        tenantFilter: 'testdomain.com',
        groupId: 'group-1',
        users: ['user-1'],
      },
    })
  })

  it('keeps Confirm disabled until a member is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippApiDialog
        createDialog={{ open: true, handleClose: vi.fn() }}
        title="Remove Member"
        fields={action.fields}
        api={action}
        row={group}
      />
    )

    // The validator keeps the form invalid, which the dialog reflects by disabling Confirm
    const confirm = await screen.findByRole('button', { name: 'Confirm' })
    expect(confirm).toBeDisabled()

    await user.click(screen.getByRole('combobox'))
    await user.click(
      await screen.findByRole('option', { name: 'John Roe (john@contoso.com)' })
    )

    await waitFor(() => {
      expect(confirm).toBeEnabled()
    })
    expect(post.mutate).not.toHaveBeenCalled()
  })
})
