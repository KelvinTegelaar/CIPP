import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Stack,
  Typography,
  Box,
  Divider,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
  ButtonGroup,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  CheckCircle,
  Cancel,
  Info,
  Microsoft,
  Sync,
  FilterAlt,
  Close,
  Search,
  FactCheck,
} from "@mui/icons-material";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import standards from "/src/data/standards.json";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { SvgIcon } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { useRouter } from "next/router";
import { useDialog } from "../../../../hooks/use-dialog";
import { Grid } from "@mui/system";
import DOMPurify from "dompurify";
import { ClockIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [comparisonData, setComparisonData] = useState(null);
  const settings = useSettings();
  const currentTenant = settings?.currentTenant;
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      comparisonMode: "standard",
    },
  });
  const runReportDialog = useDialog();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const templateDetails = ApiGetCall({
    url: `/api/listStandardTemplates`,
    queryKey: `listStandardTemplates-reports`,
  });

  // Run the report once
  const runReport = ApiPostCall({ relatedQueryKeys: ["ListStandardsCompare"] });

  // Dialog configuration for Run Report Once
  const runReportApi = {
    type: "GET",
    url: "/api/ExecStandardsRun",
    data: {
      TemplateId: templateId,
    },
    confirmText: "Are you sure you want to run this standard report?",
  };

  // Get comparison data
  const comparisonApi = ApiGetCall({
    url: "/api/ListStandardsCompare",
    data: {
      TemplateId: templateId,
      tenantFilter: currentTenant,
      CompareToStandard: true, // Always compare to standard, even in tenant comparison mode
    },
    queryKey: `ListStandardsCompare-${templateId}-${
      formControl.watch("compareTenantId") || "standard"
    }-${currentTenant}`,
    enabled: !!templateId, // Only run the query if templateId is available
  });

  useEffect(() => {
    if (templateId && templateDetails.isSuccess && templateDetails.data) {
      const selectedTemplate = templateDetails.data.find(
        (template) => template.GUID === templateId
      );

      if (selectedTemplate && comparisonApi.isSuccess && comparisonApi.data) {
        const tenantData = comparisonApi.data;

        // Find the current tenant's data by matching tenantFilter with currentTenant
        const currentTenantObj = tenantData.find((t) => t.tenantFilter === currentTenant);
        const currentTenantData = currentTenantObj ? currentTenantObj.standardsResults || [] : [];

        const allStandards = [];
        if (selectedTemplate.standards) {
          Object.entries(selectedTemplate.standards).forEach(([standardKey, standardConfig]) => {
            // Special handling for IntuneTemplate which is an array of items
            if (standardKey === "IntuneTemplate" && Array.isArray(standardConfig)) {
              // Process each IntuneTemplate item separately
              standardConfig.forEach((templateItem, index) => {
                const templateId = templateItem.TemplateList?.value;
                if (templateId) {
                  const standardId = `standards.IntuneTemplate.${templateId}`;
                  const standardInfo = standards.find((s) => s.name === `standards.IntuneTemplate`);

                  // Find the tenant's value for this specific template
                  const currentTenantStandard = currentTenantData.find(
                    (s) => s.standardId === standardId
                  );

                  // Get the direct standard value from the tenant object
                  const directStandardValue = currentTenantObj?.[standardId];

                  // Determine compliance status
                  let isCompliant = false;

                  // For IntuneTemplate, the value is true if compliant, or an object with comparison data if not compliant
                  if (directStandardValue === true) {
                    isCompliant = true;
                  } else if (
                    directStandardValue !== undefined &&
                    typeof directStandardValue !== "object"
                  ) {
                    isCompliant = true;
                  } else if (currentTenantStandard) {
                    isCompliant = currentTenantStandard.value === true;
                  }

                  // Create a standardValue object that contains the template settings
                  const templateSettings = {
                    templateId,
                    Template: templateItem.TemplateList?.label || "Unknown Template",
                    "Assign to": templateItem.AssignTo || "On",
                    "Excluded Group": templateItem.excludeGroup || "",
                    "Included Group": templateItem.customGroup || "",
                  };

                  allStandards.push({
                    standardId,
                    standardName: `Intune Template: ${
                      templateItem.TemplateList?.label || templateId
                    }`,
                    currentTenantValue:
                      directStandardValue !== undefined
                        ? directStandardValue
                        : currentTenantStandard?.value,
                    standardValue: templateSettings, // Use the template settings object instead of true
                    complianceStatus: isCompliant ? "Compliant" : "Non-Compliant",
                    complianceDetails:
                      standardInfo?.docsDescription || standardInfo?.helpText || "",
                    standardDescription: standardInfo?.helpText || "",
                    standardImpact: standardInfo?.impact || "Medium Impact",
                    standardImpactColour: standardInfo?.impactColour || "warning",
                    templateName: selectedTemplate?.templateName || "Standard Template",
                    templateActions: templateItem.action || [],
                  });
                }
              });
            } else {
              // Regular handling for other standards
              const standardId = `standards.${standardKey}`;
              const standardInfo = standards.find((s) => s.name === standardId);
              const standardSettings = standardConfig.standards?.[standardKey] || {};
              //console.log(standardInfo);

              // Check if reporting is enabled for this standard by checking the action property
              // The standard should be reportable if there's an action with value === 'Report'
              const actions = standardConfig?.action ?? [];
              const reportingEnabled =
                actions.filter((action) => action?.value === "Report").length > 0;

              // Find the tenant's value for this standard
              const currentTenantStandard = currentTenantData.find(
                (s) => s.standardId === standardId
              );

              // Determine compliance status
              let isCompliant = false;
              let reportingDisabled = !reportingEnabled;

              // Check if the standard is directly in the tenant object (like "standards.AuditLog": true)
              const standardIdWithoutPrefix = standardId.replace("standards.", "");
              const directStandardValue = currentTenantObj?.[standardId];

              // Special case for boolean standards that are true in the tenant
              if (directStandardValue === true) {
                // If the standard is directly in the tenant and is true, it's compliant
                isCompliant = true;
              } else if (directStandardValue !== undefined) {
                // For non-boolean values, use strict equality
                isCompliant =
                  JSON.stringify(directStandardValue) === JSON.stringify(standardSettings);
              } else if (currentTenantStandard) {
                // Fall back to the previous logic if the standard is not directly in the tenant object
                if (typeof standardSettings === "boolean" && standardSettings === true) {
                  isCompliant = currentTenantStandard.value === true;
                } else {
                  isCompliant =
                    JSON.stringify(currentTenantStandard.value) ===
                    JSON.stringify(standardSettings);
                }
              }

              // Determine compliance status text based on reporting flag
              const complianceStatus = reportingDisabled
                ? "Reporting Disabled"
                : isCompliant
                ? "Compliant"
                : "Non-Compliant";

              // Use the direct standard value from the tenant object if it exists
              allStandards.push({
                standardId,
                standardName: standardInfo?.label || standardKey,
                currentTenantValue:
                  directStandardValue !== undefined
                    ? directStandardValue
                    : currentTenantStandard?.value,
                standardValue: standardSettings,
                complianceStatus,
                reportingDisabled,
                complianceDetails: standardInfo?.docsDescription || standardInfo?.helpText || "",
                standardDescription: standardInfo?.helpText || "",
                standardImpact: standardInfo?.impact || "Medium Impact",
                standardImpactColour: standardInfo?.impactColour || "warning",
                templateName: selectedTemplate.templateName || "Standard Template",
                templateActions: standardConfig.action || [],
              });
            }
          });
        }

        setComparisonData(allStandards);
      } else {
        setComparisonData([]);
      }
    } else if (comparisonApi.isError) {
      setComparisonData([]);
    }
  }, [
    templateId,
    templateDetails.isSuccess,
    templateDetails.data,
    comparisonApi.isSuccess,
    comparisonApi.data,
    comparisonApi.isError,
  ]);
  const comparisonModeOptions = [{ label: "Compare Tenant to Standard", value: "standard" }];

  // Group standards by category
  const groupedStandards = useMemo(() => {
    if (!comparisonData) return {};

    const result = {};

    comparisonData.forEach((standard) => {
      // Find the standard info in the standards.json data
      const standardInfo = standards.find((s) => standard.standardId.includes(s.name));

      // Use the category from standards.json, or default to "Other Standards"
      const category = standardInfo?.cat || "Other Standards";

      if (!result[category]) {
        result[category] = [];
      }

      result[category].push(standard);
    });

    // Sort standards within each category
    Object.keys(result).forEach((category) => {
      result[category].sort((a, b) => a.standardName.localeCompare(b.standardName));
    });

    return result;
  }, [comparisonData]);

  const filteredGroupedStandards = useMemo(() => {
    if (!groupedStandards) return {};

    if (!searchQuery && filter === "all") {
      return groupedStandards;
    }

    const result = {};
    const searchLower = searchQuery.toLowerCase();

    Object.keys(groupedStandards).forEach((category) => {
      const categoryMatchesSearch = !searchQuery || category.toLowerCase().includes(searchLower);

      const filteredStandards = groupedStandards[category].filter((standard) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "compliant" && standard.complianceStatus === "Compliant") ||
          (filter === "nonCompliant" && standard.complianceStatus === "Non-Compliant");

        const matchesSearch =
          !searchQuery ||
          categoryMatchesSearch ||
          standard.standardName.toLowerCase().includes(searchLower) ||
          standard.standardDescription.toLowerCase().includes(searchLower);

        return matchesFilter && matchesSearch;
      });

      if (filteredStandards.length > 0) {
        result[category] = filteredStandards;
      }
    });

    return result;
  }, [groupedStandards, searchQuery, filter]);

  const allCount = comparisonData?.length || 0;
  const compliantCount =
    comparisonData?.filter((standard) => standard.complianceStatus === "Compliant").length || 0;
  const nonCompliantCount =
    comparisonData?.filter((standard) => standard.complianceStatus === "Non-Compliant").length || 0;
  const reportingDisabledCount =
    comparisonData?.filter((standard) => standard.complianceStatus === "Reporting Disabled")
      .length || 0;
  const compliancePercentage =
    allCount > 0
      ? Math.round((compliantCount / (allCount - reportingDisabledCount || 1)) * 100)
      : 0;

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
        <Box>
          <Stack direction="row" alignItems="space-between" spacing={2}>
            <Typography variant="h4" width={"100%"}>
              {
                templateDetails?.data?.filter((template) => template.GUID === templateId)?.[0]
                  ?.templateName
              }
            </Typography>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => comparisonApi.refetch()}>
                <Sync />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack alignItems="center" flexWrap="wrap" direction="row" spacing={2}>
            {comparisonApi.data?.find((comparison) => comparison.RowKey === currentTenant) && (
              <Stack alignItems="center" direction="row" spacing={1}>
                <Chip
                  icon={
                    <SvgIcon fontSize="small">
                      <FactCheck />
                    </SvgIcon>
                  }
                  label={`${compliancePercentage}% Compliant`}
                  variant="outlined"
                  size="small"
                  color={
                    compliancePercentage === 100
                      ? "success"
                      : compliancePercentage >= 50
                      ? "warning"
                      : "error"
                  }
                  sx={{ ml: 2 }}
                />
                <Chip
                  icon={
                    <SvgIcon fontSize="small">
                      <ClockIcon />
                    </SvgIcon>
                  }
                  size="small"
                  label={`Updated on ${new Date(
                    comparisonApi.data.find(
                      (comparison) => comparison.RowKey === currentTenant
                    ).LastRefresh
                  ).toLocaleString()}`}
                />
              </Stack>
            )}
          </Stack>
          {templateDetails?.data?.filter((template) => template.GUID === templateId)?.[0]
            ?.description && (
            <Box
              sx={{
                "& a": {
                  color: (theme) => theme.palette.primary.main,
                  textDecoration: "underline",
                },
                color: "text.secondary",
                fontSize: "0.875rem",
                "& p": {
                  my: 0,
                },
                mt: 2,
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  templateDetails?.data?.filter((template) => template.GUID === templateId)[0]
                    .description
                ),
              }}
            />
          )}
        </Box>
        {comparisonApi.isFetching && (
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
                    <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width={200} height={32} />
                    </Stack>
                    <Skeleton variant="text" width={100} height={24} />
                  </Stack>
                </Grid>

                <Grid item size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 3 }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems="center"
                        spacing={3}
                      >
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

                <Grid item size={{ xs: 12, md: 6 }}>
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

        <Divider sx={{ my: 2 }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            mt: 2,
            alignItems: { xs: "flex-start", sm: "center" },
            displayPrint: "none", // Hide filters in print view
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
            <TextField
              size="small"
              variant="filled"
              fullWidth={{ xs: true, sm: false }}
              sx={{ width: { xs: "100%", sm: 350 } }}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ margin: "0 !important" }}>
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Tooltip title="Clear search">
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                        >
                          <Close />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
          <ButtonGroup variant="outlined" color="primary" size="small">
            <Button disabled={true} color="primary">
              <SvgIcon fontSize="small">
                <FilterAlt />
              </SvgIcon>
            </Button>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
            >
              All ({allCount})
            </Button>
            <Button
              variant={filter === "compliant" ? "contained" : "outlined"}
              onClick={() => setFilter("compliant")}
            >
              Compliant ({compliantCount})
            </Button>
            <Button
              variant={filter === "nonCompliant" ? "contained" : "outlined"}
              onClick={() => setFilter("nonCompliant")}
            >
              Non-Compliant ({nonCompliantCount})
            </Button>
          </ButtonGroup>
        </Stack>
        {comparisonApi.isError && (
          <Card sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Error fetching comparison data
            </Alert>
            <Typography variant="body2">
              There was an error retrieving the comparison data. Please try running the report again
              by clicking the "Run Report Once" button above.
            </Typography>
            {comparisonApi.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                  {comparisonApi.error.message || JSON.stringify(comparisonApi.error, null, 2)}
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {comparisonApi.isSuccess && (!comparisonApi.data || comparisonApi.data.length === 0) && (
          <Card sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              No comparison data is available. This might be because:
            </Alert>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • The tenant has not been scanned yet
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • The template has no standards configured
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • There was an issue with the comparison
              </Typography>
            </Box>
            <Typography variant="body2">
              Try running the report by clicking the "Run Report Once" button above.
            </Typography>
          </Card>
        )}

        {filteredGroupedStandards && Object.keys(filteredGroupedStandards).length === 0 && (
          <Card sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              No standards match the selected filter criteria or search query.
            </Alert>
            <Typography variant="body2">
              Try selecting a different filter or modifying the search query.
            </Typography>
          </Card>
        )}

        {Object.keys(filteredGroupedStandards).map((category) => (
          <React.Fragment key={category}>
            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
              {category}
            </Typography>

            {filteredGroupedStandards[category].map((standard, index) => (
              <Grid container spacing={3} key={index} sx={{ mb: 4 }}>
                <Grid item size={{ xs: 12, md: 6 }}>
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
                              bgcolor:
                                standard.complianceStatus === "Compliant"
                                  ? "success.main"
                                  : standard.complianceStatus === "Reporting Disabled"
                                  ? "grey.500"
                                  : "error.main",
                            }}
                          >
                            {standard.complianceStatus === "Compliant" ? (
                              <CheckCircle sx={{ color: "white" }} />
                            ) : standard.complianceStatus === "Reporting Disabled" ? (
                              <Info sx={{ color: "white" }} />
                            ) : (
                              <Cancel sx={{ color: "white" }} />
                            )}
                          </Box>
                          <Stack>
                            <Typography variant="h6">{standard?.standardName}</Typography>
                            <Box>
                              <Chip
                                label="Standard"
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ mt: 1, px: 2 }}
                              />
                            </Box>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Box sx={{ p: 3 }}>
                      {!standard.standardValue ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          This data has not yet been collected. Collect the data by pressing the
                          report button on the top of the page.
                        </Alert>
                      ) : (
                        <Box>
                          <Box>
                            <Box
                              sx={{
                                p: 2,
                                bgcolor: "background.default",
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              {standard.standardValue &&
                              typeof standard.standardValue === "object" &&
                              Object.keys(standard.standardValue).length > 0 ? (
                                Object.entries(standard.standardValue).map(([key, value]) => (
                                  <Box key={key} sx={{ display: "flex", mb: 0.5 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: "medium", mr: 1 }}
                                    >
                                      {key}:
                                    </Typography>
                                    <Typography variant="body2">
                                      {typeof value === "object" && value !== null
                                        ? value?.label || JSON.stringify(value)
                                        : value === true
                                        ? "Enabled"
                                        : value === false
                                        ? "Disabled"
                                        : String(value)}
                                    </Typography>
                                  </Box>
                                ))
                              ) : (
                                <Typography variant="body2">
                                  {standard.standardValue === true ? (
                                    <Alert severity="success" sx={{ mt: 1 }}>
                                      This setting is configured correctly
                                    </Alert>
                                  ) : standard.standardValue === false ? (
                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                      This setting is not configured correctly
                                    </Alert>
                                  ) : standard.standardValue !== undefined ? (
                                    typeof standard.standardValue === "object" ? (
                                      "No settings configured"
                                    ) : (
                                      String(standard.standardValue)
                                    )
                                  ) : (
                                    <Alert severity="info" sx={{ mt: 1 }}>
                                      This setting is not configured, or data has not been
                                      collected. If you are getting this after data collection, the
                                      tenant might not be licensed for this feature
                                    </Alert>
                                  )}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
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

                <Grid item size={{ xs: 12, md: 6 }}>
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
                            <Box>
                              <Chip
                                label="Current Tenant"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 1, px: 2 }}
                              />
                            </Box>
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
                                  : standard.complianceStatus === "Reporting Disabled"
                                  ? "grey.500"
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
                      {/* Existing tenant comparison content */}
                      {typeof standard.currentTenantValue === "object" &&
                      standard.currentTenantValue !== null ? (
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: "background.default",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {standard.complianceStatus === "Reporting Disabled" ? (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              Reporting is disabled for this standard in the template configuration.
                            </Alert>
                          ) : (
                            Object.entries(standard.currentTenantValue).map(([key, value]) => {
                              const standardValueForKey =
                                standard.standardValue && typeof standard.standardValue === "object"
                                  ? standard.standardValue[key]
                                  : undefined;

                              const isDifferent =
                                standardValueForKey !== undefined &&
                                JSON.stringify(value) !== JSON.stringify(standardValueForKey);

                              return (
                                <Box key={key} sx={{ display: "flex", mb: 0.5 }}>
                                  <Typography variant="body2" sx={{ fontWeight: "medium", mr: 1 }}>
                                    {key}:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color:
                                        standard.complianceStatus === "Compliant"
                                          ? "success.main"
                                          : isDifferent
                                          ? "error.main"
                                          : "inherit",
                                      fontWeight:
                                        standard.complianceStatus === "Non-Compliant" && isDifferent
                                          ? "medium"
                                          : "inherit",
                                    }}
                                  >
                                    {standard.complianceStatus === "Compliant" && value === true
                                      ? "Compliant"
                                      : typeof value === "object" && value !== null
                                      ? value?.label || JSON.stringify(value)
                                      : value === true
                                      ? "Enabled"
                                      : value === false
                                      ? "Disabled"
                                      : String(value)}
                                  </Typography>
                                </Box>
                              );
                            })
                          )}
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: "pre-wrap",
                            color:
                              standard.complianceStatus === "Compliant"
                                ? "success.main"
                                : standard.complianceStatus === "Reporting Disabled"
                                ? "text.secondary"
                                : "error.main",
                            fontWeight:
                              standard.complianceStatus === "Non-Compliant" ? "medium" : "inherit",
                          }}
                        >
                          {standard.complianceStatus === "Reporting Disabled" ? (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              Reporting is disabled for this standard in the template configuration.
                            </Alert>
                          ) : standard.complianceStatus === "Compliant" &&
                            standard.currentTenantValue === true ? (
                            <Alert severity="success" sx={{ mt: 1 }}>
                              This setting is configured correctly
                            </Alert>
                          ) : standard.currentTenantValue === false ? (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              This setting is not configured correctly
                            </Alert>
                          ) : standard.currentTenantValue !== undefined ? (
                            String(standard.currentTenantValue)
                          ) : (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              This setting is not configured, or data has not been collected. If you
                              are getting this after data collection, the tenant might not be
                              licensed for this feature
                            </Alert>
                          )}
                        </Typography>
                      )}
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
          </React.Fragment>
        ))}
      </Stack>

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
        relatedQueryKeys={["ListStandardsCompare"]}
      />
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
