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
  Button,
  Skeleton,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
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
  LineChart,
  Line,
  CartesianGrid,
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
import { LicenseSankey } from "/src/components/CippComponents/LicenseSankey";
import { MobileSankey } from "/src/components/CippComponents/MobileSankey";
import { CippUniversalSearch } from "/src/components/CippCards/CippUniversalSearch.jsx";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { CippAddTestReportDrawer } from "/src/components/CippComponents/CippAddTestReportDrawer";
import { CippCopyToClipBoard } from "/src/components/CippComponents/CippCopyToClipboard.jsx";
import { CippTimeAgo } from "/src/components/CippComponents/CippTimeAgo.jsx";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
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
  CardMembership as CardMembershipIcon,
} from "@mui/icons-material";

// Helper function to process MFAState data into Sankey chart format
const processMFAStateData = (mfaState) => {
  if (!mfaState || !Array.isArray(mfaState) || mfaState.length === 0) {
    return null;
  }

  // Count enabled users only
  const enabledUsers = mfaState.filter((user) => user.AccountEnabled === true);

  if (enabledUsers.length === 0) {
    return null;
  }

  // Split by MFA registration status
  let registeredUsers = 0;
  let notRegisteredUsers = 0;

  // For registered users, split by protection method
  let registeredCA = 0;
  let registeredSD = 0;
  let registeredPerUser = 0;
  let registeredNone = 0;

  // For not registered users, split by protection method
  let notRegisteredCA = 0;
  let notRegisteredSD = 0;
  let notRegisteredPerUser = 0;
  let notRegisteredNone = 0;

  enabledUsers.forEach((user) => {
    const hasRegistered = user.MFARegistration === true;
    const coveredByCA = user.CoveredByCA?.startsWith("Enforced") || false;
    const coveredBySD = user.CoveredBySD === true;
    const perUserEnabled = user.PerUser === "enforced" || user.PerUser === "enabled";

    // Consider PerUser as MFA enabled/registered
    if (hasRegistered || perUserEnabled) {
      registeredUsers++;
      // Per-User gets its own separate terminal path
      if (perUserEnabled) {
        registeredPerUser++;
      } else if (coveredByCA) {
        registeredCA++;
      } else if (coveredBySD) {
        registeredSD++;
      } else {
        registeredNone++;
      }
    } else {
      notRegisteredUsers++;
      if (coveredByCA) {
        notRegisteredCA++;
      } else if (coveredBySD) {
        notRegisteredSD++;
      } else {
        notRegisteredNone++;
      }
    }
  });

  const registeredPercentage = ((registeredUsers / enabledUsers.length) * 100).toFixed(1);
  const protectedPercentage = (
    ((registeredCA + registeredSD + registeredPerUser) / enabledUsers.length) *
    100
  ).toFixed(1);

  const nodes = [
    { source: "Enabled users", target: "MFA registered", value: registeredUsers },
    { source: "Enabled users", target: "Not registered", value: notRegisteredUsers },
  ];

  // Add protection methods for registered users
  if (registeredCA > 0)
    nodes.push({ source: "MFA registered", target: "CA policy", value: registeredCA });
  if (registeredSD > 0)
    nodes.push({ source: "MFA registered", target: "Security defaults", value: registeredSD });
  if (registeredPerUser > 0)
    nodes.push({ source: "MFA registered", target: "Per-user MFA", value: registeredPerUser });
  if (registeredNone > 0)
    nodes.push({ source: "MFA registered", target: "No enforcement", value: registeredNone });

  // Add protection methods for not registered users
  if (notRegisteredCA > 0)
    nodes.push({ source: "Not registered", target: "CA policy", value: notRegisteredCA });
  if (notRegisteredSD > 0)
    nodes.push({ source: "Not registered", target: "Security defaults", value: notRegisteredSD });
  if (notRegisteredPerUser > 0)
    nodes.push({ source: "Not registered", target: "Per-user MFA", value: notRegisteredPerUser });
  if (notRegisteredNone > 0)
    nodes.push({ source: "Not registered", target: "No enforcement", value: notRegisteredNone });

  return {
    description: `${registeredPercentage}% of enabled users have registered MFA methods. ${protectedPercentage}% are protected by policies requiring MFA.`,
    nodes: nodes,
  };
};

