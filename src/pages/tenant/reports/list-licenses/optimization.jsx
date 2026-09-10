import { useCallback, useMemo } from 'react'
import { CippIcons } from '../../../../utils/icon-registry'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Container } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippHead } from '../../../../components/CippComponents/CippHead'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { Chart } from '../../../../components/chart'
import tabOptions from './tabOptions.json'
import { CippAutoComplete } from '../../../../components/CippComponents/CippAutocomplete'
import { useSettings } from '../../../../hooks/use-settings'
import { useLicenseCurrency } from '../../../../hooks/use-license-currency'
import { useM365Licenses } from '../../../../utils/m365-licenses-data'
import { ApiGetCall } from '../../../../api/ApiCall'

const TIER_LABELS = {
  UnassignedSeats: 'Unassigned seats',
  Inactive: 'Inactive users',
  DisabledAccount: 'Disabled accounts',
  Downgrade: 'Mailbox-only (review)',
  Overlap: 'Overlapping SKUs',
}
const TIER_ORDER = [
  'UnassignedSeats',
  'Inactive',
  'DisabledAccount',
  'Downgrade',
  'Overlap',
]

const simpleColumns = [
  'License',
  'Finding',
  'Seats',
  'Unit cost',
  'Monthly saving',
  'Suggested action',
]

