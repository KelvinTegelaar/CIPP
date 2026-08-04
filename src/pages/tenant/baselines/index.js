import {
  Box,
  Card,
  CardHeader,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useRouter } from 'next/router'
import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { TabbedLayout } from '../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { CippChartCard } from '../../../components/CippCards/CippChartCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { ApiGetCall } from '../../../api/ApiCall'
import { ResourceUnavailable } from '../../../components/resource-unavailable'

// CippChartCard shows a skeleton while its series is empty; once the query settles with no
// data (no baseline runs yet) we show a real empty state instead of a permanent skeleton.
const EmptyChartCard = ({ title, message }) => (
  <Card style={{ width: '100%', height: '100%' }}>
    <CardHeader title={title} />
    <Divider />
    <ResourceUnavailable message={message} />
  </Card>
)

// The API serializes single-element arrays as a bare object; charts need real arrays.
const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const Page = () => {
  const pageTitle = 'Fleet Overview'
  const router = useRouter()

  const aggregate = ApiGetCall({
    url: '/api/ListBaselineAlignment',
    data: { byStandard: true },
    queryKey: 'ListBaselineAlignment-byStandard',
  })

  const fleetScore = aggregate.data?.fleet
  const trend = asArray(aggregate.data?.trend)
  const tenantsNeedingAttention = asArray(aggregate.data?.tenants)
    .slice()
    .sort((a, b) => a.alignedPercentage - b.alignedPercentage)
    .slice(0, 5)
  const activeDeviations = asArray(aggregate.data?.activeDeviations)
  const licenseMissingPercentage = fleetScore?.total
    ? Math.round((fleetScore.licenseMissing / fleetScore.total) * 100)
    : 0

  return (
    <>
      <CippHead title={pageTitle} />
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <CippInfoBar
            isFetching={aggregate.isFetching}
            data={[
              {
                icon: <CheckBadgeIcon />,
                name: 'Compliant with accepted deviations',
                data: `${fleetScore?.alignedPercentage ?? 0}%`,
                color: 'success',
                toolTip: `${fleetScore?.acceptedPercentage ?? 0}% of this score comes from accepted deviations`,
              },
              {
                icon: <ShieldCheckIcon />,
                name: 'Compliant with baseline',
                data: `${fleetScore?.verifiedPercentage ?? 0}%`,
                toolTip:
                  'Standards currently in their expected state, with accepted deviations NOT counted.',
              },
              {
                icon: <ExclamationTriangleIcon />,
                name: 'Open Deviations',
                data: fleetScore?.drift ?? 0,
                color: 'error',
                toolTip: 'Drift awaiting triage (Accept / Deny / Remediate)',
              },
              {
                icon: <KeyIcon />,
                name: 'License Missing',
                data: `${licenseMissingPercentage}%`,
                color: 'warning',
                toolTip: `${fleetScore?.licenseMissing ?? 0} standard instance${(fleetScore?.licenseMissing ?? 0) === 1 ? '' : 's'} excluded from scoring because the tenant lacks the license`,
              },
            ]}
          />
          <Grid container spacing={2}>
            <Grid size={{ md: 8, xs: 12 }}>
              {!aggregate.isFetching && trend.length === 0 ? (
                <EmptyChartCard
                  title="Fleet Compliance Trend"
                  message="Trend data appears after the first baseline runs."
                />
              ) : (
                <CippChartCard
                  isFetching={aggregate.isFetching}
                  title="Fleet Compliance Trend"
                  chartType="area"
                  chartSeries={
                    trend.length > 0
                      ? [
                          {
                            name: 'Compliant with accepted deviations',
                            data: trend.map((point) => ({
                              x: point.date,
                              y: point.aligned,
                            })),
                          },
                          {
                            name: 'Compliant with baseline',
                            data: trend.map((point) => ({
                              x: point.date,
                              y: point.verified,
                            })),
                          },
                        ]
                      : []
                  }
                />
              )}
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              {!aggregate.isFetching && (fleetScore?.total ?? 0) === 0 ? (
                <EmptyChartCard
                  title="Deviation States"
                  message="Deviation data appears after the first baseline runs."
                />
              ) : (
                <CippChartCard
                  isFetching={aggregate.isFetching}
                  title="Deviation States"
                  chartType="donut"
                  totalLabel="Applicable"
                  chartSeries={
                    fleetScore
                      ? [
                          fleetScore.compliant,
                          fleetScore.accepted,
                          fleetScore.drift,
                          fleetScore.denied,
                        ]
                      : []
                  }
                  labels={['Compliant', 'Accepted', 'Drift', 'Denied']}
                />
              )}
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ md: 4, xs: 12 }}>
              {!aggregate.isFetching && tenantsNeedingAttention.length === 0 ? (
                <EmptyChartCard
                  title="Tenants Needing Attention"
                  message="Tenant scores appear after the first baseline runs."
                />
              ) : (
                <Card style={{ width: '100%', height: '100%' }}>
                  <CardHeader title="Tenants Needing Attention" />
                  <Divider />
                  <Stack spacing={2} sx={{ p: 2 }}>
                    {tenantsNeedingAttention.map((tenant) => (
                      <Box
                        key={tenant.tenantFilter}
                        onClick={() =>
                          router.push('/tenant/baselines/alignment')
                        }
                        sx={{ cursor: 'pointer' }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Tooltip title={tenant.tenantFilter}>
                            <Typography variant="body2" noWrap>
                              {tenant.displayName}
                            </Typography>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ flexShrink: 0 }}
                          >
                            {tenant.alignedPercentage}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={tenant.alignedPercentage ?? 0}
                          color={
                            tenant.alignedPercentage < 50
                              ? 'error'
                              : tenant.alignedPercentage < 80
                                ? 'warning'
                                : 'success'
                          }
                          sx={{ mt: 0.5, borderRadius: 1 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              )}
            </Grid>
            <Grid size={{ md: 8, xs: 12 }}>
              <CippDataTable
                queryKey="ListBaselineAlignment-activeDeviations-table"
                title="Accepted & Denied Deviations"
                data={activeDeviations}
                refreshFunction={aggregate}
                simpleColumns={[
                  'tenantName',
                  'standardLabel',
                  'status',
                  'deviationReason',
                  'deviationBy',
                  'deviationExpires',
                ]}
              />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
