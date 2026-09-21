import React from 'react'
import { vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@mui/material'
import { renderWithProviders, settingsWith } from '../../test-utils'

// jsdom matchMedia never matches, so this overrides only useIsNarrowForTables for the FAB pivot, useTableViewMode stays real
const narrowState = vi.hoisted(() => ({ narrow: false }))
vi.mock('../../../src/hooks/use-breakpoint', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useIsNarrowForTables: () => narrowState.narrow }
})

import { CippDataTable } from '../../../src/components/CippTable/CippDataTable'

// wide enough that full mode overflows into "+N more fields"
const users = [
  {
    displayName: 'Alice Smith',
    userPrincipalName: 'alice@contoso.com',
    department: 'IT',
    jobTitle: 'Engineer',
    city: 'Seattle',
    country: 'US',
    accountEnabled: true,
  },
]
const columns = [
  'displayName',
  'userPrincipalName',
  'department',
  'jobTitle',
  'city',
  'country',
  'accountEnabled',
]

// no viewMode prop, so settings.tableViewMode='cards' forces cards but leaves the toggle allowed
const renderCards = (settings = {}, componentProps = {}) =>
  renderWithProviders(
    <CippDataTable data={users} simpleColumns={columns} title="Users" {...componentProps} />,
    { settings: settingsWith({ tableViewMode: 'cards', ...settings }) }
  )

describe('CippMobileCardList card anatomy', () => {
  it('shows the slotted anatomy: overflow counter, secondary slot as bare text', async () => {
    renderCards()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    // details cap at 3 of the 4 remaining columns -> 1 overflow
    expect(screen.getByText(/more field/)).toBeInTheDocument()
    // secondary slot is bare text, its column label never renders
    expect(screen.queryByText('User Principal Name')).not.toBeInTheDocument()
  })
})

describe('CippMobileCardList status chips', () => {
  // The identity/device/custom test tables: Result went to the chips row but Risk fell to
  // the detail rows — two chips organised by two different systems on one card, and the
  // detail-grid "High" said nothing about what was high.
  it('keeps Result and Risk together in the chips row, and labels the mute one', async () => {
    renderWithProviders(
      <CippDataTable
        viewMode="cards"
        title="Identity Tests"
        data={[{ TestName: 'Tenant has M365 Copilot prerequisites', Result: 'Passed', Risk: 'High' }]}
        simpleColumns={['TestName', 'Result', 'Risk']}
      />,
      { settings: settingsWith({ tableViewMode: 'cards' }) }
    )
    await waitFor(() =>
      expect(screen.getByText('Tenant has M365 Copilot prerequisites')).toBeInTheDocument()
    )

    const passed = screen.getByText('Passed')
    const high = screen.getByText('High')
    // both chips share one container — Risk is not off in the details grid
    expect(high.closest('.MuiStack-root')).toBe(passed.closest('.MuiStack-root'))
    // "High" alone doesn't say what is high; "Passed" speaks for itself
    expect(screen.getByText('Risk')).toBeInTheDocument()
    expect(screen.queryByText('Result')).not.toBeInTheDocument()
  })
})

