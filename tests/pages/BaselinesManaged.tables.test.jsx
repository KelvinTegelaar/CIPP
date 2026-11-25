import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
// Table cells do not render under jsdom, so the table is captured instead: what the page
// hands it is what the user gets.
let table
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: (props) => {
    table = props
    return (
      <div>
        {props.title}
        {props.cardButton}
      </div>
    )
  },
}))
vi.mock(
  '../../src/components/CippBaselines/CippManagedBaselineRecommendations',
  () => ({
    CippManagedBaselineRecommendations: () => <div>recommendations view</div>,
  })
)
import { api, getResult } from '../mocks/api-call'
import { ApiGetCall } from '../../src/api/ApiCall'

import Page from '../../src/pages/tenant/baselines/managed/index.jsx'

const extensionOn = getResult({
  data: { CyberDrainManagedBaselines: { Enabled: true } },
})
const templatesResult = getResult({
  data: {
    Results: [
      { id: 'one', name: 'Identity Essentials', imported: false, status: [] },
      {
        id: 'two',
        name: 'Email Protection',
        imported: true,
        baselineGuid: 'baseline-2',
        status: ['Imported', 'Update available'],
      },
    ],
  },
})
const requestsResult = getResult({
  data: {
    Results: [{ requestId: 'request-9', tenantFilter: 'contoso.com' }],
  },
})
const failedResult = getResult({
  isSuccess: false,
  isError: true,
  error: {
    response: {
      data: { Results: 'CyberDrain rejected the API key. Check the key.' },
    },
  },
})

const route =
  (overrides = {}) =>
  (opts) => {
    if (opts?.url === '/api/ListExtensionsConfig') return extensionOn
    if (opts?.url === '/api/ListManagedBaselineTemplates')
      return overrides.templates ?? templatesResult
    if (opts?.url === '/api/ListManagedBaselineRequests')
      return overrides.requests ?? requestsResult
    return getResult({ isSuccess: false })
  }

const lastCall = (url) =>
  ApiGetCall.mock.calls
    .map(([opts]) => opts)
    .filter((opts) => opts?.url === url)
    .at(-1)

const action = (label) => table.actions.find((entry) => entry.label === label)

describe('Managed Baselines tab - tables', () => {
  beforeEach(() => {
    router.query = {}
    router.isReady = true
    table = undefined
    api.get = route()
  })

  it('opens on the published baselines and only asks for the list it shows', () => {
    renderWithProviders(<Page />)

    expect(table.title).toBe('Managed Baseline Templates')
    expect(table.data).toHaveLength(2)
    expect(lastCall('/api/ListManagedBaselineTemplates').waiting).toBe(true)
    expect(lastCall('/api/ListManagedBaselineRequests').waiting).toBe(false)
  })

  it('offers Add for a baseline that is not added yet and Edit for one that is', () => {
    renderWithProviders(<Page />)
    const [fresh, added] = table.data

    expect(action('Add to My Baselines').condition(fresh)).toBe(true)
    expect(action('Add to My Baselines').condition(added)).toBe(false)
    expect(action('Add to My Baselines').data).toEqual({
      Action: '!Import',
      id: 'id',
    })
    expect(action('Edit Baseline').condition(added)).toBe(true)
    expect(action('Edit Baseline').condition(fresh)).toBe(false)
    expect(action('Edit Baseline').link).toBe(
      '/tenant/baselines/template?id=[baselineGuid]'
    )
  })

  it('switches to the custom requests and offers each action only when it applies', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    await user.click(screen.getByText('Custom Managed Baseline'))

    expect(table.title).toBe('Custom Managed Baselines')
    expect(table.data).toHaveLength(1)
    expect(lastCall('/api/ListManagedBaselineRequests').waiting).toBe(true)

    const ready = { ready: true, status: ['Completed - ready to confirm'] }
    const failed = { ready: false, status: ['Failed'] }
    const implemented = { ready: false, status: ['Implemented'] }
    expect(action('Review and Confirm').condition(ready)).toBe(true)
    expect(action('Review and Confirm').condition(failed)).toBe(false)
    expect(action('Review and Confirm').link).toBe(
      '/tenant/baselines/template?managedRequest=[requestId]'
    )
    expect(action('Retry').condition(failed)).toBe(true)
    expect(action('Retry').condition(ready)).toBe(false)
    expect(action('Cancel Request').condition(ready)).toBe(true)
    expect(action('Cancel Request').condition(implemented)).toBe(false)
    expect(
      screen.getByRole('button', { name: 'Request Custom Baseline' })
    ).toBeInTheDocument()
  })

  it('opens the custom requests straight away from a link that asks for them', () => {
    router.query = { view: 'custom' }
    renderWithProviders(<Page />)

    expect(table.title).toBe('Custom Managed Baselines')
  })

  it('shows why a list failed, with a way to the integration', () => {
    api.get = route({ templates: failedResult })
    renderWithProviders(<Page />)

    expect(
      screen.getByText('CyberDrain rejected the API key. Check the key.')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open Integration' })
    ).toHaveAttribute(
      'href',
      '/cipp/integrations/configure?id=CyberDrainManagedBaselines'
    )
  })

  it('shows the recommendations from the third card, without asking for the other lists', async () => {
    renderWithProviders(<Page />)

    await userEvent.click(screen.getByText('Recommendations'))

    expect(screen.getByText('recommendations view')).toBeInTheDocument()
    expect(lastCall('/api/ListManagedBaselineTemplates').waiting).toBe(false)
    expect(lastCall('/api/ListManagedBaselineRequests').waiting).toBe(false)
  })
})
