import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Grid } from '@mui/system'
import { useMemo, useState } from 'react'
import { SvgIcon } from '@mui/material'
import { Chart } from '../../../../components/chart'
import { CippChartCard } from '../../../../components/CippCards/CippChartCard'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { MailFlowReportButton } from '../../../../components/CippPdf/MailFlowReportButton'

const dayOptions = [7, 14, 30, 90]

// Get-MailFlowStatusReport event types, in stack order
const eventTypes = [
  { key: 'GoodMail', label: 'Good mail' },
  { key: 'TransportRules', label: 'Transport rules' },
  { key: 'SpamDetections', label: 'Spam' },
  { key: 'EdgeBlockSpam', label: 'Edge blocked spam' },
  { key: 'EmailPhish', label: 'Phish' },
  { key: 'EmailMalware', label: 'Malware' },
]

const Page = () => {
  const theme = useTheme()
  const tenantFilter = useSettings().currentTenant
  const [days, setDays] = useState(14)

  const flowReport = ApiGetCall({
    url: '/api/ListMailFlowReports',
    data: {
      tenantFilter: tenantFilter,
      reportType: 'MailFlowStatus',
      days: days,
    },
    queryKey: `MailFlowStatus-${tenantFilter}-${days}`,
    waiting: !!tenantFilter,
  })

  const topSenders = ApiGetCall({
    url: '/api/ListMailFlowReports',
    data: {
      tenantFilter: tenantFilter,
      reportType: 'TrafficSummary',
      category: 'TopMailSender',
      days: days,
    },
    queryKey: `MailFlowTopSenders-${tenantFilter}-${days}`,
    waiting: !!tenantFilter,
  })

  const topSpamRecipients = ApiGetCall({
    url: '/api/ListMailFlowReports',
    data: {
      tenantFilter: tenantFilter,
      reportType: 'TrafficSummary',
      category: 'TopSpamRecipient',
      days: days,
    },
    queryKey: `MailFlowTopSpam-${tenantFilter}-${days}`,
    waiting: !!tenantFilter,
  })

  const flowRows = useMemo(
    () => flowReport.data?.Results ?? [],
    [flowReport.data]
  )

  const { chartLabels, chartSeries, dailyTotals, totals, directionSeries } = useMemo(() => {
    const dates = [...new Set(flowRows.map((r) => r.Date))].sort()
    const byDateAndType = {}
    const typeTotals = {}
    const dirTotals = { Inbound: 0, Outbound: 0, IntraOrg: 0 }
    for (const row of flowRows) {
      const count = Number(row.Count) || 0
      byDateAndType[`${row.Date}|${row.EventType}`] =
        (byDateAndType[`${row.Date}|${row.EventType}`] ?? 0) + count
      typeTotals[row.EventType] = (typeTotals[row.EventType] ?? 0) + count
      if (dirTotals[row.Direction] !== undefined)
        dirTotals[row.Direction] += count
    }
    return {
      chartLabels: dates.map((d) =>
        new Date(d).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
      ),
      chartSeries: eventTypes.map((t) => ({
        name: t.label,
        data: dates.map((d) => byDateAndType[`${d}|${t.key}`] ?? 0),
      })),
      dailyTotals: dates.map((d) =>
        eventTypes.reduce((row, t) => ({ ...row, [t.key]: byDateAndType[`${d}|${t.key}`] ?? 0 }), {
          date: d,
        })
      ),
      totals: typeTotals,
      directionSeries: dirTotals,
    }
  }, [flowRows])

  const totalMail = Object.values(totals).reduce((a, b) => a + b, 0)
  const goodMailPct = totalMail
    ? Math.round(((totals.GoodMail ?? 0) / totalMail) * 1000) / 10
    : 0

  const mailFlowData = useMemo(
    () => ({
      days,
      totals,
      directionTotals: directionSeries,
      daily: dailyTotals,
      topSenders: topSenders.data?.Results ?? [],
      topSpamRecipients: topSpamRecipients.data?.Results ?? [],
    }),
    [
      days,
      totals,
      directionSeries,
      dailyTotals,
      topSenders.data,
      topSpamRecipients.data,
    ]
  )

  const infoBarData = [
    {
      icon: (
        <SvgIcon>
          <CippIcons.EnvelopeIcon />
        </SvgIcon>
      ),
      name: `Total mail - ${days} days`,
      data: flowReport.isFetching ? '...' : totalMail.toLocaleString(),
    },
    {
      icon: (
        <SvgIcon>
          <CippIcons.CheckCircleIcon />
        </SvgIcon>
      ),
      name: 'Good mail',
      data: flowReport.isFetching ? '...' : `${goodMailPct}%`,
      color: 'success.main',
    },
    {
      icon: (
        <SvgIcon>
          <CippIcons.ShieldExclamationIcon />
        </SvgIcon>
      ),
      name: 'Phish caught',
      data: flowReport.isFetching
        ? '...'
        : (totals.EmailPhish ?? 0).toLocaleString(),
      color: 'warning.main',
    },
    {
      icon: (
        <SvgIcon>
          <CippIcons.ExclamationTriangleIcon />
        </SvgIcon>
      ),
      name: 'Malware blocked',
      data: flowReport.isFetching
        ? '...'
        : (totals.EmailMalware ?? 0).toLocaleString(),
      color: 'error.main',
    },
  ]

  const stackedChartOptions = {
    chart: {
      background: 'transparent',
      stacked: true,
      toolbar: { show: false },
    },
    colors: [
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.warning.dark,
      theme.palette.secondary.main,
      theme.palette.error.main,
    ],
    dataLabels: { enabled: false },
    // ApexCharts' theme.mode leaves the grid at its #e0e0e0 default, which draws near-white
    // rules on a dark card; the theme's divider is correct in both modes.
    grid: { borderColor: theme.palette.divider },
    xaxis: {
      categories: chartLabels,
      labels: { show: true, rotate: 0, style: { fontSize: '12px' } },
      axisBorder: { color: theme.palette.divider },
      axisTicks: { color: theme.palette.divider },
      tickPlacement: 'on',
    },
    legend: { show: true, position: 'bottom' },
    plotOptions: { bar: { columnWidth: '60%' } },
    stroke: { width: 1, colors: [theme.palette.background.paper] },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  }

  return (
    <Stack spacing={2} sx={{ px: 3 }}>
      {/* KPI tiles take the full width on phones; the period selector and export drop to their own row. */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: "space-between"
        }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <CippInfoBar data={infoBarData} isFetching={flowReport.isFetching} />
        </Box>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            alignItems: "center",
            flexWrap: 'wrap'
          }}>
          <ButtonGroup size="small">
            {dayOptions.map((d) => (
              <Button
                key={d}
                variant={days === d ? 'contained' : 'outlined'}
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </ButtonGroup>
          <MailFlowReportButton
            mailFlowData={mailFlowData}
            tenantName={tenantFilter}
            disabled={flowReport.isFetching || totalMail === 0}
          />
        </Stack>
      </Stack>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card style={{ height: '100%' }}>
            <CardHeader title="Mail dispositions by day" />
            <Divider />
            <CardContent>
              {flowReport.isFetching ? (
                <Skeleton variant="rounded" sx={{ height: 320 }} />
              ) : (
                <Chart
                  height={320}
                  options={stackedChartOptions}
                  series={chartSeries}
                  type="bar"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <CippChartCard
            title="Direction"
            chartType="donut"
            isFetching={flowReport.isFetching}
            chartSeries={[
              directionSeries.Inbound,
              directionSeries.Outbound,
              directionSeries.IntraOrg,
            ]}
            labels={['Inbound', 'Outbound', 'Intra-org']}
            totalLabel="Total"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CippDataTable
            title="Top mail senders"
            simpleColumns={['Name', 'Count']}
            data={topSenders.data?.Results ?? []}
            isFetching={topSenders.isFetching}
            refreshFunction={() => topSenders.refetch()}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CippDataTable
            title="Top spam recipients"
            simpleColumns={['Name', 'Count']}
            data={topSpamRecipients.data?.Results ?? []}
            isFetching={topSpamRecipients.isFetching}
            refreshFunction={() => topSpamRecipients.refetch()}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)
export default Page
