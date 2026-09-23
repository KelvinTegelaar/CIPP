import { Button, Tooltip } from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { useBecEvidenceDownload } from './CippBecEvidenceDownload'

/**
 * Export evidence from the case page: renders both report PDFs in the browser, posts them to the
 * backend which collates the package into a ZIP, and downloads it. There is no results panel; any
 * error shows in the button's hover tooltip, so the control stays a single button in the action row.
 */
export const CippBecEvidenceExportButton = ({
  tenantFilter,
  caseId,
  userData,
  becData,
}) => {
  const { download, busy, lastError } = useBecEvidenceDownload()

  const tooltip = busy
    ? 'Building evidence package…'
    : lastError
      ? `Last export failed: ${lastError}`
      : 'Renders both report PDFs and packages the case evidence as a ZIP'

  return (
    <Tooltip title={tooltip}>
      <span>
        <Button
          size="small"
          variant="outlined"
          color={lastError ? 'error' : 'primary'}
          startIcon={<CippIcons.Archive />}
          onClick={() =>
            download(
              {
                CaseId: caseId,
                Tenant: tenantFilter,
                UserId: userData?.id,
                UserPrincipalName: userData?.userPrincipalName,
                DisplayName: userData?.displayName,
              },
              becData
            )
          }
          disabled={busy || !caseId}
        >
          {busy ? 'Building evidence package…' : 'Export evidence (ZIP)'}
        </Button>
      </span>
    </Tooltip>
  )
}

export default CippBecEvidenceExportButton
