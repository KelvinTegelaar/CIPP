import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CippIcons } from '../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import {
  Button,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  SvgIcon,
  Stack,
  Alert,
  Box,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useForm } from 'react-hook-form'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { useSettings } from '../../../hooks/use-settings.js'

const simpleColumns = [
  'DateTime',
  'Tenant',
  'User',
  'Message',
  'API',
  'Severity',
  'AppId',
  'IP',
  'LogData',
]

const offcanvas = {
  extendedInfoFields: ['DateTime', 'API', 'Severity', 'Message', 'User', 'AppId', 'IP', 'LogData'],
}

const apiUrl = '/api/Listlogs'
const pageTitle = 'Logbook Results'

const actions = [
  {
    label: 'View Log Entry',
    link: '/cipp/logs/logentry?logentry=[RowKey]&dateFilter=[DateFilter]',
    pinned: true,
    icon: <CippIcons.EyeIcon />,
    color: 'primary',
  },
]

const severityOptions = [
  { value: 'Info', label: 'Info' },
  { value: 'Warn', label: 'Warning' },
  { value: 'Error', label: 'Error' },
  { value: 'Critical', label: 'Critical' },
  { value: 'Alert', label: 'Alert' },
  { value: 'Debug', label: 'Debug' },
]

// ListLogs counts whole days in the instance timezone, so 2d is yesterday and today.
const rangeOptions = [
  { value: null, label: 'Today' },
  { value: 2, label: '2d' },
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
]

// The applied filters, which are also the page's URL query (so a filtered view can be shared).
const emptyFilters = {
  start: null,
  end: null,
  user: null,
  severity: null,
  api: null,
  search: null,
  ip: null,
  appId: null,
  days: null,
  tenantOnly: false,
}
const filterKeys = Object.keys(emptyFilters)

const fromQuery = (query) => ({
  start: /^\d{8}$/.test(query.start ?? '') ? query.start : null,
  end: /^\d{8}$/.test(query.end ?? '') ? query.end : null,
  user: query.user || null,
  severity: query.severity || null,
  api: query.api || null,
  search: query.search || null,
  ip: query.ip || null,
  appId: query.appId || null,
  days: rangeOptions.some((option) => option.value && option.value === Number(query.days))
    ? Number(query.days)
    : null,
  tenantOnly: query.tenantOnly === 'true',
})

const toQuery = (filters) =>
  Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== null && value !== false && value !== '')
      .map(([key, value]) => [key, String(value)])
  )

const toYmd = (unixSeconds) =>
  unixSeconds ? new Date(unixSeconds * 1000).toISOString().split('T')[0].replace(/-/g, '') : null
const fromYmd = (ymd) =>
  ymd ? Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)) / 1000 : null
