import { Box, Chip, Stack, Typography } from '@mui/material'
import CippButtonCard from '../CippCards/CippButtonCard'
import { CippDataTable } from '../CippTable/CippDataTable'

// The containment actions run for this case and their per-target results, newest first. Reads the
// history persisted on the run (becData.Run.Containment); renders nothing until something has run.
// An accordion like the objective groups, open by default.
export const CippBecRemediationHistory = ({ becData }) => {
  const history = [...(becData?.Run?.Containment || [])].reverse()
  if (history.length === 0) return null

  return (
    <CippButtonCard
      variant="outlined"
      component="accordion"
      accordionExpanded={true}
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <Box>Remediation taken</Box>
          <Chip
            size="small"
            variant="outlined"
            label={`${history.length} run${history.length === 1 ? '' : 's'}`}
          />
        </Stack>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Containment actions run for this case and their results, newest first.
      </Typography>
      <Stack spacing={2.5}>
        {history.map((entry, index) => {
          const results = Array.isArray(entry.Results) ? entry.Results : []
          return (
            <Box key={index}>
              <Typography variant="subtitle2" gutterBottom>
                {entry.At
                  ? new Date(entry.At).toLocaleString()
                  : 'Unknown time'}{' '}
                · {entry.By || 'CIPP'} · {(entry.Actions || []).length}{' '}
                action(s)
              </Typography>
              {results.length > 0 ? (
                <CippDataTable
                  noCard
                  hideTitle
                  data={results}
                  simpleColumns={['Action', 'Target', 'resultText', 'state']}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No per-action results were recorded.
                </Typography>
              )}
            </Box>
          )
        })}
      </Stack>
    </CippButtonCard>
  )
}

export default CippBecRemediationHistory
