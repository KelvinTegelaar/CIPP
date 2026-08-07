import { Alert, CircularProgress, Stack, Typography } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippCodeBlock } from './CippCodeBlock'

// More-info panel for a live custom Sensitive Information Type: looks up its rule pack by RulePackId and
// shows what it actually detects (parsed configuration + the raw ClassificationRuleCollection XML).
export const CippSitRulePackDetails = ({ row, tenant }) => {
  const isCustom = Boolean(row?.Publisher) && !String(row.Publisher).startsWith('Microsoft')
  // Only classic regex/keyword (Entity) SITs have an inspectable rule configuration.
  const isEntity = row?.Type === 'Entity'
  const shouldShow = isCustom && isEntity
  const tenantFilter = tenant === 'AllTenants' && row?.Tenant ? row.Tenant : tenant

  const rulePack = ApiGetCall({
    url: '/api/ListSensitiveInfoTypeRulePackage',
    queryKey: `SitRulePack-${tenantFilter}-${row?.RulePackId}`,
    data: { tenantFilter, RulePackId: row?.RulePackId },
    waiting: Boolean(shouldShow && tenantFilter && row?.RulePackId),
    retry: 1,
    refetchOnWindowFocus: false,
    toast: false,
  })

  if (!shouldShow) {
    return null
  }

  if (rulePack.isLoading || rulePack.isFetching) {
    return (
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Looking up rule pack {row?.RulePackId}...
        </Typography>
      </Stack>
    )
  }

  if (rulePack.isError || !rulePack.data?.Xml) {
    return (
      <Alert severity="warning" variant="outlined">
        Could not load the rule pack configuration for this Sensitive Information Type.
      </Alert>
    )
  }

  const data = rulePack.data
  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Typography variant="subtitle2">Detection configuration</Typography>
      <CippCodeBlock
        code={JSON.stringify(data.Configuration ?? {}, null, 2)}
        language="json"
        type="syntax"
      />
      <Typography variant="subtitle2">Rule pack XML ({data.RulePackId})</Typography>
      <CippCodeBlock code={data.Xml} language="xml" type="editor" readOnly editorHeight="400px" />
    </Stack>
  )
}
