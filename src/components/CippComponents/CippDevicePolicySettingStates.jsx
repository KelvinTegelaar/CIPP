import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  FormControlLabel,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippDataTable } from '../CippTable/CippDataTable'
import { getCippError } from '../../utils/get-cipp-error'

const FAIL_SORT_PRIORITY = {
  noncompliant: 0,
  error: 1,
  conflict: 2,
}

const FAIL_STATES = new Set(['noncompliant', 'error', 'conflict'])

const isFailingState = (state) => FAIL_STATES.has(String(state ?? '').toLowerCase())

const sortSettingStates = (rows) =>
  [...rows].sort((a, b) => {
    const aPriority = FAIL_SORT_PRIORITY[String(a.state ?? '').toLowerCase()] ?? 10
    const bPriority = FAIL_SORT_PRIORITY[String(b.state ?? '').toLowerCase()] ?? 10
    if (aPriority !== bPriority) return aPriority - bPriority
    const aName = a.settingName || a.setting || ''
    const bName = b.settingName || b.setting || ''
    return aName.localeCompare(bName)
  })

const formatSources = (sources) => {
  if (!Array.isArray(sources) || sources.length === 0) return ''
  return sources
    .map((source) => source?.displayName)
    .filter(Boolean)
    .join(', ')
}

/**
 * Lazy-loaded setting states for an Intune compliance or configuration policy
 * on a managed device. Mount only when the parent policy card is expanded.
 */
export const CippDevicePolicySettingStates = ({
  deviceId,
  policyStateId,
  tenantFilter,
  statesCollection,
}) => {
  const [showAll, setShowAll] = useState(false)
  const canFetch = Boolean(deviceId && policyStateId && tenantFilter && statesCollection)

  const settingStatesRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `deviceManagement/managedDevices/${deviceId}/${statesCollection}/${policyStateId}/settingStates`,
      tenantFilter,
    },
    queryKey: `DevicePolicySettingStates-${statesCollection}-${deviceId}-${policyStateId}-${tenantFilter}`,
    waiting: canFetch,
  })

  const rows = useMemo(() => {
    if (!settingStatesRequest.isSuccess) return []
    const results = settingStatesRequest.data?.Results
    const rawRows = Array.isArray(results) ? results : results ? [results] : []
    return sortSettingStates(rawRows).map((row, index) => ({
      ...row,
      id: row.id || `${row.settingInstanceId || row.setting || 'setting'}-${index}`,
      settingName: row.settingName || row.setting || 'Unknown setting',
      complianceState: row.state,
      sourcesDisplay: formatSources(row.sources),
    }))
  }, [settingStatesRequest.isSuccess, settingStatesRequest.data])

  const failingRows = useMemo(() => rows.filter((row) => isFailingState(row.state)), [rows])
  const displayRows = showAll ? rows : failingRows

  if (!canFetch) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">Policy setting states cannot be loaded for this policy.</Alert>
      </Box>
    )
  }

  if (settingStatesRequest.isFetching && !settingStatesRequest.isSuccess) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={120} />
      </Box>
    )
  }

  if (settingStatesRequest.isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {getCippError(settingStatesRequest.error) ||
            'Unable to load setting states. Try expanding this policy again.'}
        </Alert>
      </Box>
    )
  }

  if (rows.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No setting states returned for this policy.
        </Typography>
      </Box>
    )
  }

  const filterControls = (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        px: 2,
        pt: 2,
        pb: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {failingRows.length} failing of {rows.length} settings
      </Typography>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={showAll}
            onChange={(event) => setShowAll(event.target.checked)}
          />
        }
        label="Show all settings"
      />
    </Stack>
  )

  if (!showAll && failingRows.length === 0) {
    return (
      <Box sx={{ pb: 2 }}>
        {filterControls}
        <Box sx={{ px: 2 }}>
          <Alert severity="success">No failing settings.</Alert>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 2 }}>
      {filterControls}
      <Box sx={{ px: 1 }}>
        <CippDataTable
          title="Setting States"
          hideTitle
          data={displayRows}
          simpleColumns={[
            'settingName',
            'complianceState',
            'currentValue',
            'sourcesDisplay',
            'errorDescription',
          ]}
          isFetching={settingStatesRequest.isFetching}
          refreshFunction={() => settingStatesRequest.refetch()}
        />
      </Box>
    </Box>
  )
}

CippDevicePolicySettingStates.propTypes = {
  deviceId: PropTypes.string.isRequired,
  policyStateId: PropTypes.string.isRequired,
  tenantFilter: PropTypes.string.isRequired,
  statesCollection: PropTypes.oneOf([
    'deviceCompliancePolicyStates',
    'deviceConfigurationStates',
  ]).isRequired,
}

export default CippDevicePolicySettingStates
