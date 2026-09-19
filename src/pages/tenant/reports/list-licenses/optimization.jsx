import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CippIcons } from '../../../../utils/icon-registry'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import tabOptions from './tabOptions.json'
import { useSettings } from '../../../../hooks/use-settings'
import { useLicenseCurrency } from '../../../../hooks/use-license-currency'
import { useLicenseReportSettings } from '../../../../hooks/use-license-report-settings'
import { useM365Licenses } from '../../../../utils/m365-licenses-data'
import { ApiGetCall } from '../../../../api/ApiCall'
import { LicenseReportButton } from '../../../../components/CippPdf/LicenseReportButton'

const INACTIVE_OPTIONS = [30, 60, 90, 120, 180].map((v) => ({
  label: `${v} days`,
  value: v,
}))
const TENURE_OPTIONS = [3, 6, 9, 12].map((v) => ({
  label: `${v} months`,
  value: v,
}))

const Page = () => {
  const pageTitle = 'License Optimization'
  const tenant = useSettings().currentTenant
  const [currency, setCurrency] = useLicenseCurrency()
  const [settings, setSettings] = useLicenseReportSettings()
  const [expanded, setExpanded] = useState(false)

  const currenciesQuery = ApiGetCall({
    url: '/api/ListLicensePricing',
    queryKey: 'LicensePricingCurrencies',
  })
  const currencies = useMemo(() => {
    const list = currenciesQuery.data?.Currencies
    return Array.isArray(list) && list.length ? list : ['USD']
  }, [currenciesQuery.data])

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      recommendDowngrades: settings.recommendDowngrades,
      recommendUpgrades: settings.recommendUpgrades,
      recommendTerms: settings.recommendTerms,
      protectSecurityFeatures: settings.protectSecurityFeatures,
      inactiveDays:
        INACTIVE_OPTIONS.find((o) => o.value === settings.inactiveDays) ??
        INACTIVE_OPTIONS[2],
      tenureMonths:
        TENURE_OPTIONS.find((o) => o.value === settings.tenureMonths) ??
        TENURE_OPTIONS[1],
      currency: { label: currency, value: currency },
    },
  })

  const onSubmit = (values) => {
    setSettings({
      recommendDowngrades: !!values.recommendDowngrades,
      recommendUpgrades: !!values.recommendUpgrades,
      recommendTerms: !!values.recommendTerms,
      protectSecurityFeatures: !!values.protectSecurityFeatures,
      inactiveDays: values.inactiveDays?.value ?? 90,
      tenureMonths: values.tenureMonths?.value ?? 6,
    })
    if (values.currency?.value) setCurrency(values.currency.value)
    setExpanded(false)
  }

  const apiData = {
    currency,
    inactiveDays: settings.inactiveDays,
    tenureMonths: settings.tenureMonths,
    recommendDowngrades: settings.recommendDowngrades,
    recommendUpgrades: settings.recommendUpgrades,
    recommendTerms: settings.recommendTerms,
    protectSecurityFeatures: settings.protectSecurityFeatures,
  }
  const settingsKey = Object.values(apiData).join('-')
  const queryKey = `LicenseRecommendations-${tenant}-${settingsKey}`

  // The same report the table reads, for the KPI bar and the client PDF.
  const reportQuery = ApiGetCall({
    url: '/api/ListLicenseRecommendations',
    data: { tenantFilter: tenant, ...apiData },
    queryKey: `${queryKey}-report`,
    waiting: !!tenant,
  })
  const report = useMemo(() => {
    const results = reportQuery.data?.Results
    return results && typeof results === 'object' ? results : null
  }, [reportQuery.data])
  const summary = report?.Summary ?? {}

  const fmt = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: summary.Currency || currency || 'USD',
        maximumFractionDigits: 0,
      })
    } catch {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
    }
  }, [summary.Currency, currency])

  const kpis = [
    {
      icon: <CippIcons.BanknotesIcon />,
      name: 'Monthly spend',
      data: fmt.format(summary.MonthlySpend || 0),
      color: 'primary',
      toolTip: `${summary.AssignedSeats ?? 0} assigned seats · ${Math.round((summary.PriceCoverage ?? 0) * 100)}% priced`,
    },
    {
      icon: <CippIcons.ArrowTrendingDownIcon />,
      name: 'Potential saving / month',
      data: fmt.format(summary.TotalPotentialMonthly || 0),
      color: 'success',
      toolTip: `${fmt.format(summary.TotalPotentialAnnual || 0)} per year`,
    },
    {
      icon: <CippIcons.UsersIcon />,
      name: 'Suggestions',
      data: summary.SuggestionCount ?? 0,
      color: 'warning',
      toolTip: `${summary.ReclaimableSeats ?? 0} seats can be removed outright`,
    },
    {
      icon: <CippIcons.ShieldCheckIcon />,
      name: 'Protection investment / month',
      data: fmt.format(summary.ProtectInvestmentMonthly || 0),
      color: 'info',
      toolTip: `${summary.ProtectSeats ?? 0} users with no device management, sign-in security or device threat protection`,
    },
  ]

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

  const relatedQueryKeys = [`${queryKey}*`, 'LicensePricing*']

  const actions = [
    {
      label: 'Remove license from user',
      type: 'POST',
      url: '/api/ExecBulkLicense',
      icon: <CippIcons.TrashIcon />,
      confirmText: 'Remove [License] from [User]?',
      multiPost: false,
      condition: (row) => row.Type === 'Remove license' && !!row.UserId,
      customDataformatter: (row) => ({
        tenantFilter: tenant,
        LicenseOperation: 'Remove',
        Licenses: [{ label: row.License, value: row.skuId }],
        userIds: [row.UserId],
      }),
      relatedQueryKeys,
    },
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
      confirmText: `Set the ${currency} monthly price for [License].`,
      relatedQueryKeys,
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'Type',
      'User',
      'DisplayName',
      'License',
      'TargetLicense',
      'Suggestion',
      'Reason',
      'Seats',
      'Monthly saving',
      'Annual saving',
      'Evidence',
      'Loses',
    ],
    actions,
  }

  const enabledSummary = [
    settings.recommendDowngrades && 'downgrades',
    settings.recommendUpgrades && 'upgrades',
    settings.recommendTerms && 'yearly/monthly',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <CippTablePage
      title={pageTitle}
      queryKey={queryKey}
      apiUrl="/api/ListLicenseRecommendations"
      apiData={apiData}
      apiDataKey="Results.Suggestions"
      dataMap={(row) => ({
        ...row,
        'Monthly saving': fmt.format(row.MonthlySaving || 0),
        'Annual saving': fmt.format(row.AnnualSaving || 0),
      })}
      simpleColumns={[
        'Type',
        'User',
        'License',
        'Suggestion',
        'Reason',
        'Monthly saving',
      ]}
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        <LicenseReportButton
          report={report}
          tenantName={tenant}
          disabled={reportQuery.isFetching}
        />
      }
      tableFilter={
        <Stack spacing={2}>
          <CippInfoBar data={kpis} isFetching={reportQuery.isFetching} />
          <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
          >
            <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', minWidth: 0 }}
              >
                <SvgIcon>
                  <CippIcons.Tune />
                </SvgIcon>
                <Typography
                  variant="h6"
                  sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                >
                  Analysis Settings
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.8em',
                      fontWeight: 'normal',
                      display: { xs: 'block', md: 'inline' },
                      ml: { xs: 0, md: '10px' },
                    }}
                  >
                    ({enabledSummary || 'removals only'} | inactive after{' '}
                    {settings.inactiveDays} days | yearly after{' '}
                    {settings.tenureMonths} months | {currency}
                    {settings.protectSecurityFeatures
                      ? ' | security features protected'
                      : ''}
                    )
                  </Box>
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <form onSubmit={formControl.handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CippFormComponent
                      type="switch"
                      name="recommendDowngrades"
                      label="Recommend downgrades - the cheapest plan that still covers what each user actually used"
                      formControl={formControl}
                    />
                    <CippFormComponent
                      type="switch"
                      name="recommendUpgrades"
                      label="Recommend upgrades - cheaper bundles, and protection for users with none"
                      formControl={formControl}
                    />
                    <CippFormComponent
                      type="switch"
                      name="recommendTerms"
                      label="Recommend yearly/monthly split - commit stable seats to a yearly term"
                      formControl={formControl}
                    />
                    <CippFormComponent
                      type="switch"
                      name="protectSecurityFeatures"
                      label="Protect security features - never suggest a plan that drops Intune, Entra, Defender or Purview"
                      formControl={formControl}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                      <CippFormComponent
                        type="autoComplete"
                        name="inactiveDays"
                        label="Treat a user as inactive after"
                        formControl={formControl}
                        multiple={false}
                        creatable={false}
                        options={INACTIVE_OPTIONS}
                      />
                      <CippFormComponent
                        type="autoComplete"
                        name="tenureMonths"
                        label="Treat a seat as stable (yearly) after"
                        formControl={formControl}
                        multiple={false}
                        creatable={false}
                        options={TENURE_OPTIONS}
                      />
                      <CippFormComponent
                        type="autoComplete"
                        name="currency"
                        label="Currency"
                        formControl={formControl}
                        multiple={false}
                        creatable={false}
                        options={currencies.map((c) => ({
                          label: c,
                          value: c,
                        }))}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={
                        <SvgIcon>
                          <CippIcons.FunnelIcon />
                        </SvgIcon>
                      }
                    >
                      Apply Settings
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </AccordionDetails>
          </Accordion>
        </Stack>
      }
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
