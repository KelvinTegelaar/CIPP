import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { CippChartCard } from '../../../components/CippCards/CippChartCard'
import { CippImageCard } from '../../../components/CippCards/CippImageCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { CippOffCanvas } from '../../../components/CippComponents/CippOffCanvas'
import { useDialog } from '../../../hooks/use-dialog'
import { ApiGetCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'
import { Alert, Button, Container, Stack, SvgIcon, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import {
  ArrowPathIcon,
  CpuChipIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

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

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const syncDialog = useDialog()
  const queryKey = `ListShadowAI-${currentTenant}`

  const shadowAi = ApiGetCall({
    url: '/api/ListShadowAI',
    data: { tenantFilter: currentTenant },
    queryKey: queryKey,
    waiting: !!currentTenant && currentTenant !== 'AllTenants',
  })

  const data = shadowAi.data ?? {}
  const summary = data.summary ?? {}
  const byCategory = data.byCategory ?? []
  const byRisk = data.byRisk ?? []
  const topTools = data.topTools ?? []
  const needsSync = shadowAi.isSuccess && !summary.intuneSynced && !summary.entraSynced
  const showCharts = shadowAi.isFetching || byCategory.length > 0

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
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {summary.lastDataRefresh
                    ? `Last data refresh: ${new Date(summary.lastDataRefresh).toLocaleString()}`
                    : ''}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={syncDialog.handleOpen}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowPathIcon />
                    </SvgIcon>
                  }
                >
                  Sync data
                </Button>
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
                    icon: <CpuChipIcon />,
                    name: 'AI Tools Detected',
                    data: `${summary.aiToolsDetected ?? 0}`,
                  },
                  {
                    icon: <ComputerDesktopIcon />,
                    name: 'Device Installs',
                    data: `${summary.deviceInstalls ?? 0}`,
                  },
                  {
                    icon: <KeyIcon />,
                    name: 'AI Apps in Entra',
                    data: `${summary.consentedAiApps ?? 0}`,
                  },
                  {
                    icon: <ExclamationTriangleIcon />,
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
                    labels={topTools.map((item) => item.tool)}
                    chartSeries={topTools.map((item) => item.footprint)}
                    totalLabel="Devices + Users"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="AI Tools by Risk"
                    isFetching={shadowAi.isFetching}
                    chartType="pie"
                    labels={byRisk.map((item) => item.risk)}
                    chartSeries={byRisk.map((item) => item.tools)}
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
                simpleColumns={[
                  'application',
                  'aiTool',
                  'category',
                  'risk',
                  'publisher',
                  'platform',
                  'version',
                  'deviceCount',
                ]}
              />
            </Grid>

            <Grid size={{ md: 12, xs: 12 }}>
              <CippDataTable
                title="AI Applications in Entra"
                isFetching={shadowAi.isFetching}
                actions={[
                  {
                    label: 'Application Users',
                    icon: <UserGroupIcon />,
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
                simpleColumns={[
                  'application',
                  'aiTool',
                  'category',
                  'risk',
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
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
