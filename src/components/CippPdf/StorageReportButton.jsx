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
  Tooltip,
  Typography,
} from '@mui/material'
import { useSettings } from '../../hooks/use-settings'
import { ServerPdfPane, useServerPdf } from './useServerPdf'
import { useBrandingSettings } from './useBrandingSettings'

// Rendered server-side by ExecGetStorageReportPdf from the cached usage sync and cleanup scan.
export const StorageReportButton = ({ tenantName, disabled = false }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const tenantFilter = useSettings().currentTenant
  const branding = useBrandingSettings()
  const pdf = useServerPdf({
    url: `/api/ExecGetStorageReportPdf?tenantFilter=${encodeURIComponent(tenantFilter)}&brandingPresetId=${encodeURIComponent(branding?.reportDefaults?.storage ?? '')}`,
    enabled: dialogOpen,
  })
  const handleClose = () => setDialogOpen(false)
  const fileName = `Storage_Report_${(tenantName || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <>
      <Tooltip title="Generate a client-ready PDF of storage use, version history and cleanup opportunities">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CippIcons.PictureAsPdf />}
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
          >
            Export Report
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
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
              Storage Report Preview
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CippIcons.Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <ServerPdfPane
            {...pdf}
            title={`Storage Report - ${tenantName}`}
            errorText="The report could not be generated. Ensure the storage usage has been synced for this tenant."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
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

export default StorageReportButton