describe('CippMobileCardList table view toggle', () => {
  afterEach(() => {
    narrowState.narrow = false
  })

  it('opens the table view and the way back restores cards, never touching settings', async () => {
    // narrow viewport: the round trip must hand back the card view intact
    narrowState.narrow = true
    const user = userEvent.setup()
    const handleUpdate = vi.fn()
    const { container } = renderCards({ handleUpdate })
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    expect(screen.getByTestId('cipp-mobile-card-list')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText(/more field/)).toBeInTheDocument()

    // jsdom renders no MRT header/row text, so just check the table mounts and cards unmount
    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(container.querySelector('table')).not.toBeNull())
    expect(screen.queryByTestId('cipp-mobile-card-list')).not.toBeInTheDocument()

    // same aria-label, now the desktop toolbar's "way back" button
    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(screen.getByTestId('cipp-mobile-card-list')).toBeInTheDocument())

    // full card content is back: detail rows and the overflow counter
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText(/more field/)).toBeInTheDocument()

    // transient: the view toggle never persists
    expect(handleUpdate).not.toHaveBeenCalled()
  })

  it('the toggled table keeps every configured column visible', async () => {
    narrowState.narrow = true
    const user = userEvent.setup()
    renderCards()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Columns' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Columns' }))

    // Columns menu reads table.getAllColumns(), unaffected by the virtualized header row
    const menu = within(screen.getAllByRole('menu')[0])
    const checkbox = (name) => within(menu.getByRole('menuitem', { name })).getByRole('checkbox')
    for (const name of [
      'Display Name',
      'User Principal Name',
      'Account Enabled',
      'Department',
      'Job Title',
      'City',
      'Country',
    ]) {
      expect(checkbox(name)).toBeChecked()
    }
  })

  it('a Fields shown toggle in the shared filter sheet changes what the card renders', async () => {
    const user = userEvent.setup()
    renderCards()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    // department is a detail row on the card before the toggle
    expect(screen.getByText('Department')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Table options' }))
    await screen.findByText('Fields shown')
    // the sheet is a portal appended to body, so its entry sorts after the card's label
    await user.click(screen.getAllByText('Department').at(-1))
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => expect(screen.queryByText('Department')).not.toBeInTheDocument())
  })

  // "Fields shown" is a checkbox per column — a dozen rows on a wide table — so anything
  // after it starts a long scroll down. The table utilities (refresh, export, reset) are what
  // people open this sheet for far more often than field toggles.
  it('puts the table utilities above the Fields shown list, not below it', async () => {
    const user = userEvent.setup()
    renderCards()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Table options' }))
    const fields = await screen.findByText('Fields shown')
    const refresh = screen.getByText('Refresh data')

    // DOCUMENT_POSITION_FOLLOWING = 4: fields comes after refresh in the DOM
    expect(refresh.compareDocumentPosition(fields) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(4)
    expect(
      screen.getByText('Reset all filters').compareDocumentPosition(fields) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBe(4)
  })

  it('an explicit viewMode prop hides the toggle button', async () => {
    renderWithProviders(
      <CippDataTable viewMode="cards" data={users} simpleColumns={columns} title="Users" />,
      { settings: settingsWith() }
    )
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Toggle table view' })).not.toBeInTheDocument()
  })

  // Regression: the cards branch and the table branch are two alternating CIPPTableToptoolbar
  // instances (only one mounts at a time), so activeFilters/searchValue/restoredFiltersRef used
  // to live in the toolbar's own useState and reset on every flip. The table-branch kebab is
  // unreachable here (mdDown from useMediaQuery never matches in jsdom, and useCompactMode stays
  // false since offsetWidth/scrollWidth are always 0) — reopening the sheet after the round trip
  // is the observable proxy for "state survived the two remounts".
  it('an applied preset and its badge survive a flip to table and back', async () => {
    narrowState.narrow = true
    const user = userEvent.setup()
    const presetFilters = [
      { filterName: 'IT department', value: [{ id: 'department', value: 'IT' }], type: 'column' },
    ]
    renderCards({}, { filters: presetFilters })
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Table options' }))
    const sheet = await screen.findByRole('dialog')
    await user.click(within(sheet).getByText('IT department'))
    await user.click(within(sheet).getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    // preset active before the flip — the sheet's aria-hidden overlay is gone now
    await waitFor(() => {
      expect(within(screen.getByRole('button', { name: 'Table options' })).getByText('1')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(document.querySelector('table')).not.toBeNull())
    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(screen.getByTestId('cipp-mobile-card-list')).toBeInTheDocument())

    // badge count survived both remounts
    expect(within(screen.getByRole('button', { name: 'Table options' })).getByText('1')).toBeInTheDocument()

    // the preset chip is marked active too
    await user.click(screen.getByRole('button', { name: 'Table options' }))
    const reopened = await screen.findByRole('dialog')
    const chip = within(reopened).getByText('IT department').closest('.MuiChip-root')
    expect(chip.className).toContain('MuiChip-filled')
  }, 15000)

  it('a manual field-visibility change survives a flip, even with preferred columns saved for the page', async () => {
    narrowState.narrow = true
    const user = userEvent.setup()
    // router mock resolves pageName to '' in tests, matching CIPPTableToptoolbar.test.jsx's convention
    const allColumnsVisible = Object.fromEntries(columns.map((c) => [c, true]))
    renderCards({ columnDefaults: { '': allColumnsVisible } })
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    expect(screen.getByText('Department')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Table options' }))
    await screen.findByText('Fields shown')
    await user.click(screen.getAllByText('Department').at(-1))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByText('Department')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(document.querySelector('table')).not.toBeNull())
    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(screen.getByTestId('cipp-mobile-card-list')).toBeInTheDocument())

    // the manual hide must not be reverted by the saved preferred-columns set on remount
    expect(screen.queryByText('Department')).not.toBeInTheDocument()
  }, 15000)
})

describe('CippMobileCardList table-view page actions FAB', () => {
  afterEach(() => {
    narrowState.narrow = false
  })

  it('narrow viewport moves cardButton into the actions FAB once toggled to table view', async () => {
    narrowState.narrow = true
    const user = userEvent.setup()
    renderCards({}, { cardButton: <Button>Add user</Button> })
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Page actions' })).toBeInTheDocument())

    // action content stays behind the FAB until opened
    expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Page actions' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add user' })).toBeInTheDocument())
  })

  it('desktop viewport keeps cardButton in the header, no FAB', async () => {
    const user = userEvent.setup()
    renderCards({}, { cardButton: <Button>Add user</Button> })
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add user' })).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Page actions' })).not.toBeInTheDocument()
  })
})

