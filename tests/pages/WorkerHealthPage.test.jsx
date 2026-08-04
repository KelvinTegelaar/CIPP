import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import Page from '../../src/pages/cipp/advanced/container-management/worker-health.js'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../mocks/api-call'
import { ApiGetCallWithPagination } from '../../src/api/ApiCall'

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
