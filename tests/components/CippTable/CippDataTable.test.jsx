import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import { CippDataTable } from '../../../src/components/CippTable/CippDataTable'
import { resetOverlayHistory } from '../../../src/utils/overlay-history'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, paginatedResult } from '../../mocks/api-call'

// idle keeps static-data tables on their data prop; the nested result is re-wrapped per call like react-query's tracked copy, the memo'd toolbar needs it to see selection
const nestedRows = [{ id: 'child-1', displayName: 'Jane Doe' }]
const nestedResult = paginatedResult(nestedRows)
const idlePaginated = paginatedResult([], { isSuccess: false })
api.paginated = (opts) => (opts?.url === '/api/TestRelated' ? { ...nestedResult } : idlePaginated)

const basicData = [
  { displayName: 'Alice Smith', mail: 'alice@contoso.com', department: 'IT', accountEnabled: true },
  { displayName: 'Bob Johnson', mail: 'bob@contoso.com', department: 'Sales', accountEnabled: true },
  { displayName: 'Carol Williams', mail: 'carol@contoso.com', department: 'HR', accountEnabled: false },
]

describe('CippDataTable', () => {
  it('renders table with static data', async () => {
    renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail', 'department']}
        maxHeightOffset="100px"
      />
    )

    // MRT uses row virtualization; jsdom has no layout engine so individual cells
    // are not rendered. Verify the table mounted and pagination reflects the 3 rows.
    await waitFor(() => {
      expect(screen.getByText('1-3 of 3')).toBeInTheDocument()
    })
  })

  it('renders title in card header', async () => {
    renderWithProviders(
      <CippDataTable
        data={basicData}
        title="User List"
        simpleColumns={['displayName', 'mail']}
        maxHeightOffset="100px"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('User List')).toBeInTheDocument()
    })
  })

  it('renders without card when noCard is true', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        noCard={true}
        simpleColumns={['displayName', 'mail']}
        maxHeightOffset="100px"
      />
    )

    expect(container.querySelector('.MuiCardHeader-root')).toBeNull()
  })

  it('renders in simple mode', async () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simple={true}
        simpleColumns={['displayName', 'mail', 'department']}
        maxHeightOffset="100px"
      />
    )

    // In simple mode the toolbar is hidden; the table element itself should still mount.
    await waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull()
    })

    expect(container.querySelector('tbody')).not.toBeNull()
  })

  // Loading skeleton test covered in CippDataTable.browser.test.jsx (requires real DOM layout)

  it('renders with actions menu button on rows', async () => {
    const mockFn = vi.fn()
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail', 'department']}
        actions={[{ label: 'View User', noConfirm: true, customFunction: mockFn }]}
        maxHeightOffset="100px"
      />
    )

    // When actions are provided, MRT renders a row-actions column.
    await waitFor(() => {
      const table = container.querySelector('table')
      expect(table).not.toBeNull()
    })

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders with hideTitle and no cardButton, no CardHeader', async () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        hideTitle={true}
        simpleColumns={['displayName', 'mail']}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('.MuiCardHeader-root')).toBeNull()
  })

  it('renders cardButton in card header', async () => {
    renderWithProviders(
      <CippDataTable
        data={basicData}
        title="Users"
        cardButton={<button>Add User</button>}
        simpleColumns={['displayName']}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument()
    })
  })

  it('renders ResourceUnavailable for non-array data', async () => {
    renderWithProviders(
      <CippDataTable
        data="not an array"
        incorrectDataMessage="Custom error message"
        simpleColumns={['displayName']}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
  })

  it('renders with offCanvas config', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail']}
        offCanvas={{
          title: 'User Details',
          extendedInfoFields: ['displayName', 'mail', 'department'],
        }}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('renders with custom columns instead of simpleColumns', async () => {
    // MRT uses virtualization and doesn't render column header text in jsdom (no layout engine).
    // Verify the table mounts without error when `columns` is provided instead of `simpleColumns`.
    const customColumns = [
      { id: 'displayName', header: 'Full Name', accessorKey: 'displayName' },
      { id: 'mail', header: 'Email Address', accessorKey: 'mail' },
    ]
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        columns={customColumns}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull()
    })
  })

  it('renders with defaultSorting', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail', 'department']}
        defaultSorting={[{ id: 'displayName', desc: true }]}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('renders noCard with non-array data shows ResourceUnavailable', () => {
    renderWithProviders(
      <CippDataTable
        data="invalid"
        noCard={true}
        incorrectDataMessage="Bad data format"
        simpleColumns={['displayName']}
        maxHeightOffset="100px"
      />
    )
    expect(screen.getByText('Bad data format')).toBeInTheDocument()
  })

  it('renders with nested property data', async () => {
    const nestedData = [
      { displayName: 'Alice', info: { email: 'alice@test.com' } },
      { displayName: 'Bob', info: { email: 'bob@test.com' } },
    ]
    const { container } = renderWithProviders(
      <CippDataTable
        data={nestedData}
        simpleColumns={['displayName', 'info.email']}
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull()
    })
  })

  it('renders with offCanvas and actions combined', () => {
    const mockFn = vi.fn()
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'mail']}
        actions={[{ label: 'Edit', noConfirm: true, customFunction: mockFn }]}
        offCanvas={{
          title: 'Details',
          extendedInfoFields: ['displayName', 'mail'],
        }}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('renders with empty data array', async () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={[]}
        simpleColumns={['displayName', 'mail']}
        title="Empty Table"
        maxHeightOffset="100px"
      />
    )
    await waitFor(() => {
      expect(screen.getByText('Empty Table')).toBeInTheDocument()
    })
  })

  it('renders with filters', () => {
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'department']}
        filters={[{ id: 'department', value: 'IT' }]}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  // slot semantics: cross-type table preset switch clears the outgoing type
  it('column preset clears a stale global filter left by a legacy untyped preset', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'department']}
        filters={[
          // untyped preset = legacy shape, lands its column array in the GLOBAL filter slot
          { filterName: 'Legacy IT', value: [{ id: 'department', value: 'IT' }] },
          { filterName: 'IT only', value: [{ id: 'department', value: 'IT' }], type: 'column' },
        ]}
        maxHeightOffset="100px"
      />
    )
    await screen.findByText('1-3 of 3')

    // legacy preset stringifies to "[object Object]" in the global filter, matches zero rows
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Legacy IT' }))
    await waitFor(() => {
      expect(screen.queryByText('1-3 of 3')).not.toBeInTheDocument()
    })

    // the column preset must not leave the stale global filter in place
    // Legacy IT preset is active here, button label is 'Filters (1)'
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'IT only' }))
    await waitFor(() => {
      expect(screen.getByText('1-1 of 1')).toBeInTheDocument()
    })
  }, 20000)

  it('renders with conditional actions', () => {
    const mockFn = vi.fn()
    const { container } = renderWithProviders(
      <CippDataTable
        data={basicData}
        simpleColumns={['displayName', 'accountEnabled']}
        actions={[
          {
            label: 'Disable Account',
            noConfirm: true,
            customFunction: mockFn,
            condition: (row) => row.accountEnabled === true,
          },
        ]}
        maxHeightOffset="100px"
      />
    )
    expect(container.querySelector('table')).not.toBeNull()
  })
})

