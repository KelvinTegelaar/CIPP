import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
  Divider,
  Button,
  Skeleton,
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
import { SecureScoreCard } from "/src/components/CippComponents/SecureScoreCard";
import { MFACard } from "/src/components/CippComponents/MFACard";
import { AuthMethodCard } from "/src/components/CippComponents/AuthMethodCard";
import { LicenseCard } from "/src/components/CippComponents/LicenseCard";
import { TenantInfoCard } from "/src/components/CippComponents/TenantInfoCard";
import { TenantMetricsGrid } from "/src/components/CippComponents/TenantMetricsGrid";
import { AssessmentCard } from "/src/components/CippComponents/AssessmentCard";
import { CippUniversalSearch } from "/src/components/CippCards/CippUniversalSearch.jsx";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { CippAddTestReportDrawer } from "/src/components/CippComponents/CippAddTestReportDrawer";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import {
  Devices as DevicesIcon,
  CheckCircle as CheckCircleIcon,
  Work as BriefcaseIcon,
} from "@mui/icons-material";

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
          ExecutedAt: testsApi.data?.LatestReportTimeStamp || null,
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
            MFAState: testsApi.data.MFAState,
            OverviewCaDevicesAllUsers: dashboardDemoData.TenantInfo.OverviewCaDevicesAllUsers,
            OverviewAuthMethodsPrivilegedUsers:
              dashboardDemoData.TenantInfo.OverviewAuthMethodsPrivilegedUsers,
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

  return (
    <Container maxWidth={false} sx={{ mt: 12, mb: 6 }}>
      <Box sx={{ width: "100%", mx: "auto" }}>
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
            <TenantInfoCard data={organization.data} isLoading={organization.isFetching} />
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
            <AssessmentCard data={reportData} isLoading={testsApi.isFetching} />
          </Grid>
        </Grid>

        {/* Identity Section - 2 Column Grid */}
        <Box sx={{ mt: 6, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
                <SecureScoreCard
                  data={testsApi.data?.SecureScore}
                  isLoading={testsApi.isFetching}
                />
                <AuthMethodCard data={testsApi.data?.MFAState} isLoading={testsApi.isFetching} />
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
                <MFACard data={testsApi.data?.MFAState} isLoading={testsApi.isFetching} />
                <LicenseCard data={testsApi.data?.LicenseData} isLoading={testsApi.isFetching} />
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
