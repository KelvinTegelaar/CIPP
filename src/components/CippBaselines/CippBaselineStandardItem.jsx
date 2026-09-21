import { useEffect } from 'react'
import { CippIcons } from '../../utils/icon-registry'
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
import { useWatch } from 'react-hook-form'
import CippFormComponent from '../CippComponents/CippFormComponent'
import CippBaselineStandardSettings from './CippBaselineStandardSettings'
import { useM365Licenses } from '../../utils/m365-licenses-data'
import { getServicePlanFriendlyName } from '../../utils/get-cipp-service-plan-name'

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
    });
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
  savedConfig,
}) => {
  // Multi-instance standards use 'Name#<id>' keys so each instance keeps its own config.
  // Legacy keys were positional counters; new ones are opaque ids - only number the
  // legacy ones, the id itself means nothing to a user.
  const fieldBase = instanceId ?? standard.name
  const instanceSuffix = fieldBase.includes('#')
    ? fieldBase.split('#')[1]
    : null
  const instanceNumber = /^\d+$/.test(instanceSuffix ?? '')
    ? Number(instanceSuffix) + 1
    : null
  const watched = useWatch({ control: formControl.control, name: fieldBase })
  // Identity-carrying standards (CA/Intune templates via instanceIdentity, manual tasks
  // via taskName) title as '<label> - <selected name>' so ten instances stay tellable.
  // Saved-but-never-expanded instances have no form values yet (details mount lazily),
  // so the saved configuration supplies the identity for the title.
  const identityValueRaw = standard.instanceIdentity
    ? (watched?.variables?.[standard.instanceIdentity] ??
      savedConfig?.variables?.[standard.instanceIdentity])
    : (watched?.variables?.taskName ?? savedConfig?.variables?.taskName)
  const identityLabel =
    identityValueRaw && typeof identityValueRaw === 'object'
      ? (identityValueRaw.label ?? identityValueRaw.value)
      : identityValueRaw
  const variableEntries = Object.entries(standard.variables ?? {})
  // The license catalog loads as an async chunk; this re-renders once it lands so
  // the required-license chip shows friendly names instead of service plan codes.
  useM365Licenses()
  const requiredLicenseNames = [
    ...new Set(
      (standard.requiredCapabilities ?? []).map(getServicePlanFriendlyName)
    ),
  ]

  // Seed the action posture: saved configuration (editing an existing baseline) wins,
  // then the defaults for a freshly added standard - report only, never auto-remediate,
  // until the operator explicitly enables it. The settings fields seed themselves
  // (saved value > recommended) inside CippBaselineStandardSettings. savedConfig is a
  // dependency so a form reset (reloading a template into a mounted editor) re-seeds
  // the wiped fields; the undefined guard keeps live edits untouched.
  useEffect(() => {
    const postureDefaults = {
      remediateEnabled: false,
      alertEnabled: true,
      alertOnRemediate: false,
    }
    Object.entries(postureDefaults).forEach(([field, fallback]) => {
      if (formControl.getValues(`${fieldBase}.${field}`) === undefined) {
        formControl.setValue(
          `${fieldBase}.${field}`,
          savedConfig?.[field] ?? fallback
        )
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldBase, savedConfig])

  const remediateEnabled = watched?.remediateEnabled ?? false
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
      slotProps={{
        transition: { unmountOnExit: true }
      }}
    >
      <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            width: '100%',
            pr: 1,
            minWidth: 0
          }}>
          <Box sx={{ minWidth: 0, flexGrow: 1, flexBasis: '30%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {identityLabel
                ? `${standard.label} - ${identityLabel}`
                : standard.label}
              {instanceNumber ? ` (instance ${instanceNumber})` : ''}
            </Typography>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {standard.cat}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              minWidth: 0
            }}>
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
                <CippIcons.Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            {standard.helpText}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{
            flexWrap: "wrap"
          }}>
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
            {requiredLicenseNames.length > 0 && (
              <Tooltip
                title={`Tenants without one of these licenses are excluded from scoring for this standard (${(standard.requiredCapabilities ?? []).join(', ')})`}
              >
                <Chip
                  variant="outlined"
                  size="small"
                  color="warning"
                  label={`Requires: ${requiredLicenseNames.join(' or ')}`}
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
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Settings
                </Typography>
                {recommendedEntries.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CippIcons.AutoFixHigh />}
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
                initialValues={savedConfig?.variables}
              />
            </>
          ) : (
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
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
                label="Automatically fix this when the setting drifts"
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

          {standard.prepare || standard.package ? (
            // Template-backed standards (CA/Intune): the real expected value is the FULL
            // selected template (or every template in the package), resolved by the
            // engine at run time - a rendered preview here would mislead.
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {standard.package
                ? 'This deploys and drift-checks every template tagged with the selected package. Membership is resolved fresh on every run: tagging a template with this package adds it to the baseline automatically, untagging removes it. All templates in the package share the options configured above.'
                : 'The expected configuration is the full selected template - use the preview button on the template picker to inspect it. The engine compares every setting in it against the tenant on each run.'}
            </Typography>
          ) : (
            <>
              <Stack direction="row" spacing={1} sx={{
                alignItems: "center"
              }}>
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
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default CippBaselineStandardItem
