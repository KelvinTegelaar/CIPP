import PropTypes from 'prop-types'
import { Alert, Box, Skeleton, Stack, Typography } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippDataTable } from '../CippTable/CippDataTable'
import { getCippError } from '../../utils/get-cipp-error'
import { CippIcons } from '../../utils/icon-registry'

/**
 * Drill-down for one failing Intune configuration policy: its failing settings (with the other
 * policies involved in a conflict) and the devices in Error or Conflict. Loads when the row opens.
 */
export const CippIntunePolicyFailureDetails = ({ row, tenant }) => {
  const policyId = row?.id
  const request = ApiGetCall({
    url: '/api/ListIntunePolicyFailures',
    data: { tenantFilter: tenant, policyId, policyBaseTypeName: row?.PolicyBaseTypeName },
    queryKey: `IntunePolicyFailures-${tenant}-${policyId}`,
    waiting: Boolean(policyId && tenant),
  })

  if (request.isFetching && !request.isSuccess) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={160} />
      </Box>
    )
  }

  if (request.isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {getCippError(request.error) || 'Unable to load the policy failure details.'}
        </Alert>
      </Box>
    )
  }

  const results = request.data?.Results ?? {}
  const settings = (results.settings ?? []).map((setting) => ({
    ...setting,
    id: setting.settingName,
    conflictingPolicies: (setting.conflictingPolicies ?? []).join(', '),
  }))
  const devices = (results.devices ?? []).map((device) => ({ ...device, id: device.IntuneDeviceId }))
  const errors = Object.values(results.errors ?? {})

  const deviceActions = [
    {
      label: 'View Device',
      link: '/endpoint/MEM/devices/device?deviceId=[IntuneDeviceId]',
      color: 'info',
      icon: <CippIcons.EyeIcon />,
      multiPost: false,
    },
    {
      label: 'View in Intune',
      link: `https://intune.microsoft.com/${tenant}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[IntuneDeviceId]`,
      color: 'info',
      icon: <CippIcons.EyeIcon />,
      target: '_blank',
      multiPost: false,
      external: true,
    },
  ]

  return (
    <Stack spacing={2}>
      {errors.map((message) => (
        <Alert key={message} severity="warning">
          {message}
        </Alert>
      ))}
      {/* noCard drops the card header, so the section titles sit above each table */}
      <Typography variant="subtitle1">Failing Settings</Typography>
      <CippDataTable
        noCard
        title="Failing Settings"
        data={settings}
        simpleColumns={['settingName', 'errorDevices', 'conflictDevices', 'conflictingPolicies']}
        isFetching={request.isFetching}
        refreshFunction={() => request.refetch()}
      />
      <Typography variant="subtitle1">Devices</Typography>
      <CippDataTable
        noCard
        title="Devices"
        data={devices}
        simpleColumns={['DeviceName', 'UPN', 'ReportStatus', 'PspdpuLastModifiedTimeUtc']}
        actions={deviceActions}
        isFetching={request.isFetching}
        refreshFunction={() => request.refetch()}
      />
    </Stack>
  )
}

CippIntunePolicyFailureDetails.propTypes = {
  row: PropTypes.object,
  tenant: PropTypes.string,
}

export default CippIntunePolicyFailureDetails
