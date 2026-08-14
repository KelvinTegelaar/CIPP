import { fn, within, expect, userEvent, waitFor } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import { CippQueueTracker } from '../../../src/components/CippTable/CippQueueTracker'

const queueResponses = {
  'test-queue-running': {
    PartitionKey: 'CippQueue',
    RowKey: 'test-queue-running',
    Name: 'Processing Users',
    Status: 'Running',
    TotalTasks: 10,
    CompletedTasks: 6,
    RunningTasks: 1,
    FailedTasks: 0,
    PercentComplete: 60.0,
    PercentFailed: 0,
    PercentRunning: 10.0,
    Timestamp: '2026-04-08T10:00:00Z',
    Tasks: [
      { Name: 'Process user 1', Status: 'Completed', Timestamp: '2026-04-08T10:00:01Z' },
      { Name: 'Process user 2', Status: 'Completed', Timestamp: '2026-04-08T10:00:02Z' },
      { Name: 'Process user 3', Status: 'Completed', Timestamp: '2026-04-08T10:00:03Z' },
      { Name: 'Process user 4', Status: 'Completed', Timestamp: '2026-04-08T10:00:04Z' },
      { Name: 'Process user 5', Status: 'Completed', Timestamp: '2026-04-08T10:00:05Z' },
      { Name: 'Process user 6', Status: 'Completed', Timestamp: '2026-04-08T10:00:06Z' },
      { Name: 'Process user 7', Status: 'Running', Timestamp: '2026-04-08T10:00:07Z' },
      { Name: 'Process user 8', Status: 'Pending', Timestamp: '2026-04-08T10:00:08Z' },
      { Name: 'Process user 9', Status: 'Pending', Timestamp: '2026-04-08T10:00:09Z' },
      { Name: 'Process user 10', Status: 'Pending', Timestamp: '2026-04-08T10:00:10Z' },
    ],
  },
  'test-queue-done': {
    PartitionKey: 'CippQueue',
    RowKey: 'test-queue-done',
    Name: 'User Processing',
    Status: 'Completed',
    TotalTasks: 5,
    CompletedTasks: 5,
    RunningTasks: 0,
    FailedTasks: 0,
    PercentComplete: 100.0,
    PercentFailed: 0,
    PercentRunning: 0,
    Timestamp: '2026-04-08T10:00:00Z',
    Tasks: [
      { Name: 'Process user 1', Status: 'Completed', Timestamp: '2026-04-08T10:00:01Z' },
      { Name: 'Process user 2', Status: 'Completed', Timestamp: '2026-04-08T10:00:02Z' },
      { Name: 'Process user 3', Status: 'Completed', Timestamp: '2026-04-08T10:00:03Z' },
      { Name: 'Process user 4', Status: 'Completed', Timestamp: '2026-04-08T10:00:04Z' },
      { Name: 'Process user 5', Status: 'Completed', Timestamp: '2026-04-08T10:00:05Z' },
    ],
  },
  'test-queue-failed': {
    PartitionKey: 'CippQueue',
    RowKey: 'test-queue-failed',
    Name: 'Failed Operation',
    Status: 'Failed',
    TotalTasks: 5,
    CompletedTasks: 2,
    RunningTasks: 0,
    FailedTasks: 1,
    PercentComplete: 40.0,
    PercentFailed: 20.0,
    PercentRunning: 0,
    Timestamp: '2026-04-08T10:00:00Z',
    Tasks: [
      { Name: 'Process user 1', Status: 'Completed', Timestamp: '2026-04-08T10:00:01Z' },
      { Name: 'Process user 2', Status: 'Completed', Timestamp: '2026-04-08T10:00:02Z' },
      { Name: 'Process user 3', Status: 'Failed', Timestamp: '2026-04-08T10:00:03Z' },
      { Name: 'Process user 4', Status: 'Pending', Timestamp: '2026-04-08T10:00:04Z' },
      { Name: 'Process user 5', Status: 'Pending', Timestamp: '2026-04-08T10:00:05Z' },
    ],
  },
}

// Single handler that returns different data based on QueueId query param.
// Matches actual Invoke-ListCippQueue response shape.
const queueHandler = http.get('/api/ListCippQueue', ({ request }) => {
  const url = new URL(request.url)
  const queueId = url.searchParams.get('QueueId')
  const data = queueResponses[queueId]
  if (data) {
    return HttpResponse.json([data])
  }
  return HttpResponse.json([])
})

export default {
  title: 'Components/CippTable/CippQueueTracker',
  component: CippQueueTracker,
  tags: ['autodocs'],
  args: {
    onQueueComplete: fn(),
  },
  beforeEach({ msw }) {
    msw.use(queueHandler)
  },
}

// Idle: no queueId, component renders nothing (returns null).
export const Idle = {
  args: {
    queueId: null,
    queryKey: 'storybook-idle',
    title: 'Queue Tracker',
  },
  play: async ({ canvasElement, step }) => {
    await step('no queueId renders nothing', async () => {
      // Component returns null when no queueId, canvas should be empty
      await new Promise((r) => setTimeout(r, 500))
      expect(canvasElement.querySelector('button')).toBeNull()
    })
  },
}

export const InProgress = {
  args: {
    queueId: 'test-queue-running',
    queryKey: 'storybook-running',
    title: 'Processing Users',
  },
  play: async ({ canvasElement, step }) => {
    const root = within(document.body)

    await step('tracker button appears once queue data loads', async () => {
      await waitFor(() => {
        expect(canvasElement.querySelector('button')).not.toBeNull()
      })
      await userEvent.click(canvasElement.querySelector('button'))
    })

    await step('offcanvas shows running progress and the active task', async () => {
      await waitFor(() => {
        expect(root.getByText('Processing Users')).toBeVisible()
      })
      expect(root.getByText(/60\.0%/)).toBeVisible()
      expect(root.getByText('Process user 7')).toBeVisible()
    })
  },
}

export const Completed = {
  args: {
    queueId: 'test-queue-done',
    queryKey: 'storybook-done',
    title: 'User Processing',
  },
  play: async ({ canvasElement, args, step }) => {
    const root = within(document.body)

    await step('open the tracker offcanvas', async () => {
      await waitFor(() => {
        expect(canvasElement.querySelector('button')).not.toBeNull()
      })
      await userEvent.click(canvasElement.querySelector('button'))
    })

    await step('shows 100% and fires onQueueComplete', async () => {
      await waitFor(() => {
        expect(root.getByText('User Processing')).toBeVisible()
      })
      expect(root.getByText(/100\.0%/)).toBeVisible()
      await waitFor(() => {
        expect(args.onQueueComplete).toHaveBeenCalled()
      })
    })
  },
}

export const Failed = {
  args: {
    queueId: 'test-queue-failed',
    queryKey: 'storybook-failed',
    title: 'Failed Operation',
  },
  play: async ({ canvasElement, step }) => {
    const root = within(document.body)

    await step('open the tracker offcanvas', async () => {
      await waitFor(() => {
        expect(canvasElement.querySelector('button')).not.toBeNull()
      })
      await userEvent.click(canvasElement.querySelector('button'))
    })

    await step('shows the failed operation and its failed task', async () => {
      await waitFor(() => {
        expect(root.getByText('Failed Operation')).toBeVisible()
      })
      expect(root.getByText('Process user 3')).toBeVisible()
    })
  },
}
