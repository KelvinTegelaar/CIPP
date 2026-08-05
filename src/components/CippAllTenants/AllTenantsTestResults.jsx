import { useMemo } from 'react'
import { Card, CardContent, Skeleton, Stack, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { EyeIcon } from '@heroicons/react/24/outline'
import { ApiGetCall } from '../../api/ApiCall.jsx'
import { getCippError } from '../../utils/get-cipp-error'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippTestDetailOffCanvas } from '../CippTestDetail/CippTestDetailOffCanvas'
import { AllTenantsStatTile } from './AllTenantsPrimitives'
import { asArray } from './useAllTenantsDashboard'

/**
 * Detail pane for one test result row. The estate-wide list is fetched summaryOnly (no
 * ResultMarkdown/ResultDataJson), so the full row — a PartitionKey+RowKey point read — is fetched
 * here on demand, only when a row is opened.
 */
const LazyTestDetail = ({ row }) => {
  const detailApi = ApiGetCall({
    url: '/api/ListTestResultsTenants',
    data: { tenantFilter: row.Tenant, testId: row.RowKey },
    queryKey: `TestResultDetail-${row.Tenant}-${row.RowKey}`,
  })

  if (detailApi.isLoading) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={160} />
        <Skeleton variant="rounded" height={80} />
      </Stack>
    )
  }

  if (detailApi.isError) {
    return (
      <Typography variant="body2" color="error" sx={{ p: 2 }}>
        {getCippError(detailApi.error)}
      </Typography>
    )
  }

  const detail = asArray(detailApi.data)[0]
  return <CippTestDetailOffCanvas row={detail ? { ...row, ...detail } : row} />
}

const STATUS_RISK_FILTERS = [
  { filterName: 'Failed', value: [{ id: 'Status', value: 'Failed' }], type: 'column' },
  { filterName: 'Passed', value: [{ id: 'Status', value: 'Passed' }], type: 'column' },
  { filterName: 'Investigate', value: [{ id: 'Status', value: 'Investigate' }], type: 'column' },
  { filterName: 'Skipped', value: [{ id: 'Status', value: 'Skipped' }], type: 'column' },
  { filterName: 'High Risk', value: [{ id: 'Risk', value: 'High' }], type: 'column' },
  { filterName: 'Medium Risk', value: [{ id: 'Risk', value: 'Medium' }], type: 'column' },
  { filterName: 'Low Risk', value: [{ id: 'Risk', value: 'Low' }], type: 'column' },
]

/**
 * Cross-tenant test results for one test type, rendered by the Identity / Devices / Custom
 * dashboard tabs when the tenant selector is on AllTenants. Reads precomputed results from the
 * CippTestResults table (summaryOnly projection — no live Graph calls, no result blobs); the
 * per-row detail off-canvas lazily fetches the full row.
 */
export const AllTenantsTestResults = ({ testType, title, perTenantPath }) => {
  const reportApi = ApiGetCall({
    url: '/api/ListTestResultsTenants',
    data: { tenantFilter: 'AllTenants', testType, summaryOnly: 'true' },
    queryKey: `AllTenants-TestResults-${testType}`,
  })

  const rows = useMemo(() => asArray(reportApi.data), [reportApi.data])

  const stats = useMemo(() => {
    const failed = rows.filter((row) => row.Status === 'Failed')
    const passed = rows.filter((row) => row.Status === 'Passed')
    const decided = failed.length + passed.length
    return {
      failed: failed.length,
      tenantsFailing: new Set(failed.map((row) => row.Tenant)).size,
      tenantsTotal: new Set(rows.map((row) => row.Tenant)).size,
      highRisk: failed.filter((row) => String(row.Risk ?? '').toLowerCase() === 'high').length,
      passRate: decided > 0 ? Math.round((passed.length / decided) * 100) : null,
    }
  }, [rows])

  if (reportApi.isError) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="error" sx={{ py: 2, textAlign: 'center' }}>
            {getCippError(reportApi.error)}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AllTenantsStatTile
            isFetching={reportApi.isLoading}
            severity={stats.tenantsFailing ? 'warning' : 'ok'}
            value={stats.tenantsFailing}
            label="Tenants failing a check"
            meta={`of ${stats.tenantsTotal} with results`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AllTenantsStatTile
            isFetching={reportApi.isLoading}
            severity={stats.failed ? 'warning' : 'ok'}
            value={stats.failed}
            label="Failed checks"
            meta={`${rows.length} results across the estate`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AllTenantsStatTile
            isFetching={reportApi.isLoading}
            severity={stats.highRisk ? 'critical' : 'ok'}
            value={stats.highRisk}
            label="High-risk failures"
            meta="Failed checks with high risk"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AllTenantsStatTile
            isFetching={reportApi.isLoading}
            severity={
              stats.passRate === null
                ? 'neutral'
                : stats.passRate >= 90
                  ? 'ok'
                  : stats.passRate >= 70
                    ? 'warning'
                    : 'critical'
            }
            value={stats.passRate === null ? '—' : `${stats.passRate}%`}
            label="Pass rate"
            meta="Passed vs failed"
          />
        </Grid>
      </Grid>

      <CippDataTable
        title={title}
        data={rows}
        isFetching={reportApi.isLoading}
        refreshFunction={reportApi}
        simpleColumns={['TenantName', 'Name', 'Suite', 'Status', 'Risk', 'Category', 'LastRun']}
        filters={STATUS_RISK_FILTERS}
        offCanvas={{ size: 'lg', children: (row) => <LazyTestDetail row={row} /> }}
        offCanvasOnRowClick={true}
        actions={
          perTenantPath
            ? [
                {
                  label: 'View tenant dashboard',
                  link: `${perTenantPath}?tenantFilter=[Tenant]`,
                  icon: <EyeIcon />,
                },
              ]
            : []
        }
        maxHeightOffset="600px"
      />
    </Stack>
  )
}
