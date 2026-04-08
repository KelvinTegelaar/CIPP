import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../api/ApiCall.jsx'
import { Card, Alert, Typography } from '@mui/material'
import { Box, Container, Stack } from '@mui/system'
import { CippHead } from '../../../../components/CippComponents/CippHead.jsx'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable.js'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'

// Convert camelCase report names like "getMailboxUsageDetail" → "Mailbox Usage Detail"
// Uses the same acronym-aware splitting as getCippTranslation
const prettifyReportName = (name) => {
  const stripped = name.replace(/^get/, '')
  const spaced = stripped
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // acronyms: "URLPath" → "URL Path"
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase: "usageDetail" → "usage Detail"
    .replace(/\bV(\d+)\b/g, 'v$1') // normalise V2 → v2
    .trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const PERIOD_OPTIONS = [
  { label: '7 days', value: 'D7' },
  { label: '30 days', value: 'D30' },
  { label: '90 days', value: 'D90' },
  { label: '180 days', value: 'D180' },
]

const SOURCE_OPTIONS = [
  { label: 'Microsoft Graph', value: 'graph' },
  { label: 'Office Reports (reports.office.com)', value: 'office' },
]

const Page = () => {
  const { currentTenant } = useSettings()
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      source: { label: 'Microsoft Graph', value: 'graph' },
      report: null,
      period: { label: '30 days', value: 'D30' },
    },
  })

  const watched = useWatch({ control: formControl.control })
  const source = watched.source?.value ?? 'graph'
  const report = watched.report?.value ?? null
  const period = watched.period?.value ?? 'D30'
  const isNavigationLink = watched.report?.type === 'navigationLink'
  const showPeriod = source === 'graph' && !isNavigationLink

  // Reset report when source changes
  useEffect(() => {
    formControl.setValue('report', null)
  }, [source])

  // Fetch the report list for the selected source
  const reportListApi = ApiGetCall({
    url: '/api/ListGraphReports',
    data: { tenantFilter: currentTenant, type: source },
    queryKey: `ListGraphReports-${currentTenant}-${source}`,
    waiting: !!currentTenant,
  })

  const reportOptions = (reportListApi.data ?? []).map((r) => ({
    label: prettifyReportName(r.name),
    value: r.name,
    type: r.type ?? null,
  }))

  // Only fetch report data when tenant + report are set
  const reportDataApi = ApiGetCall({
    url: '/api/ListGraphReports',
    data: {
      tenantFilter: currentTenant,
      type: source,
      report: report,
      period: showPeriod ? period : undefined,
    },
    queryKey: `GraphReportData-${currentTenant}-${source}-${report}-${showPeriod ? period : 'noperiod'}`,
    waiting: !!currentTenant && !!report,
  })

  return (
    <>
      <CippHead title="Graph / Office Reports" />
      <Box>
        <Container maxWidth={false} sx={{ py: 2 }}>
          <Stack spacing={2}>
            {/* Toolbar */}
            <Card sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
                <Box sx={{ minWidth: 260 }}>
                  <CippFormComponent
                    name="source"
                    label="Source"
                    type="autoComplete"
                    multiple={false}
                    disableClearable={true}
                    formControl={formControl}
                    options={SOURCE_OPTIONS}
                    creatable={false}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 280 }}>
                  <CippFormComponent
                    name="report"
                    label="Report"
                    type="autoComplete"
                    multiple={false}
                    formControl={formControl}
                    isFetching={reportListApi.isFetching}
                    options={reportOptions}
                    placeholder={reportListApi.isFetching ? 'Loading reports…' : 'Choose a report'}
                    creatable={false}
                    sortOptions={true}
                  />
                </Box>
                {showPeriod && (
                  <Box sx={{ minWidth: 160 }}>
                    <CippFormComponent
                      name="period"
                      label="Period"
                      type="autoComplete"
                      multiple={false}
                      disableClearable={true}
                      formControl={formControl}
                      options={PERIOD_OPTIONS}
                      creatable={false}
                    />
                  </Box>
                )}
              </Stack>
              {reportListApi.isError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Failed to load report list: {reportListApi.error?.message}
                </Alert>
              )}
            </Card>

            {/* Results */}
            {!currentTenant && (
              <Alert severity="warning">Please select a tenant to get started.</Alert>
            )}
            {currentTenant && !report && (
              <Alert severity="info">Select a report above to load data.</Alert>
            )}
            {currentTenant && report && (
              <Card>
                {reportDataApi.isError ? (
                  <Alert severity="error" sx={{ m: 2 }}>
                    {reportDataApi.error?.message ?? 'Failed to load report data.'}
                  </Alert>
                ) : (
                  <CippDataTable
                    title={`${prettifyReportName(report)}${showPeriod ? ` (${period})` : ''}`}
                    data={reportDataApi.data ?? []}
                    isFetching={reportDataApi.isFetching}
                    simple={false}
                    reportTitle={`${source}-${report}`}
                    refreshFunction={reportDataApi}
                  />
                )}
              </Card>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
