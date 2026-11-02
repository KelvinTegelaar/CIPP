import React, { useState } from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders, settingsWith } from '../../test-utils'
import { SettingsContext } from '../../../src/contexts/settings-context'
import { CippDataTable } from '../../../src/components/CippTable/CippDataTable'
import router from '../../mocks/next-router'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
import { api, paginatedResult } from '../../mocks/api-call'

const page = 'identity/administration/users'
const idleResult = paginatedResult([], { isSuccess: false })
// tenant B's rows carry a field (jobTitle) that tenant A's never had, so a preference
// saved on A has no entry for it - the case where a wholesale replace would reveal it
const tenantResults = {
  A: paginatedResult([
    { displayName: 'Alice', mail: 'alice@example.com', department: 'IT' },
  ]),
  B: paginatedResult([
    {
      displayName: 'Bob',
      mail: 'bob@example.com',
      department: 'Sales',
      jobTitle: 'Manager',
    },
    {
      displayName: 'Carol',
      mail: 'carol@example.com',
      department: 'HR',
      jobTitle: 'Analyst',
    },
  ]),
}
const customColumns = [
  { id: 'displayName', accessorKey: 'displayName', header: 'Display Name' },
  { id: 'mail', accessorKey: 'mail', header: 'Mail' },
]
// every way a page can declare its columns: explicit column defs, simpleColumns, or
// nothing at all (every API field shown). the default for an unsaved field differs per mode
const modes = [
  ['custom', { columns: customColumns }],
  ['simple', { simpleColumns: ['displayName', 'mail'] }],
  ['automatic', {}],
]

// a live settings context: Save/Delete preferred columns write through handleUpdate and the
// table must see the new columnDefaults, which the static renderWithProviders value cannot do
function Example({ tableProps, saved = {}, otherSaved = {} }) {
  const [settings, setSettings] = useState(() =>
    settingsWith({
      currentTenant: 'A',
      columnDefaults: { [page]: saved, ...otherSaved },
    })
  )
  const [tableKey, setTableKey] = useState(0)
  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        handleUpdate: (update) =>
          setSettings((previous) => ({ ...previous, ...update })),
      }}
    >
      <button
        onClick={() =>
          setSettings((previous) => ({ ...previous, currentTenant: 'B' }))
        }
      >
        Tenant B
      </button>
      <button onClick={() => setTableKey((key) => key + 1)}>
        Reload table
      </button>
      <CippDataTable
        key={tableKey}
        api={{
          url: '/api/TestPreferredColumns',
          dataKey: 'Results',
          data: { tenantFilter: settings.currentTenant },
        }}
        queryKey={`preferred-${settings.currentTenant}`}
        viewMode="table"
        maxHeightOffset="100px"
        {...tableProps}
      />
    </SettingsContext.Provider>
  )
}

// Columns menu reads table.getAllColumns(), unaffected by the virtualized header row
const columnCheckbox = (name) =>
  within(screen.getByRole('menuitem', { name })).getByRole('checkbox')

beforeEach(() => {
  router.pathname = `/${page}`
  api.paginated = (options) =>
    tenantResults[options.data?.tenantFilter] || idleResult
})

afterEach(() => {
  router.pathname = '/'
})

describe.each(modes)(
  'preferred columns with %s columns',
  (mode, tableProps) => {
    const unsavedFieldDefault = mode === 'automatic'

    it('keeps the saved selection across a tenant switch, a reset and a remount', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Example tableProps={tableProps} />)
      await screen.findByText('1-1 of 1')

      await user.click(screen.getByRole('button', { name: 'Columns' }))
      if (!columnCheckbox('Department').checked)
        await user.click(columnCheckbox('Department'))
      await user.click(columnCheckbox('Mail'))
      await user.click(
        screen.getByRole('menuitem', { name: 'Save as preferred columns' })
      )

      // tenant B answers with a different schema; the saved choices survive the rebuild and
      // the field the preference never saw keeps this table's own default
      await user.click(screen.getByRole('button', { name: 'Tenant B' }))
      await screen.findByText('1-2 of 2')
      await user.click(screen.getByRole('button', { name: 'Columns' }))
      expect(columnCheckbox('Department')).toBeChecked()
      expect(columnCheckbox('Mail')).not.toBeChecked()
      expect(columnCheckbox('Job Title').checked).toBe(unsavedFieldDefault)

      // reset restores the saved choices without touching the field outside the preference
      await user.click(columnCheckbox('Department'))
      await user.click(
        screen.getByRole('menuitem', { name: 'Reset to preferred columns' })
      )
      await user.click(screen.getByRole('button', { name: 'Columns' }))
      expect(columnCheckbox('Department')).toBeChecked()
      expect(columnCheckbox('Mail')).not.toBeChecked()
      expect(columnCheckbox('Job Title').checked).toBe(unsavedFieldDefault)
      await user.keyboard('{Escape}')

      await user.click(screen.getByRole('button', { name: 'Reload table' }))
      await screen.findByText('1-2 of 2')
      await user.click(screen.getByRole('button', { name: 'Columns' }))
      expect(columnCheckbox('Department')).toBeChecked()
      expect(columnCheckbox('Mail')).not.toBeChecked()
      expect(columnCheckbox('Job Title').checked).toBe(unsavedFieldDefault)
    }, 30000)

    it('applies an existing preference once the API data arrives', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Example
          tableProps={tableProps}
          saved={{ department: true, mail: false }}
        />
      )
      await screen.findByText('1-1 of 1')
      await user.click(screen.getByRole('button', { name: 'Columns' }))
      await waitFor(() => expect(columnCheckbox('Department')).toBeChecked())
      expect(columnCheckbox('Mail')).not.toBeChecked()
      expect(columnCheckbox('Display Name')).toBeChecked()
    }, 30000)
  }
)

