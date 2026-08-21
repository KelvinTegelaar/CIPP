import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import Page from '../../src/pages/cipp/advanced/container-management/worker-health.js'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../mocks/api-call'
import { ApiGetCallWithPagination } from '../../src/api/ApiCall'
import { resetOverlayHistory } from '../../src/utils/overlay-history'

// stable refs, see GraphExplorerPage.test.jsx (fresh literals per call loop the data-sync effects)
const jobsResult = paginatedResult([
  { Id: 'j1', Name: 'Job One', RunName: 'run-a', Priority: 1, Status: 'Queued', QueuedUtc: '2026-07-30T10:00:00Z', WaitSeconds: 5, DurationSeconds: 0 },
  { Id: 'j2', Name: 'Job Two', RunName: 'run-a', Priority: 1, Status: 'Queued', QueuedUtc: '2026-07-30T10:01:00Z', WaitSeconds: 3, DurationSeconds: 0 },
  { Id: 'j3', Name: 'Job Three', RunName: 'run-b', Priority: 2, Status: 'Running', QueuedUtc: '2026-07-30T10:02:00Z', WaitSeconds: 1, DurationSeconds: 4 },
  { Id: 'j4', Name: 'Job Four', RunName: 'run-b', Priority: 2, Status: 'Completed', QueuedUtc: '2026-07-30T10:03:00Z', WaitSeconds: 1, DurationSeconds: 9 },
  { Id: 'j5', Name: 'Job Five', RunName: 'run-c', Priority: 3, Status: 'Completed', QueuedUtc: '2026-07-30T10:04:00Z', WaitSeconds: 2, DurationSeconds: 7 },
])

const emptyGetResult = getResult({ isSuccess: false })

api.get = emptyGetResult
api.post = postResult()
api.paginated = jobsResult

describe('Worker Health page - job queue preset filters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the job queue with all rows', async () => {
    renderWithProviders(<Page />)
    expect(await screen.findByText('Job Queue')).toBeInTheDocument()
    expect(await screen.findByText('1-5 of 5')).toBeInTheDocument()
  })

  // status filters server-side (before Limit truncates), a client-side filter
  // would only ever see the oldest N jobs. pin the param contract, not row counts
  it('status toggle requests server-side filtering via the Status param', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await screen.findByText('1-5 of 5')

    await user.click(screen.getByRole('button', { name: 'Queued' }))

    await waitFor(() => {
      const last = ApiGetCallWithPagination.mock.calls.at(-1)[0]
      expect(last.queryKey).toBe('WorkerHealthJobs-2000-Queued')
      expect(last.data).toMatchObject({ Action: 'Jobs', Limit: '2000', Status: 'Queued' })
    })
  })

  // Craft marks stale queue entries (task gone by dispatch time) as Skipped — same
  // server-side filter contract as every other status.
  it('Skipped toggle requests server-side filtering via the Status param', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await screen.findByText('1-5 of 5')

    await user.click(screen.getByRole('button', { name: 'Skipped' }))

    await waitFor(() => {
      const last = ApiGetCallWithPagination.mock.calls.at(-1)[0]
      expect(last.queryKey).toBe('WorkerHealthJobs-2000-Skipped')
      expect(last.data).toMatchObject({ Action: 'Jobs', Limit: '2000', Status: 'Skipped' })
    })
  })

  // jsdom has no layout engine, so MRT's virtualized table renders no cells — drive the
  // card view instead, where tapping a card opens the off-canvas (see CippDataTable.test.jsx).
  it('opening a job card shows the off-canvas detail fields', async () => {
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
    try {
      const user = userEvent.setup()
      renderWithProviders(<Page />)

      await waitFor(() => expect(screen.getByText('Job Five')).toBeInTheDocument())
      await user.click(screen.getByText('Job Five'))

      // Drawer title is the job name; scope assertions to the drawer since the card
      // behind it renders some of the same text.
      const drawer = await waitFor(() => {
        const d = screen
          .getAllByText('Job Five')
          .map((el) => el.closest('.MuiDrawer-paper'))
          .find(Boolean)
        expect(d).toBeTruthy()
        return d
      })
      // Started Utc is not a table column, and the Id value is hidden from the table.
      // Job Five never started, so its StartedUtc renders as N/A.
      expect(within(drawer).getByText('Started Utc')).toBeInTheDocument()
      expect(within(drawer).getByText('j5')).toBeInTheDocument()
    } finally {
      resetOverlayHistory()
      delete window.matchMedia
    }
  }, 30000) // card list mount + drawer transition; default 5000ms testTimeout flakes under load (see GraphExplorerPage)

  it('All toggle drops the Status param instead of sending an empty string', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await screen.findByText('1-5 of 5')

    await user.click(screen.getByRole('button', { name: 'Queued' }))
    await waitFor(() => {
      expect(ApiGetCallWithPagination.mock.calls.at(-1)[0].data.Status).toBe('Queued')
    })

    await user.click(screen.getByRole('button', { name: 'All' }))
    await waitFor(() => {
      const last = ApiGetCallWithPagination.mock.calls.at(-1)[0]
      expect(last.queryKey).toBe('WorkerHealthJobs-2000-')
      expect(last.data.Status).toBeUndefined()
    })
  })
})
