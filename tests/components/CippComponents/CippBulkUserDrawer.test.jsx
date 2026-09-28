import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippBulkUserDrawer } from '../../../src/components/CippComponents/CippBulkUserDrawer'
import {
  ApiGetCall,
  ApiPostCall,
  ApiGetCallWithPagination,
} from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(),
}))

// The license selector, the preview table and the results panel take no part in the tenant
// guard under test, and each drags in the data-table / 2.2 MB license graph that exhausts the
// worker, so they are stubbed. CippFormComponent stays real because the manual-add dialog needs
// it to queue a row.
vi.mock(
  '../../../src/components/CippComponents/CippFormLicenseSelector',
  () => ({
    CippFormLicenseSelector: () => (
      <div data-testid="CippFormLicenseSelector" />
    ),
    default: () => <div data-testid="CippFormLicenseSelector" />,
  })
)
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
// CippFormComponent statically imports the data-table stack for its cippDataTable case, and
// CippAutoComplete pulls in CippJSONView for its option preview; neither renders here, but the
// static imports alone are enough to kill the worker.
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="CippDataTable" />,
  default: () => <div data-testid="CippDataTable" />,
}))
vi.mock('../../../src/components/CippFormPages/CippJSONView', () => ({
  default: () => null,
}))
// The real drawer shell renders through a MUI Drawer portal; the stub keeps the essential
// contract - content and footer render only while the drawer is open.
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, children, footer }) =>
    visible ? (
      <div data-testid="CippOffCanvas">
        {children}
        {footer}
      </div>
    ) : null,
}))

const idleGet = {
  isSuccess: false,
  isFetching: false,
  isError: false,
  data: undefined,
  refetch: vi.fn(),
}
const idlePaginated = { ...idleGet, fetchNextPage: vi.fn() }

let postState
let mutateSpy

function mockApis() {
  ApiGetCall.mockImplementation(() => idleGet)
  ApiGetCallWithPagination.mockImplementation(() => idlePaginated)
  ApiPostCall.mockImplementation(() => ({ ...postState, mutate: mutateSpy }))
}

// Queue one user through the manual-add dialog. Any typed field is enough - handleAddItem pushes
// whatever `addrow` holds - so with a row present the Create button's disabled state is governed
// solely by the tenant guard rather than the empty-list default.
async function queueOneUser(user) {
  await user.click(screen.getByRole('button', { name: 'Add User Manually' }))
  const dialog = await screen.findByRole('dialog')
  await user.type(within(dialog).getAllByRole('textbox')[0], 'Test User')
  await user.click(within(dialog).getByRole('button', { name: 'Add' }))
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
}

describe('CippBulkUserDrawer - bulk creation is refused under All Tenants (ticket 48312738612)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    postState = { isLoading: false, isSuccess: false, isError: false }
    mutateSpy = vi.fn()
    mockApis()
  })

  it('warns and keeps Create Users disabled with a queued row when All Tenants is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippBulkUserDrawer />, {
      settings: settingsWith({ currentTenant: 'AllTenants' }),
    })

    await user.click(screen.getByRole('button', { name: 'Bulk Add Users' }))

    // The single-tenant warning must be visible before the user wastes time building a list.
    expect(screen.getByText(/single-tenant only/i)).toBeInTheDocument()

    // Even with a row queued - the state that normally enables Create Users - the guard keeps
    // submit disabled, because under All Tenants the write silently creates nothing.
    await queueOneUser(user)
    expect(screen.getByRole('button', { name: 'Create Users' })).toBeDisabled()
  }, 30000)

  it('enables Create Users and shows no warning once a specific tenant is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippBulkUserDrawer />, {
      settings: settingsWith({ currentTenant: 'contoso.onmicrosoft.com' }),
    })

    await user.click(screen.getByRole('button', { name: 'Bulk Add Users' }))

    expect(screen.queryByText(/single-tenant only/i)).not.toBeInTheDocument()

    await queueOneUser(user)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Users' })).toBeEnabled()
    })
  }, 30000)
})
