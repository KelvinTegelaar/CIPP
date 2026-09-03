import {
  Box,
  Container,
  Button,
  Divider,
  List,
  ListItemButton,
  ListSubheader,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from '@mui/material'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Grid, useMediaQuery } from '@mui/system'
import { useSettings } from '../../hooks/use-settings'
import { useIsMobileLayout } from '../../hooks/use-breakpoint'
import { ApiGetCall } from '../../api/ApiCall.jsx'
import { getFilteredPortals } from '../../utils/get-filtered-portals'
import { CippIcons, getIconByName } from '../../utils/icon-registry'
import { BulkActionsMenu } from '../../components/bulk-actions-menu'
import { CippPageActionsFab } from '../../components/CippComponents/CippPageActionsFab'
import { ExecutiveReportButton } from '../../components/ExecutiveReportButton'
import { TabbedLayout } from '../../layouts/TabbedLayout'
import { Layout as DashboardLayout } from '../../layouts/index'
import tabOptions from './tabOptions'
import { dashboardDemoData } from '../../data/dashboardv2-demo-data'
import { SecureScoreCard } from '../../components/CippComponents/SecureScoreCard'
import { MFACard } from '../../components/CippComponents/MFACard'
import { AuthMethodCard } from '../../components/CippComponents/AuthMethodCard'
import { LicenseCard } from '../../components/CippComponents/LicenseCard'
import { TenantInfoCard } from '../../components/CippComponents/TenantInfoCard'
import { TenantMetricsGrid } from '../../components/CippComponents/TenantMetricsGrid'
import { AssessmentCard } from '../../components/CippComponents/AssessmentCard'
import { AlertsOverviewCard } from '../../components/CippComponents/AlertsOverviewCard'
import { CippReportToolbar } from '../../components/CippComponents/CippReportToolbar'
import { CippHead } from '../../components/CippComponents/CippHead.jsx'
import { AllTenantsDashboard } from '../../components/CippAllTenants/AllTenantsDashboard'

