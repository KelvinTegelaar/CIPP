import { Box, Card, CardContent, Container, Button, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { Grid } from "@mui/system";
import { useSettings } from "../../hooks/use-settings";
import { ApiGetCall } from "../../api/ApiCall.jsx";
import Portals from "../../data/portals";
import { BulkActionsMenu } from "../../components/bulk-actions-menu.js";
import { ExecutiveReportButton } from "../../components/ExecutiveReportButton.js";
import { TabbedLayout } from "../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../layouts/index.js";
import tabOptions from "./tabOptions";
import { dashboardDemoData } from "../../data/dashboardv2-demo-data";
import { SecureScoreCard } from "../../components/CippComponents/SecureScoreCard";
import { MFACard } from "../../components/CippComponents/MFACard";
import { AuthMethodCard } from "../../components/CippComponents/AuthMethodCard";
import { LicenseCard } from "../../components/CippComponents/LicenseCard";
import { TenantInfoCard } from "../../components/CippComponents/TenantInfoCard";
import { TenantMetricsGrid } from "../../components/CippComponents/TenantMetricsGrid";
import { AssessmentCard } from "../../components/CippComponents/AssessmentCard";
import { CippApiDialog } from "../../components/CippComponents/CippApiDialog";
import { CippAddTestReportDrawer } from "../../components/CippComponents/CippAddTestReportDrawer";
import CippFormComponent from "../../components/CippComponents/CippFormComponent";
import {
  Devices as DevicesIcon,
  CheckCircle as CheckCircleIcon,
  Work as BriefcaseIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const Page = () => {
  const settings = useSettings();
  const router = useRouter();
  const { currentTenant } = settings;
  const [portalMenuItems, setPortalMenuItems] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false });
  const [refreshDialog, setRefreshDialog] = useState({ open: false });

  // Get reportId from query params or default to "ztna"
  // Only use default if router is ready and reportId is still not present
  const selectedReport =
    router.isReady && !router.query.reportId ? "ztna" : router.query.reportId || "ztna";

  const formControl = useForm({
    mode: "onChange",
  });

  const reportIdValue = useWatch({ control: formControl.control });

  // Fetch available reports
  const reportsApi = ApiGetCall({
    url: "/api/ListTestReports",
    queryKey: "ListTestReports",
  });

  const reports = reportsApi.data || [];

  // Update form when selectedReport changes (from URL)
  useEffect(() => {
    if (selectedReport && router.isReady && reports.length > 0) {
      const matchingReport = reports.find((r) => r.id === selectedReport);
      if (matchingReport) {
        formControl.setValue("reportId", {
          value: matchingReport.id,
          label: matchingReport.name,
        });
      }
    }
  }, [selectedReport, router.isReady, reports]);

  // Update URL when form value changes (e.g., user selects different report from dropdown)
  useEffect(() => {
    console.log("reportIdValue changed:", reportIdValue);
    if (reportIdValue?.reportId?.value && reportIdValue.reportId.value !== selectedReport) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, reportId: reportIdValue.reportId.value },
        },
        undefined,
        { shallow: true },
      );
    }
  }, [reportIdValue]);

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
    };

    let portalLinks;
    if (settings.UserSpecificSettings?.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.UserSpecificSettings.portalLinks };
    } else if (settings.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.portalLinks };
    } else {
      portalLinks = defaultLinks;
    }

    // Filter the portals based on user settings
    return Portals.filter((portal) => {
      const settingKey = portal.name;
      return settingKey ? portalLinks[settingKey] === true : true;
    });
  };

  useEffect(() => {
    if (currentTenantInfo.isSuccess) {
      const tenantLookup = currentTenantInfo.data?.find(
        (tenant) => tenant.defaultDomainName === currentTenant,
      );

      // Get filtered portals based on user preferences
      const filteredPortals = getFilteredPortals();

      const menuItems = filteredPortals.map((portal) => ({
        label: portal.label,
        target: "_blank",
        link: portal.url.replace(portal.variable, tenantLookup?.[portal.variable]),
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
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                <BulkActionsMenu
                  buttonName="Portals"
                  actions={portalMenuItems}
                  disabled={!currentTenantInfo.isSuccess || portalMenuItems.length === 0}
                />
                <ExecutiveReportButton disabled={organization.isFetching} />
                <Tooltip title="Coming soon!" arrow>
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<AssessmentIcon />}
                      disabled
                      sx={{
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      Report Builder
                    </Button>
                  </span>
                </Tooltip>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
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
                      label: r.name,
                      value: r.id,
                      description: r.description,
                    }))}
                    placeholder="Choose a report"
                  />
                </Box>
                <CippAddTestReportDrawer />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    minWidth: "auto",
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    transition: "all 0.2s ease-in-out",
                    px: 2,
                  }}
                  onClick={() => {
                    setRefreshDialog({
                      open: true,
                      title: "Refresh Test Data",
                      message: `Are you sure you want to refresh the test data for ${currentTenant}? This might take up to 2 hours to update.`,
                      api: {
                        url: "/api/ExecTestRun",
                        data: { tenantFilter: currentTenant },
                        method: "POST",
                      },
                      handleClose: () => setRefreshDialog({ open: false }),
                    });
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Update Report
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    transition: "all 0.2s ease-in-out",
                  }}
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
                <Box sx={{ height: 450 }}>
                  <SecureScoreCard
                    data={testsApi.data?.SecureScore}
                    isLoading={testsApi.isFetching}
                    sx={{ height: "100%" }}
                  />
                </Box>
                <Box sx={{ height: 450 }}>
                  <AuthMethodCard
                    data={testsApi.data?.MFAState}
                    isLoading={testsApi.isFetching}
                    sx={{ height: "100%" }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
                <Box sx={{ height: 450 }}>
                  <MFACard
                    data={testsApi.data?.MFAState}
                    isLoading={testsApi.isFetching}
                    sx={{ height: "100%" }}
                  />
                </Box>
                <Box sx={{ height: 450 }}>
                  <LicenseCard
                    data={testsApi.data?.LicenseData}
                    isLoading={testsApi.isFetching}
                    sx={{ height: "100%" }}
                  />
                </Box>
              </Box>
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

      {/* Refresh Data Dialog */}
      <CippApiDialog
        createDialog={refreshDialog}
        title={refreshDialog.title}
        fields={[]}
        api={{
          url: refreshDialog.api?.url,
          type: "POST",
          data: refreshDialog.api?.data,
          confirmText: refreshDialog.message,
          relatedQueryKeys: [`${currentTenant}-ListTests-${selectedReport}`],
        }}
      />
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
