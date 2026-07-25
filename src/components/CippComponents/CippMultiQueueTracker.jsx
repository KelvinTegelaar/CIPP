import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Circle, Timeline } from '@mui/icons-material'
import { useQueryClient } from '@tanstack/react-query'
import { CippOffCanvas } from './CippOffCanvas'
import { ApiGetCall } from '../../api/ApiCall'

// Terminal states, i.e. nothing more will happen to this queue.
const isFinished = (status) =>
  ['Completed', 'Failed', 'Completed (with errors)', 'Not found'].includes(status)

const statusColour = (status) => {
  if (status === 'Completed') return 'success.main'
  if (status === 'Completed (with errors)') return 'warning.main'
  if (status === 'Failed') return 'error.main'
  return 'warning.main'
}

/**
 * Progress indicator for an action that starts several background queues at once, such as a
 * report sync that refreshes more than one cache. CippQueueTracker covers the single-queue case
 * where the id arrives on the table's own list response; this one takes the ids the action
 * returned and rolls them up through ListCippQueues.
 *
 * Polling stops as soon as every queue reaches a terminal state, and the supplied query keys are
 * invalidated once, so the page showing the data refreshes itself rather than leaving the admin
 * looking at pre-sync numbers.
 */
export const CippMultiQueueTracker = ({ queueIds = [], relatedQueryKeys = [], label = 'Sync' }) => {
  const queryClient = useQueryClient()
  const [canvasVisible, setCanvasVisible] = useState(false)
  const [hasInvalidated, setHasInvalidated] = useState(false)

  const ids = Array.isArray(queueIds) ? queueIds.filter(Boolean) : []
  const idKey = ids.join(',')

  const polling = ApiGetCall({
    url: '/api/ListCippQueues',
    data: { QueueIds: idKey },
    queryKey: `CippQueues-${idKey || 'none'}`,
    waiting: ids.length > 0,
    refetchInterval: (data) => (isFinished(data?.Summary?.Status) ? false : 3000),
    refetchOnWindowFocus: false,
    staleTime: 0,
  })

  const summary = polling.data?.Summary
  const queues = polling.data?.Queues ?? []
  const finished = isFinished(summary?.Status)

  // Refresh the data the sync was run for, once, when everything has finished.
  useEffect(() => {
    if (!finished || hasInvalidated || ids.length === 0) return
    relatedQueryKeys.filter(Boolean).forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] })
    })
    setHasInvalidated(true)
  }, [finished, hasInvalidated, ids.length, relatedQueryKeys, queryClient])

  // A new set of queues means a new run: allow the refresh to fire again.
  useEffect(() => {
    setHasInvalidated(false)
  }, [idKey])

  if (ids.length === 0) return null

  const percent = summary?.PercentComplete ?? 0
  const tooltip = finished
    ? `${label} ${summary?.Status?.toLowerCase() ?? 'finished'} — ${summary?.CompletedTasks ?? 0}/${summary?.TotalTasks ?? 0} tasks`
    : `${label} running — ${percent}% (${summary?.CompletedTasks ?? 0}/${summary?.TotalTasks ?? 0} tasks across ${summary?.FoundQueues ?? ids.length} caches)`

  return (
    <>
      <Tooltip title={tooltip}>
        <Badge
          badgeContent={<Circle sx={{ fontSize: 8, color: statusColour(summary?.Status) }} />}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <IconButton
            onClick={() => setCanvasVisible(true)}
            sx={{
              color: finished ? statusColour(summary?.Status) : 'primary.main',
              animation: finished ? 'none' : 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            <Timeline />
          </IconButton>
        </Badge>
      </Tooltip>

      <CippOffCanvas
        size="md"
        title="Sync Status"
        visible={canvasVisible}
        onClose={() => setCanvasVisible(false)}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {summary?.Status ?? 'Starting'} — {percent}% complete
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            <Typography variant="body2">
              <strong>Caches:</strong> {summary?.FoundQueues ?? 0} of {summary?.TotalQueues ?? 0}
            </Typography>
            <Typography variant="body2">
              <strong>Tasks:</strong> {summary?.CompletedTasks ?? 0} / {summary?.TotalTasks ?? 0}
            </Typography>
            <Typography variant="body2">
              <strong>Running:</strong> {summary?.RunningTasks ?? 0}
            </Typography>
            <Typography variant="body2">
              <strong>Failed:</strong> {summary?.FailedTasks ?? 0}
            </Typography>
          </Stack>

          <Typography variant="subtitle2">Per cache</Typography>
          <Stack spacing={1}>
            {queues.map((queue) => (
              <Box
                key={queue.RowKey}
                sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight="medium">
                    {queue.Name}
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={queue.Status ?? 'Starting'}
                    color={
                      queue.Status === 'Completed'
                        ? 'success'
                        : queue.Status === 'Failed'
                          ? 'error'
                          : queue.Status === 'Completed (with errors)'
                            ? 'warning'
                            : 'default'
                    }
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {queue.CompletedTasks ?? 0} of {queue.TotalTasks ?? 0} tasks
                  {queue.FailedTasks > 0 ? ` — ${queue.FailedTasks} failed` : ''}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={queue.PercentComplete ?? 0}
                  sx={{ height: 5, borderRadius: 3, mt: 1 }}
                />
              </Box>
            ))}
            {queues.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {polling.isFetching ? 'Loading queue status…' : 'No queue data available yet.'}
              </Typography>
            )}
          </Stack>

          {summary?.TotalQueues > summary?.FoundQueues && (
            <Typography variant="caption" color="text.secondary">
              {summary.TotalQueues - summary.FoundQueues} queue(s) could not be found. They may have
              finished and aged out of the queue history, or failed to start.
            </Typography>
          )}
        </Stack>
      </CippOffCanvas>
    </>
  )
}

export default CippMultiQueueTracker
