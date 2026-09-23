import { useMemo } from 'react'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab'
import { Box, Chip, Stack, Typography } from '@mui/material'
import {
  buildBecTimeline,
  BEC_OBJECTIVE_COLOR,
  BEC_OBJECTIVE_LABEL,
} from '../../utils/bec-timeline'

const fmt = (ts) =>
  new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// Evaluation version A: a compact MUI Timeline. The empty opposite-content half is removed so the
// content uses the full width; each event is one dense row (time + label on a line, detail beneath)
// with a dot coloured by attacker objective. The start-of-compromise event is ringed and tagged.
export const CippBecTimelineCustom = ({ becData, windowDays = 7 }) => {
  const { events, startOfCompromise } = useMemo(
    () => buildBecTimeline(becData, windowDays),
    [becData, windowDays]
  )

  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No timestamped events in the analysis window.
      </Typography>
    )
  }

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1 }}
      >
        {Object.entries(BEC_OBJECTIVE_LABEL).map(([key, label]) => (
          <Chip
            key={key}
            size="small"
            variant="outlined"
            label={label}
            sx={{
              height: 20,
              borderColor: BEC_OBJECTIVE_COLOR[key],
              color: BEC_OBJECTIVE_COLOR[key],
            }}
          />
        ))}
      </Stack>
      <Timeline
        sx={{
          m: 0,
          p: 0,
          // Drop the empty opposite-content half MUI reserves so content spans the full width.
          '& .MuiTimelineItem-root:before': { display: 'none' },
        }}
      >
        {events.map((event, index) => {
          const colour = BEC_OBJECTIVE_COLOR[event.objective] || '#718096'
          const isStart = startOfCompromise && event.id === startOfCompromise.id
          return (
            <TimelineItem key={event.id} sx={{ minHeight: 44 }}>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    my: 0.5,
                    mx: 0,
                    width: 12,
                    height: 12,
                    bgcolor: colour,
                    boxShadow: isStart ? `0 0 0 4px ${colour}44` : 'none',
                  }}
                />
                {index < events.length - 1 && (
                  <TimelineConnector sx={{ bgcolor: 'divider' }} />
                )}
              </TimelineSeparator>
              <TimelineContent sx={{ py: 0.5, px: 1.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="baseline"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {fmt(event.ts)}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {event.label}
                  </Typography>
                  {isStart && (
                    <Chip
                      size="small"
                      color="error"
                      label="start of compromise"
                      sx={{ height: 18 }}
                    />
                  )}
                </Stack>
                {event.detail && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    {event.detail}
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          )
        })}
      </Timeline>
    </Box>
  )
}

export default CippBecTimelineCustom
