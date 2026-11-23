import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { renderWithProviders, settingsWith } from '../test-utils'
import router from '../mocks/next-router'

// Real ApiCall, builder and query cache: the edit page's lookups and the builder's pickers read the
// same lists, and only a shared cache shows a clash between their query keys.
vi.mock('../../src/components/CippFormPages/CippFormPage', () => ({
  default: ({ children }) => <>{children}</>,
}))

import EditCAPolicy from '../../src/pages/tenant/conditional/list-policies/edit.jsx'

const TENANT = 'contoso.onmicrosoft.com'
const LOCATION = '11111111-1111-1111-1111-111111111111'
const ROLE = '33333333-3333-3333-3333-333333333333'

const policy = {
  id: 'policy-1',
  displayName: 'CA100',
  state: 'disabled',
  conditions: {
    clientAppTypes: ['all'],
    users: { includeUsers: ['All'], excludeRoles: [ROLE] },
    applications: { includeApplications: ['All'] },
    locations: { includeLocations: ['All'], excludeLocations: [LOCATION] },
  },
}

const server = setupServer(
  http.get('*/api/ListConditionalAccessPolicies', () =>
    HttpResponse.json({
      Results: [{ id: 'policy-1', rawjson: JSON.stringify(policy) }],
    })
  ),
  http.get('*/api/ListNamedLocations', () =>
    HttpResponse.json([
      { id: LOCATION, displayName: 'CT-CA-Anthropic' },
      {
        id: '55555555-5555-5555-5555-555555555555',
        displayName: 'Head Office',
      },
    ])
  ),
  http.get('*/api/ListGraphRequest', ({ request }) => {
    const endpoint = new URL(request.url).searchParams.get('Endpoint')
    const rows =
      endpoint === 'roleManagement/directory/roleDefinitions'
        ? [
            { templateId: ROLE, displayName: 'Custom Helpdesk' },
            {
              templateId: '62e90394-69f5-4237-9190-012177145e10',
              displayName: 'Global Administrator',
            },
          ]
        : []
    return HttpResponse.json({ Results: rows, Metadata: {} })
  }),
  http.get('*/api/*', () => HttpResponse.json([]))
)

const listboxFor = async (name) => {
  await userEvent.click(await screen.findByRole('combobox', { name }))
  return screen.findByRole('listbox')
}

describe('Edit CA policy page with its pickers', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('shows stored IDs by name and still lists the tenant in the location and role pickers', async () => {
    router.query = { id: 'policy-1' }
    renderWithProviders(<EditCAPolicy />, {
      settings: settingsWith({ currentTenant: TENANT }),
    })

    expect(
      await screen.findByText('CT-CA-Anthropic', {}, { timeout: 10000 })
    ).toBeInTheDocument()
    expect(screen.getByText('Custom Helpdesk')).toBeInTheDocument()

    await waitFor(async () =>
      expect(
        within(await listboxFor('Exclude Locations')).getByText('Head Office')
      ).toBeInTheDocument()
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(async () =>
      expect(
        within(await listboxFor('Exclude Directory Roles')).getByText(
          'Global Administrator'
        )
      ).toBeInTheDocument()
    )
  }, 30000)
})