// static data is already there on the first render, so the column build and the saved
// preference land in the same effect flush - the preference must layer over that build
it('keeps the defaults for fields outside a saved preference on a static-data table', async () => {
  const user = userEvent.setup()
  renderWithProviders(
    <Example
      tableProps={{
        api: {},
        data: [
          {
            displayName: 'Alice',
            mail: 'alice@example.com',
            department: 'IT',
            jobTitle: 'Lead',
          },
        ],
        simpleColumns: ['displayName', 'mail'],
      }}
      saved={{ department: true, mail: false }}
    />
  )
  await screen.findByText('1-1 of 1')
  await user.click(screen.getByRole('button', { name: 'Columns' }))
  expect(columnCheckbox('Department')).toBeChecked()
  expect(columnCheckbox('Mail')).not.toBeChecked()
  expect(columnCheckbox('Job Title')).not.toBeChecked()
}, 30000)

it('does not apply the parent page preference to an unkeyed dialog table', async () => {
  const user = userEvent.setup()
  renderWithProviders(
    <Example
      tableProps={{ columns: customColumns, isInDialog: true }}
      saved={{ department: true, mail: false }}
    />
  )
  await screen.findByText('1-1 of 1')
  await user.click(screen.getByRole('button', { name: 'Columns' }))
  expect(columnCheckbox('Department')).not.toBeChecked()
  expect(columnCheckbox('Mail')).toBeChecked()
}, 30000)

it('uses the explicit persistence key for a dialog table', async () => {
  const user = userEvent.setup()
  renderWithProviders(
    <Example
      tableProps={{
        columns: customColumns,
        isInDialog: true,
        persistenceKey: 'related-users',
      }}
      saved={{ department: false, mail: true }}
      otherSaved={{ 'related-users': { department: true, mail: false } }}
    />
  )
  await screen.findByText('1-1 of 1')
  await user.click(screen.getByRole('button', { name: 'Columns' }))
  expect(columnCheckbox('Department')).toBeChecked()
  expect(columnCheckbox('Mail')).not.toBeChecked()
}, 30000)

it('does not restore a deleted preference after a tenant switch or a remount', async () => {
  const user = userEvent.setup()
  renderWithProviders(
    <Example
      tableProps={{ simpleColumns: ['displayName', 'mail'] }}
      saved={{ department: true, mail: false }}
    />
  )
  await screen.findByText('1-1 of 1')
  await user.click(screen.getByRole('button', { name: 'Columns' }))
  await user.click(
    screen.getByRole('menuitem', { name: 'Delete preferred columns' })
  )

  await user.click(screen.getByRole('button', { name: 'Tenant B' }))
  await screen.findByText('1-2 of 2')
  await user.click(screen.getByRole('button', { name: 'Columns' }))
  expect(columnCheckbox('Department')).not.toBeChecked()
  expect(columnCheckbox('Mail')).toBeChecked()
  await user.keyboard('{Escape}')

  await user.click(screen.getByRole('button', { name: 'Reload table' }))
  await screen.findByText('1-2 of 2')
  await user.click(screen.getByRole('button', { name: 'Columns' }))
  expect(columnCheckbox('Department')).not.toBeChecked()
  expect(columnCheckbox('Mail')).toBeChecked()
}, 30000)
