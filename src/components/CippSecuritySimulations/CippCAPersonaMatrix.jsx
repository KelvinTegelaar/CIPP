import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const STATE_LABELS = {
  Enforced: 'Enforced',
  ReportOnly: 'Report-only',
  Missing: 'No policy',
  Unlicensed: 'Unlicensed',
  NotApplicable: 'Not applicable',
}

const asArray = (value) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(
    (entry) => entry !== null && entry !== undefined
  )

export const CippCAPersonaMatrix = ({ matrix }) => {
  const theme = useTheme()
  const personas = asArray(matrix?.personas)
  const controls = asArray(matrix?.controls)
  const cells = asArray(matrix?.cells)

  if (!personas.length || !controls.length) {
    return (
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}
      >
        No Conditional Access policies to map.
      </Typography>
    )
  }

  const cellFor = (persona, control) =>
    cells.find((cell) => cell.persona === persona && cell.control === control)

  const colors = {
    Enforced: theme.palette.success.main,
    ReportOnly: theme.palette.warning.main,
    Missing:
      theme.palette.mode === 'dark'
        ? theme.palette.error.dark
        : theme.palette.error.light,
    Unlicensed: theme.palette.info.main,
    NotApplicable:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[300],
  }

  const colTemplate = `minmax(150px, 200px) repeat(${controls.length}, minmax(28px, 1fr))`

  const tip = (persona, control, cell) => {
    const lines = [
      `${persona} · ${control}`,
      STATE_LABELS[cell?.state] ?? 'No policy',
    ]
    const policies = asArray(cell?.policies)
    if (policies.length) lines.push(policies.join('\n'))
    return lines.join('\n')
  }

  return (
    <Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: controls.length * 40 + 200 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: colTemplate,
              gap: '4px',
              alignItems: 'end',
              mb: '6px',
            }}
          >
            <Box />
            {controls.map((control) => (
              <Typography
                key={control}
                variant="caption"
                title={control}
                sx={{
                  color: 'text.secondary',
                  fontSize: 10,
                  lineHeight: 1.2,
                  textAlign: 'center',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {control}
              </Typography>
            ))}
          </Box>
          {personas.map((persona) => (
            <Box
              key={persona}
              sx={{
                display: 'grid',
                gridTemplateColumns: colTemplate,
                gap: '4px',
                alignItems: 'center',
                mb: '4px',
              }}
            >
              <Typography
                variant="caption"
                noWrap
                title={persona}
                sx={{ pr: 1, color: 'text.secondary' }}
              >
                {persona}
              </Typography>
              {controls.map((control) => {
                const cell = cellFor(persona, control)
                const state = cell?.state ?? 'Missing'
                return (
                  <Box
                    key={`${persona}-${control}`}
                    title={tip(persona, control, cell)}
                    sx={{
                      height: 22,
                      borderRadius: '4px',
                      bgcolor:
                        state === 'ReportOnly' ? 'transparent' : colors[state],
                      border:
                        state === 'ReportOnly'
                          ? `2px solid ${colors.ReportOnly}`
                          : 'none',
                      opacity:
                        state === 'NotApplicable'
                          ? 0.5
                          : state === 'Unlicensed'
                            ? 0.55
                            : 1,
                    }}
                  />
                )
              })}
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
        {Object.keys(STATE_LABELS).map((state) => (
          <Box
            key={state}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '3px',
                bgcolor: state === 'ReportOnly' ? 'transparent' : colors[state],
                border:
                  state === 'ReportOnly'
                    ? `2px solid ${colors.ReportOnly}`
                    : 'none',
                opacity:
                  state === 'NotApplicable'
                    ? 0.5
                    : state === 'Unlicensed'
                      ? 0.55
                      : 1,
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {STATE_LABELS[state]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default CippCAPersonaMatrix
