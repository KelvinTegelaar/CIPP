import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Alert,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippTimeAgo } from './CippTimeAgo'
import { CippIcons } from '../../utils/icon-registry'

const STATUS_COLORS = {
  Applies: 'success',
  'Applies if the filter matches': 'info',
  Excluded: 'default',
}

const cellRenderers = {
  status: (row) => (
    <Chip
      size="small"
      variant="outlined"
      label={row.status}
      color={STATUS_COLORS[row.status] ?? 'warning'}
    />
  ),
}

const columns = [
  'category',
  'displayName',
  'status',
  'intent',
  'assignedVia',
  'excludedVia',
  'filter',
  'type',
]

// The CIPP list each kind of Intune object is managed from.
const policyPage = (row) => {
  switch (row.category) {
    case 'Intune Compliance Policy':
      return '/endpoint/MEM/list-compliance-policies'
    case 'Intune App Protection Policy':
    case 'Intune App Configuration Policy':
      return '/endpoint/MEM/list-appprotection-policies'
    case 'Intune Application':
      return '/endpoint/applications/list'
    case 'Intune Platform Script':
    case 'Intune Remediation Script':
      return '/endpoint/MEM/list-scripts'
    case 'Autopilot Deployment Profile':
      return '/endpoint/autopilot/enrollment-profiles'
    case 'Apple Enrollment Profile':
      return '/endpoint/autopilot/enrollment-profiles/apple-ade'
    case 'Intune Enrollment Configuration':
      return row.type === 'windows10EnrollmentCompletionPageConfiguration'
        ? '/endpoint/autopilot/list-status-pages'
        : '/endpoint/autopilot/enrollment-restrictions'
    default:
      return '/endpoint/MEM/list-policies'
  }
}

// Every Intune policy, app and profile assigned to one user, group or managed device.
export const CippIntuneAssignmentsTable = ({
  tenantFilter,
  type,
  id,
  allowNested = false,
}) => {
  const router = useRouter()
  const [includeNested, setIncludeNested] = useState(false)
  const actions = useMemo(
    () => [
      {
        label: 'View policy',
        icon: <CippIcons.Visibility />,
        noConfirm: true,
        customFunction: (row) => router.push(row.policyLink),
      },
    ],
    [router]
  )
  const request = ApiGetCall({
    url: '/api/ListIntuneAssignments',
    data: { tenantFilter, type, id, includeNested },
    queryKey: `IntuneAssignments-${tenantFilter}-${type}-${id}-${includeNested}`,
    waiting: Boolean(tenantFilter && id),
  })
  const rows = useMemo(
    () =>
      (Array.isArray(request.data) ? request.data : []).map((row) => ({
        ...row,
        policyLink: `${policyPage(row)}?tenantFilter=${encodeURIComponent(tenantFilter)}&search=${encodeURIComponent(row.displayName ?? '')}`,
      })),
    [request.data, tenantFilter]
  )
  const cachedAt = rows[0]?.CacheTimestamp

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Policies come from the Intune data CIPP collects each day
          {cachedAt ? (
            <>
              {' '}
              (last collected <CippTimeAgo data={cachedAt} />)
            </>
          ) : null}
          . Group memberships are checked live. Assignment filters are shown but
          not evaluated.
        </Typography>
        {allowNested && (
          <FormControlLabel
            control={
              <Switch
                checked={includeNested}
                onChange={(event) => setIncludeNested(event.target.checked)}
              />
            }
            label="Include groups this group is nested in"
          />
        )}
      </Stack>
      {request.isError && (
        <Alert severity="warning">
          {request.error?.response?.data?.Results ??
            'Could not load the Intune assignments.'}
        </Alert>
      )}
      <CippDataTable
        title="Intune Assignments"
        data={rows}
        isFetching={request.isFetching}
        refreshFunction={request}
        simpleColumns={columns}
        actions={actions}
        cellRenderers={cellRenderers}
        defaultSorting={[{ id: 'category', desc: false }]}
      />
    </Stack>
  )
}

export default CippIntuneAssignmentsTable
