import { describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'

// The results panel follows the async job: a pushed frame replaces the row, and the finished
// job's Logs carry the rule verdicts it renders.
let pushFrame = null
let initialRows = []
const refetch = vi.fn()

vi.mock('../../../src/api/ApiCall', () => ({
  // Only the job read answers; the table's own preset lookups get an idle result.
  ApiGetCall: ({ url }) =>
    `${url}`.includes('ListAsyncDeployment')
      ? { data: initialRows, isFetching: false, isSuccess: true, refetch }
      : {
          data: undefined,
          isFetching: false,
          isSuccess: false,
          refetch: () => {},
        },
  ApiGetCallWithPagination: () => ({
    data: undefined,
    isFetching: false,
    isSuccess: false,
  }),
  ApiPostCall: () => ({ mutate: () => {}, isPending: false, reset: () => {} }),
}))
vi.mock('../../../src/hooks/use-craft-events', () => ({
  mergeRow: (rows, row) => [row],
  useCraftJobEvents: (jobId, onEvent) => {
    pushFrame = onEvent
    return true
  },
}))

import { CippTestMessageResults } from '../../../src/components/CippComponents/CippTestMessageResults'

const running = {
  Name: 'b@contoso.example',
  Status: 'running',
  Steps: [
    { title: 'Submit the test message', status: 'succeeded' },
    {
      title: 'Locate it in the message trace',
      status: 'running',
      message: 'Waiting for the trace',
    },
    { title: 'Evaluate the mail flow rules', status: 'pending' },
  ],
  Logs: '',
}
const done = {
  ...running,
  Status: 'succeeded',
  Steps: running.Steps.map((s) => ({ ...s, status: 'succeeded' })),
  Logs: JSON.stringify({
    Trace: { MessageTraceId: 't1', Status: 'failed' },
    Events: [
      {
        Date: 'x',
        Event: 'Transport rule',
        Detail: "Transport rule: 'Block external', ID: ('A')",
        Action: 'Reject',
      },
    ],
    Rules: [
      {
        Priority: 0,
        Name: 'Block external',
        Result: 'Applied',
        Actions: 'Reject',
      },
      { Priority: 1, Name: 'Tag internal', Result: 'Not applied', Actions: '' },
      { Priority: 2, Name: 'Old rule', Result: 'Disabled', Actions: '' },
    ],
  }),
}

describe('CippTestMessageResults', () => {
  it('shows the running step, then the verdict once the pushed row finishes', async () => {
    initialRows = [running]
    renderWithProviders(<CippTestMessageResults jobId="job-1" />)
    expect(screen.getByText('Waiting for the trace')).toBeInTheDocument()
    await act(async () => {
      pushFrame({ jobId: 'job-1', data: done })
    })
    expect(screen.getByText(/1 of 2 enabled rules applied/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Raw trace' })
    ).toBeInTheDocument()
  })

  it('re-reads the job on a frame without data', async () => {
    initialRows = [running]
    renderWithProviders(<CippTestMessageResults jobId="job-2" />)
    await act(async () => {
      pushFrame({ jobId: 'job-2', mode: 'resync' })
    })
    expect(refetch).toHaveBeenCalled()
  })

  it('surfaces a failed job', () => {
    initialRows = [
      {
        ...running,
        Status: 'failed',
        Steps: [
          running.Steps[0],
          { ...running.Steps[1], status: 'failed', message: 'did not appear' },
        ],
      },
    ]
    renderWithProviders(<CippTestMessageResults jobId="job-3" />)
    expect(screen.getByText('did not appear')).toBeInTheDocument()
  })
})
