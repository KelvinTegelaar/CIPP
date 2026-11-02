import { useState } from 'react'
import { CippIcons } from '../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { CippChartCard } from '../../../components/CippCards/CippChartCard'
import { CippImageCard } from '../../../components/CippCards/CippImageCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { CippOffCanvas } from '../../../components/CippComponents/CippOffCanvas'
import { ShadowAIReportButton } from '../../../components/ShadowAIReportButton'
import { useDialog } from '../../../hooks/use-dialog'
import { ApiGetCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  SvgIcon,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { riskChartColor, sortByRiskSeverity } from '../../../utils/shadow-ai'
import { Grid } from '@mui/system'

const riskChipColor = (risk) => {
  switch (String(risk).toLowerCase()) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    case 'informational':
      return 'success'
    default:
      return 'default'
  }
}

// Row detail shown when an AI tool row is clicked, for both the Intune and the Entra table.
const AiToolDetail = ({ row }) => {
  if (!row) return null
  const isIntune = Array.isArray(row.managedDevices)

  const properties = isIntune
    ? [
        { label: 'Application', value: row.application },
        { label: 'Vendor', value: row.vendor },
        { label: 'Category', value: row.category },
        { label: 'Publisher', value: row.publisher },
        { label: 'Version', value: row.version },
        { label: 'Platform', value: row.platform },
        { label: 'Device Installs', value: row.deviceCount },
      ]
    : [
        { label: 'Application', value: row.application },
        { label: 'Vendor', value: row.vendor },
        { label: 'Category', value: row.category },
        { label: 'Application ID', value: row.applicationId },
        {
          label: 'First Consented',
          value: row.firstConsentedDateTime
            ? new Date(row.firstConsentedDateTime).toLocaleString()
            : 'Unknown',
        },
        { label: 'Sign-ins (7 Days)', value: row.signInsLast7Days },
        { label: 'Active Users (7 Days)', value: row.activeUsersLast7Days },
      ]

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          alignItems: "center",
          flexWrap: "wrap"
        }}>
        <Typography variant="h6">{row.aiTool}</Typography>
        <Chip size="small" variant="outlined" label={row.risk} color={riskChipColor(row.risk)} />
        <Chip
          size="small"
          variant="outlined"
          label={row.status ?? 'Unsanctioned'}
          color={row.status === 'Sanctioned' ? 'success' : 'warning'}
        />
      </Stack>
      {row.toolDescription && (
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          {row.toolDescription}
        </Typography>
      )}
      {row.riskReason && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: '4px solid',
            borderLeftColor: (() => {
              const color = riskChipColor(row.catalogRisk ?? row.risk)
              return color === 'default' ? 'divider' : `${color}.main`
            })(),
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Why {row.aiTool} is rated {row.catalogRisk ?? row.risk} risk
          </Typography>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            {row.riskReason}
          </Typography>
        </Box>
      )}
      {row.status === 'Sanctioned' ? (
        <Alert severity="success">
          This tool is marked as company sanctioned for this tenant, so it reports the Informational
          risk level. Use the Remove Company Sanctioned Status action to restore its catalog risk
          level.
        </Alert>
      ) : (
        <Alert severity="info">
          This tool is not company sanctioned. If your customer approves its use, mark it as company
          sanctioned via the row actions to set its risk level to Informational.
        </Alert>
      )}
      <Divider />
      <Grid container spacing={2}>
        {properties
          .filter((prop) => prop.value !== undefined && prop.value !== null && prop.value !== '')
          .map((prop) => (
            <Grid size={{ md: 4, xs: 12 }} key={prop.label}>
              <Typography variant="subtitle2" sx={{
                color: "text.secondary"
              }}>
                {prop.label}
              </Typography>
              <Typography variant="body2">{String(prop.value)}</Typography>
            </Grid>
          ))}
      </Grid>
      {!isIntune &&
        Array.isArray(row.approvedPermissions) &&
        row.approvedPermissions.length > 0 && (
          <>
            <Divider />
            <Typography variant="subtitle2" sx={{
              color: "text.secondary"
            }}>
              Approved Permissions
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{
              flexWrap: "wrap"
            }}>
              {row.approvedPermissions.map((permission) => (
                <Chip key={permission} size="small" variant="outlined" label={permission} />
              ))}
            </Stack>
          </>
        )}
      <Divider />
      {isIntune ? (
        <CippDataTable
          noCard={true}
          title="Installed Devices"
          data={row.managedDevices ?? []}
          simpleColumns={['deviceName', 'userPrincipalName', 'platform', 'osVersion']}
        />
      ) : (
        <CippDataTable
          noCard={true}
          title="Application Users (last 7 days)"
          data={row.applicationUsers ?? []}
          simpleColumns={['userPrincipalName', 'userDisplayName', 'signIns', 'lastSignInDateTime']}
        />
      )}
    </Stack>
  );
}

