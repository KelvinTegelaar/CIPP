import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { CippDataTable } from '../../../src/components/CippTable/CippDataTable'

// save-preset invalidation refetches presetList in the background (data swap, no
// isSuccess transition), the Filters dropdown must rebuild from the refetched list

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../../mocks/api-call'

const refreshRows = [
  { displayName: 'Alice Smith', mail: 'alice@contoso.com' },
  { displayName: 'Bob Johnson', mail: 'bob@contoso.com' },
]

const rows = [
  { displayName: 'Alice Smith', mail: 'alice@contoso.com', department: 'IT' },
  { displayName: 'Bob Johnson', mail: 'bob@contoso.com', department: 'Sales' },
  { displayName: 'Carol Williams', mail: 'carol@contoso.com', department: 'IT' },
]

const tablePresets = [
  { filterName: 'IT only', value: [{ id: 'department', value: 'IT' }], type: 'column' },
  { filterName: 'Sales only', value: [{ id: 'department', value: 'Sales' }], type: 'column' },
]

// stable refs per phase, fresh literals per call loop the data-sync effects
const emptyPresets = getResult({ data: { Results: [] } })
const graphPresetResult = getResult({
  data: {
    Results: [
      { id: 'gp-1', name: 'Widget View', params: { endpoint: 'testWidgets', $filter: "state eq 'on'" } },
    ],
  },
})
const emptyGetResult = getResult({ isSuccess: false })
const tableData = paginatedResult(refreshRows)
const slotsTableData = paginatedResult(rows)

let presetsResult = emptyPresets
api.get = (opts) => (opts.url === '/api/ListGraphExplorerPresets' ? presetsResult : emptyGetResult)
// route by queryKey: SlotsTest* gets the 3-row fixture (incl. graph-preset key swap), preset-refetch tests keep 2-row
api.paginated = (opts) => (opts.queryKey?.startsWith('SlotsTest') ? slotsTableData : tableData)
api.post = postResult()

// swaps presetsResult with a fresh getResult() call, mimics the identity-change a background refetch produces
function swapGraphPresets(overrides) {
  presetsResult = getResult(overrides)
}

const graphTable = (
  <CippDataTable
    api={{ url: '/api/ListGraphRequest', dataKey: 'Results', data: { Endpoint: 'testWidgets' } }}
    queryKey="PresetRefreshTest"
    simpleColumns={['displayName', 'mail']}
    filters={[]}
    maxHeightOffset="100px"
  />
)

function renderGraphTable(extraProps = {}, options) {
  // pin the preset route here so renderGraphTable-based tests see 'Widget View'
  // regardless of what an earlier test left presetsResult pointing at
  presetsResult = graphPresetResult
  return renderWithProviders(
    <CippDataTable
      api={{ url: '/api/ListGraphRequest', dataKey: 'Results', data: { Endpoint: 'testWidgets' } }}
      queryKey="SlotsTest"
      simpleColumns={['displayName', 'mail', 'department']}
      filters={tablePresets}
      maxHeightOffset="100px"
      {...extraProps}
    />,
    options
  )
}

