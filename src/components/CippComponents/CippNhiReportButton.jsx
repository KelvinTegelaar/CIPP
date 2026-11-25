import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { useBrandingQuery } from '../CippPdf/useBrandingSettings'
import { ServerPdfPane, useServerPdf } from '../CippPdf/useServerPdf'

// Previews and downloads the PDF report of a completed NHI case, rendered server-side by ExecGetNhiReportPdf.
export const CippNhiReportDialog = ({
  caseData,
  tenantFilter,
  open,
  onClose,
}) => {
  const { branding, ready: brandingReady } = useBrandingQuery()
  const params = new URLSearchParams({
    tenantFilter: tenantFilter ?? '',
    caseId: caseData?.CaseId ?? '',
    brandingPresetId: branding?.reportDefaults?.nhi ?? '',
  })
  const pdf = useServerPdf({
    url: `/api/ExecGetNhiReportPdf?${params}`,
    enabled: open && brandingReady,
  })
  const fileName = `NHI_Report_${(caseData?.DisplayName || 'app').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

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
            NHI Compromise Report: {caseData?.DisplayName}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CippIcons.Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <ServerPdfPane
          {...pdf}
          loading={pdf.loading || !brandingReady}
          title={`NHI Compromise Report - ${caseData?.DisplayName ?? ''}`}
          errorText="The report could not be generated. Open a completed case and try again."
        />
      </DialogContent>
      <DialogActions>
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

export const CippNhiReportButton = ({ caseData, tenantFilter }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={() => setOpen(true)}
        disabled={!caseData?.CaseId}
        startIcon={<CippIcons.PictureAsPdf />}
      >
        PDF report
      </Button>
      <CippNhiReportDialog
        caseData={caseData}
        tenantFilter={tenantFilter}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default CippNhiReportButton