// Drawer listing the users who signed in to an AI application in the last 7 days.
const ApplicationUsersDrawer = ({ row, drawerVisible, setDrawerVisible }) => (
  <CippOffCanvas
    title={`Application Users - ${row?.application ?? ''}`}
    size="md"
    visible={drawerVisible}
    onClose={() => setDrawerVisible(false)}
  >
    <CippDataTable
      noCard={true}
      title="Application Users (last 7 days)"
      data={row?.applicationUsers ?? []}
      simpleColumns={['userPrincipalName', 'userDisplayName', 'signIns', 'lastSignInDateTime']}
    />
  </CippOffCanvas>
)

// Datasets in the CIPP reporting database this report is compiled from.
const syncRows = [
  { Name: 'DetectedApps' },
  { Name: 'ServicePrincipals' },
  { Name: 'OAuth2PermissionGrants' },
]

// The summary stamp arrives as an ISO string or as the backend's { UtcDateTime } object;
// anything unparseable must not render as "Invalid Date".
const formatLastDataRefresh = (value) => {
  if (!value) return "";
  const date = new Date(value?.UtcDateTime ?? value);
  return Number.isNaN(date.getTime()) ? "" : `Last data refresh: ${date.toLocaleString()}`;
};

const Page = () => {
  const theme = useTheme()
  const currentTenant = useSettings().currentTenant
  const syncDialog = useDialog()
  const queryKey = `ListShadowAI-${currentTenant}`
  const [topToolsMode, setTopToolsMode] = useState('installations')

  const shadowAi = ApiGetCall({
    url: '/api/ListShadowAI',
    data: { tenantFilter: currentTenant },
    queryKey: queryKey,
    waiting: !!currentTenant && currentTenant !== 'AllTenants',
  })

  const data = shadowAi.data ?? {}
  const summary = data.summary ?? {}
  const byCategory = data.byCategory ?? []
  const byRisk = sortByRiskSeverity(data.byRisk ?? [])
  const byRiskChartColors = byRisk.map((item) => riskChartColor(item.risk, theme))
  const topTools = data.topTools ?? []
  const needsSync = shadowAi.isSuccess && !summary.intuneSynced && !summary.entraSynced
  const showCharts = shadowAi.isFetching || byCategory.length > 0

  const topToolsMetric = topToolsMode === 'users' ? 'users' : 'devices'
  const topToolsSorted = [...topTools].sort(
    (a, b) => (b[topToolsMetric] ?? 0) - (a[topToolsMetric] ?? 0)
  )

  const sanctionActions = [
    {
      label: 'Mark as Company Sanctioned',
      type: 'POST',
      url: '/api/ExecShadowAISanction',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.CheckCircleIcon />
        </SvgIcon>
      ),
      data: { Tool: 'aiTool', Action: '!Sanction' },
      confirmText:
        "Mark [aiTool] as company sanctioned for this tenant? Its risk level will report as Informational and its status as 'Sanctioned'.",
      relatedQueryKeys: [queryKey],
      condition: (row) => row.status !== 'Sanctioned',
      multiPost: false,
    },
    {
      label: 'Remove Company Sanctioned Status',
      type: 'POST',
      url: '/api/ExecShadowAISanction',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.NoSymbolIcon />
        </SvgIcon>
      ),
      data: { Tool: 'aiTool', Action: '!Unsanction' },
      confirmText:
        "Remove the company sanctioned status from [aiTool]? Its catalog risk level will apply again and its status will report as 'Unsanctioned'.",
      relatedQueryKeys: [queryKey],
      condition: (row) => row.status === 'Sanctioned',
      multiPost: false,
    },
  ]

  const statusFilters = [
    {
      filterName: 'Sanctioned',
      value: [{ id: 'status', value: 'Sanctioned' }],
      type: 'column',
    },
    {
      filterName: 'Unsanctioned',
      value: [{ id: 'status', value: 'Unsanctioned' }],
      type: 'column',
    },
    {
      filterName: 'High Risk',
      value: [{ id: 'risk', value: 'High' }],
      type: 'column',
    },
  ]

  const toolDetailOffCanvas = {
    size: 'lg',
    children: (row) => <AiToolDetail row={row} />,
  }

  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, py: 2 }}>
      <Grid container spacing={2}>
        {currentTenant === 'AllTenants' ? (
          <Grid size={{ md: 4, xs: 12 }}>
            <CippImageCard
              title="Not supported"
              imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
              text="Shadow AI Discovery requires a single tenant. Please select a tenant from the dropdown above."
            />
          </Grid>
        ) : (
          <>
            <Grid size={{ md: 12, xs: 12 }}>
              {/* Both buttons beside the refresh stamp squeeze to three lines on a phone. */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 0 }}
                sx={{
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  mb: 1
                }}>
                <Typography variant="body2" sx={{
                  color: "text.secondary"
                }}>
                  {formatLastDataRefresh(summary.lastDataRefresh)}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  <ShadowAIReportButton
                    data={data}
                    tenantName={currentTenant}
                    disabled={shadowAi.isFetching || needsSync}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={syncDialog.handleOpen}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <CippIcons.ArrowPathIcon />
                      </SvgIcon>
                    }
                  >
                    Sync data
                  </Button>
                </Stack>
              </Stack>
              {needsSync && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  No cached data found for this tenant yet. Click "Sync data" to collect the Intune
                  and Entra datasets; the report populates once the sync completes.
                </Alert>
              )}
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippInfoBar
                isFetching={shadowAi.isFetching}
                data={[
                  {
                    icon: <CippIcons.CpuChipIcon />,
                    name: 'AI Tools Detected',
                    data: `${summary.aiToolsDetected ?? 0}`,
                  },
                  {
                    icon: <CippIcons.ComputerDesktopIcon />,
                    name: 'Device Installs',
                    data: `${summary.deviceInstalls ?? 0}`,
                  },
                  {
                    icon: <CippIcons.Key />,
                    name: 'AI Apps in Entra',
                    data: `${summary.consentedAiApps ?? 0}`,
                  },
                  {
                    icon: <CippIcons.ExclamationTriangleIcon />,
                    name: 'High-Risk AI Tools',
                    data: `${summary.highRiskTools ?? 0}`,
                    color: 'error',
                  },
                ]}
              />
            </Grid>

            {showCharts && (
              <>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="AI Tools by Category"
                    isFetching={shadowAi.isFetching}
                    chartType="donut"
                    labels={byCategory.map((item) => item.category)}
                    chartSeries={byCategory.map((item) => item.tools)}
                    totalLabel="Tools"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="Top AI Tools"
                    isFetching={shadowAi.isFetching}
                    chartType="bar"
                    labels={topToolsSorted.map((item) => item.tool)}
                    chartSeries={topToolsSorted.map((item) => item[topToolsMetric] ?? 0)}
                    totalLabel={
                      topToolsMode === 'users' ? 'Active Users (7 Days)' : 'Device Installs'
                    }
                    headerAction={
                      <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={topToolsMode}
                        onChange={(event, value) => value && setTopToolsMode(value)}
                      >
                        <ToggleButton value="installations">By installations</ToggleButton>
                        <ToggleButton value="users">By users</ToggleButton>
                      </ToggleButtonGroup>
                    }
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="AI Tool Risk Distribution"
                    isFetching={shadowAi.isFetching}
                    chartType="pie"
                    labels={byRisk.map((item) => item.risk)}
                    chartSeries={byRisk.map((item) => item.tools)}
                    colors={byRiskChartColors}
                    totalLabel="Tools"
                  />
                </Grid>
              </>
            )}

            <Grid size={{ md: 12, xs: 12 }}>
              <CippDataTable
                title="AI Software on Managed Devices (Intune)"
                isFetching={shadowAi.isFetching}
                data={data.detectedApps ?? []}
                actions={sanctionActions}
                filters={statusFilters}
                offCanvas={toolDetailOffCanvas}
                offCanvasOnRowClick={true}
                simpleColumns={[
                  'application',
                  'aiTool',
                  'category',
                  'risk',
                  'status',
                  'publisher',
                  'platform',
                  'version',
                  'managedDevices',
                ]}
              />
            </Grid>

            <Grid size={{ md: 12, xs: 12 }}>
              <CippDataTable
                title="AI Applications in Entra"
                isFetching={shadowAi.isFetching}
                actions={[
                  ...sanctionActions,
                  {
                    label: 'Application Users',
                    icon: <CippIcons.UserGroupIcon />,
                    customComponent: (row, { drawerVisible, setDrawerVisible }) => (
                      <ApplicationUsersDrawer
                        row={row}
                        drawerVisible={drawerVisible}
                        setDrawerVisible={setDrawerVisible}
                      />
                    ),
                    multiPost: false,
                  },
                ]}
                data={data.consentedApps ?? []}
                filters={statusFilters}
                offCanvas={toolDetailOffCanvas}
                offCanvasOnRowClick={true}
                simpleColumns={[
                  'application',
                  'aiTool',
                  'category',
                  'risk',
                  'status',
                  'applicationId',
                  'approvedPermissions',
                  'signInsLast7Days',
                  'activeUsersLast7Days',
                  'firstConsentedDateTime',
                ]}
              />
            </Grid>

            <CippApiDialog
              createDialog={syncDialog}
              title="Sync Shadow AI data"
              api={{
                type: 'GET',
                url: '/api/ExecCIPPDBCache',
                data: { Name: 'Name' },
                confirmText:
                  'Queue a refresh of the cached Intune detected apps and Entra application data for this tenant? The report updates once the sync completes.',
                relatedQueryKeys: [queryKey],
              }}
              row={syncRows}
            />
          </>
        )}
      </Grid>
    </Container>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page

