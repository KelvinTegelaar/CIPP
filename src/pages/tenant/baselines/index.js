import { Card, CardHeader, Container, Divider, Stack } from '@mui/material'
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

const Page = () => {
  const pageTitle = 'Baselines Overview'
  const router = useRouter()

  const aggregate = ApiGetCall({
    url: '/api/ListBaselineAlignment',
    data: { byStandard: true },
    queryKey: 'ListBaselineAlignment-byStandard',
  })

  const fleetScore = aggregate.data?.fleet
  const trend = aggregate.data?.trend ?? []
  const tenantsNeedingAttention = [...(aggregate.data?.tenants ?? [])]
    .sort((a, b) => a.alignedPercentage - b.alignedPercentage)
    .slice(0, 5)
  const activeDeviations = aggregate.data?.activeDeviations ?? []

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
                name: 'Fleet Aligned',
                data: `${fleetScore?.alignedPercentage ?? 0}%`,
                color: 'success',
                toolTip: `${fleetScore?.acceptedPercentage ?? 0}% of this score comes from accepted deviations`,
              },
              {
                icon: <ShieldCheckIcon />,
                name: 'Verified Compliant',
                data: `${fleetScore?.verifiedPercentage ?? 0}%`,
                toolTip:
                  'Compliance verified against current tenant data, excluding accepted deviations',
              },
              {
                icon: <ExclamationTriangleIcon />,
                name: 'Open Deviations',
                data: fleetScore?.detected ?? 0,
                color: 'error',
                toolTip:
                  'Detected deviations awaiting triage (Accept / Remediate / Suppress)',
              },
              {
                icon: <KeyIcon />,
                name: 'License Missing',
                data: fleetScore?.licenseMissing ?? 0,
                color: 'warning',
                toolTip:
                  'Standard instances excluded from scoring because the tenant lacks the license',
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
                            name: 'Aligned %',
                            data: trend.map((point) => ({
                              x: point.date,
                              y: point.aligned,
                            })),
                          },
                          {
                            name: 'Verified %',
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
                          fleetScore.detected,
                          fleetScore.suppressed,
                        ]
                      : []
                  }
                  labels={['Compliant', 'Accepted', 'Detected', 'Suppressed']}
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
                <CippChartCard
                  isFetching={aggregate.isFetching}
                  title="Tenants Needing Attention"
                  chartType="bar"
                  totalLabel="Aligned %"
                  onClick={() => router.push('/tenant/baselines/alignment')}
                  chartSeries={tenantsNeedingAttention.map(
                    (tenant) => tenant.alignedPercentage
                  )}
                  labels={tenantsNeedingAttention.map(
                    (tenant) => tenant.displayName
                  )}
                />
              )}
            </Grid>
            <Grid size={{ md: 8, xs: 12 }}>
              <CippDataTable
                queryKey="ListBaselineAlignment-activeDeviations-table"
                title="Accepted & Suppressed Deviations"
                data={activeDeviations}
                refreshFunction={aggregate}
                simpleColumns={[
                  'tenantName',
                  'standardLabel',
                  'deviationState',
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
