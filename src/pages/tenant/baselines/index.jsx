import {
  Box,
  Button,
  Card,
  CardHeader,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../../utils/icon-registry'
import { Grid } from '@mui/system'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { TabbedLayout } from '../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { CippChartCard } from '../../../components/CippCards/CippChartCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { ApiGetCall } from '../../../api/ApiCall'
import { CippAutoComplete } from '../../../components/CippComponents/CippAutocomplete'
import { ResourceUnavailable } from '../../../components/resource-unavailable'
import { useSettings } from '../../../hooks/use-settings'

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
  const settings = useSettings()
  const [baselineId, setBaselineId] = useState(null)
  const [stage, setStage] = useState(null)

  // Unfiltered keeps the exact request/queryKey the alignment page shares.
  const filterData = baselineId
    ? { baselineId, ...(stage ? { stage } : {}) }
    : {}
  const aggregate = ApiGetCall({
    url: '/api/ListBaselineAlignment',
    data: { byStandard: true, ...filterData },
    queryKey: baselineId
      ? `ListBaselineAlignment-byStandard-${baselineId}${stage ? `-${stage}` : ''}`
      : 'ListBaselineAlignment-byStandard',
  })

  const fleetScore = aggregate.data?.fleet
  // The baselines list tells first-run apart from "configured but not run yet".
  const baselinesApi = ApiGetCall({
    url: '/api/ListBaselines',
    queryKey: 'ListBaselines',
  })
  const baselines = asArray(baselinesApi.data)
  const baselineCount = baselines.length
  const baselineOptions = [
    { label: 'All baselines', value: 'all' },
    ...baselines.map((baseline) => ({
      label: baseline.templateName,
      value: baseline.GUID,
    })),
  ]
  const selectedBaseline = baselines.find(
    (baseline) => baseline.GUID === baselineId
  )
  // Stages are identified by their 1-based position.
  const stageOptions = [
    { label: 'All stages', value: 'all' },
    ...asArray(selectedBaseline?.stages).map((stageDef, index) => ({
      label: stageDef?.name || `Stage ${index + 1}`,
      value: index + 1,
    })),
  ]
  const isFirstRun =
    !aggregate.isFetching &&
    !baselinesApi.isFetching &&
    baselineCount === 0 &&
    (fleetScore?.total ?? 0) === 0
  // A filter can match nothing yet (e.g. a stage no tenant has reached); say so instead of 'first run'.
  const filteredEmpty =
    !!baselineId && !aggregate.isFetching && (fleetScore?.total ?? 0) === 0
  const emptyFilterMessage =
    'No tenant has reached this part of the baseline yet.'
  // Carry the active filter into the Alignment tab.
  const filterQuery = baselineId
    ? `&baselineId=${baselineId}${stage ? `&stage=${stage}` : ''}`
    : ''
  // Nothing scorable under the filter (no rows, or every row skipped): a score of 0% would mislead.
  const noScore =
    !!baselineId && !aggregate.isFetching && (fleetScore?.applicable ?? 0) === 0
  const percent = (value, blank = noScore) => (blank ? '—' : `${value ?? 0}%`)
  // A filtered tile opens the Alignment tab's by-standard view, where the baseline filter applies.
  const alignmentLink = (status) =>
    baselineId
      ? `/tenant/baselines/alignment?view=standard${filterQuery}`
      : `/tenant/baselines/alignment?status=${status}`
  const trend = asArray(aggregate.data?.trend)
  const tenantsNeedingAttention = asArray(aggregate.data?.tenants)
    .slice()
    .sort((a, b) => a.alignedPercentage - b.alignedPercentage)
    .slice(0, 5)
  const activeDeviations = asArray(aggregate.data?.activeDeviations)
  const licenseMissingPercentage = fleetScore?.total
    ? Math.round((fleetScore.licenseMissing / fleetScore.total) * 100)
    : 0

  // First run: nothing exists yet, so charts and tables would all be empty
  // shells. Replace the dashboard with the three steps that make it light up.
  if (isFirstRun) {
    return (
      <>
        <CippHead title={pageTitle} />
        <Container maxWidth={false}>
          <Card>
            <CardHeader title="Welcome to Baselines" />
            <Divider />
            <Stack spacing={2} sx={{ p: 3, maxWidth: 720 }}>
              <Typography variant="body1">
                A baseline is the desired configuration for your tenants. CIPP
                checks every tenant against it twice a day, shows exactly what
                deviates, and - if you want - fixes it automatically.
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                1. Create a baseline and add standards from the catalog.
                <br />
                2. Assign the tenants or tenant groups it applies to.
                <br />
                3. Save and run the first check - no changes are made until you
                enable automatic fixing per standard.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => router.push('/tenant/baselines/template')}
                >
                  Create your first baseline
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/tenant/baselines/templates')}
                >
                  Browse the community catalog
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <CippHead title={pageTitle} />
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CippAutoComplete
                fullWidth
                multiple={false}
                creatable={false}
                label="Baseline"
                options={baselineOptions}
                value={
                  baselineOptions.find(
                    (option) => option.value === baselineId
                  ) ?? baselineOptions[0]
                }
                onChange={(newValue) => {
                  setBaselineId(
                    newValue?.value && newValue.value !== 'all'
                      ? newValue.value
                      : null
                  )
                  setStage(null)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CippAutoComplete
                fullWidth
                multiple={false}
                creatable={false}
                label="Stage"
                disabled={!baselineId}
                options={stageOptions}
                value={
                  stageOptions.find((option) => option.value === stage) ??
                  stageOptions[0]
                }
                onChange={(newValue) =>
                  setStage(
                    newValue?.value && newValue.value !== 'all'
                      ? newValue.value
                      : null
                  )
                }
              />
            </Grid>
          </Grid>
          {baselineId && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Standards shared with another baseline are scored once per tenant,
              so they count toward every baseline that includes them.
            </Typography>
          )}
          <CippInfoBar
            isFetching={aggregate.isFetching}
            data={[
              {
                icon: <CippIcons.CheckBadgeIcon />,
                name: 'Compliant with accepted deviations',
                data: percent(fleetScore?.alignedPercentage),
                color: 'success',
                toolTip: `${fleetScore?.acceptedPercentage ?? 0}% of this score comes from accepted deviations`,
              },
              {
                icon: <CippIcons.ShieldCheckIcon />,
                name: 'Compliant with baseline',
                data: percent(fleetScore?.verifiedPercentage),
                toolTip:
                  'Standards currently in their expected state, with accepted deviations NOT counted.',
              },
              {
                icon: <CippIcons.ExclamationTriangleIcon />,
                name: 'Open Deviations',
                data: fleetScore?.drift ?? 0,
                color: 'error',
                toolTip:
                  'Drift awaiting triage (Accept / Deny / Remediate) - click to review',
                link: alignmentLink('Drift'),
              },
              {
                icon: <CippIcons.Key />,
                name: 'License Missing',
                data: percent(licenseMissingPercentage, filteredEmpty),
                color: 'warning',
                toolTip: `${fleetScore?.licenseMissing ?? 0} standard instance${(fleetScore?.licenseMissing ?? 0) === 1 ? '' : 's'} excluded from scoring because the tenant lacks the license - click to review`,
                link: alignmentLink('Skipped - No License'),
              },
            ]}
          />
          <Grid container spacing={2}>
            <Grid size={{ md: 8, xs: 12 }}>
              {baselineId ? (
                // Trend history is stored for the whole fleet only.
                <EmptyChartCard
                  title="Fleet Compliance Trend"
                  message="Trend history covers the whole fleet. Clear the baseline filter to see it."
                />
              ) : !aggregate.isFetching && trend.length === 0 ? (
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
                  message={
                    filteredEmpty
                      ? emptyFilterMessage
                      : 'Deviation data appears after the first baseline runs.'
                  }
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
                  message={
                    filteredEmpty
                      ? emptyFilterMessage
                      : 'Tenant scores appear after the first baseline runs.'
                  }
                />
              ) : (
                <Card style={{ width: '100%', height: '100%' }}>
                  <CardHeader
                    title="Tenants Needing Attention"
                    subheader="Open a tenant to triage its deviations or generate a board-ready What-if report."
                    slotProps={{
                      subheader: { variant: 'caption' }
                    }}
                  />
                  <Divider />
                  <Stack spacing={2} sx={{ p: 2 }}>
                    {tenantsNeedingAttention.map((tenant) => (
                      <Box
                        key={tenant.tenantFilter}
                        onClick={() => {
                          // Land on the alignment page AS this tenant, not whatever
                          // tenant the global selector happened to hold.
                          settings.handleUpdate({
                            currentTenant: tenant.tenantFilter,
                          })
                          router.push('/tenant/baselines/alignment')
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}>
                          <Tooltip title={tenant.tenantFilter}>
                            <Typography variant="body2" noWrap>
                              {tenant.displayName}
                            </Typography>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              flexShrink: 0
                            }}>
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
  );
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
