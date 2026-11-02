import { useState } from 'react'
import { CippIcons } from '../utils/icon-registry'
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
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippOffCanvas } from './CippComponents/CippOffCanvas'
import { useSettings } from '../hooks/use-settings'
import { ServerPdfPane, useServerPdf } from './CippPdf/useServerPdf'

const sectionOptions = [
  {
    key: 'coverPage',
    label: 'Cover Page',
    description: 'Branded title page with tenant name and date',
  },
  {
    key: 'executiveSummary',
    label: 'Executive Summary',
    description: 'High-level overview, usage statistics and top tools',
  },
  {
    key: 'infographics',
    label: 'Infographic Pages',
    description: 'Statistical pages with visual elements between sections',
  },
  {
    key: 'background',
    label: 'Understanding Shadow AI',
    description: 'Explains shadow AI and its key risk areas',
  },
  {
    key: 'riskLevels',
    label: 'Risk Levels & Distribution',
    description: 'Risk methodology and distribution chart',
  },
  {
    key: 'sanctionedTools',
    label: 'Sanctioned Tools',
    description: 'Company approved AI tools and their footprint',
  },
  {
    key: 'detectedSoftware',
    label: 'AI Software (Intune)',
    description: 'AI applications found on managed devices',
  },
  {
    key: 'entraApplications',
    label: 'AI Applications (Entra)',
    description: 'AI services with consented permissions in Entra ID',
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    description: 'Action plan for managing shadow AI',
  },
]

export const ShadowAIReportButton = ({ data, tenantName, disabled }) => {
  const tenantFilter = useSettings().currentTenant
  const [previewOpen, setPreviewOpen] = useState(false)
  // Below md the 320px config rail would leave the preview about 70px wide, so it moves into
  // a drawer and the preview takes the whole dialog. Same treatment as the executive report.
  const [sectionsOpen, setSectionsOpen] = useState(false)
  const [sectionConfig, setSectionConfig] = useState({
    coverPage: true,
    executiveSummary: true,
    infographics: true,
    background: true,
    riskLevels: true,
    sanctionedTools: true,
    detectedSoftware: true,
    entraApplications: true,
    recommendations: true,
  })

  const handleSectionToggle = (sectionKey) => {
    setSectionConfig((prev) => {
      const enabledSections = Object.values(prev).filter(Boolean).length
      // Keep at least one section enabled
      if (prev[sectionKey] && enabledSections === 1) {
        return prev
      }
      return { ...prev, [sectionKey]: !prev[sectionKey] }
    })
  }

  // The PDF is rendered server-side (ExecGetShadowAIReportPdf) via the shared CIPPSharp kit and
  // re-rendered while the dialog is open whenever the selected sections change.
  const pdf = useServerPdf({
    url: '/api/ExecGetShadowAIReportPdf',
    body: { tenantFilter, sectionConfig },
    enabled: previewOpen,
  })

  const fileName = `Shadow_AI_Report_${String(tenantName).replace(/[^a-zA-Z0-9]/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`

  // One definition, two homes: the desktop rail and the mobile drawer. The drawer's own
  // header already says "Report Sections", so it takes the panel without the heading.
  const sectionPanel = ({ showHeading = true } = {}) => (
    <Box sx={{ p: 2 }}>
      {showHeading && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CippIcons.Settings size={20} />
          Report Sections
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 3
        }}>
        Configure which sections to include in your Shadow AI report. Changes are reflected in
        real-time.
      </Typography>

      <Stack spacing={1.5}>
        {sectionOptions.map((option) => (
          <Paper
            key={option.key}
            onClick={() => handleSectionToggle(option.key)}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: sectionConfig[option.key] ? 'primary.main' : 'divider',
              bgcolor: sectionConfig[option.key] ? 'primary.50' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: sectionConfig[option.key] ? 'primary.100' : 'primary.25',
              },
            }}
          >
            <Switch
              checked={sectionConfig[option.key]}
              onChange={(event) => {
                event.stopPropagation()
                handleSectionToggle(option.key)
              }}
              onClick={(event) => event.stopPropagation()}
              color="primary"
              size="small"
              disabled={
                sectionConfig[option.key] &&
                Object.values(sectionConfig).filter(Boolean).length === 1
              }
            />
            <Box sx={{ ml: 1, flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  fontSize: '0.875rem'
                }}>
                {option.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: '0.75rem'
                }}>
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
      <Tooltip title="Generate an executive report about AI usage and shadow AI risk in this tenant">
        <span>
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => setPreviewOpen(true)}
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.PictureAsPdf />
              </SvgIcon>
            }
          >
            Executive Shadow AI Report
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            // dvh, not vh: iOS counts the collapsing address bar in vh, so 95vh overflows.
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
            Shadow AI Report - {tenantName}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {/* The config rail's stand-in below md, in the title bar because the dialog is
                full-screen there and this is the only chrome that stays put. */}
            <IconButton
              onClick={() => setSectionsOpen(true)}
              size="small"
              aria-label="Report sections"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <CippIcons.Settings />
            </IconButton>
            <IconButton
              onClick={() => setPreviewOpen(false)}
              size="small"
              aria-label="Close preview"
            >
              <CippIcons.Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%', display: 'flex' }}>
          {/* Left Panel - Section Configuration. Below md it lives in the drawer instead. */}
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
            {sectionPanel()}
          </Paper>

          {/* Right Panel - PDF Preview (server-rendered) */}
          <Box sx={{ flex: 1, height: '100%', minWidth: 0 }}>
            <ServerPdfPane
              {...pdf}
              title={`Shadow AI Report - ${tenantName}`}
              errorText="The report could not be generated. Ensure the Shadow AI data has been synced for this tenant."
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
            // Caption plus two buttons in one row leaves nothing usable at 390px; the primary
            // action goes to the bottom of the stack, in thumb reach.
            flexDirection: { xs: 'column-reverse', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            '& > :not(style) ~ :not(style)': { ml: { xs: 0, md: 1 } },
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              Sections enabled: {Object.values(sectionConfig).filter(Boolean).length} of{' '}
              {sectionOptions.length}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<CippIcons.Download />}
            onClick={() => pdf.download(fileName)}
            disabled={!pdf.pdfUrl}
          >
            Download PDF
          </Button>
          <Button onClick={() => setPreviewOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>

        {/* Mounted inside the Dialog so it inherits its theme scope; aboveModal lifts it over
            the dialog it is opened from. */}
        <CippOffCanvas
          visible={sectionsOpen}
          onClose={() => setSectionsOpen(false)}
          title="Report Sections"
          size="sm"
          contentPadding={0}
          aboveModal
        >
          {sectionPanel({ showHeading: false })}
        </CippOffCanvas>
      </Dialog>
    </>
  );
}