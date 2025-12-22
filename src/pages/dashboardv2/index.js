import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  Autocomplete,
  TextField,
  Button,
  Skeleton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Grid } from "@mui/system";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall.jsx";
import Portals from "/src/data/portals";
import { BulkActionsMenu } from "/src/components/bulk-actions-menu.js";
import { ExecutiveReportButton } from "/src/components/ExecutiveReportButton.js";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LabelList,
} from "recharts";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import { dashboardDemoData } from "/src/data/dashboardv2-demo-data";
import { CaSankey } from "/src/components/CippComponents/CaSankey";
import { CaDeviceSankey } from "/src/components/CippComponents/CaDeviceSankey";
import { AuthMethodSankey } from "/src/components/CippComponents/AuthMethodSankey";
import { DesktopDevicesSankey } from "/src/components/CippComponents/DesktopDevicesSankey";
import { MobileSankey } from "/src/components/CippComponents/MobileSankey";
import { CippUniversalSearch } from "/src/components/CippCards/CippUniversalSearch.jsx";
import { CippCopyToClipBoard } from "/src/components/CippComponents/CippCopyToClipboard.jsx";
import { CippTimeAgo } from "/src/components/CippComponents/CippTimeAgo.jsx";
import {
  People as UsersIcon,
  Person as UserIcon,
  PersonOutline as GuestIcon,
  Group as GroupIcon,
  Apps as AppsIcon,
  Devices as DevicesIcon,
  PhoneAndroid as ManagedIcon,
  Security as SecurityIcon,
  Business as BuildingIcon,
  CheckCircle as CheckCircleIcon,
  Laptop as MonitorIcon,
  Work as BriefcaseIcon,
} from "@mui/icons-material";

