import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
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

const RISK_FILTERS = [
  {
    filterName: 'High Risk',
    value: [{ id: 'Risk', value: 'High' }],
    type: 'column',
  },
  {
    filterName: 'Medium Risk',
    value: [{ id: 'Risk', value: 'Medium' }],
    type: 'column',
  },
  {
    filterName: 'Low Risk',
    value: [{ id: 'Risk', value: 'Low' }],
    type: 'column',
  },
]

const TRIAGE_FILTERS = [
  {
    filterName: 'Failed',
    value: [{ id: 'Status', value: 'Failed' }],
    type: 'column',
  },
  {
    filterName: 'Investigate',
    value: [{ id: 'Status', value: 'Investigate' }],
    type: 'column',
  },
  ...RISK_FILTERS,
]

const ALL_STATUS_FILTERS = [
  {
    filterName: 'Failed',
    value: [{ id: 'Status', value: 'Failed' }],
    type: 'column',
  },
  {
    filterName: 'Passed',
    value: [{ id: 'Status', value: 'Passed' }],
    type: 'column',
  },
  {
    filterName: 'Investigate',
    value: [{ id: 'Status', value: 'Investigate' }],
    type: 'column',
  },
  {
    filterName: 'Skipped',
    value: [{ id: 'Status', value: 'Skipped' }],
    type: 'column',
  },
  ...RISK_FILTERS,
]

/**
 * Cross-tenant test results for one test type, rendered by the Identity / Devices / Custom
 * dashboard tabs when the tenant selector is on AllTenants.
 *
 * Reads precomputed results from the CippTestResults table — no live Graph calls. The scale
 * levers, learned the hard way on large estates: rows come back summaryOnly (no result blobs),
 * only Failed/Investigate rows are returned by default (rowStatus) while the tiles stay accurate
 * via server-side counts over every status (includeCounts), and the per-row detail off-canvas
 * lazily fetches the full single row. "Show all results" opts into the full row set.
 */
export const AllTenantsTestResults = ({ testType, title, perTenantPath }) => {
  const [showAll, setShowAll] = useState(false)

  const reportApi = ApiGetCall({
    url: '/api/ListTestResultsTenants',
    data: {
      tenantFilter: 'AllTenants',
      testType,
      summaryOnly: 'true',
      includeCounts: 'true',
      ...(showAll ? {} : { rowStatus: 'Failed,Investigate' }),
    },
    queryKey: `AllTenants-TestResults-${testType}-${showAll ? 'all' : 'triage'}`,
  })

  const rows = useMemo(() => asArray(reportApi.data), [reportApi.data])
  const counts = reportApi.data?.Counts

  const stats = useMemo(() => {
    const passed = Number(counts?.Passed ?? 0)
    const failed = Number(counts?.Failed ?? 0)
    const decided = passed + failed
    return {
      failed,
      totalResults: Number(counts?.TotalResults ?? 0),
      tenantsFailing: Number(counts?.TenantsFailing ?? 0),
      tenantsTotal: Number(counts?.TenantsWithResults ?? 0),
      highRisk: Number(counts?.HighRiskFailed ?? 0),
      passRate: decided > 0 ? Math.round((passed / decided) * 100) : null,
    }
  }, [counts])

  if (reportApi.isError) {
    return (
      <Card>
        <CardContent>
          <Typography
            variant="body2"
            color="error"
            sx={{ py: 2, textAlign: 'center' }}
          >
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
            meta={`${stats.totalResults.toLocaleString()} results across the estate`}
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
        title={showAll ? title : `${title} — failed & investigate`}
        data={rows}
        isFetching={reportApi.isLoading}
        refreshFunction={reportApi}
        cardButton={
          <Button
            size="small"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? 'Show failed & investigate only' : 'Show all results'}
          </Button>
        }
        simpleColumns={[
          'TenantName',
          'Name',
          'Suite',
          'Status',
          'Risk',
          'Category',
          'LastRun',
        ]}
        filters={showAll ? ALL_STATUS_FILTERS : TRIAGE_FILTERS}
        offCanvas={{
          size: 'lg',
          children: (row) => <LazyTestDetail row={row} />,
        }}
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
