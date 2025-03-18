import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Divider,
  Chip,
  Skeleton,
  Alert,
} from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { PlayArrow, CheckCircle, Cancel, Info, Public, Microsoft } from "@mui/icons-material";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import standards from "/src/data/standards.json";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { SvgIcon } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { useRouter } from "next/router";
import { useDialog } from "../../../../hooks/use-dialog";
import { Grid } from "@mui/system";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [comparisonData, setComparisonData] = useState(null);
  const settings = useSettings();
  const currentTenant = settings.currentTenant;
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      comparisonMode: "standard" // Set default comparison mode to "Compare Tenant to standard"
    }
  });
  const runReportDialog = useDialog();

  // Get template details
  const templateDetails = ApiGetCall({
    url: `/api/listStandardTemplates`,
    data: { id: templateId },
    queryKey: `listStandardTemplates-${templateId}`,
  });

  // Get tenants for dropdown
  const tenants = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: "ListTenants",
  });

  // Run the report once
  const runReport = ApiPostCall({ relatedQueryKeys: ["ListStandardCompare"] });

  // Dialog configuration for Run Report Once
  const runReportApi = {
    type: "GET",
    url: "/api/ExecStandardsRun",
    data: {
      TemplateId: templateId,
    },
    confirmText: "Are you sure you want to run this standard report?",
  };

  // Mock data for ListStandardCompare API
  const mockComparisonData = [
    {
      standardName: "Password Complexity",
      currentTenantValue: "Requires 8+ characters, uppercase, lowercase, numbers, and symbols",
      standardValue: "Requires 12+ characters, uppercase, lowercase, numbers, and symbols",
      secondTenantValue: "Requires 10+ characters, uppercase, lowercase, and numbers",
      complianceStatus: "Non-Compliant",
      secondTenantComplianceStatus: "Non-Compliant",
      complianceDetails:
        "Current tenant password policy is less strict than the standard requirement",
      standardId: "standards.PasswordComplexity",
    },
    {
      standardName: "MFA Enforcement",
      currentTenantValue: "Enabled for all users",
      standardValue: "Enabled for all users",
      secondTenantValue: "Enabled for administrators only",
      complianceStatus: "Compliant",
      secondTenantComplianceStatus: "Non-Compliant",
      complianceDetails: "MFA is properly configured according to standards",
      standardId: "standards.PWdisplayAppInformationRequiredState",
    },
    {
      standardName: "Conditional Access Policies",
      currentTenantValue:
        "4 policies configured (Block legacy authentication, Require MFA for admins, Require approved apps, Block high-risk sign-ins)",
      standardValue:
        "5 policies required (Block legacy authentication, Require MFA for all users, Require approved apps, Block high-risk sign-ins, Require compliant devices)",
      secondTenantValue:
        "3 policies configured (Block legacy authentication, Require MFA for admins, Require approved apps)",
      complianceStatus: "Non-Compliant",
      secondTenantComplianceStatus: "Non-Compliant",
      complianceDetails: "Missing required policy: Require compliant devices",
      standardId: "standards.OauthConsent",
    },
    {
      standardName: "External Sharing",
      currentTenantValue: "Restricted to specific domains",
      standardValue: "Restricted to specific domains",
      secondTenantValue: "Allowed with anyone",
      complianceStatus: "Compliant",
      secondTenantComplianceStatus: "Non-Compliant",
      complianceDetails: null,
      standardId: "standards.sharingCapability",
    },
    {
      standardName: "Audit Logging",
      currentTenantValue: "Enabled",
      standardValue: "Enabled",
      secondTenantValue: "Enabled",
      complianceStatus: "Compliant",
      secondTenantComplianceStatus: "Compliant",
      complianceDetails: null,
      standardId: "standards.AuditLog",
    },
    {
      standardName: "Retention Policies",
      currentTenantValue: "Default policy: 1 year retention",
      standardValue: "Default policy: 3 year retention",
      secondTenantValue: "No retention policies configured",
      complianceStatus: "Non-Compliant",
      secondTenantComplianceStatus: "Non-Compliant",
      complianceDetails: "Retention period is shorter than required by standard",
      standardId: "standards.RetentionPolicyTag",
    },
    {
      standardName: "Device Management",
      currentTenantValue: "Intune policies configured for Windows and iOS devices",
      standardValue: "Intune policies required for all device types (Windows, iOS, Android, macOS)",
      secondTenantValue: "Intune policies configured for Windows devices only",
      complianceStatus: "Non-Compliant",
      secondTenantComplianceStatus: "Non-Compliant",
      complianceDetails:
        "Missing required device management policies for Android and macOS devices",
      standardId: "standards.intuneDeviceRetirementDays",
    },
    {
      standardName: "Admin Account Protection",
      currentTenantValue: "Privileged Identity Management enabled, Just-in-time access configured",
      standardValue: "Privileged Identity Management enabled, Just-in-time access configured",
      secondTenantValue: "No PIM configuration",
      complianceStatus: "Compliant",
      secondTenantComplianceStatus: "Non-Compliant",
      complianceDetails: "Admin accounts are properly protected with PIM and JIT access",
      standardId: "standards.DisableTenantCreation",
    },
  ];

  // Get comparison data
  const comparisonApi = ApiGetCall({
    url: "/api/ListStandardCompare",
    data: {
      TemplateId: templateId,
      CompareTenantId: formControl.watch("compareTenantId"),
      CompareToStandard: true, // Always compare to standard, even in tenant comparison mode
    },
    queryKey: `ListStandardCompare-${templateId}-${
      formControl.watch("compareTenantId") || "standard"
    }-${currentTenant}`,
  });

  useEffect(() => {
    // Use mock data for now, replace with API data when available
    // Enhance mock data with information from standards.json
    const enhancedData = mockComparisonData.map((item) => {
      // Find the standard in standards.json
      const standardInfo = standards.find((s) => s.name === item.standardId);

      if (standardInfo) {
        return {
          ...item,
          standardName: standardInfo.label || item.standardName,
          standardDescription: standardInfo.helpText || "",
          standardImpact: standardInfo.impact || "Medium Impact",
          standardImpactColour: standardInfo.impactColour || "warning",
          // Use only information from standards.json for descriptive content
          complianceDetails:
            standardInfo.docsDescription || standardInfo.helpText || item.complianceDetails,
        };
      }

      return item;
    });

    setComparisonData(enhancedData);

    // Uncomment this when the API is ready
    // if (comparisonApi.isSuccess) {
    //   const enhancedApiData = comparisonApi.data.map(item => {
    //     const standardInfo = standards.find(s => s.name === item.standardId);
    //     if (standardInfo) {
    //       return {
    //         ...item,
    //         standardName: standardInfo.label || item.standardName,
    //         standardDescription: standardInfo.helpText || "",
    //         standardImpact: standardInfo.impact || "Medium Impact",
    //         standardImpactColour: standardInfo.impactColour || "warning",
    //         complianceDetails: standardInfo.docsDescription || standardInfo.helpText || item.complianceDetails,
    //       };
    //     }
    //     return item;
    //   });
    //   setComparisonData(enhancedApiData);
    // }
  }, [comparisonApi.isSuccess, comparisonApi.data]);

  // Prepare tenant options for dropdown
  const tenantOptions = tenants.isSuccess
    ? tenants.data?.map((tenant) => ({
        label: tenant.displayName,
        value: tenant.defaultDomainName,
      }))
    : [];

  // Prepare comparison mode options
  const comparisonModeOptions = [
    { label: "Compare Tenant to Standard", value: "standard" },
    { label: "Compare Two Tenants to Standard", value: "tenant" },
  ];

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Stack spacing={4} sx={{ px: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            color="inherit"
            onClick={() => router.back()}
            startIcon={
              <SvgIcon fontSize="small">
                <ArrowLeftIcon />
              </SvgIcon>
            }
          >
            Back to Templates
          </Button>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={4}
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">
            {`Standard Comparison${
              templateDetails.isSuccess ? ` - ${templateDetails.data[0]?.templateName}` : ""
            }`}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrow />}
            onClick={runReportDialog.handleOpen}
          >
            Run Report Once
          </Button>
        </Stack>

        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item size={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Comparison Settings
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Select how you want to compare the standards
                </Typography>
              </Grid>
              <Grid item size={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CippFormComponent
                    type="radio"
                    name="comparisonMode"
                    label="Comparison Mode"
                    formControl={formControl}
                    options={comparisonModeOptions}
                    defaultValue="standard"
                  />
                </Box>
              </Grid>
              {formControl.watch("comparisonMode") === "tenant" && (
                <Grid item size={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CippFormComponent
                      type="select"
                      name="compareTenantId"
                      label="Second Tenant"
                      formControl={formControl}
                      options={tenantOptions}
                      isFetching={tenants.isLoading}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        <CippApiResults apiObject={runReport} />

        {comparisonApi.isLoading && (
          <>
            {[1, 2, 3].map((item) => (
              <Grid container spacing={3} key={item} sx={{ mb: 4 }}>
                <Grid item size={12}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2, px: 1 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width={200} height={32} />
                    </Stack>
                    <Skeleton variant="text" width={100} height={24} />
                  </Stack>
                </Grid>

                <Grid item size={6}>
                  <Card sx={{ height: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 3 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Stack>
                          <Skeleton variant="text" width={150} height={32} />
                          <Skeleton variant="text" width={120} height={24} sx={{ mt: 1 }} />
                        </Stack>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Box sx={{ p: 3 }}>
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="90%" height={20} />
                      <Skeleton variant="text" width="95%" height={20} />
                    </Box>
                  </Card>
                </Grid>

                <Grid item size={6}>
                  <Card sx={{ height: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 3 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Stack>
                          <Skeleton variant="text" width={150} height={32} />
                          <Skeleton variant="text" width={120} height={24} sx={{ mt: 1 }} />
                        </Stack>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Box sx={{ p: 3 }}>
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="85%" height={20} />
                      <Skeleton variant="text" width="90%" height={20} />
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            ))}
          </>
        )}

        <Typography variant="h6" sx={{ mb: 3, px: 1 }}>
          Comparison Results
        </Typography>

        {comparisonData &&
          comparisonData.map((standard, index) => (
            <Grid container spacing={3} key={index} sx={{ mb: 4 }}>
              <Grid item size={12}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2, px: 1 }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor:
                          standard.complianceStatus === "Compliant" ? "success.main" : "error.main",
                      }}
                    >
                      {standard.complianceStatus === "Compliant" ? (
                        <CheckCircle sx={{ color: "white" }} />
                      ) : (
                        <Cancel sx={{ color: "white" }} />
                      )}
                    </Box>
                    <Typography variant="h6">{standard.standardName}</Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  ></Box>
                </Stack>
              </Grid>

              <Grid item size={6}>
                <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 3 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "info.main",
                          }}
                        >
                          {formControl.watch("comparisonMode") === "standard" ? (
                            <Public sx={{ color: "white" }} />
                          ) : (
                            <Microsoft sx={{ color: "white" }} />
                          )}
                        </Box>
                        <Stack>
                          <Typography variant="h6">
                            {formControl.watch("comparisonMode") === "standard"
                              ? "Standard Value"
                              : formControl.watch("compareTenantId")}
                          </Typography>
                          <Chip
                            label={
                              formControl.watch("comparisonMode") === "standard"
                                ? "Standard"
                                : "Comparison Tenant (vs Standard)"
                            }
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    {(formControl.watch("comparisonMode") === "standard" && !standard.standardValue) ||
                     (formControl.watch("comparisonMode") === "tenant" && !standard.secondTenantValue) ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        This data has not yet been collected. Collect the data by pressing the report button on the top of the page.
                      </Alert>
                    ) : (
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {formControl.watch("comparisonMode") === "standard"
                          ? standard.standardValue
                          : standard.secondTenantValue}
                      </Typography>
                    )}
                    {formControl.watch("comparisonMode") === "tenant" && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Standard value: {standard.standardValue || "Not configured"}
                      </Typography>
                    )}
                    {standard.standardDescription && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {standard.standardDescription}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                      <Chip
                        label={standard.standardImpact || "Medium Impact"}
                        size="small"
                        color={
                          standard.standardImpactColour === "info"
                            ? "info"
                            : standard.standardImpactColour === "warning"
                            ? "warning"
                            : "error"
                        }
                        sx={{ mr: 1 }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid item size={6}>
                <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 3 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "primary.main",
                          }}
                        >
                          <Microsoft sx={{ color: "white" }} />
                        </Box>
                        <Stack>
                          <Typography variant="h6">{currentTenant}</Typography>
                          <Chip
                            label="Current Tenant"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Stack>
                      </Stack>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor:
                              standard.complianceStatus === "Compliant"
                                ? "success.main"
                                : "error.main",
                            borderRadius: "50%",
                            width: 8,
                            height: 8,
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {standard.complianceStatus}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {standard.currentTenantValue || "Not configured"}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {standard.complianceDetails && (
                <Grid item size={12}>
                  <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "info.main",
                        }}
                      >
                        <Info />
                      </Box>
                      <Typography variant="body2">{standard.complianceDetails}</Typography>
                    </Stack>
                  </Card>
                </Grid>
              )}
            </Grid>
          ))}
      </Stack>

      {/* CippApiDialog for Run Report Once */}
      <CippApiDialog
        createDialog={runReportDialog}
        title="Run Standard Report"
        api={{
          ...runReportApi,
          data: {
            ...runReportApi.data,
            TemplateId: templateId,
          },
        }}
        relatedQueryKeys={["ListStandardCompare"]}
      />
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