const Page = () => {
  const settings = useSettings();
  const { currentTenant } = settings;
  const [portalMenuItems, setPortalMenuItems] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const reportOptions = [
    "Select a report",
    "Executive Summary Report",
    "Security Assessment Report",
    "Compliance Report",
    "Device Inventory Report",
  ];

  const organization = ApiGetCall({
    url: "/api/ListOrg",
    queryKey: `${currentTenant}-ListOrg`,
    data: { tenantFilter: currentTenant },
  });

  const testsApi = ApiGetCall({
    url: "/api/ListTests",
    data: { tenantFilter: currentTenant, reportId: "d5d1e123-bce0-482d-971f-be6ed820dd92" },
    queryKey: `${currentTenant}-ListTests-d5d1e123-bce0-482d-971f-be6ed820dd92`,
  });

  const driftApi = ApiGetCall({
    url: "/api/listTenantDrift",
    data: {
      TenantFilter: currentTenant,
    },
    queryKey: `TenantDrift-${currentTenant}`,
  });

  const currentTenantInfo = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: `ListTenants`,
  });

  const reportData =
    testsApi.isSuccess && testsApi.data?.TenantCounts
      ? {
          ExecutedAt: testsApi.data.LatestReportTimeStamp || new Date().toISOString(),
          TenantName: organization.data?.displayName || "",
          Domain: currentTenant || "",
          TestResultSummary: {
            IdentityPassed: testsApi.data.TestCounts?.Identity?.Passed || 0,
            IdentityTotal: testsApi.data.TestCounts?.Identity?.Total || 0,
            DevicesPassed: testsApi.data.TestCounts?.Devices?.Passed || 0,
            DevicesTotal: testsApi.data.TestCounts?.Devices?.Total || 0,
            DataPassed: 0,
            DataTotal: 0,
          },
          TenantInfo: {
            TenantOverview: {
              UserCount: testsApi.data.TenantCounts.Users || 0,
              GuestCount: testsApi.data.TenantCounts.Guests || 0,
              GroupCount: testsApi.data.TenantCounts.Groups || 0,
              ApplicationCount: testsApi.data.TenantCounts.ServicePrincipals || 0,
              DeviceCount: testsApi.data.TenantCounts.Devices || 0,
              ManagedDeviceCount: testsApi.data.TenantCounts.ManagedDevices || 0,
            },
            OverviewCaMfaAllUsers: dashboardDemoData.TenantInfo.OverviewCaMfaAllUsers,
            OverviewCaDevicesAllUsers: dashboardDemoData.TenantInfo.OverviewCaDevicesAllUsers,
            OverviewAuthMethodsPrivilegedUsers:
              dashboardDemoData.TenantInfo.OverviewAuthMethodsPrivilegedUsers,
            OverviewAuthMethodsAllUsers: dashboardDemoData.TenantInfo.OverviewAuthMethodsAllUsers,
            DeviceOverview: dashboardDemoData.TenantInfo.DeviceOverview,
          },
        }
      : dashboardDemoData;

  useEffect(() => {
    if (currentTenantInfo.isSuccess) {
      const menuItems = Portals.map((portal) => ({
        label: portal.label,
        link: portal.url
          .replace(
            "%%tenantid%%",
            currentTenantInfo.data
              ?.find((tenant) => tenant.defaultDomainName === currentTenant)
              ?.customerId?.toLowerCase()
          )
          .replace(
            "%%customername%%",
            currentTenantInfo.data?.find((tenant) => tenant.defaultDomainName === currentTenant)
              ?.displayName
          ),
        external: portal.external,
        target: settings.UserSpecificSettings?.portalLinks || portal.target,
        icon: portal.icon,
      }));
      setPortalMenuItems(menuItems);
    }
  }, [
    currentTenantInfo.isSuccess,
    currentTenant,
    settings.portalLinks,
    settings.UserSpecificSettings,
  ]);

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  const metricDescriptions = {
    users: "Total number of users in your tenant",
    guests: "External users with guest access",
    groups: "Microsoft 365 and security groups",
    apps: "Service principals in your tenant",
    devices: "All devices accessing tenant resources",
    managed: "Devices enrolled in Intune",
  };

  return (
    <Container maxWidth={false} sx={{ mt: 12, mb: 6 }}>
      <Box sx={{ width: "100%", mx: "auto" }}>
        {/* Dashboard Bar with Portals, Executive Report, and Universal Search */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                <BulkActionsMenu
                  buttonName="Portals"
                  actions={portalMenuItems}
                  disabled={!currentTenantInfo.isSuccess || portalMenuItems.length === 0}
                />
                <ExecutiveReportButton
                  tenantName={organization.data?.displayName}
                  tenantId={organization.data?.id}
                  userStats={{
                    licensedUsers: 0,
                    unlicensedUsers: 0,
                    guests: testsApi.data?.TenantCounts?.Guests || 0,
                    globalAdmins: 0,
                  }}
                  standardsData={driftApi.data}
                  organizationData={organization.data}
                  disabled={organization.isFetching || testsApi.isFetching}
                />
                <Box sx={{ flex: 1 }}>
                  <CippUniversalSearch />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ display: "flex", gap: 1.5, alignItems: "center", p: 2 }}>
                <Autocomplete
                  size="small"
                  options={reportOptions}
                  value={selectedReport}
                  onChange={(event, newValue) => setSelectedReport(newValue)}
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select a report" placeholder="Choose a report" />
                  )}
                />
                <Button
                  variant="contained"
                  size="small"
                  sx={{ whiteSpace: "nowrap", minHeight: 40 }}
                >
                  Create custom report
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ minHeight: 40 }}
                  disabled={!selectedReport || selectedReport === "Select a report"}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tenant Overview Section - 3 Column Layout */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {/* Column 1: Tenant Information */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BuildingIcon sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle1">Tenant</Typography>
                  </Box>
                }
                sx={{ pb: 1.5 }}
              />
              <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {organization.isFetching
                        ? "Loading..."
                        : organization.data?.displayName || "Not Available"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tenant ID
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {organization.isFetching ? (
                        <Typography variant="body2" fontSize="0.75rem">
                          Loading...
                        </Typography>
                      ) : organization.data?.id ? (
                        <CippCopyToClipBoard text={organization.data.id} type="chip" />
                      ) : (
                        <Typography variant="body2" fontSize="0.75rem">
                          Not Available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Primary Domain
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {organization.isFetching ? (
                        <Typography variant="body2" fontSize="0.75rem">
                          Loading...
                        </Typography>
                      ) : organization.data?.verifiedDomains?.find((d) => d.isDefault)?.name ||
                        currentTenant ? (
                        <CippCopyToClipBoard
                          text={
                            organization.data?.verifiedDomains?.find((d) => d.isDefault)?.name ||
                            currentTenant
                          }
                          type="chip"
                        />
                      ) : (
                        <Typography variant="body2" fontSize="0.75rem">
                          Not Available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Column 2: Tenant Metrics - 2x3 Grid */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title={`${reportData.TenantInfo.TenantOverview.UserCount.toLocaleString()} users`}
                  arrow
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        width: 34,
                        height: 34,
                      }}
                    >
                      <UserIcon sx={{ fontSize: 24, color: "inherit" }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Users
                      </Typography>
                      <Typography variant="h6" fontSize="1.125rem">
                        {testsApi.isFetching ? (
                          <Skeleton width={50} />
                        ) : (
                          formatNumber(reportData.TenantInfo.TenantOverview.UserCount)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title={`${reportData.TenantInfo.TenantOverview.GuestCount.toLocaleString()} guests`}
                  arrow
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "info.main",
                        color: "info.contrastText",
                        width: 34,
                        height: 34,
                      }}
                    >
                      <GuestIcon sx={{ fontSize: 24, color: "inherit" }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Guests
                      </Typography>
                      <Typography variant="h6" fontSize="1.125rem">
                        {testsApi.isFetching ? (
                          <Skeleton width={50} />
                        ) : (
                          formatNumber(reportData.TenantInfo.TenantOverview.GuestCount)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title={`${reportData.TenantInfo.TenantOverview.GroupCount.toLocaleString()} groups`}
                  arrow
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "secondary.main",
                        color: "secondary.contrastText",
                        width: 34,
                        height: 34,
                      }}
                    >
                      <GroupIcon sx={{ fontSize: 24, color: "inherit" }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Groups
                      </Typography>
                      <Typography variant="h6" fontSize="1.125rem">
                        {testsApi.isFetching ? (
                          <Skeleton width={50} />
                        ) : (
                          formatNumber(reportData.TenantInfo.TenantOverview.GroupCount)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title={`${reportData.TenantInfo.TenantOverview.ApplicationCount.toLocaleString()} service principals`}
                  arrow
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "error.main",
                        color: "error.contrastText",
                        width: 34,
                        height: 34,
                      }}
                    >
                      <AppsIcon sx={{ fontSize: 24, color: "inherit" }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Service Principals
                      </Typography>
                      <Typography variant="h6" fontSize="1.125rem">
                        {testsApi.isFetching ? (
                          <Skeleton width={50} />
                        ) : (
                          formatNumber(reportData.TenantInfo.TenantOverview.ApplicationCount)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title={`${reportData.TenantInfo.TenantOverview.DeviceCount.toLocaleString()} devices`}
                  arrow
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "warning.main",
                        color: "warning.contrastText",
                        width: 34,
                        height: 34,
                      }}
                    >
                      <DevicesIcon sx={{ fontSize: 24, color: "inherit" }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Devices
                      </Typography>
                      <Typography variant="h6" fontSize="1.125rem">
                        {testsApi.isFetching ? (
                          <Skeleton width={50} />
                        ) : (
                          formatNumber(reportData.TenantInfo.TenantOverview.DeviceCount)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title={`${reportData.TenantInfo.TenantOverview.ManagedDeviceCount.toLocaleString()} managed devices`}
                  arrow
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "success.main",
                        color: "success.contrastText",
                        width: 34,
                        height: 34,
                      }}
                    >
                      <ManagedIcon sx={{ fontSize: 24, color: "inherit" }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Managed
                      </Typography>
                      <Typography variant="h6" fontSize="1.125rem">
                        {testsApi.isFetching ? (
                          <Skeleton width={50} />
                        ) : (
                          formatNumber(reportData.TenantInfo.TenantOverview.ManagedDeviceCount)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>

          {/* Column 3: Assessment Results */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SecurityIcon sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle1">Assessment</Typography>
                  </Box>
                }
                sx={{ pb: 1.5 }}
              />
              <CardContent>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Identity
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {testsApi.isFetching ? (
                          <Skeleton width={80} />
                        ) : (
                          <>
                            {reportData.TestResultSummary.IdentityPassed}/
                            {reportData.TestResultSummary.IdentityTotal}
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              tests
                            </Typography>
                          </>
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Devices
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {testsApi.isFetching ? (
                          <Skeleton width={80} />
                        ) : (
                          <>
                            {reportData.TestResultSummary.DevicesPassed}/
                            {reportData.TestResultSummary.DevicesTotal}
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              tests
                            </Typography>
                          </>
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Last Data Collection
                      </Typography>
                      <Typography variant="body2" fontSize="0.75rem">
                        {testsApi.isFetching ? (
                          <Skeleton width={100} />
                        ) : testsApi.data?.LatestReportTimeStamp ? (
                          <CippTimeAgo data={testsApi.data.LatestReportTimeStamp} />
                        ) : (
                          "Not Available"
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ width: "40%", maxWidth: 120, aspectRatio: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="20%"
                        outerRadius="100%"
                        data={[
                          {
                            value:
                              (reportData.TestResultSummary.DevicesPassed /
                                reportData.TestResultSummary.DevicesTotal) *
                              100,
                            fill: "#22c55e",
                          },
                          {
                            value:
                              (reportData.TestResultSummary.IdentityPassed /
                                reportData.TestResultSummary.IdentityTotal) *
                              100,
                            fill: "#3b82f6",
                          },
                        ]}
                        startAngle={90}
                        endAngle={450}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" background cornerRadius={5} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Identity Section - 2 Column Grid */}
        <Box sx={{ mt: 6, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
                {/* Privileged users auth methods */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <SecurityIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h6">Privileged users auth methods</Typography>
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      {reportData.TenantInfo.OverviewAuthMethodsPrivilegedUsers?.nodes && (
                        <AuthMethodSankey
                          data={reportData.TenantInfo.OverviewAuthMethodsPrivilegedUsers.nodes}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {reportData.TenantInfo.OverviewAuthMethodsPrivilegedUsers?.description ||
                        "No description available"}
                    </Typography>
                  </CardContent>
                </Card>

                {/* All Users Auth Methods */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <UsersIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h6">All users auth methods</Typography>
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      {reportData.TenantInfo.OverviewAuthMethodsAllUsers?.nodes && (
                        <AuthMethodSankey
                          data={reportData.TenantInfo.OverviewAuthMethodsAllUsers.nodes}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {reportData.TenantInfo.OverviewAuthMethodsAllUsers?.description ||
                        "No description available"}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
                {/* User Authentication */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <UserIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h6">User authentication</Typography>
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      {reportData.TenantInfo.OverviewCaMfaAllUsers?.nodes && (
                        <CaSankey data={reportData.TenantInfo.OverviewCaMfaAllUsers.nodes} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {reportData.TenantInfo.OverviewCaMfaAllUsers?.description ||
                        "No description available"}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Device Sign-ins */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <DevicesIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h6">Device sign-ins</Typography>
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      {reportData.TenantInfo.OverviewCaDevicesAllUsers?.nodes && (
                        <CaDeviceSankey
                          data={reportData.TenantInfo.OverviewCaDevicesAllUsers.nodes}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {reportData.TenantInfo.OverviewCaDevicesAllUsers?.description ||
                        "No description available"}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Devices Section */}
        <Box sx={{ mt: 6, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Device Summary Chart */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DevicesIcon sx={{ fontSize: 24 }} />
                      <Typography variant="h6">Device summary</Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ height: 250, pb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        {
                          name: "Windows",
                          value:
                            reportData.TenantInfo.DeviceOverview.ManagedDevices
                              .deviceOperatingSystemSummary.windowsCount,
                          fill: "#3b82f6",
                        },
                        {
                          name: "macOS",
                          value:
                            reportData.TenantInfo.DeviceOverview.ManagedDevices
                              .deviceOperatingSystemSummary.macOSCount,
                          fill: "#22c55e",
                        },
                        {
                          name: "iOS",
                          value:
                            reportData.TenantInfo.DeviceOverview.ManagedDevices
                              .deviceOperatingSystemSummary.iosCount,
                          fill: "#f59e0b",
                        },
                        {
                          name: "Android",
                          value:
                            reportData.TenantInfo.DeviceOverview.ManagedDevices
                              .deviceOperatingSystemSummary.androidCount,
                          fill: "#8b5cf6",
                        },
                        {
                          name: "Linux",
                          value:
                            reportData.TenantInfo.DeviceOverview.ManagedDevices
                              .deviceOperatingSystemSummary.linuxCount,
                          fill: "#ef4444",
                        },
                      ]}
                      margin={{ left: 12, right: 0, top: 0, bottom: 10 }}
                      barSize={32}
                      barGap={2}
                    >
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} tickMargin={4} />
                      <RechartsTooltip />
                      <Bar dataKey="value" radius={5}>
                        <LabelList
                          position="insideLeft"
                          dataKey="value"
                          fill="white"
                          offset={8}
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Desktops
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(
                          ((reportData.TenantInfo.DeviceOverview.ManagedDevices.desktopCount || 0) /
                            (reportData.TenantInfo.DeviceOverview.ManagedDevices.totalCount || 1)) *
                            100
                        )}
                        %
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Mobiles
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(
                          ((reportData.TenantInfo.DeviceOverview.ManagedDevices.mobileCount || 0) /
                            (reportData.TenantInfo.DeviceOverview.ManagedDevices.totalCount || 1)) *
                            100
                        )}
                        %
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Device Compliance */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 24 }} />
                      <Typography variant="h6">Device compliance</Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ height: 250, pb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Compliant",
                            value:
                              reportData.TenantInfo.DeviceOverview.DeviceCompliance
                                .compliantDeviceCount,
                            fill: "hsl(142, 76%, 36%)",
                          },
                          {
                            name: "Non-compliant",
                            value:
                              reportData.TenantInfo.DeviceOverview.DeviceCompliance
                                .nonCompliantDeviceCount,
                            fill: "hsl(0, 84%, 60%)",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        cornerRadius={5}
                      />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "#22C55E" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Compliant
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(
                          (reportData.TenantInfo.DeviceOverview.DeviceCompliance
                            .compliantDeviceCount /
                            (reportData.TenantInfo.DeviceOverview.DeviceCompliance
                              .compliantDeviceCount +
                              reportData.TenantInfo.DeviceOverview.DeviceCompliance
                                .nonCompliantDeviceCount)) *
                            100
                        )}
                        %
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "#EF4444" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Non-compliant
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(
                          (reportData.TenantInfo.DeviceOverview.DeviceCompliance
                            .nonCompliantDeviceCount /
                            (reportData.TenantInfo.DeviceOverview.DeviceCompliance
                              .compliantDeviceCount +
                              reportData.TenantInfo.DeviceOverview.DeviceCompliance
                                .nonCompliantDeviceCount)) *
                            100
                        )}
                        %
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Device Ownership */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BriefcaseIcon sx={{ fontSize: 24 }} />
                      <Typography variant="h6">Device ownership</Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ height: 250, pb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Corporate",
                            value:
                              reportData.TenantInfo.DeviceOverview.DeviceOwnership.corporateCount,
                            fill: "hsl(217, 91%, 60%)",
                          },
                          {
                            name: "Personal",
                            value:
                              reportData.TenantInfo.DeviceOverview.DeviceOwnership.personalCount,
                            fill: "hsl(280, 85%, 60%)",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        cornerRadius={5}
                      />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "#3B82F6" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Corporate
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(
                          (reportData.TenantInfo.DeviceOverview.DeviceOwnership.corporateCount /
                            (reportData.TenantInfo.DeviceOverview.DeviceOwnership.corporateCount +
                              reportData.TenantInfo.DeviceOverview.DeviceOwnership.personalCount)) *
                            100
                        )}
                        %
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "#A855F7" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Personal
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(
                          (reportData.TenantInfo.DeviceOverview.DeviceOwnership.personalCount /
                            (reportData.TenantInfo.DeviceOverview.DeviceOwnership.corporateCount +
                              reportData.TenantInfo.DeviceOverview.DeviceOwnership.personalCount)) *
                            100
                        )}
                        %
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Desktop Devices - Full Width */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MonitorIcon sx={{ fontSize: 24 }} />
                      <Typography variant="h6">Desktop devices</Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent>
                  <Box sx={{ height: 350 }}>
                    {reportData.TenantInfo.DeviceOverview.DesktopDevicesSummary?.nodes && (
                      <DesktopDevicesSankey
                        data={reportData.TenantInfo.DeviceOverview.DesktopDevicesSummary.nodes}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {reportData.TenantInfo.DeviceOverview.DesktopDevicesSummary?.description ||
                      "No description available"}
                  </Typography>
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Entra joined
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {(() => {
                          const nodes =
                            reportData.TenantInfo.DeviceOverview.DesktopDevicesSummary?.nodes || [];
                          const entraJoined =
                            nodes.find((n) => n.target === "Entra joined")?.value || 0;
                          const windowsDevices =
                            nodes.find(
                              (n) => n.source === "Desktop devices" && n.target === "Windows"
                            )?.value || 0;
                          const macOSDevices =
                            nodes.find(
                              (n) => n.source === "Desktop devices" && n.target === "macOS"
                            )?.value || 0;
                          const total = windowsDevices + macOSDevices;
                          return Math.round((entraJoined / (total || 1)) * 100);
                        })()}
                        %
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Entra hybrid joined
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {(() => {
                          const nodes =
                            reportData.TenantInfo.DeviceOverview.DesktopDevicesSummary?.nodes || [];
                          const entraHybrid =
                            nodes.find((n) => n.target === "Entra hybrid joined")?.value || 0;
                          const windowsDevices =
                            nodes.find(
                              (n) => n.source === "Desktop devices" && n.target === "Windows"
                            )?.value || 0;
                          const macOSDevices =
                            nodes.find(
                              (n) => n.source === "Desktop devices" && n.target === "macOS"
                            )?.value || 0;
                          const total = windowsDevices + macOSDevices;
                          return Math.round((entraHybrid / (total || 1)) * 100);
                        })()}
                        %
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Entra registered
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {(() => {
                          const nodes =
                            reportData.TenantInfo.DeviceOverview.DesktopDevicesSummary?.nodes || [];
                          const entraRegistered =
                            nodes.find((n) => n.target === "Entra registered")?.value || 0;
                          const windowsDevices =
                            nodes.find(
                              (n) => n.source === "Desktop devices" && n.target === "Windows"
                            )?.value || 0;
                          const macOSDevices =
                            nodes.find(
                              (n) => n.source === "Desktop devices" && n.target === "macOS"
                            )?.value || 0;
                          const total = windowsDevices + macOSDevices;
                          return Math.round((entraRegistered / (total || 1)) * 100);
                        })()}
                        %
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Mobile Devices - Full Width */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ManagedIcon sx={{ fontSize: 24 }} />
                      <Typography variant="h6">Mobile devices</Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent>
                  <Box sx={{ height: 350 }}>
                    {reportData.TenantInfo.DeviceOverview.MobileSummary?.nodes && (
                      <MobileSankey
                        data={reportData.TenantInfo.DeviceOverview.MobileSummary.nodes}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {reportData.TenantInfo.DeviceOverview.MobileSummary?.description ||
                      "No description available"}
                  </Typography>
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Android compliant
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {(() => {
                          const nodes =
                            reportData.TenantInfo.DeviceOverview.MobileSummary?.nodes || [];
                          const androidCompliant = nodes
                            .filter(
                              (n) => n.source?.includes("Android") && n.target === "Compliant"
                            )
                            .reduce((sum, n) => sum + (n.value || 0), 0);
                          const androidTotal =
                            nodes.find(
                              (n) => n.source === "Mobile devices" && n.target === "Android"
                            )?.value || 0;
                          return androidTotal > 0
                            ? Math.round((androidCompliant / androidTotal) * 100)
                            : 0;
                        })()}
                        %
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        iOS compliant
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {(() => {
                          const nodes =
                            reportData.TenantInfo.DeviceOverview.MobileSummary?.nodes || [];
                          const iosCompliant = nodes
                            .filter((n) => n.source?.includes("iOS") && n.target === "Compliant")
                            .reduce((sum, n) => sum + (n.value || 0), 0);
                          const iosTotal =
                            nodes.find((n) => n.source === "Mobile devices" && n.target === "iOS")
                              ?.value || 0;
                          return iosTotal > 0 ? Math.round((iosCompliant / iosTotal) * 100) : 0;
                        })()}
                        %
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Total devices
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {(() => {
                          const nodes =
                            reportData.TenantInfo.DeviceOverview.MobileSummary?.nodes || [];
                          const androidTotal =
                            nodes.find(
                              (n) => n.source === "Mobile devices" && n.target === "Android"
                            )?.value || 0;
                          const iosTotal =
                            nodes.find((n) => n.source === "Mobile devices" && n.target === "iOS")
                              ?.value || 0;
                          return androidTotal + iosTotal;
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
