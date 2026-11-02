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

// The report PDF is rendered server-side (ExecGetMailFlowReportPdf) by the shared CIPPSharp component
// kit, which re-gathers and aggregates the mail flow data; the button fetches the finished PDF as a
// blob for preview and download.
export const MailFlowReportButton = ({ mailFlowData, tenantName, disabled = false }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const tenantFilter = useSettings().currentTenant
  const days = Number(mailFlowData?.days) || 14
  const hasData = Object.keys(mailFlowData?.totals ?? {}).length > 0
  const pdf = useServerPdf({
    url: `/api/ExecGetMailFlowReportPdf?tenantFilter=${encodeURIComponent(tenantFilter)}&days=${days}`,
    enabled: dialogOpen,
  })
  const handleOpen = () => setDialogOpen(true)
  const handleClose = () => setDialogOpen(false)
  const fileName = `Mail_Flow_Report_${(tenantName || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <>
      <Tooltip title="Generate a client-ready PDF of the mail flow figures">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CippIcons.PictureAsPdf />}
            onClick={handleOpen}
            disabled={disabled || !hasData}
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
          paper: { sx: { height: '90vh' } }
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <Typography variant="h6" component="div">
              Mail Flow Report Preview
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CippIcons.Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <ServerPdfPane
            {...pdf}
            title={`Mail Flow Report - ${tenantName}`}
            errorText="The report could not be generated. Mail flow data is read live from Exchange Online for this tenant."
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
  );
}

export default MailFlowReportButton
