import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall } from '../../api/ApiCall'
import { CippOffCanvas } from './CippOffCanvas'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippInfoBar } from '../CippCards/CippInfoBar'
import { Chart } from '../chart'
import { PermissionButton } from '../../utils/permissions'
import { getCippError } from '../../utils/get-cipp-error'
import {
  CA_IMPACT_SEGMENT_DAYS,
  buildImpactChart,
  filterImpactSamples,
  formatImpactDay,
  getImpactResultKeys,
  getImpactSegmentCount,
  mergeImpactSegments,
  summarizeImpact,
} from '../../utils/ca-policy-impact'

const DAY_OPTIONS = [
  { value: 1, label: '24h' },
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
]

const SAMPLE_COLUMNS = [
  'createdDateTime',
  'userDisplayName',
  'userPrincipalName',
  'appDisplayName',
  'policyResult',
  'conditionsNotSatisfied',
  'ipAddress',
]

const SAMPLE_DETAIL_FIELDS = [
  'createdDateTime',
  'userDisplayName',
  'userPrincipalName',
  'appDisplayName',
  'clientAppUsed',
  'ipAddress',
  'policyResult',
  'conditionsSatisfied',
  'conditionsNotSatisfied',
  'enforcedGrantControls',
  'enforcedSessionControls',
  'sessionControlsNotSatisfied',
  'signInErrorCode',
  'signInFailureReason',
]

const toneToPalette = (theme, tone) => {
  if (tone === 'success') return theme.palette.success.main
  if (tone === 'error') return theme.palette.error.main
  if (tone === 'warning') return theme.palette.warning.main
  return theme.palette.neutral?.[400] ?? theme.palette.grey[500]
}

const toneToIconColor = (tone) => {
  if (tone === 'success' || tone === 'error' || tone === 'warning') return tone
  return 'action'
}

const toneToIcon = (tone) => {
  if (tone === 'success') return CippIcons.Check
  if (tone === 'error') return CippIcons.Block
  if (tone === 'warning') return CippIcons.EyeIcon
  return CippIcons.People
}

const segmentLabel = (index) => {
  const from = index * CA_IMPACT_SEGMENT_DAYS + 1
  const to = (index + 1) * CA_IMPACT_SEGMENT_DAYS
  return `days ${from}-${to}`
}

/**
 * Drawer showing how a CA policy evaluated against recent interactive sign-ins, like the Entra
 * portal's Policy impact view. Opens from the CA policies list action. A 30 day window is read in
 * three ten day segments so the newest days render while the older ones are still loading.
 */
