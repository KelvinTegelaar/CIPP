import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippBulkContactDrawer } from '../../../src/components/CippComponents/CippBulkContactDrawer'
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

// The preview table and results panel take no part in what is under test, and the data-table stack
// exhausts the worker, so they are stubbed. CippFormComponent stays real because the manual-add
// dialog needs it to queue a row.
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
// react-papaparse needs a real drag-and-drop, so the reader is reduced to its two callbacks: the
// drop buttons feed the parsed rows a CSV would, the other is the file's remove control.
vi.mock('../../../src/components/CSVReader', () => ({
  default: ({ onDrop, onRemove }) => (
    <div>
      <button type="button" onClick={() => onDrop(csvRows)}>
        drop csv
      </button>
      <button type="button" onClick={() => onDrop(badCsvRows)}>
        drop bad csv
      </button>
      <button type="button" onClick={() => onRemove?.()}>
        remove csv
      </button>
    </div>
  ),
}))
const csvRows = [
  { displayName: 'From CSV', email: 'csv@supplier.example', hidefromGAL: 'false' },
]
const badCsvRows = [
  { displayName: 'Good Row', email: 'good@supplier.example' },
  { displayName: 'No Email Row', email: '' },
]
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

let mutateSpy
let resetSpy
let postState

function mockApis() {
  ApiGetCall.mockImplementation(() => idleGet)
  ApiGetCallWithPagination.mockImplementation(() => idlePaginated)
  ApiPostCall.mockImplementation(() => ({ ...postState, mutate: mutateSpy, reset: resetSpy }))
}

async function openDrawer(user) {
  await user.click(screen.getByRole('button', { name: 'Bulk Add Contacts' }))
}

async function openAddDialog(user) {
  await user.click(screen.getByRole('button', { name: 'Add Contact Manually' }))
  return screen.findByRole('dialog')
}

// The MUI Dialog is modal and marks the rest of the page aria-hidden while open, so the drawer
// footer button has to be queried with hidden: true until the dialog closes.
const createButton = (opts) => screen.getByRole('button', { name: 'Create Contacts', ...opts })

const renderDrawer = () =>
  renderWithProviders(<CippBulkContactDrawer />, {
    settings: settingsWith({ currentTenant: 'contoso.onmicrosoft.com' }),
  })

describe('CippBulkContactDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutateSpy = vi.fn()
    resetSpy = vi.fn()
    postState = { isPending: false, isSuccess: false, isError: false }
    mockApis()
  })

  it('ships an example CSV with sample rows showing true and false for hidefromGAL', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    const href = screen.getByRole('link', { name: 'Download Example CSV' }).getAttribute('href')
    const csv = decodeURIComponent(href.split(',').slice(1).join(',')).replace(/^\uFEFF/, '')
    const [header, ...rows] = csv.trim().split('\n').map((line) => line.split(','))
    const hideIndex = header.indexOf('hidefromGAL')

    expect(header[0]).toBe('displayName')
    expect(rows.length).toBeGreaterThanOrEqual(2)
    // Every sample row lines up with the header, so a user can read column by column.
    rows.forEach((row) => expect(row).toHaveLength(header.length))
    expect(rows.map((row) => row[hideIndex])).toEqual(expect.arrayContaining(['true', 'false']))
  }, 30000)

  it('queues the parsed CSV rows and drops them again when the file is removed', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    expect(createButton()).toBeEnabled()

    // Removing the file must also clear the rows it produced, or a removed file still gets submitted.
    await user.click(screen.getByRole('button', { name: 'remove csv' }))
    expect(createButton()).toBeDisabled()
  }, 30000)

  it('flags CSV rows without a display name or valid email and blocks submit', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    await user.click(screen.getByRole('button', { name: 'drop bad csv' }))
    expect(screen.getByText(/1 row is missing a display name or a valid email/i)).toBeInTheDocument()
    expect(createButton()).toBeDisabled()
  }, 30000)

  it('blocks a second submit while the batch is still running', async () => {
    postState = { isPending: true, isSuccess: false, isError: false }
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    // React Query 5 mutations report isPending, not isLoading; the button must follow that flag.
    expect(screen.getByRole('button', { name: 'Creating Contacts...' })).toBeDisabled()
  }, 30000)

  it('empties the queue once the batch succeeds so Create More Contacts cannot re-post it', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    expect(createButton()).toBeEnabled()

    // The mock is read on every render, so flip the state and let the next interaction re-render.
    postState.isSuccess = true
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create More Contacts' })).toBeDisabled()
    })
  }, 30000)

  it('clears the previous results when the drawer is closed', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(resetSpy).toHaveBeenCalledTimes(1)
  }, 30000)

  it('keeps Create Contacts disabled until a valid row is queued by hand', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    expect(createButton()).toBeDisabled()

    // Display Name alone is not enough: email is required too, so the row is refused.
    const dialog = await openAddDialog(user)
    await user.type(within(dialog).getByRole('textbox', { name: 'Display Name' }), 'Supplier Helpdesk')
    await user.click(within(dialog).getByRole('button', { name: 'Add' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(createButton({ hidden: true })).toBeDisabled()

    await user.type(within(dialog).getByRole('textbox', { name: 'Email' }), 'help@supplier.example')
    await user.click(within(dialog).getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(createButton()).toBeEnabled()
  }, 30000)

  it('posts one AddContact request per row with the single-drawer payload and a boolean hidefromGAL', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await openDrawer(user)
    // A CSV drop replaces the queue, a manual add appends to it, so the file goes first.
    await user.click(screen.getByRole('button', { name: 'drop csv' }))
    const dialog = await openAddDialog(user)
    await user.type(within(dialog).getByRole('textbox', { name: 'Display Name' }), 'Supplier Helpdesk')
    await user.type(within(dialog).getByRole('textbox', { name: 'Email' }), 'help@supplier.example')
    await user.type(within(dialog).getByRole('textbox', { name: 'Business Phone' }), '+45 12345678')
    // The only switch in the dialog is Hide from GAL.
    await user.click(within(dialog).getByRole('switch'))
    await user.click(within(dialog).getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    await user.click(createButton())

    expect(mutateSpy).toHaveBeenCalledTimes(1)
    const call = mutateSpy.mock.calls[0][0]
    expect(call.url).toBe('/api/AddContact')
    expect(call.bulkRequest).toBe(true)
    expect(call.data).toHaveLength(2)
    // The CSV string "false" must reach the backend as a boolean, not as text.
    expect(call.data[0]).toMatchObject({ DisplayName: 'From CSV', hidefromGAL: false })
    expect(call.data[1]).toMatchObject({
      tenantID: 'contoso.onmicrosoft.com',
      DisplayName: 'Supplier Helpdesk',
      email: 'help@supplier.example',
      phone: '+45 12345678',
      hidefromGAL: true,
    })
  }, 30000)
})