// A card shows a title, subtitle and a few chips/details — on pages that never configured
// an offCanvas the rest of the row used to be unreachable in card view.
describe('CippDataTable card view without an offCanvas', () => {
  const wideData = [
    {
      displayName: 'Alice Smith',
      mail: 'alice@contoso.com',
      department: 'IT',
      jobTitle: 'Engineer',
      city: 'Seattle',
      country: 'US',
      accountEnabled: true,
    },
  ]
  const columns = ['displayName', 'mail', 'department', 'jobTitle', 'city', 'country']

  it('opens an extended-info drawer from a card tap showing every shown column', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable viewMode="cards" data={wideData} simpleColumns={columns} title="Users" />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.click(screen.getByText('Alice Smith'))

    // fields that never fit on the card are present in the drawer
    await waitFor(() => expect(screen.getAllByText(/Engineer/).length).toBeGreaterThan(0))
    expect(screen.getAllByText(/Seattle/).length).toBeGreaterThan(0)
  })

  // The test-detail pages render their own drawer body (offCanvas.children) — prepending
  // the generic property list on top of it repeated Risk/Status above a body that already
  // presents them.
  it('lets a custom drawer body own the drawer, without the generic property list', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[{ Name: 'Applications do not have client secrets configured', Risk: 'High', Status: 'Failed' }]}
        simpleColumns={['Name', 'Risk', 'Status']}
        title="Identity Tests"
        offCanvas={{
          size: 'lg',
          children: () => <div data-testid="rich-body">rich detail body</div>,
        }}
      />
    )

    await waitFor(() =>
      expect(screen.getByText('Applications do not have client secrets configured')).toBeInTheDocument()
    )
    await user.click(screen.getByText('Applications do not have client secrets configured'))

    // scope to the drawer that holds the body — the toolbar's Edit Filters offcanvas is
    // also a mounted .MuiDrawer-paper and sorts first in the DOM
    const body = await screen.findByTestId('rich-body')
    const drawer = body.closest('.MuiDrawer-paper')
    expect(drawer.textContent).toContain('rich detail body')
    // no generic property list stacked above the page's own body
    expect(drawer.textContent).not.toMatch(/Risk/)
  })

  // Retired: the extended-info drawer's action buttons. Pages still carry `actions` in their
  // offCanvas configs (the Users page spreads userActions in), and the config is spread onto
  // the drawer — so the retirement has to survive the spread, not just the explicit prop.
  it('keeps retired drawer actions out even when the page config carries them', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={wideData}
        simpleColumns={columns}
        title="Users"
        offCanvas={{
          extendedInfoFields: ['displayName', 'mail'],
          actions: [{ label: 'View User', link: '/identity/administration/users/user' }],
        }}
      />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.click(screen.getByText('Alice Smith'))

    // drawer is open (property list rendered) but the actions block is gone
    await waitFor(() => expect(screen.getAllByText(/alice@contoso.com/).length).toBeGreaterThan(0))
    expect(screen.queryByText('View User')).not.toBeInTheDocument()
  })

  it('formats fallback values the way their table cells do', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[{ displayName: 'Alice Smith', defaultDomainName: 'contoso.com', accountEnabled: true }]}
        simpleColumns={['displayName', 'defaultDomainName', 'accountEnabled']}
        title="Tenants"
      />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.click(screen.getByText('Alice Smith'))

    // 'text' mode would flatten the boolean to the string "Yes"; the cell renderer uses an icon.
    // Anchored: unanchored, this would also pass on "notcontoso.com" — and CodeQL flags it.
    await waitFor(() => expect(screen.getAllByText(/^contoso\.com$/).length).toBeGreaterThan(0))
    expect(screen.queryByText('Yes')).toBeNull()
  })

  it('spells out portal links instead of showing a bare icon', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[
          {
            displayName: 'Contoso',
            portal_m365: 'https://admin.cloud.microsoft/?delegatedOrg=contoso',
          },
        ]}
        simpleColumns={['displayName', 'portal_m365']}
        title="Tenants"
      />
    )

    await waitFor(() => expect(screen.getByText('Contoso')).toBeInTheDocument())
    await user.click(screen.getByText('Contoso'))

    const link = await screen.findByRole('link', { name: /open portal/i })
    expect(link).toHaveAttribute('href', 'https://admin.cloud.microsoft/?delegatedOrg=contoso')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('links portal values on the card itself, scheme-less ones included', async () => {
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[
          {
            displayName: 'Contoso',
            portal_sharepoint: 'contoso-admin.sharepoint.com',
          },
        ]}
        simpleColumns={['displayName', 'portal_sharepoint']}
        title="Tenants"
      />
    )

    await waitFor(() => expect(screen.getByText('Contoso')).toBeInTheDocument())
    // rendered on the card, without opening the drawer
    const link = await screen.findByRole('link', { name: /open portal/i })
    expect(link).toHaveAttribute('href', 'https://contoso-admin.sharepoint.com')
  })

  it('merges the page offCanvas fields with the remaining visible columns', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={wideData}
        simpleColumns={columns}
        title="Users"
        // curated list omits jobTitle and city, which the table would still show on desktop
        offCanvas={{ title: 'User Details', extendedInfoFields: ['mail', 'department'] }}
      />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.click(screen.getByText('Alice Smith'))
    await waitFor(() => expect(screen.getByText('User Details')).toBeInTheDocument())

    // curated fields present, and the ones it left out are appended rather than dropped
    expect(screen.getAllByText(/^alice@contoso\.com$/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Engineer/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Seattle/).length).toBeGreaterThan(0)
  })

  it('does not repeat a field that appears in both lists', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[{ displayName: 'Alice Smith', department: 'Engineering' }]}
        simpleColumns={['displayName', 'department']}
        title="Users"
        offCanvas={{ title: 'User Details', extendedInfoFields: ['department', 'department'] }}
      />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.click(screen.getByText('Alice Smith'))
    await waitFor(() => expect(screen.getByText('User Details')).toBeInTheDocument())

    // scoped to the drawer — the card behind it renders its own Department row
    const drawer = screen.getByText('User Details').closest('.MuiDrawer-paper')
    expect(drawer).not.toBeNull()
    expect(within(drawer).getAllByText('Department').length).toBe(1)
  })

  it('leaves a page-supplied offCanvas in charge', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={wideData}
        simpleColumns={columns}
        title="Users"
        offCanvas={{ title: 'User Details', extendedInfoFields: ['city'] }}
      />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.click(screen.getByText('Alice Smith'))

    // the page's own drawer opens — the fallback never substitutes for a configured one
    await waitFor(() => expect(screen.getByText('User Details')).toBeInTheDocument())
    expect(screen.getAllByText(/Seattle/).length).toBeGreaterThan(0)
  })
})