export const CippCAPolicyImpactDrawer = ({
  policyId,
  policyName,
  tenantFilter,
  visible: controlledVisible,
  onClose: controlledOnClose,
  showButton = false,
  buttonText = 'See usage report',
  requiredPermissions = ['Tenant.ConditionalAccess.Read'],
  PermissionButtonComponent = PermissionButton,
  ...buttonProps
}) => {
  const theme = useTheme()
  const [internalVisible, setInternalVisible] = useState(false)
  const [days, setDays] = useState(7)
  const [percent, setPercent] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const isControlled = typeof controlledVisible === 'boolean'
  const drawerVisible = isControlled ? controlledVisible : internalVisible

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.()
    } else {
      setInternalVisible(false)
    }
  }

  const handleOpen = () => {
    if (!isControlled) {
      setInternalVisible(true)
    }
  }

  const handleDays = (value) => {
    setDays(value)
    setSelectedDay(null)
  }

  const segmentCount = getImpactSegmentCount(days)
  const ready = Boolean(drawerVisible && policyId && tenantFilter)
  const segmentCall = (segment) =>
    ApiGetCall({
      url: '/api/ListCAPolicyImpact',
      data: { tenantFilter, GUID: policyId, Days: days, Segment: segment },
      queryKey: `CAPolicyImpact-${tenantFilter}-${policyId}-${days}-${segment}`,
      waiting: ready && segment < segmentCount,
    })
  // A fixed number of hooks: segments past segmentCount simply never fetch.
  const segment0 = segmentCall(0)
  const segment1 = segmentCall(1)
  const segment2 = segmentCall(2)
  const segmentCalls = [segment0, segment1, segment2].slice(0, segmentCount)

  const results = useMemo(
    () => mergeImpactSegments(segmentCalls.map((call) => call.data?.Results)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the three hooks are stable; their data is what changes
    [segment0.data, segment1.data, segment2.data, segmentCount]
  )
  const hasResults = Boolean(results)
  const anyFetching = segmentCalls.some((call) => call.isFetching)
  const isLoading = !hasResults && anyFetching
  const failedCalls = segmentCalls.filter((call) => call.isError)
  const pendingSegments = segmentCalls
    .map((call, index) => (call.isFetching && !call.data ? index : null))
    .filter((index) => index !== null)

  const resultKeys = useMemo(
    () =>
      hasResults ? getImpactResultKeys(results.state, results.totals) : [],
    [hasResults, results]
  )
  const summary = useMemo(
    () => (hasResults ? summarizeImpact(results.totals, resultKeys) : []),
    [hasResults, results, resultKeys]
  )
  const chart = useMemo(
    () =>
      hasResults
        ? buildImpactChart(results.days, resultKeys, {
            percent,
            formatLabel: formatImpactDay,
          })
        : { labels: [], series: [] },
    [hasResults, results, resultKeys, percent]
  )
  const samples = useMemo(
    () => filterImpactSamples(hasResults ? results.samples : [], selectedDay),
    [hasResults, results, selectedDay]
  )
  const dayDates = useMemo(
    () => (hasResults ? results.days.map((row) => row.date) : []),
    [hasResults, results]
  )

  const title = policyName
    ? `Usage report - ${policyName}`
    : results?.displayName
      ? `Usage report - ${results.displayName}`
      : 'Usage report'
  const totalSignIns = hasResults ? Number(results.totals?.total) || 0 : 0

  const infoBarData = [
    {
      icon: (
        <SvgIcon>
          <CippIcons.Timeline />
        </SvgIcon>
      ),
      name: `Sign-ins evaluated - ${days} ${days === 1 ? 'day' : 'days'}`,
      data: totalSignIns.toLocaleString(),
      toolTip:
        'Interactive sign-ins in the window where this policy was evaluated, whatever the outcome.',
    },
    ...summary.map((item) => {
      const Icon = toneToIcon(item.color)
      return {
        icon: (
          <SvgIcon>
            <Icon />
          </SvgIcon>
        ),
        name: item.label,
        data: percent ? `${item.percent}%` : item.count.toLocaleString(),
        color: toneToIconColor(item.color),
        toolTip: percent
          ? `${item.count.toLocaleString()} sign-ins`
          : `${item.percent}% of evaluated sign-ins`,
      }
    }),
  ]

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: true,
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, context, config) => {
          event?.stopPropagation?.()
          const day = dayDates[config.dataPointIndex]
          setSelectedDay((current) => (current === day ? null : day))
        },
      },
    },
    colors: resultKeys.map((key) =>
      toneToPalette(theme, summary.find((item) => item.key === key)?.color)
    ),
    dataLabels: { enabled: false },
    grid: { borderColor: theme.palette.divider },
    xaxis: {
      categories: chart.labels,
      labels: { show: true, rotate: 0, style: { fontSize: '12px' } },
      axisBorder: { color: theme.palette.divider },
      axisTicks: { color: theme.palette.divider },
      tickPlacement: 'on',
    },
    yaxis: percent
      ? { max: 100, labels: { formatter: (value) => `${value}%` } }
      : {},
    legend: { show: true, position: 'bottom' },
    plotOptions: { bar: { columnWidth: '60%' } },
    stroke: { width: 1, colors: [theme.palette.background.paper] },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
    states: { active: { filter: { type: 'darken' } } },
  }

  const sampleActions = useMemo(
    () => [
      {
        label: 'View User',
        link: `/identity/administration/users/user?userId=[userId]&tenantFilter=${encodeURIComponent(
          tenantFilter || ''
        )}`,
        pinned: true,
        multiPost: false,
        hideBulk: true,
        icon: <CippIcons.EyeIcon />,
        color: 'success',
      },
      {
        label: 'View in Entra',
        link: `https://entra.microsoft.com/${encodeURIComponent(
          tenantFilter || ''
        )}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/[userId]`,
        external: true,
        multiPost: false,
        hideBulk: true,
        icon: <CippIcons.Launch />,
        color: 'info',
      },
    ],
    [tenantFilter]
  )

  const samplesTitle = selectedDay
    ? `Sample sign-ins on ${formatImpactDay(selectedDay)} where policy controls were not met`
    : 'Sample sign-ins where policy controls were not met'

  return (
    <>
      {showButton && (
        <PermissionButtonComponent
          requiredPermissions={requiredPermissions}
          onClick={handleOpen}
          startIcon={<CippIcons.BarChart />}
          {...buttonProps}
        >
          {buttonText}
        </PermissionButtonComponent>
      )}
      <CippOffCanvas
        title={title}
        visible={drawerVisible}
        onClose={handleClose}
        size="xl"
      >
        <Stack spacing={2} sx={{ mb: 2 }}>
          {failedCalls.map((call, index) => (
            <Alert key={`error-${index}`} severity="error">
              {segmentCount > 1
                ? `Could not load ${segmentLabel(segmentCalls.indexOf(call))}: `
                : 'Could not load the usage report: '}
              {getCippError(call.error)}
            </Alert>
          ))}
          {isLoading && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}
            >
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Reading sign-ins this policy was evaluated against…
              </Typography>
            </Box>
          )}
          {!isLoading && (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                {results?.state && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color={
                      results.state === 'enabled'
                        ? 'success'
                        : results.state === 'enabledForReportingButNotEnforced'
                          ? 'info'
                          : 'default'
                    }
                    label={
                      results.state === 'enabled'
                        ? 'Enforced'
                        : results.state === 'enabledForReportingButNotEnforced'
                          ? 'Report-only'
                          : 'Disabled'
                    }
                  />
                )}
                <Chip
                  size="small"
                  variant="outlined"
                  label="Interactive sign-ins only"
                />
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                sx={{ alignItems: 'center', flexWrap: 'wrap' }}
              >
                <ButtonGroup size="small">
                  {DAY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={days === option.value ? 'contained' : 'outlined'}
                      onClick={() => handleDays(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
                <ButtonGroup size="small">
                  <Button
                    variant={!percent ? 'contained' : 'outlined'}
                    onClick={() => setPercent(false)}
                  >
                    Count
                  </Button>
                  <Button
                    variant={percent ? 'contained' : 'outlined'}
                    onClick={() => setPercent(true)}
                  >
                    Percentage
                  </Button>
                </ButtonGroup>
              </Stack>
            </Stack>
          )}
          {hasResults && pendingSegments.length > 0 && (
            <Box>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary">
                Showing the newest{' '}
                {results.loadedSegments * CA_IMPACT_SEGMENT_DAYS} days, loading{' '}
                {pendingSegments.map(segmentLabel).join(' and ')}…
              </Typography>
            </Box>
          )}
          {hasResults && results.partial && (
            <Alert severity="warning">
              Part of the sign-in log could not be read, so these counts are
              incomplete
              {results.partialReason ? ` (${results.partialReason})` : ''}.
            </Alert>
          )}
          {!isLoading && hasResults && (
            <CippInfoBar data={infoBarData} isFetching={false} />
          )}
          {!isLoading && hasResults && totalSignIns === 0 && !anyFetching && (
            <Alert severity="info">
              This policy was not evaluated against any interactive sign-in in
              the last {days} {days === 1 ? 'day' : 'days'}.
            </Alert>
          )}
          {!isLoading && hasResults && (
            <Card>
              <CardHeader
                title="Sign-in activity over time"
                subheader="Select a day to narrow the sample sign-ins below"
              />
              <Divider />
              <CardContent>
                {chart.labels.length === 0 ? (
                  <Skeleton variant="rounded" sx={{ height: 320 }} />
                ) : (
                  <Chart
                    height={320}
                    options={chartOptions}
                    series={chart.series}
                    type="bar"
                  />
                )}
              </CardContent>
            </Card>
          )}
          {!isLoading && hasResults && (
            <CippDataTable
              title={samplesTitle}
              cardButton={
                selectedDay ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedDay(null)}
                  >
                    Show all days
                  </Button>
                ) : null
              }
              noCard={false}
              simple={false}
              isFetching={false}
              data={samples}
              actions={sampleActions}
              simpleColumns={SAMPLE_COLUMNS}
              exportEnabled={true}
              maxHeightOffset="200px"
              offCanvasOnRowClick={true}
              offCanvas={{
                title: 'Sign-in details',
                size: 'md',
                extendedInfoFields: SAMPLE_DETAIL_FIELDS,
              }}
            />
          )}
        </Stack>
      </CippOffCanvas>
    </>
  )
}

export default CippCAPolicyImpactDrawer
