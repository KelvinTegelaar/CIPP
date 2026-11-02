import { useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippAutoComplete } from '../CippComponents/CippAutocomplete'
import { CippOffCanvas } from '../CippComponents/CippOffCanvas'
import { ServerPdfPane, useServerPdf } from '../CippPdf/useServerPdf'
import { useBrandingSettings } from '../CippPdf/useBrandingSettings'
import { DEFAULT_BRANDING_OPTION } from '../ReportBuilder/reportSettings'
import { ApiGetCall } from '../../api/ApiCall'

const operatorLabels = {
  eq: 'equals',
  ne: 'does not equal',
  startsWith: 'starts with',
  notStartsWith: 'does not start with',
}

// Human-readable summary of a stage's graduation conditions. Used by the alignment and
// template pages - deliberately NOT by the PDF, which tells the rollout in plain words.
export const describeStageConditions = (stage) => {
  if (!stage?.conditions?.length) return 'no conditions configured'
  const parts = stage.conditions.map((condition) => {
    switch (condition.type) {
      case 'time':
        return `${condition.days} ${condition.unit ?? 'days'} in the previous stage`
      case 'variable':
        return `${condition.variable} ${operatorLabels[condition.operator] ?? condition.operator} '${condition.value}'`
      case 'group':
        return `the tenant is in the '${condition.groupName ?? condition.group}' group`
      case 'success':
        return 'all previous stage items applied successfully'
      case 'manual':
        return 'manual approval by an operator'
      default:
        return condition.type
    }
  })
  return parts.join(stage.logic === 'or' ? ' OR ' : ' AND ')
}

// Report option toggles shown in the sidebar, in the executive report's card style. The keys
// are the endpoint's sectionConfig fields.
const sectionOptions = [
  {
    key: 'alreadyAligned',
    label: 'What Is Already In Place',
    description: 'Deployed policies and enforced settings, with their values',
  },
  {
    key: 'rolloutStages',
    label: 'Rollout Stages',
    description: 'How the remaining waves arrive and when',
  },
]

