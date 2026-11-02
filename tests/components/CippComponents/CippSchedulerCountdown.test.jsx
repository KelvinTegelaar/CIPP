import React from 'react'
import { act, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderWithTheme } from '../../test-utils'
import {
  CippSchedulerCountdown,
  countDueTasks,
  countInFlightTasks,
  formatCountdown,
  formatDueLabel,
  formatInFlightLabel,
  getNextSchedulerRun,
} from '../../../src/components/CippComponents/CippSchedulerCountdown'

// The component subscribes to the table's React Query cache entry. Standing in for that hook keeps
// these tests off the network and lets each one state exactly what the table has loaded.
const apiMock = vi.hoisted(() => ({ result: { isSuccess: false, data: undefined } }))
vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCallWithPagination: () => apiMock.result,
}))

// Local-time constructor, so the quarter-hour maths is exercised in whatever timezone the
// test runner happens to be in.
const at = (hours, minutes, seconds, ms = 0) => new Date(2026, 0, 15, hours, minutes, seconds, ms)

const plannedAt = (date) => ({ TaskState: 'Planned', ScheduledTime: date.toISOString() })

// Rows reach the component as pages of the paginated query.
const loaded = (rows) => ({ isSuccess: true, data: { pages: [rows] } })

beforeEach(() => {
  apiMock.result = { isSuccess: false, data: undefined }
})

describe('getNextSchedulerRun', () => {
  it.each([
    ['on the boundary, moves to the next one', at(14, 15, 0), at(14, 30, 0)],
    ['just before a boundary', at(14, 14, 59), at(14, 15, 0)],
    ['start of an hour', at(14, 0, 0), at(14, 15, 0)],
    ['rolls over the hour', at(14, 59, 30), at(15, 0, 0)],
  ])('%s', (_label, now, expected) => {
    expect(getNextSchedulerRun(now).getTime()).toBe(expected.getTime())
  })

  it('rolls over midnight', () => {
    const nextRun = getNextSchedulerRun(at(23, 59, 30))
    expect(nextRun.getTime()).toBe(new Date(2026, 0, 16, 0, 0, 0).getTime())
  })

  it('zeroes seconds and milliseconds', () => {
    const nextRun = getNextSchedulerRun(at(14, 3, 47, 512))
    expect(nextRun.getSeconds()).toBe(0)
    expect(nextRun.getMilliseconds()).toBe(0)
  })

  it('does not mutate the date it is given', () => {
    const now = at(14, 3, 47)
    getNextSchedulerRun(now)
    expect(now.getTime()).toBe(at(14, 3, 47).getTime())
  })
})

describe('formatCountdown', () => {
  it('pads seconds to two digits', () => {
    expect(formatCountdown(5000)).toBe('0:05')
    expect(formatCountdown(272000)).toBe('4:32')
  })

  it('floors a passed boundary at zero', () => {
    expect(formatCountdown(-1000)).toBe('0:00')
    expect(formatCountdown(0)).toBe('0:00')
  })
})

describe('countDueTasks', () => {
  const nextRun = at(14, 15, 0)

  it('counts planned tasks whose time falls before the run', () => {
    expect(countDueTasks([plannedAt(at(14, 0, 0)), plannedAt(at(13, 0, 0))], nextRun)).toBe(2)
  })

  it('counts a task scheduled exactly on the boundary', () => {
    expect(countDueTasks([plannedAt(at(14, 15, 0))], nextRun)).toBe(1)
  })

  it('skips a task scheduled after the run', () => {
    expect(countDueTasks([plannedAt(at(14, 20, 0))], nextRun)).toBe(0)
  })

  it('counts Failed - Planned, which the orchestrator also picks up', () => {
    const row = { ...plannedAt(at(14, 0, 0)), TaskState: 'Failed - Planned' }
    expect(countDueTasks([row], nextRun)).toBe(1)
  })

  it.each(['Completed', 'Failed', 'Running', 'Pending', 'Processing'])(
    'skips %s tasks',
    (TaskState) => {
      expect(countDueTasks([{ ...plannedAt(at(14, 0, 0)), TaskState }], nextRun)).toBe(0)
    }
  )

  it('skips explicitly disabled tasks only', () => {
    const due = plannedAt(at(14, 0, 0))
    expect(countDueTasks([{ ...due, Disabled: true }], nextRun)).toBe(0)
    // Disabled is absent on every task predating the flag, so only an explicit true excludes.
    expect(countDueTasks([{ ...due, Disabled: false }, due], nextRun)).toBe(2)
  })

  it('accepts a scheduled time stored as epoch seconds', () => {
    const epoch = String(Math.floor(at(14, 0, 0).getTime() / 1000))
    expect(countDueTasks([{ TaskState: 'Planned', ScheduledTime: epoch }], nextRun)).toBe(1)
  })

  it('skips rows with an unusable scheduled time', () => {
    const rows = [
      { TaskState: 'Planned' },
      { TaskState: 'Planned', ScheduledTime: 'not a date' },
      { TaskState: 'Planned', ScheduledTime: null },
    ]
    expect(countDueTasks(rows, nextRun)).toBe(0)
  })
})

