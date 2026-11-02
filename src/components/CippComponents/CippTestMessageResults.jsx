import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Stack } from '@mui/system'
import { ApiGetCall } from '../../api/ApiCall'
import { CippDataTable } from '../CippTable/CippDataTable'
import { mergeRow, useCraftJobEvents } from '../../hooks/use-craft-events'

// Follows the async deployment job ExecTestMessage queues. Craft pushes each step over the
// realtime channel (the same plumbing the offboarding progress uses); when that stream is not
// available the job is polled instead. The finished job's Logs carry the trace events and
// every mail flow rule marked Applied / Not applied / Disabled / Not reached.
const stepChipColor = (status) =>
  status === 'succeeded'
    ? 'success'
    : status === 'failed'
      ? 'error'
      : status === 'running'
        ? 'info'
        : 'default'

export const CippTestMessageResults = ({ jobId }) => {
  const [view, setView] = useState('rules')
  // Rows come from the job read until a push replaces them; a new job id starts over.
  const [pushedRows, setPushedRows] = useState(null)
  useEffect(() => setPushedRows(null), [jobId])
  const query = ApiGetCall({
    url: jobId ? `/api/ListAsyncDeployment?DeploymentId=${jobId}` : null,
    queryKey: `TestMessageJob-${jobId}`,
    waiting: !!jobId,
  })
  const queriedRows = Array.isArray(query.data) ? query.data : []
  const connected = useCraftJobEvents(jobId, (frame) => {
    if (!frame.data) return query.refetch()
    setPushedRows((old) => mergeRow(old ?? queriedRows, frame.data))
  })
  const rows = pushedRows ?? queriedRows

  const job = rows[0]
  const finished = job && ['succeeded', 'failed'].includes(job.Status)
  // Fallback polling only while the stream is not delivering and the job is still running.
  useEffect(() => {
    if (!jobId || connected || finished) return undefined
    const timer = setInterval(() => query.refetch(), 10000)
    return () => clearInterval(timer)
  }, [jobId, connected, finished])

  const result = useMemo(() => {
    if (!job?.Logs) return null
    try {
      return typeof job.Logs === 'string' ? JSON.parse(job.Logs) : job.Logs
    } catch {
      return null
    }
  }, [job?.Logs])
  const ruleRows = result?.Rules ?? []
  const events = result?.Events ?? []
  const applied = ruleRows.filter((r) => r.Result === 'Applied').length
  const considered = ruleRows.filter((r) => r.Result !== 'Disabled').length

  if (!jobId) return null

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {job && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {(job.Steps ?? []).map((step, index) => (
            <Chip
              key={index}
              size="small"
              color={stepChipColor(step.status ?? step.Status)}
              label={step.title ?? step.Title}
              title={step.message ?? step.Message}
            />
          ))}
        </Stack>
      )}
      {!finished && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            {job?.Steps?.find((s) => (s.status ?? s.Status) === 'running')
              ?.message ??
              'Waiting for Exchange to process the test message. This usually takes under a minute; the full report is also on its way to the report mailbox.'}
          </Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </Box>
      )}
      {finished && job.Status === 'failed' && (
        <Alert severity="warning">
          {job.Steps?.find((s) => (s.status ?? s.Status) === 'failed')
            ?.message ?? 'The test could not be evaluated.'}
        </Alert>
      )}
      {result && (
        <Alert severity={applied ? 'success' : 'info'}>
          {`${applied} of ${considered} enabled rule${considered === 1 ? '' : 's'} applied to the test message.`}
          {!applied &&
            ' Rules that were evaluated but did not match are listed only in the emailed report.'}
        </Alert>
      )}
      {result && (
        <ToggleButtonGroup
          size="small"
          exclusive
          color="primary"
          value={view}
          onChange={(e, next) => next && setView(next)}
        >
          <ToggleButton value="rules">Rules</ToggleButton>
          <ToggleButton value="trace">Raw trace</ToggleButton>
        </ToggleButtonGroup>
      )}
      {result && view === 'rules' && (
        <CippDataTable
          title="Mail flow rules"
          data={ruleRows}
          simpleColumns={[
            'Priority',
            'Name',
            'Result',
            'Actions',
            'Mode',
            'StopRuleProcessing',
          ]}
          exportEnabled={false}
          showBulkExportAction={false}
        />
      )}
      {result && view === 'trace' && (
        <CippDataTable
          title="Message trace events"
          data={events}
          simpleColumns={['Date', 'Event', 'Detail', 'Action']}
          exportEnabled={false}
          showBulkExportAction={false}
        />
      )}
    </Stack>
  )
}

export default CippTestMessageResults