// Button + preview dialog in the executive report's shape: an options rail on the left
// (branding, simulated baselines, section toggles) and the PDF preview on the right. The PDF
// is rendered server-side (ExecGetBaselineWhatIfReportPdf), which reads the same alignment,
// baselines and stored templates this page shows, and re-renders whenever an option changes.
export const CippBaselineWhatIfReport = ({
  tenant,
  stageStates = [],
  baselines = [],
}) => {
  const [open, setOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [simulatedSelection, setSimulatedSelection] = useState([])
  const [sectionConfig, setSectionConfig] = useState({
    alreadyAligned: true,
    rolloutStages: true,
  })
  // Null until the operator picks one, so the branding setting for this report type keeps
  // applying as it changes. An explicit choice - including "Default" - wins from then on.
  const [presetOverride, setPresetOverride] = useState(null)
  const defaultBranding = useBrandingSettings()
  const brandingPresetId =
    presetOverride ?? defaultBranding?.reportDefaults?.baseline ?? ''

  // Named branding sets a report can be rendered against. Only names/ids are needed now that
  // the PDF is branded server-side, so this shares the executive report's image-free query.
  const brandingPresets = ApiGetCall({
    url: '/api/ListBrandingPresets',
    data: { includeImages: false },
    queryKey: 'ListBrandingPresets-list',
    waiting: open,
  })
  const presetOptions = useMemo(
    () => [
      DEFAULT_BRANDING_OPTION,
      ...(Array.isArray(brandingPresets.data) ? brandingPresets.data : []).map(
        (preset) => ({ label: preset.name, value: preset.id })
      ),
    ],
    [brandingPresets.data]
  )

  const tenantLabel = tenant?.displayName ?? tenant?.tenantFilter ?? 'tenant'

  // Baselines not rolled out to this tenant can be simulated in the report.
  const availableTemplates = baselines.filter(
    (template) =>
      !stageStates.some((state) => state.templateId === template.GUID)
  )

  const pdf = useServerPdf({
    url: '/api/ExecGetBaselineWhatIfReportPdf',
    body: {
      tenantFilter: tenant?.tenantFilter,
      simulatedTemplateIds: simulatedSelection.map((option) => option.value),
      sectionConfig,
      brandingPresetId,
    },
    enabled: open,
  })

  const fileName = `Baseline_Report_${tenantLabel.replace(/[^a-zA-Z0-9]/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`

  const toggleSection = (key) =>
    setSectionConfig((prev) => ({ ...prev, [key]: !prev[key] }))

  // One definition, two homes: the desktop rail and the mobile drawer. The drawer's own
  // header already says "Report Options", so it takes the panel without the heading.
  const optionsPanel = ({ showHeading = true } = {}) => (
    <Box sx={{ p: 2 }}>
      {showHeading && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CippIcons.Settings size={20} />
          Report Options
        </Typography>
      )}
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Configure what the baseline report includes. Changes are reflected in
        real-time.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CippAutoComplete
          size="small"
          label="Branding"
          multiple={false}
          creatable={false}
          disableClearable={true}
          isFetching={brandingPresets.isFetching}
          options={presetOptions}
          value={
            presetOptions.find((option) => option.value === brandingPresetId) ??
            presetOptions[0]
          }
          onChange={(option) => setPresetOverride(option?.value ?? '')}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Presets are managed in Settings → Branding
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <CippAutoComplete
          size="small"
          label="Simulate additional baselines"
          multiple={true}
          creatable={false}
          options={availableTemplates.map((template) => ({
            label: template.templateName,
            value: template.GUID,
          }))}
          value={simulatedSelection}
          onChange={(options) => setSimulatedSelection(options ?? [])}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Everything these baselines would add appears in the report as planned
          changes.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {sectionOptions.map((option) => (
          <Paper
            key={option.key}
            onClick={() => toggleSection(option.key)}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: sectionConfig[option.key]
                ? 'primary.main'
                : 'divider',
              bgcolor: sectionConfig[option.key]
                ? 'primary.50'
                : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: sectionConfig[option.key]
                  ? 'primary.100'
                  : 'primary.25',
              },
            }}
          >
            <Switch
              checked={sectionConfig[option.key]}
              onChange={(event) => {
                event.stopPropagation()
                toggleSection(option.key)
              }}
              onClick={(event) => event.stopPropagation()}
              color="primary"
              size="small"
            />
            <Box sx={{ ml: 1, flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
              >
                {option.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
              >
                {option.description}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  )

  return (
    <>
      <Tooltip title="Preview what applying the configured standards would change for this tenant, including upcoming stages">
        <Button
          variant="contained"
          startIcon={<CippIcons.PictureAsPdf />}
          onClick={() => setOpen(true)}
        >
          What-If Report
        </Button>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: { xs: '100dvh', md: '95vh' },
            maxHeight: { xs: '100dvh', md: '95vh' },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="div" noWrap sx={{ minWidth: 0 }}>
            Baseline Report - {tenantLabel}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {/* The options rail's stand-in below md, in the title bar because the dialog
                is full-screen there and this is the only chrome that stays put. */}
            <IconButton
              onClick={() => setOptionsOpen(true)}
              size="small"
              aria-label="Report options"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <CippIcons.Settings />
            </IconButton>
            <IconButton
              onClick={() => setOpen(false)}
              size="small"
              aria-label="Close preview"
            >
              <CippIcons.Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%', display: 'flex' }}>
          {/* Left Panel - report options. Below md it lives in the drawer instead. */}
          <Paper
            sx={{
              width: 320,
              flexShrink: 0,
              borderRadius: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              height: '100%',
              overflow: 'auto',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {optionsPanel()}
          </Paper>

          {/* Right Panel - PDF preview */}
          <Box sx={{ flex: 1, height: '100%', minWidth: 0 }}>
            <ServerPdfPane
              {...pdf}
              title={`Baseline Report - ${tenantLabel}`}
              errorText="The report could not be generated. Run the baseline for this tenant and try again."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<CippIcons.Download />}
            onClick={() => pdf.download(fileName)}
            disabled={!pdf.pdfUrl}
          >
            Download PDF
          </Button>
        </DialogActions>

        <CippOffCanvas
          visible={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          title="Report Options"
          size="sm"
          contentPadding={0}
          aboveModal
        >
          {optionsPanel({ showHeading: false })}
        </CippOffCanvas>
      </Dialog>
    </>
  )
}

export default CippBaselineWhatIfReport