describe('CIPPTableToptoolbar - preset list refresh', () => {
  it('shows a newly saved preset in the Filters dropdown without a remount', async () => {
    const user = userEvent.setup()
    presetsResult = emptyPresets // order-independent: not relying on the module-scope initial value
    renderWithProviders(graphTable)
    await screen.findByText('1-2 of 2')

    // preset not saved yet, menu opens without it
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await screen.findByRole('menuitem', { name: 'Reset all filters' })
    expect(screen.queryByRole('menuitem', { name: 'My Saved Preset' })).toBeNull()
    await user.keyboard('{Escape}')

    // save-preset invalidation refetches: same isSuccess, new data identity.
    // reopening the menu re-renders the toolbar, which is all a background
    // refetch does, and matches the real repro (reopening doesn't help)
    swapGraphPresets({
      data: { Results: [{ id: 'p1', name: 'My Saved Preset', params: { endpoint: 'testWidgets' } }] },
    })
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await screen.findByRole('menuitem', { name: 'My Saved Preset' })
  }, 30000)

  it('graph preset and column preset are both marked active', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Widget View' }))
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await waitFor(() => {
      // scope to the live accessible menu, a closing menu's DOM can linger (aria-hidden) and double-count
      const menu = within(screen.getByRole('menu'))
      expect(menu.getAllByTestId('CheckIcon').length).toBeGreaterThanOrEqual(2)
    })
  }, 30000)

  it('applying a graph preset keeps the column filter applied', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))
    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Widget View' }))
    // same mocked rows come back under the swapped queryKey, column filter must survive
    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    })
  }, 30000)

  it('clicking the active graph preset toggles it off and keeps the column filter', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Widget View' }))
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))
    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    })

    // second click on the active graph preset = toggle off, column filter survives on base data
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Widget View' }))
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await waitFor(() => {
      // scope to the live accessible menu, same reason as the dual-slot pin above
      const menu = within(screen.getByRole('menu'))
      expect(menu.getAllByTestId('CheckIcon')).toHaveLength(1)
    })
    expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
  }, 20000)

  it('clicking the active column preset toggles back to unfiltered rows', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))
    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))
    await waitFor(() => {
      expect(screen.getByText('1-3 of 3')).toBeInTheDocument()
    })
  }, 30000)

  it('renders exactly one Filters menu with sections when both kinds exist', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await screen.findByRole('menuitem', { name: 'Widget View' })
    // two Menu blocks share this anchor, a dup mount would render two identical papers
    expect(document.querySelectorAll('.MuiMenu-paper').length).toBe(1)
    expect(screen.getByText('Graph filters')).toBeInTheDocument()
    expect(screen.getByText('Table filters')).toBeInTheDocument()
  }, 30000)

  it('button shows the active slot count', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Widget View' }))
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Filters (2)' })).toBeInTheDocument()
    })
  }, 30000)

  it('reset all filters clears the search box text', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.type(screen.getByPlaceholderText('Search...'), 'alice')
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Reset all filters' }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toHaveValue('')
    })
  }, 30000)

  it('restores both persisted slots and discards garbage global values', async () => {
    renderGraphTable({}, {
      settings: settingsWith({
        persistFilters: true,
        setLastUsedFilter: vi.fn(),
        lastUsedFilters: {
          // legacy single-slot shape with a non-string global value
          '': { type: 'global', value: [{ id: 'department', value: 'IT' }], name: 'Legacy Garbage' },
        },
      }),
    })
    await screen.findByText('1-3 of 3')
    // cross the restore effect's setTimeout(100) window before asserting, otherwise
    // cleanup unmounts (and cancels the pending timer) before it ever runs
    await new Promise((resolve) => setTimeout(resolve, 250))
    // garbage discarded: table stays unfiltered, no active slot
    expect(screen.getByText('1-3 of 3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Filters \(/ })).toBeNull()
  })

  it('restores both persisted slots and discards new-shape garbage global values', async () => {
    renderGraphTable({}, {
      settings: settingsWith({
        persistFilters: true,
        setLastUsedFilter: vi.fn(),
        lastUsedFilters: {
          // new shape can carry the same non-string global garbage the legacy branch discards
          '': {
            graph: null,
            table: { id: 'Garbage', name: 'Garbage', type: 'global', value: [{ id: 'department', value: 'IT' }] },
          },
        },
      }),
    })
    await screen.findByText('1-3 of 3')
    // cross the restore effect's setTimeout(100) window before asserting, otherwise
    // cleanup unmounts (and cancels the pending timer) before it ever runs
    await new Promise((resolve) => setTimeout(resolve, 250))
    // garbage discarded: table stays unfiltered, no active slot
    expect(screen.getByText('1-3 of 3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Filters \(/ })).toBeNull()
  })

  it('restores a legacy column filter into the table slot', async () => {
    renderGraphTable({}, {
      settings: settingsWith({
        persistFilters: true,
        setLastUsedFilter: vi.fn(),
        lastUsedFilters: {
          '': { type: 'column', value: [{ id: 'department', value: 'IT' }], name: 'IT only' },
        },
      }),
    })
    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    }, { timeout: 5000 })
    expect(screen.getByRole('button', { name: 'Filters (1)' })).toBeInTheDocument()
  })

  // Regression: the restore effect used to key on getRequestData.isFetching, re-arming its
  // 100ms timer on every fetch settle (once per page of an auto-paginated load) and
  // overwriting whatever the user had just applied with the persisted filter.
  it('does not clobber a user filter applied after the persisted one was restored', async () => {
    const user = userEvent.setup()
    renderGraphTable({}, {
      settings: settingsWith({
        persistFilters: true,
        setLastUsedFilter: vi.fn(),
        lastUsedFilters: {
          '': { type: 'column', value: [{ id: 'department', value: 'IT' }], name: 'IT only' },
        },
      }),
    })
    // persisted "IT only" lands first
    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    }, { timeout: 5000 })

    // user switches to the other preset
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sales only' }))
    await waitFor(() => {
      expect(screen.getByText('1-1 of 1')).toBeInTheDocument()
    })

    // well past the restore timer: the persisted filter must not come back
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(screen.getByText('1-1 of 1')).toBeInTheDocument()
  }, 30000)

  it('syncs the search box when a global preset is applied and cleared', async () => {
    const user = userEvent.setup()
    renderGraphTable({
      filters: [{ filterName: 'Named Alice', value: 'alice', type: 'global' }],
    })
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Named Alice' }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toHaveValue('alice')
    })

    // tapping the active preset again clears the slot — and the box with it
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Named Alice' }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toHaveValue('')
    })
  }, 30000)

  // filterList was state-initialised from the prop and never re-synced, so pages that
  // compute `filters` asynchronously showed an empty preset list forever
  it('picks up filters that arrive after the first render', async () => {
    const user = userEvent.setup()
    presetsResult = graphPresetResult

    const LateFilters = () => {
      const [filters, setFilters] = React.useState([])
      return (
        <>
          <button type="button" onClick={() => setFilters(tablePresets)}>
            load filters
          </button>
          <CippDataTable
            api={{ url: '/api/ListGraphRequest', dataKey: 'Results', data: { Endpoint: 'testWidgets' } }}
            queryKey="SlotsTest"
            simpleColumns={['displayName', 'mail', 'department']}
            filters={filters}
            maxHeightOffset="100px"
          />
        </>
      )
    }

    renderWithProviders(<LateFilters />)
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    expect(screen.queryByRole('menuitem', { name: 'IT only' })).toBeNull()
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'load filters' }))
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    expect(await screen.findByRole('menuitem', { name: 'IT only' })).toBeInTheDocument()
    // the fetched graph preset is not lost when the prop-driven list arrives
    expect(screen.getByRole('menuitem', { name: 'Widget View' })).toBeInTheDocument()
  }, 30000)

  it('renaming an applied graph preset keeps it marked active', async () => {
    const user = userEvent.setup()
    renderGraphTable()
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Widget View' }))

    // rename lands via refetch, same id
    swapGraphPresets({
      data: { Results: [{ id: 'gp-1', name: 'Widget View v2', params: { endpoint: 'testWidgets', $filter: "state eq 'on'" } }] },
    })
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    const renamed = await screen.findByRole('menuitem', { name: 'Widget View v2' })
    await waitFor(() => {
      expect(within(renamed).queryByTestId('CheckIcon')).not.toBeNull()
    })
  }, 30000)
})

describe('CIPPTableToptoolbar desktop export', () => {
  it('Export menu carries the row exports and opens the API response viewer', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        data={rows}
        simpleColumns={['displayName', 'mail']}
        title="Users"
        maxHeightOffset="100px"
      />
    )
    await screen.findByText('Users')

    await user.click(screen.getByRole('button', { name: /Export/ }))
    await screen.findByRole('menuitem', { name: 'Export to CSV' })
    expect(screen.getByRole('menuitem', { name: 'Export to PDF' })).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'View API Response' }))
    await screen.findByText('API Response')
  })
})
