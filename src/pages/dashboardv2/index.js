import {
  Box,
  Container,
  Button,
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
import { ApiGetCall } from '../../api/ApiCall.jsx'
import Portals from '../../data/portals'
import { BulkActionsMenu } from '../../components/bulk-actions-menu.js'
import { ExecutiveReportButton } from '../../components/ExecutiveReportButton.js'
import { TabbedLayout } from '../../layouts/TabbedLayout'
import { Layout as DashboardLayout } from '../../layouts/index.js'
import tabOptions from './tabOptions'
import { dashboardDemoData } from '../../data/dashboardv2-demo-data'
import { SecureScoreCard } from '../../components/CippComponents/SecureScoreCard'
import { MFACard } from '../../components/CippComponents/MFACard'
import { AuthMethodCard } from '../../components/CippComponents/AuthMethodCard'
import { LicenseCard } from '../../components/CippComponents/LicenseCard'
import { TenantInfoCard } from '../../components/CippComponents/TenantInfoCard'
import { TenantMetricsGrid } from '../../components/CippComponents/TenantMetricsGrid'
import { AssessmentCard } from '../../components/CippComponents/AssessmentCard'
import { CippReportToolbar } from '../../components/CippComponents/CippReportToolbar'
import { Assessment as AssessmentIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material'
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon'
import { CippHead } from '../../components/CippComponents/CippHead.jsx'

const Page = () => {
  const settings = useSettings()
  const router = useRouter()
  const { currentTenant } = settings
  const [portalMenuItems, setPortalMenuItems] = useState([])
  const isWide = useMediaQuery('(min-width:1513px)')
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState(null)
  // Get reportId from query params or default to "ztna"
  // Only use default if router is ready and reportId is still not present
  const selectedReport =
    router.isReady && !router.query.reportId ? 'ztna' : router.query.reportId || 'ztna'

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
  })

  const organizationRecord = organization.data?.Results?.[0]

  const testsApi = ApiGetCall({
    url: '/api/ListTests',
    data: { tenantFilter: currentTenant, reportId: selectedReport },
    queryKey: `${currentTenant}-ListTests-${selectedReport}`,
    waiting: !!currentTenant && !!selectedReport,
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
            IdentityTotal: testsApi.data.TestCounts?.Identity?.Total || 0,
            DevicesPassed: testsApi.data.TestCounts?.Devices?.Passed || 0,
            DevicesTotal: testsApi.data.TestCounts?.Devices?.Total || 0,
            CustomPassed: testsApi.data.TestCounts?.Custom?.Passed || 0,
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

  // Function to filter portals based on user preferences
  const getFilteredPortals = () => {
    const defaultLinks = {
      M365_Portal: true,
      Exchange_Portal: true,
      Entra_Portal: true,
      Teams_Portal: true,
      Azure_Portal: true,
      Intune_Portal: true,
      SharePoint_Admin: true,
      Security_Portal: true,
      Compliance_Portal: true,
      Power_Platform_Portal: true,
      Power_BI_Portal: true,
    }

    let portalLinks
    if (settings.UserSpecificSettings?.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.UserSpecificSettings.portalLinks }
    } else if (settings.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.portalLinks }
    } else {
      portalLinks = defaultLinks
    }

    // Filter the portals based on user settings
    return Portals.filter((portal) => {
      const settingKey = portal.name
      return settingKey ? portalLinks[settingKey] === true : true
    })
  }

  useEffect(() => {
    if (currentTenantInfo.isSuccess) {
      const tenantLookup = currentTenantInfo.data?.find(
        (tenant) => tenant.defaultDomainName === currentTenant
      )

      // Get filtered portals based on user preferences
      const filteredPortals = getFilteredPortals()

      const menuItems = filteredPortals.map((portal) => ({
        label: portal.label,
        target: '_blank',
        link: portal.url.replace(portal.variable, tenantLookup?.[portal.variable]),
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

  return (
    <Container maxWidth={false} sx={{ mt: 12, mb: 6 }}>
      <CippHead title="Dashboard" />
      <Box sx={{ width: '100%', mx: 'auto' }}>
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
              <BulkActionsMenu
                buttonName="Portals"
                actions={portalMenuItems}
                disabled={!currentTenantInfo.isSuccess || portalMenuItems.length === 0}
              />
              {isWide ? (
                <>
                  <ExecutiveReportButton disabled={organization.isFetching} />
                  <Button
                    component={Link}
                    href="/tools/report-builder/generated"
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Report Builder
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={(e) => setReportsMenuAnchor(e.currentTarget)}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ChevronDownIcon />
                      </SvgIcon>
                    }
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    Dashboard Reports
                  </Button>
                  <Menu
                    keepMounted
                    anchorEl={reportsMenuAnchor}
                    open={Boolean(reportsMenuAnchor)}
                    onClose={() => setReportsMenuAnchor(null)}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    MenuListProps={{ dense: true, sx: { p: 1 } }}
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
                        <AssessmentIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Report Builder</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <CippReportToolbar />
          </Grid>
        </Grid>

        {/* Tenant Overview Section - 3 Column Layout */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Column 1: Tenant Information */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <TenantInfoCard data={organizationRecord} isLoading={organization.isFetching} />
          </Grid>

          {/* Column 2: Tenant Metrics - 2x3 Grid */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <TenantMetricsGrid
              data={reportData.TenantInfo.TenantOverview}
              isLoading={testsApi.isFetching}
            />
          </Grid>

          {/* Column 3: Assessment Results */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <AssessmentCard
              data={reportData}
              isLoading={testsApi.isFetching}
              title={reports.find((r) => r.id === selectedReport)?.name}
            />
          </Grid>
        </Grid>

        {/* Identity Section - 2 Column Grid */}
        <Box>
          <Grid container spacing={2}>
            {/* Left Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                <Box sx={{ height: 450 }}>
                  <SecureScoreCard
                    data={testsApi.data?.SecureScore}
                    isLoading={testsApi.isFetching}
                    sx={{ height: '100%' }}
                  />
                </Box>
                <Box sx={{ height: 450 }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                <Box sx={{ height: 450 }}>
                  <MFACard
                    data={testsApi.data?.MFAState}
                    isLoading={testsApi.isFetching}
                    sx={{ height: '100%' }}
                  />
                </Box>
                <Box sx={{ height: 450 }}>
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
    </Container>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