// The offcanvas walks the rows with Prev/Next and reports "N of M". Both come from the
// table's row model, and both used to be read from a mirror of it kept in state.
describe('CippDataTable offcanvas row navigation', () => {
  // Deliberately unsorted: the display order and the arrival order differ.
  const people = [
    { displayName: 'Carol Williams', mail: 'carol@contoso.com' },
    { displayName: 'Alice Smith', mail: 'alice@contoso.com' },
    { displayName: 'Bob Johnson', mail: 'bob@contoso.com' },
  ]

  // The Prev/Next bar and the position caption only render below md.
  const useMobileViewport = () => {
    const cache = new Map()
    window.matchMedia = (query) => {
      if (!cache.has(query)) {
        cache.set(query, {
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        })
      }
      return cache.get(query)
    }
  }

  const Table = (props) => (
    <CippDataTable
      viewMode="cards"
      simpleColumns={['displayName', 'mail']}
      title="Users"
      {...props}
    />
  )

  // Rows land from the API after the table has already mounted — the normal case.
  const AsyncTable = (props) => {
    const [data, setData] = React.useState([])
    return (
      <>
        <button type="button" onClick={() => setData(people)}>
          Load rows
        </button>
        <Table data={data} {...props} />
      </>
    )
  }

  beforeEach(() => {
    useMobileViewport()
  })

  afterEach(() => {
    resetOverlayHistory()
    delete window.matchMedia
  })

  it('counts rows that arrived after the table mounted', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AsyncTable />)

    await user.click(screen.getByRole('button', { name: 'Load rows' }))
    await waitFor(() => expect(screen.getByText('Carol Williams')).toBeInTheDocument())
    await user.click(screen.getByText('Carol Williams'))

    expect(await screen.findByText('1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
  })

  it('numbers rows in the order they are shown, not the order they arrived', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Table data={people} defaultSorting={[{ id: 'displayName', desc: false }]} />
    )

    // Sorted, Carol is last on screen — so she is the last row, with nowhere to go next.
    await waitFor(() => expect(screen.getByText('Carol Williams')).toBeInTheDocument())
    await user.click(screen.getByText('Carol Williams'))

    expect(await screen.findByText('3 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('counts only the rows left after a search', async () => {
    const user = userEvent.setup()
    const withTwoBobs = [
      ...people,
      { displayName: 'Bob Marley', mail: 'bob.marley@contoso.com' },
    ]
    renderWithProviders(
      <Table data={withTwoBobs} defaultSorting={[{ id: 'displayName', desc: false }]} />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'bob')
    await waitFor(() => expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument())

    await user.click(screen.getByText('Bob Marley'))

    // the sorted model is built from the FILTERED rows, so the search narrows the walk
    // too: two Bobs, not four people.
    expect(await screen.findByText('2 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /prev/i })).toBeEnabled()
  })

  it('steps to the next row as displayed', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Table data={people} defaultSorting={[{ id: 'displayName', desc: false }]} />
    )

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    await user.click(screen.getByText('Alice Smith'))
    expect(await screen.findByText('1 of 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /next/i }))

    // Bob follows Alice on screen; Carol is where the raw arrival order would have landed.
    expect(await screen.findByText('2 of 3')).toBeInTheDocument()
    // scoped by the drawer's own heading — the toolbar renders a filter Drawer too
    const drawer = screen.getByText('Extended Info').closest('.MuiDrawer-paper')
    expect(within(drawer).getByText('bob@contoso.com')).toBeInTheDocument()
  })
})

// the narrow-table height measurement reads viewport-relative positions, so the toggle
// aligns the card surface with the scrolling ancestor's top before the table flips in
describe('CippDataTable cards->table toggle scroll', () => {
  const useMobileViewport = () => {
    const cache = new Map()
    window.matchMedia = (query) => {
      if (!cache.has(query)) {
        cache.set(query, {
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        })
      }
      return cache.get(query)
    }
  }

  beforeEach(() => {
    useMobileViewport()
  })

  afterEach(() => {
    delete window.matchMedia
  })

  it('keeps a mid-page table in view instead of yanking the page to the top', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <div data-testid="scroller" style={{ overflowY: 'auto' }}>
        <CippDataTable data={basicData} simpleColumns={['displayName', 'mail']} title="Users" />
      </div>
    )
    await waitFor(() => expect(screen.getByTestId('cipp-card-view')).toBeInTheDocument())

    // surface sits below the scroller's viewport top, page already scrolled
    const scroller = screen.getByTestId('scroller')
    const surface = screen.getByTestId('cipp-card-view')
    scroller.getBoundingClientRect = () => ({ top: 64 })
    surface.getBoundingClientRect = () => ({ top: 300 })
    scroller.scrollTop = 120

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))

    // prior scroll plus the surface's offset from the scroller viewport top
    expect(scroller.scrollTop).toBe(120 + (300 - 64))
  })
})