describe('formatDueLabel', () => {
  it('reads naturally at each count', () => {
    expect(formatDueLabel(0)).toBe('No tasks due')
    expect(formatDueLabel(1)).toBe('1 task due')
    expect(formatDueLabel(4)).toBe('4 tasks due')
  })
})

describe('countInFlightTasks', () => {
  it.each(['Pending', 'Running', 'Processing'])('counts %s tasks', (TaskState) => {
    expect(countInFlightTasks([{ TaskState }])).toBe(1)
  })

  it.each(['Planned', 'Failed - Planned', 'Completed', 'Failed'])(
    'does not count %s tasks',
    (TaskState) => {
      expect(countInFlightTasks([{ TaskState }])).toBe(0)
    }
  )

  it('counts a task disabled mid-run, since disabling does not stop it', () => {
    expect(countInFlightTasks([{ TaskState: 'Running', Disabled: true }])).toBe(1)
  })

  it('does not double-count against the due total', () => {
    // A claimed task leaves Planned, so the two counts never see the same row.
    const rows = [plannedAt(at(14, 0, 0)), { TaskState: 'Pending' }]
    expect(countDueTasks(rows, at(14, 15, 0))).toBe(1)
    expect(countInFlightTasks(rows)).toBe(1)
  })
})

describe('formatInFlightLabel', () => {
  it('reads naturally at each count', () => {
    expect(formatInFlightLabel(1)).toBe('1 in progress')
    expect(formatInFlightLabel(3)).toBe('3 in progress')
  })
})

describe('CippSchedulerCountdown', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const renderAt = (now) => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    return renderWithTheme(
      <CippSchedulerCountdown apiUrl="/api/ListScheduledItems" queryKey="ListScheduledItems-test" />
    )
  }

  it('renders nothing on the server, so hydration cannot mismatch', () => {
    expect(renderToStaticMarkup(<CippSchedulerCountdown />)).toBe('')
  })

  it('counts down to the next quarter hour', () => {
    renderAt(at(14, 10, 28))

    expect(screen.getByText('4:32')).toBeInTheDocument()
    // Locale-agnostic: built with the same call the component makes.
    const expectedTime = at(14, 15, 0).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
    expect(screen.getByRole('group', { name: /next scheduler run/i })).toHaveTextContent(
      expectedTime
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('4:31')).toBeInTheDocument()
  })

  it('rolls to the following run once the boundary passes', () => {
    renderAt(at(14, 14, 59))
    expect(screen.getByText('0:01')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('is not a live region, so it is not announced on every tick', () => {
    renderAt(at(14, 10, 28))
    expect(screen.getByRole('group', { name: /next scheduler run/i })).not.toHaveAttribute(
      'aria-live'
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('reports how many of the loaded tasks the next run will pick up', () => {
    apiMock.result = loaded([
      plannedAt(at(14, 0, 0)),
      plannedAt(at(14, 20, 0)), // after the run
      { ...plannedAt(at(14, 0, 0)), TaskState: 'Completed' },
    ])
    renderAt(at(14, 10, 28))

    expect(screen.getByText('1 task due')).toBeInTheDocument()
  })

  it('says so when the next run has nothing to do', () => {
    apiMock.result = loaded([])
    renderAt(at(14, 10, 28))

    expect(screen.getByText('No tasks due')).toBeInTheDocument()
    expect(screen.queryByText(/in progress/)).not.toBeInTheDocument()
  })

  // The case that prompted this: a task already claimed by an off-cycle run sits in Pending, so
  // nothing is due for the next run, but the row on screen is plainly not idle.
  it('reports a claimed task as in progress rather than as nothing at all', () => {
    apiMock.result = loaded([{ TaskState: 'Pending', ScheduledTime: at(14, 9, 41).toISOString() }])
    renderAt(at(14, 10, 28))

    expect(screen.getByText('No tasks due')).toBeInTheDocument()
    expect(screen.getByText('1 in progress')).toBeInTheDocument()
  })

  it('shows both counts when work is queued and running at once', () => {
    apiMock.result = loaded([
      plannedAt(at(14, 0, 0)),
      plannedAt(at(14, 1, 0)),
      { TaskState: 'Running' },
    ])
    renderAt(at(14, 10, 28))

    expect(screen.getByText('2 tasks due')).toBeInTheDocument()
    expect(screen.getByText('1 in progress')).toBeInTheDocument()
  })

  it('shows no count until the table has loaded', () => {
    renderAt(at(14, 10, 28))

    expect(screen.getByText('4:32')).toBeInTheDocument()
    expect(screen.queryByText(/due$/)).not.toBeInTheDocument()
  })
})
