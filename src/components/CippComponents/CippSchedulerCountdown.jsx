import { useSyncExternalStore } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { Avatar, Box, Card, Chip, Divider, Skeleton, Typography } from '@mui/material'
import { ApiGetCallWithPagination } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'
import { parseCippDate } from '../../utils/parse-cipp-date'

// Scheduled tasks are picked up by Start-UserTasksOrchestrator, which runs on the fixed cron
// `0 */15 * * * *` (backend/Config/CIPPTimers.json). Every IANA UTC offset is a whole multiple of
// 15 minutes, so those boundaries fall on the same instants in the browser's local clock as in
// whatever timezone the backend schedules in - the next run can be derived locally.
export const SCHEDULER_INTERVAL_MINUTES = 15

// The states the orchestrator treats as awaiting a run. Its filter also recovers stuck tasks
// (Pending > 1h, Running/Processing > 4h), which are deliberately not counted here: that is a
// self-heal path, and counting them would make a stuck job look like upcoming work.
const PLANNED_STATES = ['Planned', 'Failed - Planned']

// Already claimed by an orchestrator rather than waiting for one: Pending is "picked up, queuing
// commands", Running and Processing are executing. These are reported separately because they are
// not what the next run will pick up, but a task visibly sitting in one of them alongside a bare
// "no tasks due" reads as though nothing is happening.
const IN_FLIGHT_STATES = ['Pending', 'Running', 'Processing']

/** The next quarter-hour boundary strictly after `now`, with seconds and milliseconds zeroed. */
export const getNextSchedulerRun = (now = new Date()) => {
  const nextRun = new Date(now)
  nextRun.setSeconds(0, 0)
  // setMinutes(60) rolls into the next hour on its own, so hour, day and DST boundaries are all
  // handled by Date rather than by arithmetic here.
  nextRun.setMinutes(
    (Math.floor(now.getMinutes() / SCHEDULER_INTERVAL_MINUTES) + 1) * SCHEDULER_INTERVAL_MINUTES
  )
  return nextRun
}

/** Milliseconds as `m:ss`, floored at 0:00 so a passed boundary never renders as negative. */
export const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// A row with no usable scheduled time is not counted. The guard is load-bearing: `new Date(null)`
// is the epoch rather than an Invalid Date, so without it a row missing ScheduledTime would parse
// to 1970 and always look due.
const isDueBy = (scheduledTime, nextRun) => {
  if (scheduledTime === null || scheduledTime === undefined) return false
  const scheduled = parseCippDate(scheduledTime)
  return !Number.isNaN(scheduled.getTime()) && scheduled <= nextRun
}

/**
 * How many of `rows` the run at `nextRun` will pick up: enabled, awaiting a run, and due by then.
 *
 * `Disabled` is absent on every task created before the flag existed, so this tests for an
 * explicit true rather than for falsiness, matching the orchestrator's own client-side filter.
 */
export const countDueTasks = (rows, nextRun) =>
  rows.filter(
    (row) =>
      row?.Disabled !== true &&
      PLANNED_STATES.includes(row?.TaskState) &&
      isDueBy(row?.ScheduledTime, nextRun)
  ).length

/** Chip text for a due-task count. */
export const formatDueLabel = (count) => {
  if (count === 0) return 'No tasks due'
  return count === 1 ? '1 task due' : `${count} tasks due`
}

/**
 * How many of `rows` an orchestrator is already working on.
 *
 * Unlike the due count this does not exclude disabled tasks: disabling one mid-run does not stop
 * the run, and this reports observed state rather than eligibility for the next one.
 */
export const countInFlightTasks = (rows) =>
  rows.filter((row) => IN_FLIGHT_STATES.includes(row?.TaskState)).length

/** Chip text for an in-flight count. */
export const formatInFlightLabel = (count) =>
  count === 1 ? '1 in progress' : `${count} in progress`

// Hidden below sm, where the row wraps and a rule between wrapped lines reads as noise.
const VerticalRule = () => (
  <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
)

// The wall clock is external state, so it is read through useSyncExternalStore rather than an
// effect. That also gives correct SSR behaviour for the static export: the server snapshot is null
// so nothing renders, and React reads the real time after hydration instead of mismatching.
const subscribeToClock = (listener) => {
  const interval = setInterval(listener, 1000)
  return () => clearInterval(interval)
}

