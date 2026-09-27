import { useState } from 'react'
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
import { useSettings } from '../../hooks/use-settings'
import { useBrandingSettings } from './useBrandingSettings'
import { ServerPdfPane, useServerPdf } from './useServerPdf'

// Which sections the report can carry. `overview` is the page that makes it a report, so it is
// always on.
export const LICENSE_REPORT_SECTIONS = [
  {
    key: 'spend',
    label: 'What you pay for',
    description: 'Every plan, seats owned versus in use, and monthly cost.',
  },
  {
    key: 'reclaim',
    label: 'Licenses you can remove',
    description: 'Unassigned, switched-off, inactive and duplicate licenses.',
  },
  {
    key: 'downgrades',
    label: 'Cheaper plans',
    description: 'People whose plan includes more than they use.',
  },
  {
    key: 'upgrades',
    label: 'Better plans',
    description:
      'Bundles that cost less, and people with no security protection.',
  },
  {
    key: 'terms',
    label: 'Yearly or monthly',
    description: 'How many seats are stable enough to commit to for a year.',
  },
  {
    key: 'method',
    label: 'How this was measured',
    description: 'Sources, time window and assumptions.',
  },
]

export const DEFAULT_LICENSE_REPORT_SECTIONS = Object.fromEntries(
  LICENSE_REPORT_SECTIONS.map((section) => [section.key, true])
)

// The report PDF is rendered server-side (ExecGetLicenseReportPdf) by the shared CIPPSharp kit,
// which re-runs the page's license analysis with the same `settings` the page's table uses; the
// dialog previews the returned PDF and re-renders it when a section is switched.
export const LicenseReportButton = ({
  report,
  tenantName,
  settings,
  disabled = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sections, setSections] = useState(DEFAULT_LICENSE_REPORT_SECTIONS)
  const tenantFilter = useSettings().currentTenant
  const branding = useBrandingSettings()
  const hasData = !!report?.Summary && report.Summary.DataAvailable !== false
  const pdf = useServerPdf({
    url: '/api/ExecGetLicenseReportPdf',
    body: {
      tenantFilter,
      ...settings,
      sections,
      brandingPresetId: branding?.reportDefaults?.licensing ?? '',
    },
    enabled: dialogOpen,
  })

  const toggleSection = (key) =>
    setSections((current) => ({ ...current, [key]: !current[key] }))

  const safeTenant = (tenantName || 'tenant').replace(/[^a-z0-9.-]/gi, '_')
  const fileName = `Licensing_Report_${safeTenant}_${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <>
      <Tooltip title="Generate a client-ready PDF of the licensing figures">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CippIcons.PictureAsPdf />}
            onClick={() => setDialogOpen(true)}
            disabled={disabled || !hasData}
          >
            Client Report
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        slotProps={{
          paper: { sx: { height: '90vh' } },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" component="div">
              Licensing Report - {tenantName}
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <CippIcons.Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', minHeight: 0 }}>
          <Paper
            sx={{
              width: 300,
              flexShrink: 0,
              borderRadius: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
              p: 2,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Report Sections
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              The summary page is always included. Recommendation sections
              follow the switches on the page; a section switched off there has
              nothing to show here.
            </Typography>
            <Stack spacing={1.5}>
              {LICENSE_REPORT_SECTIONS.map((option) => (
                <Paper
                  key={option.key}
                  onClick={() => toggleSection(option.key)}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: sections[option.key]
                      ? 'primary.main'
                      : 'divider',
                    bgcolor: sections[option.key]
                      ? 'primary.50'
                      : 'background.paper',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Switch
                    checked={!!sections[option.key]}
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
          </Paper>
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <ServerPdfPane
              {...pdf}
              title={`Licensing Report - ${tenantName}`}
              errorText="The report could not be generated. License data is read from the reporting cache for this tenant; try again once it has been collected."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<CippIcons.Download />}
            onClick={() => pdf.download(fileName)}
            disabled={!pdf.pdfUrl}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LicenseReportButton