// Helper function to process MFAState data into Auth Methods Sankey chart format
const processAuthMethodsData = (mfaState) => {
  if (!mfaState || !Array.isArray(mfaState) || mfaState.length === 0) {
    return null;
  }

  // Count enabled users only
  const enabledUsers = mfaState.filter((user) => user.AccountEnabled === true);

  if (enabledUsers.length === 0) {
    return null;
  }

  // Categorize MFA methods as phishable or phish-resistant
  const phishableMethods = ["mobilePhone", "email", "microsoftAuthenticatorPush"];
  const phishResistantMethods = ["fido2", "windowsHelloForBusiness", "x509Certificate"];

  let singleFactor = 0;
  let phishableCount = 0;
  let phishResistantCount = 0;
  let perUserMFA = 0;

  // Breakdown of phishable methods
  let phoneCount = 0;
  let authenticatorCount = 0;

  // Breakdown of phish-resistant methods
  let passkeyCount = 0;
  let whfbCount = 0;

  enabledUsers.forEach((user) => {
    const methods = user.MFAMethods || [];
    const perUser = user.PerUser === "enforced" || user.PerUser === "enabled";
    const hasRegistered = user.MFARegistration === true;

    // If user has per-user MFA enforced but no specific methods, count as generic MFA
    if (perUser && !hasRegistered && methods.length === 0) {
      perUserMFA++;
      return;
    }

    // Check if user has any MFA methods
    if (!hasRegistered || methods.length === 0) {
      singleFactor++;
      return;
    }

    // Categorize by method type
    const hasPhishResistant = methods.some((m) => phishResistantMethods.includes(m));
    const hasPhishable = methods.some((m) => phishableMethods.includes(m));

    if (hasPhishResistant) {
      phishResistantCount++;
      // Count specific phish-resistant methods
      if (methods.includes("fido2") || methods.includes("x509Certificate")) {
        passkeyCount++;
      }
      if (methods.includes("windowsHelloForBusiness")) {
        whfbCount++;
      }
    } else if (hasPhishable) {
      phishableCount++;
      // Count specific phishable methods
      if (methods.includes("mobilePhone") || methods.includes("email")) {
        phoneCount++;
      }
      if (
        methods.includes("microsoftAuthenticatorPush") ||
        methods.includes("softwareOneTimePasscode")
      ) {
        authenticatorCount++;
      }
    } else {
      // Has MFA methods but not in our categorized lists
      phishableCount++;
      authenticatorCount++;
    }
  });

  const mfaPercentage = (
    ((phishableCount + phishResistantCount + perUserMFA) / enabledUsers.length) *
    100
  ).toFixed(1);
  const phishResistantPercentage = ((phishResistantCount / enabledUsers.length) * 100).toFixed(1);

  const nodes = [
    { source: "Users", target: "Single factor", value: singleFactor },
    { source: "Users", target: "Multi factor", value: perUserMFA },
    { source: "Users", target: "Phishable", value: phishableCount },
    { source: "Users", target: "Phish resistant", value: phishResistantCount },
  ];

  // Add phishable method breakdowns
  if (phoneCount > 0) nodes.push({ source: "Phishable", target: "Phone", value: phoneCount });
  if (authenticatorCount > 0)
    nodes.push({ source: "Phishable", target: "Authenticator", value: authenticatorCount });

  // Add phish-resistant method breakdowns
  if (passkeyCount > 0)
    nodes.push({ source: "Phish resistant", target: "Passkey", value: passkeyCount });
  if (whfbCount > 0) nodes.push({ source: "Phish resistant", target: "WHfB", value: whfbCount });

  return {
    description: `${mfaPercentage}% of enabled users have MFA configured. ${phishResistantPercentage}% use phish-resistant authentication methods.`,
    nodes: nodes,
  };
};

