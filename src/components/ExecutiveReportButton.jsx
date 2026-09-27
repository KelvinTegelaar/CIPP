import { useState, useMemo } from 'react'
import { CippIcons } from '../utils/icon-registry'
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Switch,
  Paper,
  Stack,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { CippAutoComplete } from './CippComponents/CippAutocomplete'
import { CippOffCanvas } from './CippComponents/CippOffCanvas'
import { useSettings } from '../hooks/use-settings'
import { ApiGetCall } from '../api/ApiCall'
import { ServerPdfPane, useServerPdf } from './CippPdf/useServerPdf'
import { DEFAULT_BRANDING_OPTION } from './ReportBuilder/reportSettings'
import { useBrandingSettings } from './CippPdf/useBrandingSettings'

export const ExecutiveReportButton = (props) => {
  const { variant: buttonVariant, onClick: onClickProp, ...other } = props
  const settings = useSettings()
  const tenantFilter = settings.currentTenant
  const defaultBranding = useBrandingSettings()

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false)

  // Null until the operator picks one, so the branding setting for this report type keeps applying
  // as it changes. An explicit choice — including "Default" — wins from then on.
  const [presetOverride, setPresetOverride] = useState(null)
  const brandingPresetId = presetOverride ?? defaultBranding?.reportDefaults?.executive ?? ''

  // Named branding sets a report can be rendered against instead of the default branding. Only the
  // names/ids are needed now that the PDF is branded server-side, so the image payloads are skipped.
  const brandingPresets = ApiGetCall({
    url: '/api/ListBrandingPresets',
    data: { includeImages: false },
    queryKey: 'ListBrandingPresets-list',
    waiting: previewOpen,
  })

  const presetOptions = useMemo(
    () => [
      // Imported rather than restated: this option used to read "Global branding settings" here
      // while the branding page called the same thing "Default".
      DEFAULT_BRANDING_OPTION,
      ...(Array.isArray(brandingPresets.data) ? brandingPresets.data : []).map((preset) => ({
        label: preset.name,
        value: preset.id,
      })),
    ],
    [brandingPresets.data]
  )

  // Only the sections the server-side executive report composes (Build-CippExecutiveReportTree).
  const [sectionConfig, setSectionConfig] = useState({
    executiveSummary: true,
    securityStandards: true,
    secureScore: true,
    licenseManagement: true,
    deviceManagement: true,
    conditionalAccess: true,
    infographics: true,
  })

  // The dialog title and download filename use the tenant domain; the PDF itself carries the real
  // display name, resolved server-side.
  const tenantName = tenantFilter || 'Tenant'

  const fileName = `Executive_Report_${String(tenantName).replace(/[^a-zA-Z0-9]/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`

  // The PDF is rendered server-side (ExecGetExecutiveReportPdf) via the shared CIPPSharp kit and
  // re-rendered while the dialog is open whenever the selected sections or branding change.
  const pdf = useServerPdf({
    url: '/api/ExecGetExecutiveReportPdf',
    body: { tenantFilter, sectionConfig, brandingPresetId },
    enabled: previewOpen,
  })

  // At least one section must stay enabled; otherwise a plain toggle.
  const handleSectionToggle = (sectionKey) => {
    setSectionConfig((prev) => {
      const enabledSections = Object.values(prev).filter(Boolean).length
      if (prev[sectionKey] && enabledSections === 1) {
        return prev
      }
      return { ...prev, [sectionKey]: !prev[sectionKey] }
    })
  }

  // Close handler with cleanup
  const handleClose = () => {
    setPreviewOpen(false)
  }

  // Below md the 320px config rail would leave the preview about 70px wide, so it moves into
  // a drawer and the preview takes the whole dialog.
  const [sectionsOpen, setSectionsOpen] = useState(false)

  // Section configuration options
  const sectionOptions = [
    {
      key: 'executiveSummary',
      label: 'Executive Summary',
      description: 'High-level overview and statistics',
    },
    {
      key: 'securityStandards',
      label: 'Security Standards',
      description: 'Compliance assessment and standards evaluation',
    },
    {
      key: 'secureScore',
      label: 'Microsoft Secure Score',
      description: 'Security posture measurement and trends',
    },
    {
      key: 'licenseManagement',
      label: 'License Management',
      description: 'License allocation and optimization',
    },
    {
      key: 'deviceManagement',
      label: 'Device Management',
      description: 'Device compliance and insights',
    },
    {
      key: 'conditionalAccess',
      label: 'Conditional Access',
      description: 'Access control policies and analysis',
    },
    {
      key: 'infographics',
      label: 'Infographic Pages',
      description: 'Statistical pages with visual elements between sections',
    },
  ]

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
        Configure which sections to include in your executive report. Changes are reflected in
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
            presetOptions.find((option) => option.value === brandingPresetId) ?? presetOptions[0]
          }
          onChange={(option) => setPresetOverride(option?.value ?? '')}
        />
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          Presets are managed in Settings → Branding
        </Typography>
      </Box>

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

      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: "primary.main",
            fontWeight: "bold"
          }}>
          💡 Pro Tip
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            mt: 0.5
          }}>
          Enable only the sections relevant to your audience to create focused, impactful reports.
          At least one section must be enabled.
        </Typography>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Main Executive Summary Button - Always available */}
      {buttonVariant === 'menuItem' ? (
        <MenuItem
          onClick={() => {
            setPreviewOpen(true)
            onClickProp?.()
          }}
          {...other}
        >
          <ListItemIcon>
            <CippIcons.PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText>Executive Summary</ListItemText>
        </MenuItem>
      ) : (
        <Tooltip title="Generate Executive Report with preview and configuration">
          <Box component="span" sx={{ display: 'inline-flex', width: '100%', minWidth: 0 }}>
            <Button
              variant="contained"
              startIcon={<CippIcons.PictureAsPdf />}
              onClick={() => setPreviewOpen(true)}
              sx={{
                minWidth: 0,
                width: '100%',
                pl: 1,
                pr: 1,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                justifyContent: 'center',
                '& .MuiButton-startIcon': {
                  marginLeft: 0,
                  marginRight: 0.75,
                  flexShrink: 0,
                },
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease-in-out',
              }}
              {...other}
            >
              <Box
                component="span"
                sx={{
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}
              >
                Executive Summary
              </Box>
            </Button>
          </Box>
        </Tooltip>
      )}

      {/* Combined Preview and Configuration Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClose}
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
            Executive Report - {tenantName}
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
            <IconButton onClick={handleClose} size="small" aria-label="Close preview">
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
              title={`Executive Report - ${tenantName}`}
              errorText="The report could not be generated. Ensure this tenant has data and try again."
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
            sx={{ minWidth: 140 }}
          >
            Download PDF
          </Button>

          <Button onClick={handleClose} variant="outlined">
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
