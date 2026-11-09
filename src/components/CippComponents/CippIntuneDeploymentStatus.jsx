import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { Alert, Box, Chip, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippDataTable } from '../CippTable/CippDataTable'
import { getCippError } from '../../utils/get-cipp-error'

const statusColor = (status) => {
  const text = `${status}`.toLowerCase()
  if (/error|fail|conflict|non compliant|flagged/.test(text)) return 'error'
  if (/pending|progress|grace/.test(text)) return 'warning'
  if (/^(succeeded|success|installed|compliant|checked in|remediated)$/.test(text)) return 'success'
  return 'default'
}

const TABS = {
  Devices: ['DeviceName', 'UserPrincipalName', 'Status', 'StatusDetail', 'Platform', 'LastReported'],
  Users: ['UserPrincipalName', 'UserName', 'Status', 'StatusDetail', 'DeviceCount', 'LastReported'],
}

// Device and user deployment status of one Intune app, policy or script, for list-page drawers.
// type is the Graph collection (defaults to the row's URLName); null Devices/Users means Intune has no status for that side.
// The apps list uses ListAppDeploymentStatus so application-only roles can read it.
export const CippIntuneDeploymentStatus = ({
  row,
  tenant,
  type,
  url = '/api/ListIntuneDeploymentStatus',
}) => {
  const [tab, setTab] = useState(0)
  const statusType = type ?? row?.URLName
  const tenantFilter = tenant === 'AllTenants' && row?.Tenant ? row.Tenant : tenant
  const canFetch = Boolean(statusType && row?.id && tenantFilter && tenantFilter !== 'AllTenants')

  const status = ApiGetCall({
    url,
    queryKey: `IntuneDeploymentStatus-${statusType}-${tenantFilter}-${row?.id}`,
    data: { tenantFilter, ID: row?.id, Type: statusType },
    waiting: canFetch,
    retry: 1,
    refetchOnWindowFocus: false,
    toast: false,
  })

  const tabs = useMemo(() => {
    const results = status.data?.Results
    return Object.keys(TABS)
      .filter((name) => Array.isArray(results?.[name]))
      .map((name) => ({ name, rows: results[name] }))
  }, [status.data])

  const active = tabs[Math.min(tab, tabs.length - 1)]
  const counts = useMemo(() => {
    const byStatus = {}
    for (const item of active?.rows ?? []) byStatus[item.Status] = (byStatus[item.Status] ?? 0) + 1
    return Object.entries(byStatus).sort((a, b) => b[1] - a[1])
  }, [active])

  if (!canFetch) return null

  let body
  if (status.isLoading || (status.isFetching && !status.isSuccess)) {
    body = <Skeleton variant="rounded" height={120} />
  } else if (status.isError) {
    body = (
      <Alert severity="warning" variant="outlined">
        {getCippError(status.error) || 'Could not load deployment status.'}
      </Alert>
    )
  } else if (tabs.length === 0) {
    body = (
      <Alert severity="info" variant="outlined">
        Intune has no deployment status for this type.
      </Alert>
    )
  } else {
    body = (
      <>
        <Tabs value={tabs.indexOf(active)} onChange={(_, value) => setTab(value)}>
          {tabs.map(({ name, rows }) => (
            <Tab key={name} label={`${name} (${rows.length})`} />
          ))}
        </Tabs>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', py: 1.5 }}>
          {counts.map(([label, count]) => (
            <Chip key={label} size="small" color={statusColor(label)} label={`${label}: ${count}`} />
          ))}
        </Stack>
        <CippDataTable
          key={active.name}
          title={`${active.name} deployment status`}
          hideTitle
          noCard
          data={active.rows}
          simpleColumns={TABS[active.name]}
          isFetching={status.isFetching}
          refreshFunction={() => status.refetch()}
        />
      </>
    )
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Deployment Status
      </Typography>
      {body}
    </Box>
  )
}

CippIntuneDeploymentStatus.propTypes = {
  row: PropTypes.object,
  tenant: PropTypes.string,
  type: PropTypes.string,
  url: PropTypes.string,
}
