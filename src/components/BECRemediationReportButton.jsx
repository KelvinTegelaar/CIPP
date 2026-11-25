import { useState } from 'react'
import { CippIcons } from '../utils/icon-registry'
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
} from '@mui/material'
import { useSettings } from '../hooks/use-settings'
import { useBrandingQuery } from './CippPdf/useBrandingSettings'
import { ServerPdfPane, useServerPdf } from './CippPdf/useServerPdf'

// The report PDF is rendered server-side (ExecGetBecReportPdf) by the shared CIPPSharp component kit,
// which reads the stored BEC run (BecReports/BecResults) by case id; the dialog fetches the finished
// PDF as a blob for preview and download. A run is identified by its caseId - userId is the fallback
// the server uses to pick the user's newest completed run.
export const BECReportDialog = ({
  tenantFilter,
  caseId,
  userId,
  userName,
  userDisplayName,
  open,
  onClose,
}) => {
  // 'full' = the complete report; 'summary' = the executive pages only, for a C-suite reader.
  const [variant, setVariant] = useState('full')
  const { branding, ready: brandingReady } = useBrandingQuery()

  const params = new URLSearchParams({
    tenantFilter: tenantFilter ?? '',
    caseId: caseId ?? '',
    userId: userId ?? '',
    userName: userName ?? '',
    userDisplayName: userDisplayName ?? '',
    variant,
    brandingPresetId:
      branding?.reportDefaults?.[
        variant === 'summary' ? 'becSummary' : 'bec'
      ] ?? '',
  })
  const pdf = useServerPdf({
    url: `/api/ExecGetBecReportPdf?${params}`,
    enabled: open && brandingReady,
  })
  const fileName = `BEC_${variant === 'summary' ? 'Summary' : 'Report'}_${(userName || 'user').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: '90vh',
          },
        },
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
            BEC Remediation Report Preview
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={variant}
              onChange={(event, value) => value && setVariant(value)}
            >
              <ToggleButton value="summary">C-suite summary</ToggleButton>
              <ToggleButton value="full">Full report</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={onClose} size="small">
              <CippIcons.Close />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <ServerPdfPane
          {...pdf}
          loading={pdf.loading || !brandingReady}
          title={`BEC Remediation Report - ${userDisplayName || userName || ''}`}
          errorText="The report could not be generated. Ensure the BEC check has completed for this user."
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

export const BECRemediationReportButton = ({
  userData,
  becData,
  tenantFilter,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const currentTenant = useSettings().currentTenant

  // Only offer the report once the BEC analysis has completed (its result is what the server reads).
  const hasData = userData && becData && !becData.Waiting

  if (!hasData) {
    return null // Don't show button if data isn't ready
  }

  return (
    <>
      <Tooltip title="Generate BEC Remediation Report PDF">
        <Button
          variant="contained"
          startIcon={<CippIcons.PictureAsPdf />}
          onClick={() => setDialogOpen(true)}
          color="primary"
        >
          Generate PDF Report
        </Button>
      </Tooltip>
      <BECReportDialog
        tenantFilter={tenantFilter ?? currentTenant}
        caseId={becData?.CaseId ?? becData?.Run?.CaseId}
        userId={userData?.id ?? userData?.userId}
        userName={userData?.userPrincipalName}
        userDisplayName={userData?.displayName}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