const Page = () => {
  const settings = useSettings()
  const router = useRouter()
  const { currentTenant } = settings
  // The per-tenant cards below are all scoped to a single tenant's Graph data. Under AllTenants —
  // which is also the state on first login, before a tenant has been picked — swap in the
  // cross-tenant view rather than letting the layout render "Not supported".
  const isAllTenants = !currentTenant || currentTenant === 'AllTenants'
  const [portalMenuItems, setPortalMenuItems] = useState([])
  const isWide = useMediaQuery('(min-width:1513px)')
  // Below md the Portals/Reports button row gives way to a bottom-right FAB sheet, and
  // CippReportToolbar collapses to selector + kebab on its own.
  const isMobile = useIsMobileLayout()
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState(null)
  // Get reportId from query params or default to the user's preferred suite (Preferences page)
  // Only use default if router is ready and reportId is still not present
  const defaultReportId =
    settings.UserSpecificSettings?.defaultTestSuite?.value ||
    settings.defaultTestSuite?.value ||
    'ztna'
  const selectedReport =
    router.isReady && !router.query.reportId
      ? defaultReportId
      : router.query.reportId || defaultReportId

  // Fetch available reports (shared cache with CippReportToolbar)
  const reportsApi = ApiGetCall({
    url: '/api/ListTestReports',
    queryKey: 'ListTestReports',
  })

  const reports = reportsApi.data || []

  const organization = ApiGetCall({
    url: '/api/ListGraphRequest',
    queryKey: `${currentTenant}-ListGraphRequest-organization`,
    data: { tenantFilter: currentTenant, Endpoint: 'organization' },
    waiting: !isAllTenants,
  })

  const organizationRecord = organization.data?.Results?.[0]

  const testsApi = ApiGetCall({
    url: '/api/ListTests',
    data: { tenantFilter: currentTenant, reportId: selectedReport },
    queryKey: `${currentTenant}-ListTests-${selectedReport}`,
    waiting: !isAllTenants && !!currentTenant && !!selectedReport,
  })

  const currentTenantInfo = ApiGetCall({
    url: '/api/listTenants',
    data: { AllTenantSelector: true },
    queryKey: 'TenantSelector',
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  })

  const reportData =
    testsApi.isSuccess && testsApi.data?.TenantCounts
      ? {
          ExecutedAt: testsApi.data?.LatestReportTimeStamp || null,
          TenantName: organizationRecord?.displayName || '',
          Domain: currentTenant || '',
          TestResultSummary: {
            IdentityPassed: testsApi.data.TestCounts?.Identity?.Passed || 0,
            IdentityFailed: testsApi.data.TestCounts?.Identity?.Failed || 0,
            IdentitySkipped: testsApi.data.TestCounts?.Identity?.Skipped || 0,
            IdentityInformational: testsApi.data.TestCounts?.Identity?.Informational || 0,
            IdentityNeedsAttention: testsApi.data.TestCounts?.Identity?.NeedsAttention || 0,
            IdentityTotal: testsApi.data.TestCounts?.Identity?.Total || 0,
            DevicesPassed: testsApi.data.TestCounts?.Devices?.Passed || 0,
            DevicesFailed: testsApi.data.TestCounts?.Devices?.Failed || 0,
            DevicesSkipped: testsApi.data.TestCounts?.Devices?.Skipped || 0,
            DevicesInformational: testsApi.data.TestCounts?.Devices?.Informational || 0,
            DevicesNeedsAttention: testsApi.data.TestCounts?.Devices?.NeedsAttention || 0,
            DevicesTotal: testsApi.data.TestCounts?.Devices?.Total || 0,
            CustomPassed: testsApi.data.TestCounts?.Custom?.Passed || 0,
            CustomFailed: testsApi.data.TestCounts?.Custom?.Failed || 0,
            CustomSkipped: testsApi.data.TestCounts?.Custom?.Skipped || 0,
            CustomInformational: testsApi.data.TestCounts?.Custom?.Informational || 0,
            CustomNeedsAttention: testsApi.data.TestCounts?.Custom?.NeedsAttention || 0,
            CustomTotal: testsApi.data.TestCounts?.Custom?.Total || 0,
            DataPassed: 0,
            DataTotal: 0,
          },
          SecureScore: testsApi.data.SecureScore || [],
          TenantInfo: {
            TenantOverview: {
              UserCount: testsApi.data.TenantCounts.Users || 0,
              GuestCount: testsApi.data.TenantCounts.Guests || 0,
              GroupCount: testsApi.data.TenantCounts.Groups || 0,
              ApplicationCount: testsApi.data.TenantCounts.ServicePrincipals || 0,
              DeviceCount: testsApi.data.TenantCounts.Devices || 0,
              ManagedDeviceCount: testsApi.data.TenantCounts.ManagedDevices || 0,
            },
            MFAState: testsApi.data.MFAState,
            OverviewCaDevicesAllUsers: dashboardDemoData.TenantInfo.OverviewCaDevicesAllUsers,
            OverviewAuthMethodsPrivilegedUsers:
              dashboardDemoData.TenantInfo.OverviewAuthMethodsPrivilegedUsers,
            DeviceOverview: dashboardDemoData.TenantInfo.DeviceOverview,
          },
        }
      : dashboardDemoData

  useEffect(() => {
    if (currentTenantInfo.isSuccess) {
      const tenantLookup = currentTenantInfo.data?.find(
        (tenant) => tenant.defaultDomainName === currentTenant
      )

      // Get filtered portals based on user preferences
      const filteredPortals = getFilteredPortals(settings)

      const menuItems = filteredPortals.map((portal) => ({
        label: portal.label,
        target: '_blank',
        // A portal with a `field` has a URL the backend resolved for us (SharePoint's host cannot be
        // derived from the tenant). Use it when it's there, otherwise fall back to the templated URL.
        link:
          portal.field && tenantLookup?.[portal.field]
            ? tenantLookup[portal.field]
            : portal.url.replace(portal.variable, tenantLookup?.[portal.variable]),
        icon: portal.icon,
      }))
      setPortalMenuItems(menuItems)
    }
  }, [
    currentTenantInfo.isSuccess,
    currentTenant,
    settings.portalLinks,
    settings.UserSpecificSettings,
  ])

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  if (isAllTenants) {
    // No top margin, matching CippTablePage: the layout's breadcrumb Divider already carries mb: 2.
    // xs bottom margin clears the mobile page-actions FAB (~76px), matching CippMobileCardList's pb: 10.
    return (
      <Container maxWidth={false} sx={{ mb: { xs: 10, md: 6 } }}>
        <CippHead title="Dashboard" />
        <AllTenantsDashboard />
      </Container>
    )
  }

  return (
    // Both branches sit under the same TabbedLayout tab bar; the per-tenant mt: 12 is legacy
    // desktop spacing kept for now. Mobile adds nothing — the breadcrumb rail no longer
    // renders on the dashboard, and the sibling views (identity/devices/custom) start their
    // toolbar straight after the layout's own 16px gap, so this view must too.
    // mb xs clears the mobile page-actions FAB (~76px), matching CippMobileCardList's pb: 10.
    <Container maxWidth={false} sx={{ mt: { xs: 0, md: 12 }, mb: { xs: 10, md: 6 } }}>
      <CippHead title="Dashboard" />
      <Box sx={{ width: '100%', mx: 'auto' }}>
        {/* xs has a single item (the portals cell is desktop-only), so grid spacing would
            only pad the toolbar down away from the title. */}
        <Grid
          container
          spacing={{ xs: 0, md: 2 }}
          sx={{
            alignItems: "center",
            mb: 2
          }}>
          {!isMobile && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              data-tutorial="dashboard-toolbar"
              sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}
            >
              <Box
                data-tutorial="dashboard-portals"
                sx={{
                  flex: '0.7 1 0',
                  minWidth: 0,
                  display: 'flex',
                  '& .MuiButtonBase-root': {
                    width: '100%',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              >
                <BulkActionsMenu
                  buttonName="Portals"
                  actions={portalMenuItems}
                  disabled={!currentTenantInfo.isSuccess || portalMenuItems.length === 0}
                />
              </Box>
              {isWide ? (
                <>
                  <Box
                    sx={{
                      flex: '1.15 1 0',
                      minWidth: 0,
                      display: 'flex',
                      '& .MuiButtonBase-root': {
                        width: '100%',
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  >
                    <ExecutiveReportButton disabled={organization.isFetching} />
                  </Box>
                  <Box sx={{ flex: '1.15 1 0', minWidth: 0, display: 'flex' }}>
                    <Button
                      component={Link}
                      href="/tools/report-builder/generated"
                      variant="contained"
                      startIcon={<CippIcons.Assessment />}
                      sx={{
                        width: '100%',
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Report Builder
                      </Box>
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                    <Button
                      variant="contained"
                      onClick={(e) => setReportsMenuAnchor(e.currentTarget)}
                      startIcon={
                        <SvgIcon fontSize="small">
                          <CippIcons.ChevronDownIcon />
                        </SvgIcon>
                      }
                      sx={{
                        width: '100%',
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Dashboard Reports
                      </Box>
                    </Button>
                  </Box>
                  <Menu
                    keepMounted
                    anchorEl={reportsMenuAnchor}
                    open={Boolean(reportsMenuAnchor)}
                    onClose={() => setReportsMenuAnchor(null)}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    slotProps={{
                      list: { dense: true, sx: { p: 1 } }
                    }}
                  >
                    <ExecutiveReportButton
                      variant="menuItem"
                      disabled={organization.isFetching}
                      onClick={() => setReportsMenuAnchor(null)}
                    />
                    <MenuItem
                      component={Link}
                      href="/tools/report-builder/generated"
                      onClick={() => setReportsMenuAnchor(null)}
                    >
                      <ListItemIcon>
                        <CippIcons.Assessment fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Report Builder</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Grid>
          )}
          <Grid size={{ xs: 12, md: 8 }} data-tutorial="dashboard-test-suite">
            <CippReportToolbar />
          </Grid>
        </Grid>

        {/* Tenant Overview Section - 3 Column Layout */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Column 1: Tenant Information */}
          <Grid size={{ xs: 12, lg: 4 }} data-tutorial="dashboard-tenant-info">
            <TenantInfoCard data={organizationRecord} isLoading={organization.isFetching} />
          </Grid>

          {/* Column 2: Tenant Metrics - 2x3 Grid */}
          <Grid size={{ xs: 12, lg: 4 }} data-tutorial="dashboard-tenant-metrics">
            <TenantMetricsGrid
              data={reportData.TenantInfo.TenantOverview}
              isLoading={testsApi.isFetching}
            />
          </Grid>

          {/* Column 3: Assessment Results */}
          <Grid size={{ xs: 12, lg: 4 }} data-tutorial="dashboard-assessment">
            <AssessmentCard
              data={reportData}
              isLoading={testsApi.isFetching}
              title={reports.find((r) => r.id === selectedReport)?.name}
              description={reports.find((r) => r.id === selectedReport)?.description}
            />
          </Grid>
        </Grid>

        {/* Alerts Section - Full Width */}
        <Box sx={{ mb: 2 }} data-tutorial="dashboard-alerts">
          <AlertsOverviewCard tenantFilter={currentTenant} />
        </Box>

        {/* Identity Section - 2 Column Grid */}
        <Box>
          <Grid container spacing={2}>
            {/* Left Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  height: '100%',
                }}
              >
                {/* The fixed height exists to keep the two lg columns level. Below lg this is
                    a single column, so it buys nothing and clips instead: the description wraps
                    to more lines on a narrow card and the stats row falls off the bottom edge. */}
                <Box sx={{ height: { xs: 'auto', lg: 450 } }} data-tutorial="dashboard-secure-score">
                  <SecureScoreCard
                    data={testsApi.data?.SecureScore}
                    isLoading={testsApi.isFetching}
                    sx={{ height: '100%' }}
                  />
                </Box>
                <Box sx={{ height: { xs: 'auto', lg: 450 } }} data-tutorial="dashboard-auth-methods">
                  <AuthMethodCard
                    data={testsApi.data?.MFAState}
                    isLoading={testsApi.isFetching}
                    sx={{ height: '100%' }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  height: '100%',
                }}
              >
                <Box sx={{ height: { xs: 'auto', lg: 450 } }} data-tutorial="dashboard-mfa">
                  <MFACard
                    data={testsApi.data?.MFAState}
                    isLoading={testsApi.isFetching}
                    sx={{ height: '100%' }}
                  />
                </Box>
                <Box sx={{ height: { xs: 'auto', lg: 450 } }} data-tutorial="dashboard-licenses">
                  <LicenseCard
                    data={testsApi.data?.LicenseData}
                    isLoading={testsApi.isFetching}
                    sx={{ height: '100%' }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Mobile home of the Portals/Reports header row. keepMounted: ExecutiveReportButton's
          preview Dialog is internal state and must survive the sheet auto-closing under it
          (same trick as the desktop Reports Menu above). */}
      {isMobile && (
        <CippPageActionsFab
          title="Dashboard actions"
          restackButtons={false}
          sheetProps={{ ModalProps: { keepMounted: true } }}
        >
          {portalMenuItems.length > 0 && (
            <>
              <List
                sx={{ py: 0 }}
                subheader={
                  <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
                    Portals
                  </ListSubheader>
                }
              >
                {portalMenuItems.map((item, index) => (
                  <ListItemButton
                    key={`portal-${index}`}
                    component="a"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ minHeight: 48 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{getIconByName(item.icon)}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
              <Divider sx={{ my: 0.5 }} />
            </>
          )}
          <List
            sx={{ py: 0 }}
            subheader={
              <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
                Reports
              </ListSubheader>
            }
          >
            <ExecutiveReportButton variant="menuItem" disabled={organization.isFetching} />
            <ListItemButton
              component={Link}
              href="/tools/report-builder/generated"
              sx={{ minHeight: 48 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CippIcons.Assessment fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Report Builder" />
            </ListItemButton>
          </List>
        </CippPageActionsFab>
      )}
    </Container>
  );
}

// No allTenantsSupport={false} here: the page handles AllTenants itself (see isAllTenants above),
// and the Identity / Devices / Custom tabs each render a cross-tenant view in that mode too.
// Leaving the opt-out in place would make the layout render "Not supported" and never mount this page.
Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