describe('CippDataTable subTables', () => {
  const parentRows = [{ id: 'parent-1', displayName: 'Finance' }]
  // live nested table, the shape groups/index.js ships
  const nestedTable = {
    title: 'Related for [displayName]',
    api: { url: '/api/TestRelated', dataKey: 'Results' },
    simpleColumns: ['displayName'],
    viewMode: 'cards',
  }

  it('injects a button column that opens a nested table', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={parentRows}
        simpleColumns={['displayName', 'related']}
        title="Groups"
        subTables={[
          {
            id: 'related',
            header: 'Related',
            label: 'View',
            table: nestedTable,
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'View' }))

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(within(dialog).getByText('Related for Finance')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(within(dialog).getByText('Jane Doe')).toBeInTheDocument()
    })
  })

  it('runs nested row and bulk actions with the parent row attached', async () => {
    const rowFn = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={parentRows}
        simpleColumns={['displayName', 'related']}
        title="Groups"
        subTables={[
          {
            id: 'related',
            header: 'Related',
            label: 'View',
            table: {
              ...nestedTable,
              actions: [
                {
                  label: 'Remove',
                  noConfirm: true,
                  customFunction: rowFn,
                },
              ],
            },
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'View' }))

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(dialog).getByText('Jane Doe')).toBeInTheDocument())

    await user.click(within(dialog).getByRole('button', { name: 'Row actions' }))
    await user.click(await screen.findByText('Remove'))

    // the row sheet hands the action off to its exit transition
    await waitFor(() => {
      expect(rowFn).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'child-1',
          displayName: 'Jane Doe',
          parent: expect.objectContaining({ id: 'parent-1', displayName: 'Finance' }),
        }),
        expect.anything(),
        expect.anything()
      )
    })

    rowFn.mockClear()
    await user.click(within(dialog).getByRole('button', { name: 'Select' }))
    await user.click(within(dialog).getByRole('checkbox', { name: 'Select Jane Doe' }))
    await user.click(within(dialog).getByRole('button', { name: 'Actions' }))
    await user.click(await screen.findByText('Remove'))

    await waitFor(() => {
      expect(rowFn).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'child-1',
          parent: expect.objectContaining({ id: 'parent-1' }),
        }),
        expect.anything(),
        expect.anything()
      )
    })
  })

  it('replaces a data column that shares the subTable id', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[{ id: 'parent-1', displayName: 'Finance', related: [{ id: 'stale' }] }]}
        simpleColumns={['displayName', 'related']}
        title="Groups"
        subTables={[
          {
            id: 'related',
            header: 'Related',
            label: 'View',
            table: nestedTable,
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'View' }))

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(within(dialog).getByText('Jane Doe')).toBeInTheDocument()
    })
    expect(within(dialog).queryByText('stale')).not.toBeInTheDocument()
  })

  it('does not show a subTable column unless it is listed in simpleColumns', async () => {
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={parentRows}
        simpleColumns={['displayName']}
        title="Groups"
        subTables={[
          {
            id: 'related',
            header: 'Related',
            label: 'View',
            table: nestedTable,
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument()
  })

  it('shows cachedColumn instead of the nested table button when that field is on the data', async () => {
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[{ id: 'parent-1', displayName: 'Finance', membersCsv: 'Jane, Bob' }]}
        simpleColumns={['displayName', 'members']}
        title="Groups"
        subTables={[
          {
            id: 'members',
            header: 'Members',
            label: 'View members',
            cachedColumn: 'membersCsv',
            table: { ...nestedTable, title: 'Members of [displayName]' },
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'View members' })).not.toBeInTheDocument()
    expect(screen.getByText('Jane, Bob')).toBeInTheDocument()
  })

  it('still shows the nested table button when cachedColumn is configured but missing from the data', async () => {
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={parentRows}
        simpleColumns={['displayName', 'members']}
        title="Groups"
        subTables={[
          {
            id: 'members',
            header: 'Members',
            label: 'View members',
            cachedColumn: 'membersCsv',
            table: { ...nestedTable, title: 'Members of [displayName]' },
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'View members' })).toBeInTheDocument()
  })

  it('shows the nested table button when cachedColumn exists but is empty (live API shape)', async () => {
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={[{ id: 'parent-1', displayName: 'Finance', membersCsv: '', ownersCsv: '' }]}
        simpleColumns={['displayName', 'members']}
        title="Groups"
        subTables={[
          {
            id: 'members',
            header: 'Members',
            label: 'View members',
            cachedColumn: 'membersCsv',
            table: { ...nestedTable, title: 'Members of [displayName]' },
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'View members' })).toBeInTheDocument()
  })

  it('renders a declarative nested cardButton from table config', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        data={parentRows}
        simpleColumns={['displayName', 'related']}
        title="Groups"
        subTables={[
          {
            id: 'related',
            header: 'Related',
            label: 'View',
            table: {
              ...nestedTable,
              // table view, the card header is the only cardButton slot inside a dialog
              viewMode: 'table',
              cardButton: {
                label: 'Add Members',
                url: '/api/EditGroup',
                confirmText: 'Add Members for [displayName]?',
                data: { groupId: 'id' },
              },
            },
          },
        ]}
      />
    )

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'View' }))

    const nested = await screen.findByRole('dialog')
    const addButton = await within(nested).findByRole('button', { name: 'Add Members' })
    await user.click(addButton)

    expect(await screen.findByText('Add Members for Finance?')).toBeInTheDocument()
  })
})
