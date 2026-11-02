import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { ServerPdfPane, useServerPdf } from './useServerPdf'
import { useBrandingSettings } from './useBrandingSettings'

// Rendered server-side (ExecGetDomainReportPdf) from the stored Domain Analyser results for every domain
// in the tenant; no DNS lookups run, so the report is as current as the last analysis.
export const DomainReportDialog = ({ tenantFilter, open, onClose }) => {
  const [includeDetails, setIncludeDetails] = useState(true)
  const branding = useBrandingSettings({ waiting: open })
  const pdf = useServerPdf({
    url: `/api/ExecGetDomainReportPdf?tenantFilter=${encodeURIComponent(tenantFilter ?? '')}&includeDetails=${includeDetails}&brandingPresetId=${encodeURIComponent(branding?.reportDefaults?.domain ?? '')}`,
    enabled: open && !!tenantFilter && tenantFilter !== 'AllTenants',
  })
  const fileName = `Domain_Security_Assessment_${(tenantFilter || 'tenant').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { height: '90vh' } } }}
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
            Domain Security Report - {tenantFilter}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CippIcons.Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <ServerPdfPane
          {...pdf}
          title={`Domain Security Report - ${tenantFilter}`}
          errorText={
            pdf.error === 404
              ? 'There are no Domain Analyser results for this tenant yet. Run the analysis, then try again.'
              : 'The report could not be generated.'
          }
        />
      </DialogContent>
      <DialogActions>
        <FormControlLabel
          sx={{ mr: 'auto', ml: 1 }}
          control={
            <Switch
              checked={includeDetails}
              onChange={(event) => setIncludeDetails(event.target.checked)}
            />
          }
          label="Include technical details"
        />
        <Button onClick={onClose}>Close</Button>
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
  )
}

export default DomainReportDialog
