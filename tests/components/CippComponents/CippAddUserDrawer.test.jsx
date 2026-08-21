import React, { useReducer } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippAddUserDrawer } from '../../../src/components/CippComponents/CippAddUserDrawer'
import { ApiGetCall, ApiPostCall, ApiGetCallWithPagination } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(),
}))

// The user pickers and the license selector pull in the data-table stack and the 2.2 MB license
// dataset; none of them take part in the create-another-user flow, so they are stubbed. The
// domain selector stays real - its auto-preselect is central to the bug under test.
vi.mock('../../../src/components/CippComponents/CippFormUserSelector', () => ({
  CippFormUserSelector: () => <div data-testid="CippFormUserSelector" />,
  default: () => <div data-testid="CippFormUserSelector" />,
}))
vi.mock('../../../src/components/CippComponents/CippFormLicenseSelector', () => ({
  CippFormLicenseSelector: () => <div data-testid="CippFormLicenseSelector" />,
  default: () => <div data-testid="CippFormLicenseSelector" />,
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
// CippFormComponent statically imports the data-table stack for its cippDataTable case;
// nothing in this drawer uses it, but importing it is enough to exhaust the test worker.
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="CippDataTable" />,
  default: () => <div data-testid="CippDataTable" />,
}))
// CippAutoComplete statically imports CippJsonView for its option-preview offcanvas, which
// drags in the formatting/code-block/Intune-definition graph - another worker-killer this
// flow never renders.
vi.mock('../../../src/components/CippFormPages/CippJSONView', () => ({
  default: () => null,
}))
// The real drawer shell drags in the property-card/formatting graph, which this test does
// not exercise. The stub keeps the essential contract: content + footer render only while
// the drawer is open.
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, children, footer }) =>
    visible ? (
      <div data-testid="CippOffCanvas">
        {children}
        {footer}
      </div>
    ) : null,
}))

const idleGet = { isSuccess: false, isFetching: false, isError: false, data: undefined, refetch: vi.fn() }
const okGet = (data) => ({ isSuccess: true, isFetching: false, isError: false, data, refetch: vi.fn() })

// Mutable state backing the ApiPostCall mock: flipping it and re-rendering imitates the
// react-query mutation lifecycle (idle -> pending -> success) the drawer sees in production.
let postState
let mutateSpy

function mockApis() {
  ApiGetCall.mockImplementation(({ url }) => {
    if (url.startsWith('/api/ListNewUserDefaults')) return okGet([])
    if (url.startsWith('/api/ListExtensionsConfig')) return okGet({})
    if (url.startsWith('/api/ListGroups')) return okGet([])
    if (url.startsWith('/api/ListCustomDataMappings')) return okGet({ Results: [] })
    if (url.startsWith('/api/ListUserGroups')) return okGet([])
    return idleGet
  })
  ApiGetCallWithPagination.mockImplementation(({ url }) => {
    if (url === '/api/ListGraphRequest') {
      return {
        isSuccess: true,
        isFetching: false,
        isError: false,
        data: {
          pages: [
            {
              Results: [
                { id: 'testdomain.com', isDefault: true, isInitial: false, isVerified: true },
                { id: 'other.com', isDefault: false, isInitial: false, isVerified: true },
              ],
            },
          ],
        },
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
      }
    }
    return { ...idleGet, fetchNextPage: vi.fn() }
  })
  ApiPostCall.mockImplementation(() => ({ ...postState, mutate: mutateSpy }))
}

// Buttons that force a re-render after mutating postState stand in for react-query pushing new
// mutation state into the drawer.
function Harness() {
  const [, force] = useReducer((x) => x + 1, 0)
  return (
    <>
      <button
        onClick={() => {
          postState.isPending = true
          force()
        }}
      >
        flip-pending
      </button>
      <button
        onClick={() => {
          postState.isPending = false
          postState.isSuccess = true
          force()
        }}
      >
        flip-success
      </button>
      <CippAddUserDrawer />
    </>
  )
}

const getDomainInput = () =>
  screen.getByLabelText(/Primary Domain name/i, { selector: 'input' })

const fillRequiredFields = async (user, { displayName, username }) => {
  const displayNameInput = screen.getByLabelText(/Display Name/i, { selector: 'input' })
  await user.clear(displayNameInput)
  await user.type(displayNameInput, displayName)
  const usernameInput = screen.getByLabelText(/^Username/i, { selector: 'input' })
  await user.clear(usernameInput)
  await user.type(usernameInput, username)
}

describe('CippAddUserDrawer - create another user without a page refresh (issue #309)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    postState = { isPending: false, isSuccess: false, isError: false }
    mutateSpy = vi.fn()
    mockApis()
  })

  it('re-enables the Create button for a second user after the first succeeds', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />, {
      settings: settingsWith({ usageLocation: { value: 'US', label: 'United States' } }),
    })

    await user.click(screen.getByRole('button', { name: 'Add User' }))

    // First user: the domain selector auto-picks the tenant default domain
    await waitFor(() => {
      expect(getDomainInput()).toHaveValue('testdomain.com')
    })
    await fillRequiredFields(user, { displayName: 'First User', username: 'first.user' })

    const createButton = screen.getByRole('button', { name: 'Create User' })
    await waitFor(() => {
      expect(createButton).toBeEnabled()
    })
    await user.click(createButton)
    expect(mutateSpy).toHaveBeenCalledTimes(1)
    expect(mutateSpy.mock.calls[0][0].data).toMatchObject({
      displayName: 'First User',
      username: 'first.user',
      primDomain: { value: 'testdomain.com' },
    })

    // Simulate the mutation lifecycle so isSuccess transitions like it does in production
    await user.click(screen.getByRole('button', { name: 'flip-pending' }))
    await user.click(screen.getByRole('button', { name: 'flip-success' }))

    // The drawer resets the form for the next user
    const anotherButton = await screen.findByRole('button', { name: 'Create Another User' })

    // The remounted domain selector must auto-pick the default domain again; without it the
    // required primDomain stays silently empty and the button never re-enables (issue #309)
    await waitFor(() => {
      expect(getDomainInput()).toHaveValue('testdomain.com')
    })

    // Second user: complete all required fields again, exactly as the issue describes
    await fillRequiredFields(user, { displayName: 'Second User', username: 'second.user' })

    await waitFor(() => {
      expect(anotherButton).toBeEnabled()
    })
    await user.click(anotherButton)
    expect(mutateSpy).toHaveBeenCalledTimes(2)
    expect(mutateSpy.mock.calls[1][0].data).toMatchObject({
      displayName: 'Second User',
      username: 'second.user',
      primDomain: { value: 'testdomain.com' },
    })
  })
})
