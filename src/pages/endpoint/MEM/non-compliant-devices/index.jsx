import { useMemo, useState } from 'react'
import { Alert, Chip, Container, Stack } from '@mui/material'
import { Grid } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippChartCard } from '../../../../components/CippCards/CippChartCard'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { getIntuneDeviceActions } from '../../../../components/CippComponents/CippIntuneDeviceActions.jsx'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { getCippError } from '../../../../utils/get-cipp-error'

// Intune's built-in policy that fails devices for "Has a compliance policy assigned", "Is active"
// and "Enrolled user exists"; the export carries no policy id, so the name is the only marker
const BUILT_IN_POLICY = 'Default Device Compliance Policy'
const DEVICE_ACTION_LABELS = ['View Device', 'Sync Device']

// Intune reports error codes as signed 32-bit decimals (-2016281112); admins look them up as hex (0x87D1FDE8)
const formatErrorCode = (code) => {
  const value = Number(code)
  if (!Number.isInteger(value) || value === 0) return code
  return `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')} (${value})`
}

// One row per failing setting from the device x setting rows the export caches
const groupBySetting = (rows) => {
  const groups = new Map()
  for (const row of rows) {
    const key = `${row.policyName}|${row.settingName}`
    if (!groups.has(key)) {
      groups.set(key, {
        settingName: row.settingName,
        policyName: row.policyName,
        builtInPolicy: row.policyName === BUILT_IN_POLICY,
        devices: [],
        deviceIds: new Set(),
        errorCount: 0,
      })
    }
    const group = groups.get(key)
    group.devices.push({ ...row, id: row.deviceId, errorCode: formatErrorCode(row.errorCode) })
    group.deviceIds.add(`${row.Tenant ?? ''}|${row.deviceId}`)
    if (/error/i.test(String(row.settingStatus ?? ''))) group.errorCount += 1
  }
  return [...groups.values()]
    .map(({ deviceIds, ...group }) => ({ ...group, deviceCount: deviceIds.size }))
    .sort((a, b) => b.deviceCount - a.deviceCount)
}

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const [filter, setFilter] = useState(null)

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListDeviceNonCompliance',
    queryKey: 'ListDeviceNonCompliance',
    cacheName: 'IntuneNonCompliantSettings',
    syncTitle: 'Sync Non-Compliant Settings',
    allowToggle: false,
    defaultCached: true,
  })

  const report = ApiGetCall({
    url: reportDB.resolvedApiUrl,
    data: { tenantFilter: currentTenant },
    queryKey: reportDB.resolvedQueryKey,
    waiting: !!currentTenant,
  })

  const rows = useMemo(() => (Array.isArray(report.data) ? report.data : []), [report.data])
  const settings = useMemo(() => groupBySetting(rows), [rows])
  const filteredSettings = useMemo(
    () => groupBySetting(filter ? rows.filter(filter.match) : rows),
    [rows, filter]
  )

  const topSettings = settings.slice(0, 10)
  // The same setting can fail under several policies; name the policy only where bar labels would collide
  const topSettingLabels = topSettings.map((setting) =>
    topSettings.filter((other) => other.settingName === setting.settingName).length > 1
      ? `${setting.settingName} (${setting.policyName})`
      : setting.settingName
  )
  const devicesByOs = useMemo(() => {
    const seen = new Map()
    for (const row of rows) seen.set(`${row.Tenant ?? ''}|${row.deviceId}`, row.os || 'Unknown')
    const counts = {}
    for (const os of seen.values()) counts[os] = (counts[os] ?? 0) + 1
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [rows])
  const deviceTotal = devicesByOs.reduce((total, [, count]) => total + count, 0)

  const deviceActions = getIntuneDeviceActions({ tenantFilter: currentTenant }).filter((action) =>
    DEVICE_ACTION_LABELS.includes(action.label)
  )

  const offCanvas = {
    size: 'lg',
    children: (row) => (
      <CippDataTable
        noCard
        title={`Devices failing "${row.settingName}"`}
        data={row.devices}
        actions={deviceActions}
        // The failure reason leads: the drawer shows ~4 columns before the table scrolls sideways
        simpleColumns={[
          'deviceName',
          'settingStatus',
          'errorCode',
          'userPrincipalName',
          'complianceState',
          'os',
          'osVersion',
          ...reportDB.cacheColumns,
        ]}
      />
    ),
  }

  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, py: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ md: 12, xs: 12 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
            {filter && (
              <Chip
                size="small"
                label={`Filtered: ${filter.label}`}
                onDelete={() => setFilter(null)}
              />
            )}
            {reportDB.controls}
          </Stack>
          {report.isError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              Could not load the non-compliant devices report: {getCippError(report.error)}
            </Alert>
          )}
          {!report.isFetching && report.isSuccess && rows.length === 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              No failing compliance settings are cached for this tenant. Either every device is
              compliant, or the report has not been collected yet: a sync starts an Intune export
              that takes a few minutes, and the next sync reads it.
            </Alert>
          )}
        </Grid>

        <Grid size={{ md: 8, xs: 12 }}>
          <CippChartCard
            title="Top Failing Settings"
            isFetching={report.isFetching}
            chartType="bar"
            labels={topSettingLabels}
            chartSeries={topSettings.map((setting) => setting.deviceCount)}
            // A device failing several settings counts once per bar, so the total is distinct devices
            customTotal={deviceTotal}
            totalLabel="Non-Compliant Devices"
            onSegmentClick={(label, index) => {
              const { policyName, settingName } = topSettings[index]
              setFilter({
                label,
                match: (row) => row.policyName === policyName && row.settingName === settingName,
              })
            }}
          />
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <CippChartCard
            title="Non-Compliant Devices by OS"
            isFetching={report.isFetching}
            chartType="donut"
            labels={devicesByOs.map(([os]) => os)}
            chartSeries={devicesByOs.map(([, count]) => count)}
            totalLabel="Devices"
            onSegmentClick={(label) =>
              setFilter({ label, match: (row) => (row.os || 'Unknown') === label })
            }
          />
        </Grid>

        <Grid size={{ md: 12, xs: 12 }}>
          <CippDataTable
            title="Failing Compliance Settings"
            isFetching={report.isFetching}
            data={filteredSettings}
            offCanvas={offCanvas}
            offCanvasOnRowClick={true}
            simpleColumns={['settingName', 'policyName', 'builtInPolicy', 'deviceCount', 'errorCount']}
          />
        </Grid>
      </Grid>
      {reportDB.syncDialog}
    </Container>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>
)

export default Page