const formatYmd = (ymd) =>
  new Date(ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') + 'T00:00:00').toLocaleDateString()

const toForm = (filters) => ({
  startDate: fromYmd(filters.start),
  endDate: fromYmd(filters.end),
  username: filters.user ?? '',
  severity: (filters.severity?.split(',') ?? []).map(
    (value) => severityOptions.find((option) => option.value === value) ?? { value, label: value }
  ),
  api: (filters.api?.split('|') ?? []).map((value) => ({ value, label: value })),
  search: filters.search ?? '',
  ip: filters.ip ?? '',
  appId: filters.appId ?? '',
  range: filters.days,
  tenantOnly: filters.tenantOnly,
})

const fromForm = (data) => ({
  start: toYmd(data.startDate),
  end: toYmd(data.endDate),
  user: data.username?.trim() || null,
  severity: data.severity?.length ? data.severity.map((item) => item.value).join(',') : null,
  // Joined with | so the backend's regex match on the API column treats it as an OR.
  api: data.api?.length ? data.api.map((item) => item.value).join('|') : null,
  search: data.search?.trim() || null,
  ip: data.ip?.trim() || null,
  appId: data.appId?.trim() || null,
  // Explicit dates win over a quick range on the backend, so only keep one.
  days: data.startDate || data.endDate ? null : (data.range ?? null),
  tenantOnly: !!data.tenantOnly,
})

const Page = () => {
  const router = useRouter()
  const formControl = useForm({ defaultValues: toForm(emptyFilters) })
  const [expanded, setExpanded] = useState(false) // State for Accordion
  const [filters, setFilters] = useState(emptyFilters)
  const settings = useSettings() // Hook to access settings
  const currentTenant = settings?.currentTenant
  const canLimitToTenant = !!currentTenant && currentTenant !== 'AllTenants'
  const limitedTenant = filters.tenantOnly && canLimitToTenant ? currentTenant : null
  const filterEnabled = filterKeys.some((key) => filters[key] !== null && filters[key] !== false)

  // Filters arrive in the URL from shared links and from other pages linking into the logbook.
  useEffect(() => {
    if (!router.isReady) return
    const fromUrl = fromQuery(router.query)
    setFilters(fromUrl)
    formControl.reset(toForm(fromUrl))
  }, [router.isReady])

  const applyFilters = (next) => {
    setFilters(next)
    const otherParams = Object.fromEntries(
      Object.entries(router.query).filter(([key]) => !filterKeys.includes(key))
    )
    router.replace(
      { pathname: router.pathname, query: { ...otherParams, ...toQuery(next) } },
      undefined,
      { shallow: true }
    )
    setExpanded(false) // Close the accordion after applying or clearing filters
  }

  // Watch date fields to show warning for large date ranges
  const watchStartDate = formControl.watch('startDate')
  const watchEndDate = formControl.watch('endDate')
  const watchRange = formControl.watch('range')
  const hasDates = !!(watchStartDate || watchEndDate)

  // A quick range replaces any picked dates; picking a date leaves no range highlighted.
  const pickRange = (value) => {
    formControl.setValue('range', value)
    formControl.setValue('startDate', null)
    formControl.setValue('endDate', null)
  }

  // Component to display warning for large date ranges
  const DateRangeWarning = () => {
    if (!watchStartDate || !watchEndDate) return null

    const startDateMs = new Date(watchStartDate * 1000)
    const endDateMs = new Date(watchEndDate * 1000)
    const daysDifference = (endDateMs - startDateMs) / (1000 * 60 * 60 * 24)

    if (daysDifference > 10) {
      return (
        <Grid size={{ xs: 12, md: 7 }}>
          <Alert severity="warning">
            You have selected a date range of {Math.ceil(daysDifference)} days. Large date ranges
            may cause timeouts or errors due to the amount of data being processed. Consider
            narrowing your date range if you encounter issues.
          </Alert>
        </Grid>
      )
    }
    return null
  }

  const onSubmit = (data) => applyFilters(fromForm(data))

  const clearFilters = () => {
    formControl.reset(toForm(emptyFilters))
    applyFilters(emptyFilters)
  }

  const summary = [
    filters.start || filters.end
      ? `${filters.start ? formatYmd(filters.start) : new Date().toLocaleDateString()}${
          filters.end ? ` - ${formatYmd(filters.end)}` : ''
        }`
      : filters.days
        ? `Last ${filters.days} days`
        : null,
    filters.user && `User: ${filters.user}`,
    filters.severity && `Severity: ${filters.severity.replace(/,/g, ', ')}`,
    filters.api && `API: ${filters.api.replace(/\|/g, ', ')}`,
    filters.search && `Search: "${filters.search}"`,
    filters.ip && `IP: ${filters.ip}`,
    filters.appId && `App ID: ${filters.appId}`,
    limitedTenant && `Tenant: ${limitedTenant}`,
  ].filter(Boolean)

  return (
    <CippTablePage
      tableFilter={
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                minWidth: 0
              }}>
              <SvgIcon>
                <CippIcons.FunnelIcon />
              </SvgIcon>
              <Typography variant="h6" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                Logbook Filters
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.8em',
                    fontWeight: 'normal',
                    display: { xs: 'block', md: 'inline' },
                    ml: { xs: 0, md: '10px' },
                  }}
                >
                  {filterEnabled && summary.length > 0
                    ? `(${summary.join(' | ')})`
                    : `(Today: ${new Date().toLocaleDateString()})`}
                </Box>
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={formControl.handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {/* Date Filter */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Alert severity="info">
                    Use the filters below to narrow down your logbook results. You can filter by
                    date range, username, severity levels, API, message text, IP address and app
                    ID. By default, the logbook shows the current day based on UTC time. Your local
                    time is {new Date().getTimezoneOffset() / -60} hours offset from UTC.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <CippFormComponent
                    type="textField"
                    name="search"
                    label="Search messages"
                    formControl={formControl}
                    placeholder="Text to find in the log message, across every page of results"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <ButtonGroup size="small" aria-label="Quick date range">
                    {rangeOptions.map((option) => (
                      <Button
                        key={option.label}
                        variant={
                          !hasDates && (watchRange ?? null) === option.value
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() => pickRange(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  {/* Two full-width pickers side by side leaves each about 150px on a
                      phone, which is narrower than the date they have to show. */}
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Box sx={{
                      flexGrow: 1
                    }}>
                      <CippFormComponent
                        type="datePicker"
                        name="startDate"
                        label="Select Start Date"
                        dateTimeType="date"
                        formControl={formControl}
                      />
                    </Box>
                    <Box sx={{
                      flexGrow: 1
                    }}>
                      <CippFormComponent
                        type="datePicker"
                        name="endDate"
                        label="Select End Date"
                        dateTimeType="date"
                        formControl={formControl}
                        validators={{
                          validate: (value) => {
                            const startDate = formControl.getValues('startDate')
                            if (value && !startDate) {
                              return 'Start date must be set when using an end date'
                            }
                            if (
                              startDate &&
                              value &&
                              new Date(value * 1000) < new Date(startDate * 1000)
                            ) {
                              return 'End date must be after start date'
                            }
                            return true
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Date Range Warning Alert */}
                <DateRangeWarning />

                {/* Username Filter */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <CippFormComponent
                    type="textField"
                    name="username"
                    label="Filter by Username"
                    formControl={formControl}
                    placeholder="Enter username to filter logs"
                    fullWidth
                  />
                </Grid>

                {/* Severity + API Filters, side by side (half width each) */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flexGrow: 1 }}>
                      <CippFormComponent
                        type="autoComplete"
                        name="severity"
                        label="Filter by Severity"
                        formControl={formControl}
                        multiple={true}
                        options={severityOptions}
                        placeholder="Select severity levels"
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <CippFormComponent
                        type="autoComplete"
                        name="api"
                        label="Filter by API"
                        formControl={formControl}
                        multiple={true}
                        creatable={true}
                        freeSolo={true}
                        options={[]}
                        placeholder="Type API name(s)"
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* IP + App ID, side by side (half width each) */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flexGrow: 1 }}>
                      <CippFormComponent
                        type="textField"
                        name="ip"
                        label="Filter by IP address"
                        formControl={formControl}
                        placeholder="All or part of an address"
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <CippFormComponent
                        type="textField"
                        name="appId"
                        label="Filter by App ID"
                        formControl={formControl}
                        placeholder="API client or integration app ID"
                        fullWidth
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Tenant limit: the logbook spans every tenant unless this is on */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <CippFormComponent
                    type="switch"
                    name="tenantOnly"
                    label={
                      canLimitToTenant
                        ? `Only show logs for ${currentTenant}`
                        : 'Only show logs for the selected tenant (select a tenant first)'
                    }
                    disabled={!canLimitToTenant}
                    formControl={formControl}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} useFlexGap sx={{
                    flexWrap: "wrap"
                  }}>
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
                      Apply Filters
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={
                        <SvgIcon>
                          <CippIcons.XMarkIcon />
                        </SvgIcon>
                      }
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      queryKey={`Listlogs-${JSON.stringify(filters)}-${limitedTenant}`}
      tenantInTitle={false}
      defaultSorting={[{ id: 'DateTime', desc: true }]}
      apiData={{
        StartDate: filters.start,
        EndDate: filters.end,
        Days: filters.days,
        User: filters.user,
        Severity: filters.severity,
        API: filters.api, // Server-side regex match on the API column
        Search: filters.search, // Server-side message search across every page
        IP: filters.ip,
        AppId: filters.appId,
        Filter: filterEnabled,
        Tenant: limitedTenant, // Only when the tenant switch is on
        manualPagination: true, // Page through ListLogs via Metadata.nextLink
        // CippTablePage injects tenantFilter from the tenant selector, but ListLogs reads
        // Tenant instead, and a literal 'AllTenants' tenantFilter would stop
        // ApiGetCallWithPagination from ever fetching page two. Null drops the param.
        tenantFilter: null,
      }}
      actions={actions}
      offCanvas={offcanvas}
      rowOpen={{
        link: '/cipp/logs/logentry?logentry=[RowKey]&dateFilter=[DateFilter]',
        condition: (row) => Boolean(row?.RowKey),
      }}
    />
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
