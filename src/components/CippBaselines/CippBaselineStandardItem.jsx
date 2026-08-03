import { useEffect } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { AutoFixHigh, Delete, ExpandMore } from '@mui/icons-material'
import { useWatch } from 'react-hook-form'
import CippFormComponent from '../CippComponents/CippFormComponent'
import CippBaselineStandardSettings from './CippBaselineStandardSettings'

const impactColors = {
  'Low Impact': 'info',
  'Medium Impact': 'warning',
  'High Impact': 'error',
}

// Unwrap autoComplete option objects ({label, value}) to their raw value.
const unwrap = (value) =>
  value && typeof value === 'object' && 'value' in value ? value.value : value

const resolveToken = (token, values) => unwrap(values?.[token])

// Render a §5 `expected` template from the configured variable values. Type-preserving for
// exact `%token%` strings, string-replacing for embedded tokens — mirrors the engine's
// render step.
export const renderExpectedValue = (template, values) => {
  if (typeof template === 'string') {
    const exact = template.match(/^%(\w+)%$/)
    if (exact) {
      const value = resolveToken(exact[1], values)
      return value === undefined ? template : value
    }
    return template.replace(/%(\w+)%/g, (match, token) => {
      const value = resolveToken(token, values)
      return value === undefined ? match : value
    })
  }
  if (Array.isArray(template)) {
    return template.map((item) => renderExpectedValue(item, values))
  }
  if (template && typeof template === 'object') {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [
        key,
        renderExpectedValue(value, values),
      ])
    )
  }
  return template
}