// The Card header hosts a portal target for the toolbar's bulk-actions UI on narrow
// viewports (CIPPTableToptoolbar's bulkActionsSlot). Row selection itself can't be driven
// here: CippDataTable's table renders with enableRowVirtualization + enableColumnVirtualization
// always on, and jsdom never reports a nonzero container size, so react-virtual computes an
// empty range — thead and tbody both mount with zero cells (verified: no checkboxes, no
// columnheaders, table-view page actions FAB tests above only ever check for the <table>
// element itself, never header/row content). Selecting a row to exercise the portal is
// covered in the CippMobileCardList.stories.jsx browser story instead.
describe('CippMobileCardList table-view header mounts as the bulk-actions portal target', () => {
  afterEach(() => {
    narrowState.narrow = false
  })

  it('narrow + hideTitle + cardButton: header still mounts even though the FAB owns cardButton', async () => {
    narrowState.narrow = true
    const user = userEvent.setup()
    const { container } = renderCards(
      {},
      { hideTitle: true, cardButton: <Button>Add user</Button> }
    )
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(container.querySelector('table')).not.toBeNull())

    // headerAction is undefined here (FAB owns cardButton), so the gate has to key off
    // cardButton directly or this mounts nothing and the portal target never exists
    expect(container.querySelector('.MuiCardHeader-root')).not.toBeNull()
  })

  it('desktop + hideTitle + cardButton: header mounts with cardButton in it, same as before', async () => {
    const user = userEvent.setup()
    const { container } = renderCards(
      {},
      { hideTitle: true, cardButton: <Button>Add user</Button> }
    )
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(container.querySelector('table')).not.toBeNull())

    const header = container.querySelector('.MuiCardHeader-root')
    expect(header).not.toBeNull()
    expect(within(header).getByRole('button', { name: 'Add user' })).toBeInTheDocument()
  })
})

describe('CippMobileCardList data source controls', () => {
  afterEach(() => {
    narrowState.narrow = false
  })

  it('renders in the Table options sheet, not in the page actions FAB', async () => {
    narrowState.narrow = true
    const user = userEvent.setup()
    renderCards(
      {},
      { dataSourceControls: <span>Live badge</span>, cardButton: <Button>Add user</Button> }
    )
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Table options' }))
    const filterSheet = await within(document.body).findByRole('dialog')
    expect(within(filterSheet).getByText('Data source')).toBeInTheDocument()
    expect(within(filterSheet).getByText('Live badge')).toBeInTheDocument()

    await user.click(within(filterSheet).getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument())

    // narrow + table view: cardButton lives behind the FAB, dataSourceControls must not follow it there
    await user.click(screen.getByRole('button', { name: 'Toggle table view' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Page actions' })).toBeInTheDocument())

    // and the table's card header must not double-render them (sheet is the only narrow home)
    expect(screen.queryByText('Live badge')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Page actions' }))
    const fabSheet = await within(document.body).findByRole('dialog')
    await waitFor(() => expect(within(fabSheet).getByRole('button', { name: 'Add user' })).toBeInTheDocument())
    expect(within(fabSheet).queryByText('Live badge')).not.toBeInTheDocument()
  })
})