const Page = () => {
  const settings = useSettings();
  const router = useRouter();
  const { currentTenant } = settings;
  const [portalMenuItems, setPortalMenuItems] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false });

  // Get reportId from query params or default to "ztna"
  const selectedReport = router.query.reportId || "ztna";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      reportId: selectedReport,
    },
  });

  const reportIdValue = useWatch({ control: formControl.control });

  // Update URL when form value changes (e.g., user selects different report from dropdown)
  useEffect(() => {
    console.log("reportIdValue changed:", reportIdValue);
    if (reportIdValue && reportIdValue.reportId?.value !== selectedReport) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, reportId: reportIdValue.reportId?.value },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [reportIdValue]);

  // Fetch available reports
  const reportsApi = ApiGetCall({
    url: "/api/ListTestReports",
    queryKey: "ListTestReports",
  });

  const reports = reportsApi.data || [];

  const organization = ApiGetCall({
    url: "/api/ListOrg",
    queryKey: `${currentTenant}-ListOrg`,
    data: { tenantFilter: currentTenant },
  });

  const testsApi = ApiGetCall({
    url: "/api/ListTests",
    data: { tenantFilter: currentTenant, reportId: selectedReport },
    queryKey: `${currentTenant}-ListTests-${selectedReport}`,
    waiting: !!currentTenant && !!selectedReport,
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
            OverviewCaMfaAllUsers: processMFAStateData(testsApi.data.MFAState),
            OverviewCaDevicesAllUsers: dashboardDemoData.TenantInfo.OverviewCaDevicesAllUsers,
            OverviewAuthMethodsPrivilegedUsers:
              dashboardDemoData.TenantInfo.OverviewAuthMethodsPrivilegedUsers,
            OverviewAuthMethodsAllUsers: processAuthMethodsData(testsApi.data.MFAState),
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
                <Box sx={{ flex: 1 }}>
                  <CippFormComponent
                    name="reportId"
                    label="Select a report"
                    type="autoComplete"
                    multiple={false}
                    formControl={formControl}
                    options={reports.map((r) => ({
                      label: r.description ? `${r.name} - ${r.description}` : r.name,
                      value: r.id,
                      description: r.description,
                    }))}
                    placeholder="Choose a report"
                  />
                </Box>
                <CippAddTestReportDrawer />
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ minHeight: 40 }}
                  onClick={() => {
                    const report = reports.find((r) => r.id === selectedReport);
                    if (report && report.source !== "file") {
                      setDeleteDialog({
                        open: true,
                        handleClose: () => setDeleteDialog({ open: false }),
                        row: { ReportId: selectedReport, name: report.name },
                      });
                    }
                  }}
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
                    {organization.isFetching ? (
                      <Skeleton width={150} height={24} />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {organization.data?.displayName || "Not Available"}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tenant ID
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {organization.isFetching ? (
                        <Skeleton width={200} height={24} />
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
                        <Skeleton width={180} height={24} />
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
                {/* Secure Score */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <SecurityIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h6">Secure Score</Typography>
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Box sx={{ height: 250 }}>
                      {testsApi.isFetching ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
                          <Skeleton variant="rectangular" width="100%" height={200} />
                        </Box>
                      ) : reportData.SecureScore && reportData.SecureScore.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={reportData.SecureScore.sort(
                              (a, b) => new Date(a.createdDateTime) - new Date(b.createdDateTime)
                            ).map((score) => ({
                              date: new Date(score.createdDateTime).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              }),
                              score: score.currentScore,
                              percentage: Math.round((score.currentScore / score.maxScore) * 100),
                            }))}
                            margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              tickMargin={8}
                              domain={[0, "dataMax + 20"]}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                              }}
                              formatter={(value, name) => {
                                if (name === "score") return [value.toFixed(2), "Score"];
                                if (name === "percentage") return [value + "%", "Percentage"];
                                return value;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#22c55e"
                              strokeWidth={2}
                              dot={{ fill: "#22c55e", r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No secure score data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      The Secure Score measures your security posture across your tenant.
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardContent sx={{ pt: 2 }}>
                    {testsApi.isFetching ? (
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width={80} height={60} />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width={80} height={60} />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width={80} height={60} />
                        </Box>
                      </Box>
                    ) : reportData.SecureScore && reportData.SecureScore.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Latest %
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {Math.round(
                              (reportData.SecureScore[reportData.SecureScore.length - 1]
                                .currentScore /
                                reportData.SecureScore[reportData.SecureScore.length - 1]
                                  .maxScore) *
                                100
                            )}
                            %
                          </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Current Score
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {reportData.SecureScore[
                              reportData.SecureScore.length - 1
                            ].currentScore.toFixed(2)}
                          </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Max Score
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {reportData.SecureScore[
                              reportData.SecureScore.length - 1
                            ].maxScore.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Enable secure score monitoring in your tenant
                      </Typography>
                    )}
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
                      {testsApi.isFetching ? (
                        <Skeleton variant="rectangular" width="100%" height={300} />
                      ) : reportData.TenantInfo.OverviewAuthMethodsAllUsers?.nodes ? (
                        <AuthMethodSankey
                          data={reportData.TenantInfo.OverviewAuthMethodsAllUsers.nodes}
                        />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No authentication method data available
                          </Typography>
                        </Box>
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
                      {testsApi.isFetching ? (
                        <Skeleton variant="rectangular" width="100%" height={300} />
                      ) : reportData.TenantInfo.OverviewCaMfaAllUsers?.nodes ? (
                        <CaSankey data={reportData.TenantInfo.OverviewCaMfaAllUsers.nodes} />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No MFA data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {reportData.TenantInfo.OverviewCaMfaAllUsers?.description ||
                        "No description available"}
                    </Typography>
                  </CardContent>
                </Card>

                {/* License Overview */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CardMembershipIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h6">License Overview</Typography>
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      {testsApi.isFetching ? (
                        <Skeleton variant="rectangular" width="100%" height={300} />
                      ) : testsApi.data?.LicenseData && Array.isArray(testsApi.data.LicenseData) ? (
                        <LicenseSankey data={testsApi.data.LicenseData} />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No license data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardContent sx={{ pt: 2 }}>
                    {testsApi.isFetching ? (
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width={80} height={20} sx={{ mb: 1 }} />
                          <Skeleton width={60} height={32} />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width={80} height={20} sx={{ mb: 1 }} />
                          <Skeleton width={60} height={32} />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width={80} height={20} sx={{ mb: 1 }} />
                          <Skeleton width={60} height={32} />
                        </Box>
                      </Box>
                    ) : testsApi.data?.LicenseData && Array.isArray(testsApi.data.LicenseData) ? (
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Total Licenses
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {testsApi.data.LicenseData.reduce(
                              (sum, lic) => sum + (parseInt(lic?.TotalLicenses || 0) || 0),
                              0
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Assigned
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {testsApi.data.LicenseData.reduce(
                              (sum, lic) => sum + (parseInt(lic?.CountUsed || 0) || 0),
                              0
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Available
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {testsApi.data.LicenseData.reduce(
                              (sum, lic) => sum + (parseInt(lic?.CountAvailable || 0) || 0),
                              0
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No license statistics available
                        </Typography>
                      </Box>
                    )}
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
                  {testsApi.isFetching ? (
                    <Skeleton variant="rectangular" width="100%" height={250} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          {
                            name: "Windows",
                            value:
                              reportData.TenantInfo.DeviceOverview?.ManagedDevices
                                ?.deviceOperatingSystemSummary?.windowsCount || 0,
                            fill: "#3b82f6",
                          },
                          {
                            name: "macOS",
                            value:
                              reportData.TenantInfo.DeviceOverview?.ManagedDevices
                                ?.deviceOperatingSystemSummary?.macOSCount || 0,
                            fill: "#22c55e",
                          },
                          {
                            name: "iOS",
                            value:
                              reportData.TenantInfo.DeviceOverview?.ManagedDevices
                                ?.deviceOperatingSystemSummary?.iosCount || 0,
                            fill: "#f59e0b",
                          },
                          {
                            name: "Android",
                            value:
                              reportData.TenantInfo.DeviceOverview?.ManagedDevices
                                ?.deviceOperatingSystemSummary?.androidCount || 0,
                            fill: "#8b5cf6",
                          },
                          {
                            name: "Linux",
                            value:
                              reportData.TenantInfo.DeviceOverview?.ManagedDevices
                                ?.deviceOperatingSystemSummary?.linuxCount || 0,
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
                  )}
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  {testsApi.isFetching ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Desktops
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {Math.round(
                            ((reportData.TenantInfo.DeviceOverview?.ManagedDevices?.desktopCount ||
                              0) /
                              (reportData.TenantInfo.DeviceOverview?.ManagedDevices?.totalCount ||
                                1)) *
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
                            ((reportData.TenantInfo.DeviceOverview?.ManagedDevices?.mobileCount ||
                              0) /
                              (reportData.TenantInfo.DeviceOverview?.ManagedDevices?.totalCount ||
                                1)) *
                              100
                          )}
                          %
                        </Typography>
                      </Box>
                    </Box>
                  )}
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
                  {testsApi.isFetching ? (
                    <Skeleton variant="rectangular" width="100%" height={250} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Compliant",
                              value:
                                reportData.TenantInfo.DeviceOverview?.DeviceCompliance
                                  ?.compliantDeviceCount || 0,
                              fill: "hsl(142, 76%, 36%)",
                            },
                            {
                              name: "Non-compliant",
                              value:
                                reportData.TenantInfo.DeviceOverview?.DeviceCompliance
                                  ?.nonCompliantDeviceCount || 0,
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
                  )}
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  {testsApi.isFetching ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                    </Box>
                  ) : (
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
                          {(() => {
                            const compliant =
                              reportData.TenantInfo.DeviceOverview?.DeviceCompliance
                                ?.compliantDeviceCount || 0;
                            const nonCompliant =
                              reportData.TenantInfo.DeviceOverview?.DeviceCompliance
                                ?.nonCompliantDeviceCount || 0;
                            const total = compliant + nonCompliant;
                            return total > 0 ? Math.round((compliant / total) * 100) : 0;
                          })()}
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
                          {(() => {
                            const compliant =
                              reportData.TenantInfo.DeviceOverview?.DeviceCompliance
                                ?.compliantDeviceCount || 0;
                            const nonCompliant =
                              reportData.TenantInfo.DeviceOverview?.DeviceCompliance
                                ?.nonCompliantDeviceCount || 0;
                            const total = compliant + nonCompliant;
                            return total > 0 ? Math.round((nonCompliant / total) * 100) : 0;
                          })()}
                          %
                        </Typography>
                      </Box>
                    </Box>
                  )}
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
                  {testsApi.isFetching ? (
                    <Skeleton variant="rectangular" width="100%" height={250} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Corporate",
                              value:
                                reportData.TenantInfo.DeviceOverview?.DeviceOwnership
                                  ?.corporateCount || 0,
                              fill: "hsl(217, 91%, 60%)",
                            },
                            {
                              name: "Personal",
                              value:
                                reportData.TenantInfo.DeviceOverview?.DeviceOwnership
                                  ?.personalCount || 0,
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
                  )}
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  {testsApi.isFetching ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                    </Box>
                  ) : (
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
                          {(() => {
                            const corporate =
                              reportData.TenantInfo.DeviceOverview?.DeviceOwnership
                                ?.corporateCount || 0;
                            const personal =
                              reportData.TenantInfo.DeviceOverview?.DeviceOwnership
                                ?.personalCount || 0;
                            const total = corporate + personal;
                            return total > 0 ? Math.round((corporate / total) * 100) : 0;
                          })()}
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
                          {(() => {
                            const corporate =
                              reportData.TenantInfo.DeviceOverview?.DeviceOwnership
                                ?.corporateCount || 0;
                            const personal =
                              reportData.TenantInfo.DeviceOverview?.DeviceOwnership
                                ?.personalCount || 0;
                            const total = corporate + personal;
                            return total > 0 ? Math.round((personal / total) * 100) : 0;
                          })()}
                          %
                        </Typography>
                      </Box>
                    </Box>
                  )}
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
                      <Typography variant="h6">License Overview</Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent>
                  <Box sx={{ height: 350 }}>
                    {testsApi.isFetching ? (
                      <Skeleton variant="rectangular" width="100%" height={350} />
                    ) : testsApi.data?.LicenseData ? (
                      <LicenseSankey data={testsApi.data.LicenseData} />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No license data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Overview of license assignments and availability
                  </Typography>
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  {testsApi.isFetching ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={80} height={20} sx={{ mb: 1 }} />
                        <Skeleton width={60} height={32} />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={80} height={20} sx={{ mb: 1 }} />
                        <Skeleton width={60} height={32} />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={80} height={20} sx={{ mb: 1 }} />
                        <Skeleton width={60} height={32} />
                      </Box>
                    </Box>
                  ) : testsApi.data?.LicenseData && Array.isArray(testsApi.data.LicenseData) ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Total Licenses
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {testsApi.data.LicenseData.reduce(
                            (sum, lic) => sum + (parseInt(lic?.TotalLicenses || 0) || 0),
                            0
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Assigned
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {testsApi.data.LicenseData.reduce(
                            (sum, lic) => sum + (parseInt(lic?.CountUsed || 0) || 0),
                            0
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Available
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {testsApi.data.LicenseData.reduce(
                            (sum, lic) => sum + (parseInt(lic?.CountAvailable || 0) || 0),
                            0
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No license statistics available
                      </Typography>
                    </Box>
                  )}
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
                    {testsApi.isFetching ? (
                      <Skeleton variant="rectangular" width="100%" height={350} />
                    ) : reportData.TenantInfo.DeviceOverview?.MobileSummary?.nodes ? (
                      <MobileSankey
                        data={reportData.TenantInfo.DeviceOverview.MobileSummary.nodes}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No mobile device data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {reportData.TenantInfo.DeviceOverview.MobileSummary?.description ||
                      "No description available"}
                  </Typography>
                </CardContent>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  {testsApi.isFetching ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={60} height={50} />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Android compliant
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {(() => {
                            const nodes =
                              reportData.TenantInfo.DeviceOverview?.MobileSummary?.nodes || [];
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
                              reportData.TenantInfo.DeviceOverview?.MobileSummary?.nodes || [];
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
                              reportData.TenantInfo.DeviceOverview?.MobileSummary?.nodes || [];
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
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Delete Report Dialog */}
      <CippApiDialog
        createDialog={deleteDialog}
        title="Delete Custom Report"
        fields={[]}
        row={reportIdValue}
        api={{
          url: "/api/DeleteTestReport",
          type: "POST",
          data: {
            ReportId: reportIdValue.reportId?.value,
          },
          confirmText: "Are you sure you want to delete this report? This action cannot be undone.",
          relatedQueryKeys: ["ListTestReports"],
        }}
      />
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