// One standard inside a stage: summary row with state chips, details with the standard's
// configurable variables (from the V3 definition), the per-delta action posture, and a live
// preview of the expected value the engine will enforce.
export const CippBaselineStandardItem = ({
  standard,
  formControl,
  expanded,
  onToggle,
  onRemove,
  instanceId,
}) => {
  // Multi-instance standards use 'Name#n' keys so each instance keeps its own config.
  const fieldBase = instanceId ?? standard.name
  const instanceNumber = fieldBase.includes('#')
    ? Number(fieldBase.split('#')[1]) + 1
    : null
  const watched = useWatch({ control: formControl.control, name: fieldBase })
  const variableEntries = Object.entries(standard.variables ?? {})

  // Seed the action posture when the standard is first added; the settings fields seed
  // themselves (recommended value first) inside CippBaselineStandardSettings.
  useEffect(() => {
    if (formControl.getValues(`${fieldBase}.remediateEnabled`) === undefined) {
      formControl.setValue(`${fieldBase}.remediateEnabled`, true)
    }
    if (formControl.getValues(`${fieldBase}.alertEnabled`) === undefined) {
      formControl.setValue(`${fieldBase}.alertEnabled`, true)
    }
    if (formControl.getValues(`${fieldBase}.alertOnRemediate`) === undefined) {
      formControl.setValue(`${fieldBase}.alertOnRemediate`, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldBase])

  const remediateEnabled = watched?.remediateEnabled ?? true
  const alertEnabled = watched?.alertEnabled ?? true
  const alertOnRemediate = watched?.alertOnRemediate ?? false
  const renderedExpected = renderExpectedValue(
    standard.expected,
    watched?.variables
  )

  const recommendedEntries = variableEntries.filter(
    ([, definition]) =>
      definition.recommended !== undefined && !definition.locked
  )
  const differsFromRecommended = recommendedEntries.some(
    ([key, definition]) =>
      unwrap(watched?.variables?.[key]) !== definition.recommended
  )

  const applyRecommended = () => {
    recommendedEntries.forEach(([key, definition]) => {
      const value =
        definition.type === 'autoComplete'
          ? (definition.options?.find(
              (option) => option.value === definition.recommended
            ) ?? definition.recommended)
          : definition.recommended
      formControl.setValue(`${fieldBase}.variables.${key}`, value)
    })
  }

  return (
    <Accordion
      variant="outlined"
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      sx={{ '&:before': { display: 'none' }, borderRadius: '12px' }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', pr: 1, minWidth: 0 }}
        >
          <Box sx={{ minWidth: 0, flexGrow: 1, flexBasis: '30%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {standard.label}
              {instanceNumber ? ` (instance ${instanceNumber})` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {standard.cat}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            justifyContent="flex-end"
            sx={{ minWidth: 0 }}
          >
            {differsFromRecommended && (
              <Chip
                variant="outlined"
                size="small"
                color="warning"
                label="Differs from recommended"
              />
            )}
            <Tooltip
              title={
                remediateEnabled
                  ? 'Drift is corrected automatically on every run'
                  : 'Drift is only reported, never corrected automatically'
              }
            >
              <Chip
                variant="outlined"
                size="small"
                color={remediateEnabled ? 'success' : 'default'}
                label={remediateEnabled ? 'Auto-remediate' : 'Report only'}
              />
            </Tooltip>
            <Tooltip
              title={
                alertEnabled
                  ? 'An alert fires when a new deviation is detected'
                  : 'No alerts fire for deviations on this standard'
              }
            >
              <Chip
                variant="outlined"
                size="small"
                color={alertEnabled ? 'info' : 'warning'}
                label={alertEnabled ? 'Alert on deviation' : 'Alerts muted'}
              />
            </Tooltip>
            {alertOnRemediate && (
              <Tooltip title="An alert fires whenever auto-remediation corrects this standard">
                <Chip
                  variant="outlined"
                  size="small"
                  color="info"
                  label="Alert on remediation"
                />
              </Tooltip>
            )}
            <Chip
              variant="outlined"
              size="small"
              color={impactColors[standard.impact] ?? 'default'}
              label={standard.impact}
            />
            {standard.secureScoreImpact > 0 && (
              <Tooltip title="Potential Secure Score increase when compliant">
                <Chip
                  variant="outlined"
                  size="small"
                  label={`+${standard.secureScoreImpact} pts`}
                />
              </Tooltip>
            )}
            <Tooltip title="Remove from this stage">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove(fieldBase)
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {standard.helpText}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(standard.recommendedBy ?? []).map((source) => (
              <Chip
                key={source}
                variant="outlined"
                size="small"
                color="info"
                label={`Recommended by ${source}`}
              />
            ))}
            {(standard.tag ?? []).map((tag) => (
              <Chip key={tag} variant="outlined" size="small" label={tag} />
            ))}
            {(standard.requiredCapabilities ?? []).length > 0 && (
              <Tooltip title="Tenants without one of these licenses are excluded from scoring for this standard">
                <Chip
                  variant="outlined"
                  size="small"
                  color="warning"
                  label={`Requires: ${standard.requiredCapabilities.join(' or ')}`}
                />
              </Tooltip>
            )}
          </Stack>
          <Divider />

          {variableEntries.length > 0 ? (
            <>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Settings
                </Typography>
                {recommendedEntries.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoFixHigh />}
                    onClick={applyRecommended}
                  >
                    Use recommended values
                  </Button>
                )}
              </Stack>
              <CippBaselineStandardSettings
                standard={standard}
                formControl={formControl}
                namePrefix={`${fieldBase}.variables`}
              />
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              This standard has no configurable settings - it enforces a fixed
              value.
            </Typography>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Action
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippFormComponent
                type="switch"
                name={`${fieldBase}.remediateEnabled`}
                label="Auto-remediate on drift"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippFormComponent
                type="switch"
                name={`${fieldBase}.alertEnabled`}
                label="Alert on new deviation"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippFormComponent
                type="switch"
                name={`${fieldBase}.alertOnRemediate`}
                label="Alert when remediated"
                formControl={formControl}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Expected value (rendered from the settings above)
            </Typography>
            <Chip
              variant="outlined"
              size="small"
              label={`Compare: ${standard.compare ?? 'subset'}`}
            />
          </Stack>
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'success.lighter',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: 'success.main',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'success.dark',
              }}
            >
              {JSON.stringify(renderedExpected, null, 2)}
            </Typography>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default CippBaselineStandardItem
