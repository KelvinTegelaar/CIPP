import React, { useState } from 'react'
import { Button, Stack } from '@mui/material'
import { http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { CippDataTable } from '../../../src/components/CippTable/CippDataTable'
import { SettingsProvider } from '../../../src/contexts/settings-context'
import { useSettings } from '../../../src/hooks/use-settings'

const persistenceKey = 'storybook/preferred-columns/users'
const columns = [
  { id: 'displayName', accessorKey: 'displayName', header: 'Display Name' },
  { id: 'mail', accessorKey: 'mail', header: 'Mail' },
]
// tenant B carries a field (jobTitle) tenant A never had, so a preference saved on A has
// no entry for it. TanStack shows a column without an entry, which is what a wholesale
// replace of the visibility map used to trigger
const tenants = {
  'tenant-a.example': [
    { displayName: 'Alice', mail: 'alice@tenant-a.example', department: 'IT' },
  ],
  'tenant-b.example': [
    {
      displayName: 'Bob',
      mail: 'bob@tenant-b.example',
      department: 'Sales',
      jobTitle: 'Manager',
    },
    {
      displayName: 'Carol',
      mail: 'carol@tenant-b.example',
      department: 'HR',
      jobTitle: 'Analyst',
    },
  ],
}

// the real SettingsProvider persists to localStorage, so the saved preference and the
// current tenant survive a story re-run - "Reset example" puts both back to a known state
function PreferredColumnsExample() {
  const settings = useSettings()
  const [tableKey, setTableKey] = useState(0)
  const tenant = settings.currentTenant || 'tenant-a.example'

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button
          onClick={() =>
            settings.handleUpdate({ currentTenant: 'tenant-a.example' })
          }
        >
          Tenant A
        </Button>
        <Button
          onClick={() =>
            settings.handleUpdate({ currentTenant: 'tenant-b.example' })
          }
        >
          Tenant B
        </Button>
        <Button onClick={() => setTableKey((key) => key + 1)}>
          Reload table
        </Button>
        <Button
          onClick={() => {
            settings.handleUpdate({
              currentTenant: 'tenant-a.example',
              columnDefaults: {
                ...settings.columnDefaults,
                [persistenceKey]: {},
              },
            })
            setTableKey((key) => key + 1)
          }}
        >
          Reset example
        </Button>
      </Stack>
      <CippDataTable
        key={tableKey}
        title={`Users - ${tenant}`}
        persistenceKey={persistenceKey}
        api={{
          url: '/api/TestPreferredColumns',
          dataKey: 'Results',
          data: { tenantFilter: tenant },
        }}
        queryKey={`preferred-columns-${tenant}`}
        columns={columns}
        viewMode="table"
        maxHeightOffset="100px"
      />
    </Stack>
  )
}

export default {
  title: 'Components/CippTable/Preferred Columns',
  decorators: [
    (Story) => (
      <SettingsProvider>
        <Story />
      </SettingsProvider>
    ),
  ],
}

export const AcrossTenants = {
  beforeEach({ msw }) {
    msw.use(
      http.get('/api/TestPreferredColumns', ({ request }) => {
        const tenant = new URL(request.url).searchParams.get('tenantFilter')
        return HttpResponse.json({
          Results: tenants[tenant] || [],
          Metadata: {},
        })
      })
    )
  },
  render: () => <PreferredColumnsExample />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const checkbox = (name) =>
      within(body.getByRole('menuitem', { name })).getByRole('checkbox')
    const expectPreferred = async () => {
      await waitFor(() =>
        expect(
          canvas.getByRole('columnheader', { name: /Department/ })
        ).toBeVisible()
      )
      expect(canvas.queryByRole('columnheader', { name: /^Mail/ })).toBeNull()
    }

    await step(
      'save Department shown and Mail hidden on Tenant A',
      async () => {
        await userEvent.click(
          canvas.getByRole('button', { name: 'Reset example' })
        )
        await canvas.findByText('Alice')
        await userEvent.click(canvas.getByRole('button', { name: 'Columns' }))
        await userEvent.click(checkbox('Department'))
        await userEvent.click(checkbox('Mail'))
        await userEvent.click(
          body.getByRole('menuitem', { name: 'Save as preferred columns' })
        )
        await expectPreferred()
      }
    )

    await step(
      'Tenant B keeps the preference although its schema differs',
      async () => {
        await userEvent.click(canvas.getByRole('button', { name: 'Tenant B' }))
        await canvas.findByText('Bob')
        await expectPreferred()
        // the field the preference never saw keeps the page default (hidden for column defs)
        expect(
          canvas.queryByRole('columnheader', { name: /Job Title/ })
        ).toBeNull()
      }
    )

    await step(
      'reset restores the saved choices without revealing the unsaved field',
      async () => {
        await userEvent.click(canvas.getByRole('button', { name: 'Columns' }))
        await userEvent.click(checkbox('Department'))
        await userEvent.click(
          body.getByRole('menuitem', { name: 'Reset to preferred columns' })
        )
        await expectPreferred()
        expect(
          canvas.queryByRole('columnheader', { name: /Job Title/ })
        ).toBeNull()
      }
    )

    await step(
      'a reload and a return to Tenant A both keep the preference',
      async () => {
        await userEvent.click(
          canvas.getByRole('button', { name: 'Reload table' })
        )
        await canvas.findByText('Bob')
        await expectPreferred()
        await userEvent.click(canvas.getByRole('button', { name: 'Tenant A' }))
        await canvas.findByText('Alice')
        await expectPreferred()
      }
    )
  },
}
