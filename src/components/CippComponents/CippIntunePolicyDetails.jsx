import { Alert, CircularProgress, Stack, Typography } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import CippJsonView from '../CippFormPages/CippJSONView'

export const CippIntunePolicyDetails = ({ row, tenant }) => {
  const isConfigurationPolicy = row?.URLName?.toLowerCase() === 'configurationpolicies'
  const isAdministrativeTemplate = row?.URLName?.toLowerCase() === 'grouppolicyconfigurations'
  const isSupportedPolicyType = isConfigurationPolicy || isAdministrativeTemplate
  const urlName = isAdministrativeTemplate ? 'groupPolicyConfigurations' : 'configurationPolicies'
  const policyTypeLabel = isAdministrativeTemplate ? 'Administrative Template' : 'Settings Catalog'
  const tenantFilter = tenant === 'AllTenants' && row?.Tenant ? row.Tenant : tenant

  const policyDetails = ApiGetCall({
    url: '/api/ListIntunePolicy',
    queryKey: `ListIntunePolicyDetails-${urlName}-${tenantFilter}-${row?.id}`,
    data: {
      TenantFilter: tenantFilter,
      ID: row?.id,
      URLName: urlName,
      IncludeSettingDefinitions: true,
    },
    waiting: Boolean(isSupportedPolicyType && tenantFilter && row?.id),
    retry: 1,
    refetchOnWindowFocus: false,
    toast: false,
  })

  if (!isSupportedPolicyType) {
    return null
  }

  const details = Array.isArray(policyDetails.data) ? policyDetails.data[0] : policyDetails.data
  const fallbackDetails = row?.settings || row?.definitionValues ? row : null
  const settingsObject = details?.settings || details?.definitionValues ? details : fallbackDetails

  if (policyDetails.isLoading || policyDetails.isFetching) {
    return (
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Loading policy details and Microsoft descriptions...
        </Typography>
      </Stack>
    )
  }

  if (policyDetails.isError && !settingsObject) {
    return (
      <Alert severity="warning" variant="outlined">
        Could not load live {policyTypeLabel} details for this policy.
      </Alert>
    )
  }

  if (!settingsObject) {
    return (
      <Alert severity="info" variant="outlined">
        This {policyTypeLabel} policy did not return any settings.
      </Alert>
    )
  }

  return <CippJsonView object={settingsObject} type="intune" defaultOpen title="Policy Settings" />
}
