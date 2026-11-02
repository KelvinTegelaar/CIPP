import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

const hasValue = (val) => val !== null && val !== undefined && val !== ''

// A row carries the two sides in ExpectedValue/ReceivedValue. Which of them are populated is what
// distinguishes a genuine difference from a property that only one side has at all.
export const getDiffStatus = (row) => {
  const a = hasValue(row.ExpectedValue)
  const b = hasValue(row.ReceivedValue)
  if (a && b) return 'different'
  if (a) return 'onlyA'
  if (b) return 'onlyB'
  return 'equal'
}

const diffStatusColors = {
  different: 'error',
  onlyA: 'warning',
  onlyB: 'info',
  equal: 'success',
}

const diffRowColors = {
  different: { dark: 'rgba(244, 67, 54, 0.08)', light: 'rgba(244, 67, 54, 0.04)' },
  onlyA: { dark: 'rgba(255, 152, 0, 0.08)', light: 'rgba(255, 152, 0, 0.04)' },
  onlyB: { dark: 'rgba(33, 150, 243, 0.08)', light: 'rgba(33, 150, 243, 0.04)' },
  equal: { dark: 'transparent', light: 'transparent' },
}

const getRowColor = (row, theme) => {
  const colors = diffRowColors[getDiffStatus(row)]
  return theme.palette.mode === 'dark' ? colors.dark : colors.light
}

export const formatDiffValue = (val) => {
  if (val === null || val === undefined) return (
    <Typography sx={{
      color: "text.disabled"
    }}>N/A</Typography>
  );
  if (typeof val === 'object') {
    return (
      <Box
        component="pre"
        sx={{ m: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {JSON.stringify(val, null, 2)}
      </Box>
    )
  }
  return String(val)
}

/**
 * Renders the per-property differences returned by /api/ExecCompareIntunePolicy.
 *
 * labelA/labelB name the two sides in both the column headers and the status chips, so the same
 * table reads correctly whether it is comparing two arbitrary sources or a tenant against its
 * baseline template.
 */
export const CippPolicyDiffTable = ({ rows = [], labelA = 'Source A', labelB = 'Source B' }) => {
  const diffChipLabels = {
    different: 'Different',
    onlyA: `Only in ${labelA}`,
    onlyB: `Only in ${labelB}`,
    equal: 'Equal',
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{labelA}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{labelB}</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: 140 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const status = getDiffStatus(row)
            return (
              <TableRow key={index} sx={(theme) => ({ backgroundColor: getRowColor(row, theme) })}>
                <TableCell sx={{ fontWeight: 500 }}>{row.Property}</TableCell>
                <TableCell>{formatDiffValue(row.ExpectedValue)}</TableCell>
                <TableCell>{formatDiffValue(row.ReceivedValue)}</TableCell>
                <TableCell>
                  <Chip
                    label={diffChipLabels[status]}
                    size="small"
                    color={diffStatusColors[status]}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CippPolicyDiffTable
