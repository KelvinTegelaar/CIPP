import { useEffect, useMemo } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { ApiPostCall } from '../../api/ApiCall'
import CippJsonView from '../CippFormPages/CippJSONView'
import { CippPolicyDiffTable } from './CippPolicyDiffTable'

/**
 * Live "compare to baseline" for a standard backed by an Intune template.
 *
 * The drift and standards pages know which template a standard points at but not which policy it
 * landed on in the tenant, so the tenant side is resolved server-side by the template's display
 * name - the same lookup the IntuneTemplate standard itself performs. The baseline side is sent
 * with the tenant so it goes through the standard's reusable-settings sync and text replacement,
 * which is what makes the differences shown here match what drift reports.
 */
export const CippPolicyCompareDialog = ({
  open,
  onClose,
  tenantFilter,
  templateGuid,
  templateName,
  standardsTemplateId,
}) => {
  const compareApi = ApiPostCall({ relatedQueryKeys: [] })

  useEffect(() => {
    if (!open || !tenantFilter || !templateGuid) return
    compareApi.mutate({
      url: '/api/ExecCompareIntunePolicy',
      data: {
        sourceA: { type: 'template', templateGuid, tenantFilter },
        // standardsTemplateId lets the lookup honour the standard's fuzzy match setting, so the
        // comparison targets the policy remediation would actually overwrite.
        sourceB: { type: 'tenantPolicyByTemplate', templateGuid, tenantFilter, standardsTemplateId },
      },
    })
    // Refire on every open so the comparison is always against the tenant's current state.
  }, [open, tenantFilter, templateGuid, standardsTemplateId])

  const results = useMemo(() => {
    if (!compareApi.isSuccess) return null
    return compareApi.data?.data || compareApi.data
  }, [compareApi.isSuccess, compareApi.data])

  const errorMessage = useMemo(() => {
    if (!compareApi.isError) return null
    const errData = compareApi.error?.response?.data
    return errData?.Results || compareApi.error?.message || 'An error occurred'
  }, [compareApi.isError, compareApi.error])

  const comparisonRows = useMemo(() => {
    const raw = results?.Results
    const rows = Array.isArray(raw) ? raw : raw ? [raw] : []
    return rows.filter((row) => row && typeof row === 'object')
  }, [results?.Results])

  const handleClose = () => {
    compareApi.reset()
    onClose()
  }

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
      <DialogTitle>Compare to baseline{templateName ? ` - ${templateName}` : ''}</DialogTitle>
      <DialogContent dividers>
        {compareApi.isPending && (
          <Stack spacing={2}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        )}

        {errorMessage && (
          <Alert severity="error" icon={<CippIcons.Error />}>
            {errorMessage}
          </Alert>
        )}

        {results && (
          <Stack spacing={3}>
            {results.policyMissing ? (
              <Alert severity="warning" icon={<CippIcons.PolicyOutlined />}>
                <AlertTitle>Not deployed to {tenantFilter}</AlertTitle>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  No Intune policy named{' '}
                  <Box component="strong">
                    {results.missingPolicyName || templateName || 'this policy'}
                  </Box>{' '}
                  exists in this tenant, so there is nothing to compare against. This is why the
                  standard reports it as non-compliant.
                </Typography>
                <Typography variant="body2">
                  {results.fuzzyDistance > 0
                    ? `No similarly named policy was found either - this standard allows a name to differ by up to ${results.fuzzyDistance} character${results.fuzzyDistance === 1 ? '' : 's'}. The baseline below is what gets created when the standard next remediates.`
                    : 'This standard matches a tenant policy by exact display name, so a policy that was renamed in the tenant shows up here too. Raising the fuzzy match distance on the standard would let it match a renamed policy. Otherwise the baseline below is what gets created when the standard next remediates.'}
                </Typography>
              </Alert>
            ) : (
              <Alert
                severity={results.identical ? 'success' : 'warning'}
                icon={results.identical ? <CippIcons.CheckCircle /> : <CippIcons.CompareArrows />}
              >
                {results.identical
                  ? 'The tenant policy matches the baseline template - no differences found.'
                  : `${comparisonRows.length} difference${
                      comparisonRows.length === 1 ? '' : 's'
                    } between the baseline template and the tenant policy.`}
              </Alert>
            )}

            {results.matchType === 'fuzzy' && (
              <Alert severity="info" icon={<CippIcons.Info />}>
                <AlertTitle>Matched by similar name</AlertTitle>
                No policy exactly named{' '}
                <Box component="strong">{templateName || 'the template'}</Box> exists in this tenant,
                so this compares against{' '}
                <Box component="strong">{results.matchedName}</Box> - the policy the standard&apos;s
                fuzzy match setting would overwrite on the next remediation.
              </Alert>
            )}

            {results.assignmentComparison?.matched === false && (
              <Alert severity="warning" icon={<CippIcons.CompareArrows />}>
                <AlertTitle>Assignments differ</AlertTitle>
                The comparison above covers the policy settings only. This
                standard also verifies assignments, and they do not match what
                the standard expects, which is why the drift report still lists
                this policy as a deviation:
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                  {(results.assignmentComparison.reasons || []).map(
                    (reason, index) => (
                      <li key={index}>{reason}</li>
                    )
                  )}
                </Box>
              </Alert>
            )}

            {!results.identical && comparisonRows.length > 0 && (
              <CippPolicyDiffTable rows={comparisonRows} labelA="Baseline" labelB="Tenant" />
            )}

            {results.sourceAData && (
              <CippJsonView
                object={results.sourceAData}
                type="intune"
                title={
                  results.policyMissing
                    ? `Baseline template, not yet in the tenant - ${results.sourceALabel}`
                    : `Baseline template - ${results.sourceALabel}`
                }
              />
            )}

            {results.sourceBData && (
              <CippJsonView
                object={results.sourceBData}
                type="intune"
                title={`Tenant policy - ${results.sourceBLabel}`}
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CippPolicyCompareDialog