const Page = () => {
  const theme = useTheme()
  const tenant = useSettings().currentTenant
  const [currency, setCurrency] = useLicenseCurrency()

  // Currencies present in the price data drive the selector.
  const currenciesQuery = ApiGetCall({
    url: '/api/ListLicensePricing',
    queryKey: 'LicensePricingCurrencies',
  })
  const currencies = useMemo(() => {
    const list = currenciesQuery.data?.Currencies
    return Array.isArray(list) && list.length ? list : ['USD']
  }, [currenciesQuery.data])

  const query = ApiGetCall({
    url: '/api/ListLicenseOptimization',
    data: { tenantFilter: tenant, currency },
    queryKey: `LicenseOptimization-${tenant}-${currency}`,
    waiting: !!tenant,
  })

  const summary = query.data?.Results?.Summary ?? null
  const opportunities = useMemo(
    () => query.data?.Results?.Opportunities ?? [],
    [query.data]
  )

  const currencyFmt = useMemo(() => {
    const currency = summary?.Currency || 'USD'
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      })
    } catch {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
    }
  }, [summary?.Currency])
  const fmt = useCallback(
    (n) => currencyFmt.format(Number(n) || 0),
    [currencyFmt]
  )
  // Per-seat unit cost is small - show cents, unlike the rounded aggregate savings.
  const unitFmt = useMemo(() => {
    const currency = summary?.Currency || 'USD'
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } catch {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
  }, [summary?.Currency])

  const kpis = useMemo(() => {
    const s = summary ?? {}
    const pctOfSpend = s.MonthlySpend
      ? Math.round(((s.ReclaimableMonthly || 0) / s.MonthlySpend) * 100)
      : 0
    const coverage = Math.round((s.PriceCoverage ?? 0) * 100)
    return [
      {
        icon: <CippIcons.BanknotesIcon />,
        name: 'Monthly spend',
        data: fmt(s.MonthlySpend),
        color: 'primary',
        toolTip: `${s.AssignedSeats ?? 0} assigned seats · ${coverage}% priced`,
      },
      {
        icon: <CippIcons.ArrowTrendingDownIcon />,
        name: 'Reclaimable / mo',
        data: fmt(s.ReclaimableMonthly),
        color: 'success',
        toolTip: `${pctOfSpend}% of monthly spend`,
      },
      {
        icon: <CippIcons.UsersIcon />,
        name: 'Reclaimable seats',
        data: s.ReclaimableSeats ?? 0,
        color: 'warning',
        toolTip: 'Unassigned, disabled, and inactive seats',
      },
    ]
  }, [summary, fmt])

  // skuId -> skuPartNumber, so a price set from here records the part number too.
  const licenses = useM365Licenses()
  const partNumberBySku = useMemo(() => {
    const map = {}
    licenses.forEach((l) => {
      if (l.GUID && l.String_Id && !map[l.GUID.toLowerCase()]) {
        map[l.GUID.toLowerCase()] = l.String_Id
      }
    })
    return map
  }, [licenses])

  // Set a price for an in-use SKU that has none in the current currency.
  const actions = [
    {
      label: 'Set price',
      type: 'POST',
      url: '/api/ExecLicensePricing',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.CurrencyDollarIcon />
        </SvgIcon>
      ),
      fields: [
        {
          type: 'number',
          name: 'MonthlyPrice',
          label: `Monthly price per seat (${currency})`,
        },
      ],
      condition: (row) => !row.PriceKnown,
      customDataformatter: (row, action, formData) => ({
        Action: 'SetPrice',
        skuId: row.skuId,
        skuPartNumber: partNumberBySku[String(row.skuId).toLowerCase()] || '',
        Product_Display_Name: row.License,
        MonthlyPrice: formData.MonthlyPrice,
        Currency: currency,
      }),
      confirmText: `Set the ${currency} monthly price for [License]. This is used across the optimization report.`,
      relatedQueryKeys: [
        `LicenseOptimization-${tenant}-${currency}`,
        'LicensePricing*',
      ],
    },
  ]

  const chart = useMemo(() => {
    if (!opportunities.length) return null
    const byTier = {}
    opportunities.forEach((o) => {
      byTier[o.Tier] = (byTier[o.Tier] || 0) + (Number(o.MonthlySaving) || 0)
    })
    // Only tiers with an actual reclaimable amount belong on the spend chart; the review tier
    // (mailbox-only) claims no saving, so it is surfaced in the table rather than as a $0 bar.
    const tiers = TIER_ORDER.filter((t) => byTier[t] > 0)
    if (!tiers.length) return null
    const palette = {
      UnassignedSeats: theme.palette.error.main,
      Inactive: theme.palette.warning.main,
      DisabledAccount: theme.palette.info?.main || theme.palette.primary.main,
      Downgrade: theme.palette.primary.main,
      Overlap: theme.palette.secondary.main,
    }
    return {
      series: [
        {
          name: 'Monthly saving',
          data: tiers.map((t) => Math.round(byTier[t] * 100) / 100),
        },
      ],
      options: {
        chart: {
          type: 'bar',
          background: 'transparent',
          toolbar: { show: false },
        },
        theme: { mode: theme.palette.mode },
        colors: tiers.map((t) => palette[t]),
        plotOptions: {
          bar: {
            distributed: true,
            horizontal: true,
            borderRadius: 4,
            barHeight: '60%',
          },
        },
        dataLabels: { enabled: true, formatter: (v) => currencyFmt.format(v) },
        xaxis: {
          categories: tiers.map((t) => TIER_LABELS[t] ?? t),
          labels: { formatter: (v) => currencyFmt.format(v) },
        },
        legend: { show: false },
        grid: { borderColor: theme.palette.divider },
        tooltip: {
          theme: theme.palette.mode,
          y: { formatter: (v) => currencyFmt.format(v) },
        },
      },
    }
  }, [opportunities, theme, currencyFmt])

  const tableData = useMemo(
    () =>
      opportunities.map((o) => ({
        License: o.License,
        Finding: o.FindingLabel,
        Seats: o.Seats,
        'Unit cost': o.UnitCost != null ? unitFmt.format(o.UnitCost) : '—',
        // Review findings (no claimed saving) and unpriced SKUs show a dash, not a misleading $0.
        'Monthly saving': o.MonthlySaving > 0 ? fmt(o.MonthlySaving) : '—',
        'Suggested action': o.SuggestedAction,
        Users: o.Users,
        Tier: o.Tier,
        skuId: o.skuId,
        PriceKnown: o.PriceKnown,
      })),
    [opportunities, fmt, unitFmt]
  )

  const offCanvas = {
    children: (row) => (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {row.License} — {row.Finding}
        </Typography>
        {Array.isArray(row.Users) && row.Users.length ? (
          <Stack spacing={0.5}>
            {row.Users.map((u) => (
              <Typography key={u} variant="body2">
                {u}
              </Typography>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            No specific users — this is a seat-count finding.
          </Typography>
        )}
      </Box>
    ),
    size: 'md',
  }

  return (
    <>
      <CippHead title="License Optimization" />
      <Box sx={{ p: 3 }}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "flex-end",
                alignItems: "center"
              }}>
              <CippAutoComplete
                label="Currency"
                options={currencies.map((c) => ({ label: c, value: c }))}
                value={{ label: currency, value: currency }}
                multiple={false}
                creatable={false}
                disableClearable={true}
                size="small"
                sx={{ minWidth: 140 }}
                onChange={(option) => {
                  if (option?.value) setCurrency(option.value)
                }}
              />
            </Stack>
            {summary && summary.DataAvailable === false && (
              <Alert severity="info">
                No cached license data for this tenant yet. It is collected by
                the nightly reporting cache; once that runs, this report will
                populate.
              </Alert>
            )}
            {summary?.AnonymizedReports && (
              <Alert severity="warning">
                Microsoft 365 usage reports are anonymized for this tenant, so
                per-user activity can&apos;t be matched to users — the downgrade
                and overlapping-SKU findings may be understated. Apply the
                &ldquo;Disable Anonymous Reports&rdquo; standard to enable the
                full analysis.
              </Alert>
            )}

            <CippInfoBar data={kpis} isFetching={query.isFetching} />

            <Card>
              <CardHeader
                title="Where the waste is"
                subheader="Reclaimable spend by category, per month"
              />
              <Divider />
              <CardContent>
                {query.isFetching ? (
                  <Skeleton variant="rounded" sx={{ height: 300 }} />
                ) : chart ? (
                  <Chart
                    options={chart.options}
                    series={chart.series}
                    type="bar"
                    height={300}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      py: 6,
                      textAlign: 'center'
                    }}>
                    {opportunities.length
                      ? 'No cost is estimated for these SKUs, so there is nothing to chart. Set a price on the opportunities below to see reclaimable spend.'
                      : 'No reclaim opportunities found for this tenant.'}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <CippDataTable
              title={
                tenant
                  ? `Reclaim opportunities - ${tenant}`
                  : 'Reclaim opportunities'
              }
              data={tableData}
              simpleColumns={simpleColumns}
              actions={actions}
              offCanvas={offCanvas}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
