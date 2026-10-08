import { describe, expect, it } from 'vitest'
import { withQueue } from '../../../src/components/CippComponents/CippMultiQueueTracker'

// Shapes as Invoke-ListCippQueues returns them: Get-CIPPQueueData entries tagged with QueueId.
const A = '6f1c2b8e-1d2a-4c1e-9f0a-3b2c1d4e5f60'
const B = '0a0b0c0d-0000-4000-8000-000000000001'
const entry = (Status, CompletedTasks, TotalTasks = 4) => ({
  Name: 'Sync',
  RowKey: `Orch-${CompletedTasks}`,
  Status,
  TotalTasks,
  CompletedTasks,
  RunningTasks: 0,
  FailedTasks: Status === 'Completed (with errors)' ? 1 : 0,
})
const listed = (queues, missing = []) => ({
  Queues: queues,
  MissingQueueIds: missing,
  Summary: { TotalQueues: queues.length + missing.length, Status: 'Running' },
})

describe('withQueue', () => {
  it('replaces the pushed queue in place and keeps the set running while another queue is', () => {
    const old = listed([
      { ...entry('Running', 1), QueueId: A },
      { ...entry('Running', 2), QueueId: B },
    ])

    const next = withQueue(old, A.toUpperCase(), entry('Completed', 4))

    expect(next.Queues.map((q) => [q.QueueId, q.Status])).toEqual([
      [A, 'Completed'],
      [B, 'Running'],
    ])
    expect(next.Summary).toMatchObject({
      Status: 'Running',
      TotalTasks: 8,
      CompletedTasks: 6,
      PercentComplete: 75,
    })
  })

  it('finishes the set only when the last queue does, surfacing errors', () => {
    const old = listed([
      { ...entry('Completed', 4), QueueId: A },
      { ...entry('Running', 2), QueueId: B },
    ])

    const next = withQueue(old, B, entry('Completed (with errors)', 4))

    expect(next.Summary).toMatchObject({
      Status: 'Completed (with errors)',
      IsComplete: true,
      FailedTasks: 1,
    })
  })

  it('adds a queue that was missing when the page first asked', () => {
    const old = listed([{ ...entry('Running', 1), QueueId: A }], [B])

    const next = withQueue(old, B, entry('Running', 1))

    expect(next.Queues.map((q) => q.QueueId)).toEqual([A, B])
    expect(next.MissingQueueIds).toEqual([])
    expect(next.Summary.FoundQueues).toBe(2)
  })
})
