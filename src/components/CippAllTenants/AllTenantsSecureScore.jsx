import { useMemo } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import Link from 'next/link'
import { ApiGetCall } from '../../api/ApiCall.jsx'
import { getCippError } from '../../utils/get-cipp-error'
import { CippInfoBar } from '../CippCards/CippInfoBar'
import { CippDataTable } from '../CippTable/CippDataTable'
import { AllTenantsTrendChart, severityColor } from './AllTenantsPrimitives'
import { asArray, deriveSecureScoreSummary } from './useAllTenantsDashboard'

/**
 * Estate-wide secure score, rendered by the secure score tabs when the tenant selector is on
 * AllTenants: the summary on Tenant Overview, the per-tenant table on Table Overview. Built from
 * the nightly-cache report rather than live Graph calls, and shares its query key with the All
 * Tenants dashboard card — both tabs and the dashboard resolve from one request.
 */
const useSecureScoreReport = () => {
  const reportApi = ApiGetCall({
    url: '/api/ListSecureScoreReport',
    data: { tenantFilter: 'AllTenants', includeHistory: 'true' },
    queryKey: 'AllTenantsDashboard-SecureScore',
  })

  const rows = useMemo(() => asArray(reportApi.data), [reportApi.data])
  const summary = useMemo(() => deriveSecureScoreSummary(rows), [rows])

  return { reportApi, rows, summary }
}

const scoreSeverity = (value) => (value >= 75 ? 'ok' : value >= 50 ? 'warning' : 'critical')

/**
 * Ranked tenant rows with a score bar; each row links to that tenant's own secure score view via
 * the tenantFilter query param, which the tenant selector picks up.
 */
const LeaderboardCard = ({ title, subheader, rows, isFetching }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardHeader
      title={title}
      subheader={subheader}
      slotProps={{
        title: { variant: 'h6' },
        subheader: { variant: 'caption' }
      }} />
    <Divider />
    <CardContent sx={{ flex: 1 }}>
      {isFetching ? (
        <Stack spacing={1.5}>
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} variant="rounded" height={40} />
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            py: 2,
            textAlign: 'center'
          }}>
          No scored tenants yet
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {rows.map((row) => (
            <Stack
              key={row.tenant}
              component={Link}
              href={`/tenant/administration/securescore?tenantFilter=${row.tenant}`}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                px: 1,
                py: 0.75,
                borderRadius: 1,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { backgroundColor: 'action.hover' }
              }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                  width: 24,
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums'
                }}>
                #{row.rank}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap title={row.name}>
                  {row.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, row.percent))}
                  sx={{
                    mt: 0.5,
                    height: 4,
                    borderRadius: 5,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: severityColor(scoreSeverity(row.percent)),
                    },
                  }}
                />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                  color: severityColor(scoreSeverity(row.percent)),
                }}
              >
                {row.percent}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
)

const ReportError = ({ error }) => (
  <Card>
    <CardContent>
      <Typography variant="body2" color="error" sx={{ py: 2, textAlign: 'center' }}>
        {getCippError(error)}
      </Typography>
    </CardContent>
  </Card>
)

export const AllTenantsSecureScoreSummary = () => {
  const { reportApi, summary } = useSecureScoreReport()

  if (reportApi.isError) return <ReportError error={reportApi.error} />

  const deltaLabel =
    summary.delta === null ? '—' : `${summary.delta > 0 ? '+' : ''}${summary.delta} pts`

  const infoBarItems = [
    {
      name: 'Portfolio average',
      data: `${summary.average}%`,
      icon: <CippIcons.ShieldCheckIcon />,
      toolTip: `Average of each tenant's latest cached score, across ${summary.scored} tenants`,
    },
    {
      name: summary.trend.length > 1 ? `Change over ${summary.trend.length} days` : 'Change',
      data: deltaLabel,
      icon: summary.delta < 0 ? <CippIcons.ArrowTrendingDownIcon /> : <CippIcons.ArrowTrendingUpIcon />,
      color: summary.delta < 0 ? 'error' : summary.delta > 0 ? 'success' : 'primary',
      toolTip: 'Movement of the portfolio average across the retained history window',
    },
    {
      name: 'Highest',
      data: summary.best ? `${summary.best.percent}%` : '—',
      icon: <CippIcons.TrophyIcon />,
      color: 'success',
      toolTip: summary.best
        ? `${summary.best.name} — ${summary.best.current} of ${summary.best.max} points`
        : 'No scored tenants yet',
    },
    {
      name: 'Lowest',
      data: summary.worst ? `${summary.worst.percent}%` : '—',
      icon: <CippIcons.ExclamationTriangleIcon />,
      color: 'error',
      toolTip: summary.worst
        ? `${summary.worst.name} — ${summary.worst.current} of ${summary.worst.max} points`
        : 'No scored tenants yet',
    },
  ]

  // Ranks are estate-wide (1 = best). The boards never overlap: bottom takes the worst five,
  // top takes whatever best tenants remain on estates smaller than ten.
  const bottomRows = summary.ranked.slice(0, 5).map((row, index) => ({
    ...row,
    rank: summary.ranked.length - index,
  }))
  const topRows = summary.ranked
    .slice(Math.max(5, summary.ranked.length - 5))
    .reverse()
    .map((row, index) => ({ ...row, rank: index + 1 }))

  return (
    <Stack spacing={2}>
      <CippInfoBar isFetching={reportApi.isLoading} data={infoBarItems} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Portfolio trend"
              subheader="Daily average of every tenant's cached score"
              slotProps={{
                title: { variant: 'h6' },
                subheader: { variant: 'caption' }
              }} />
            <Divider />
            <CardContent sx={{ flex: 1 }}>
              <AllTenantsTrendChart
                points={summary.trend}
                isFetching={reportApi.isLoading}
                height={280}
                severity={summary.delta < 0 ? 'critical' : summary.delta > 0 ? 'ok' : 'info'}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <LeaderboardCard
            title="Top 5"
            subheader="Highest scoring tenants"
            rows={topRows}
            isFetching={reportApi.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <LeaderboardCard
            title="Bottom 5"
            subheader="Lowest scoring tenants"
            rows={bottomRows}
            isFetching={reportApi.isLoading}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export const AllTenantsSecureScoreTable = () => {
  const { reportApi, rows } = useSecureScoreReport()

  if (reportApi.isError) return <ReportError error={reportApi.error} />

  if (!reportApi.isLoading && rows.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              py: 2,
              textAlign: 'center'
            }}>
            No cached secure scores yet. Scores appear after the nightly cache job has run.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <CippDataTable
      title="Secure score by tenant"
      data={rows}
      isFetching={reportApi.isLoading}
      refreshFunction={() => reportApi.refetch()}
      simpleColumns={[
        'TenantName',
        'Tenant',
        'PercentageScore',
        'CurrentScore',
        'MaxScore',
        'CapturedAt',
      ]}
      defaultSorting={[{ id: 'PercentageScore', desc: false }]}
      actions={[
        {
          label: 'View tenant secure score',
          link: '/tenant/administration/securescore?tenantFilter=[Tenant]',
          icon: <CippIcons.EyeIcon />,
        },
      ]}
    />
  )
}
