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

export const CyberInsuranceReportButton = ({ reportData, tenantName }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const tenantFilter = useSettings().currentTenant
  const hasData = !!reportData?.summary?.testsRun
  const pdf = useServerPdf({
    url: `/api/ExecGetCyberInsuranceReportPdf?tenantFilter=${encodeURIComponent(tenantFilter)}`,
    enabled: dialogOpen,
  })
  const handleOpen = () => setDialogOpen(true)
  const handleClose = () => setDialogOpen(false)
  const fileName = `Cyber_Insurance_Report_${(tenantName || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <>
      <Tooltip title="Generate a PDF to attach to the cyber insurance application">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CippIcons.PictureAsPdf />}
            onClick={handleOpen}
            disabled={!hasData}
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
              Cyber Insurance Report Preview
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CippIcons.Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <ServerPdfPane
            {...pdf}
            title={`Cyber Insurance Report - ${tenantName}`}
            errorText="The report could not be generated. Sync the report data for this tenant and try again."
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

export default CyberInsuranceReportButton