// Whole seconds, so the snapshot is referentially stable between ticks - returning a fresh Date
// would re-render forever. Reading the clock per tick rather than decrementing also means
// background-tab timer throttling corrects itself on refocus instead of accumulating drift.
const getClockSnapshot = () => Math.floor(Date.now() / 1000)
const getServerClockSnapshot = () => null

/**
 * Live countdown to the next scheduler pass, for the CippTablePage `tableFilter` slot on the
 * Scheduled Tasks page.
 *
 * Scheduled Time renders as relative time, so a task whose time has passed reads "3 minutes ago"
 * while its state is still Planned - which looks overdue when it is only waiting for the next
 * 15-minute pass. This says when that pass is due, and how much work it will pick up.
 *
 * Styled as a metric tile rather than an alert: it is standing information about the page, not a
 * notice to act on. Follows the dashboard card idiom - avatar icon, caption label, prominent value.
 *
 * @param {string} apiUrl   - The table's apiUrl, verbatim.
 * @param {string} queryKey - The table's queryKey, verbatim. Matching both subscribes to the same
 *                            React Query cache entry the table already populates, so the count
 *                            costs no extra request. It also scopes the count to the rows on
 *                            screen, so it tracks the Show System Jobs toggle.
 */
export const CippSchedulerCountdown = ({ apiUrl, queryKey }) => {
  const clock = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot)
  const tenant = useSettings().currentTenant
  const tasks = ApiGetCallWithPagination({
    url: apiUrl,
    data: { tenantFilter: tenant },
    queryKey,
    waiting: Boolean(apiUrl && queryKey),
  })

  if (clock === null) return null

  const now = new Date(clock * 1000)
  const nextRun = getNextSchedulerRun(now)

  // Held at the last successful result through a background refetch: dropping to the skeleton on
  // every poll would flicker a number that has almost certainly not changed.
  const rows = tasks.isSuccess
    ? (tasks.data?.pages ?? []).flatMap((page) => (Array.isArray(page) ? page : []))
    : null
  const dueCount = rows === null ? null : countDueTasks(rows, nextRun)
  const inFlightCount = rows === null ? 0 : countInFlightTasks(rows)

  return (
    // A group rather than a live region: an aria-live element would announce the countdown once a
    // second. The text is ambient, and is read normally when navigated to.
    <Card role="group" aria-label="Next scheduler run">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          p: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap',
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: { xs: 34, md: 38 },
            height: { xs: 34, md: 38 },
            flexShrink: 0,
          }}
        >
          <CippIcons.AccessTime sx={{ fontSize: { xs: 20, md: 22 }, color: 'inherit' }} />
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" noWrap sx={{
            color: "text.secondary"
          }}>
            Next scheduler run
          </Typography>
          {/* The countdown is the point of the tile; the due time is a qualifier on it, so it
              rides on the same baseline at body size rather than as a second peer metric. */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="h5"
              sx={{
                lineHeight: 1.2,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCountdown(nextRun - now)}
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{
                color: "text.secondary",
                fontVariantNumeric: 'tabular-nums'
              }}>
              due at {nextRun.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </Box>

        <VerticalRule />

        {/* Sits in the outer row rather than on the value line: a chip has no text baseline to
            share with the countdown, so it centres against the tile instead. */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {dueCount === null ? (
            <Skeleton variant="rounded" width={86} height={24} />
          ) : (
            <Chip
              size="small"
              variant="outlined"
              color={dueCount > 0 ? 'primary' : 'default'}
              label={formatDueLabel(dueCount)}
            />
          )}
          {/* Only when there is something to report - a permanent "0 in progress" is noise. */}
          {inFlightCount > 0 && (
            <Chip
              size="small"
              variant="outlined"
              color="info"
              label={formatInFlightLabel(inFlightCount)}
            />
          )}
        </Box>

        <VerticalRule />

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            flex: '1 1 260px',
            minWidth: 0
          }}>
          Scheduled tasks are picked up every {SCHEDULER_INTERVAL_MINUTES} minutes. A task whose
          scheduled time has passed stays Planned until the next run.
        </Typography>
      </Box>
    </Card>
  );
}

export default CippSchedulerCountdown
