import { Alert, Container, Stack } from '@mui/material'
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
import {
  getFleetScore,
  getTenantSummaries,
  standardsV3Resolved,
  standardsV3Trend,
} from '../../../data/standards-v3-mock-data'

const Page = () => {
  const pageTitle = 'Standards V3 - Overview'
  const router = useRouter()
  const fleetScore = getFleetScore()
  const tenantSummaries = getTenantSummaries()

  const tenantsNeedingAttention = [...tenantSummaries]
    .sort((a, b) => a.alignedPercentage - b.alignedPercentage)
    .slice(0, 5)

  const activeDeviations = standardsV3Resolved.filter((row) =>
    ['Accepted', 'Suppressed'].includes(row.deviationState)
  )

  return (
    <>
      <CippHead title={pageTitle} />
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <Alert severity="info">
            Standards V3 is in preview. All data on these pages is mock data
            used to validate the interface design.
          </Alert>
          <CippInfoBar
            data={[
              {
                icon: <CheckBadgeIcon />,
                name: 'Fleet Aligned',
                data: `${fleetScore.alignedPercentage}%`,
                color: 'success',
                toolTip: `${fleetScore.acceptedPercentage}% of this score comes from accepted deviations`,
              },
              {
                icon: <ShieldCheckIcon />,
                name: 'Verified Compliant',
                data: `${fleetScore.verifiedPercentage}%`,
                toolTip:
                  'Compliance verified against current tenant data, excluding accepted deviations',
              },
              {
                icon: <ExclamationTriangleIcon />,
                name: 'Open Deviations',
                data: fleetScore.detected,
                color: 'error',
                toolTip:
                  'Detected deviations awaiting triage (Accept / Remediate / Suppress)',
              },
              {
                icon: <KeyIcon />,
                name: 'License Missing',
                data: fleetScore.licenseMissing,
                color: 'warning',
                toolTip:
                  'Standard instances excluded from scoring because the tenant lacks the license',
              },
            ]}
          />
          <Grid container spacing={2}>
            <Grid size={{ md: 8, xs: 12 }}>
              <CippChartCard
                title="Fleet Compliance Trend"
                chartType="area"
                chartSeries={[
                  {
                    name: 'Aligned %',
                    data: standardsV3Trend.map((point) => ({
                      x: point.date,
                      y: point.aligned,
                    })),
                  },
                  {
                    name: 'Verified %',
                    data: standardsV3Trend.map((point) => ({
                      x: point.date,
                      y: point.verified,
                    })),
                  },
                ]}
              />
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippChartCard
                title="Deviation States"
                chartType="donut"
                totalLabel="Applicable"
                chartSeries={[
                  fleetScore.compliant,
                  fleetScore.accepted,
                  fleetScore.detected,
                  fleetScore.suppressed,
                ]}
                labels={['Compliant', 'Accepted', 'Detected', 'Suppressed']}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippChartCard
                title="Tenants Needing Attention"
                chartType="bar"
                totalLabel="Aligned %"
                onClick={() => router.push('/tenant/standards-v3/alignment')}
                chartSeries={tenantsNeedingAttention.map(
                  (tenant) => tenant.alignedPercentage
                )}
                labels={tenantsNeedingAttention.map(
                  (tenant) => tenant.displayName
                )}
              />
            </Grid>
            <Grid size={{ md: 8, xs: 12 }}>
              <CippDataTable
                title="Accepted & Suppressed Deviations"
                data={activeDeviations}
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
