import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { useRouter } from "next/router";
import {
  Check,
  Warning,
  ExpandMore,
  CheckCircle,
  Block,
  CheckBox,
  Cancel,
  Policy,
  Error,
  Info,
  FactCheck,
  Search,
  Edit,
} from "@mui/icons-material";
import {
  Box,
  Stack,
  Typography,
  Button,
  Menu,
  MenuItem,
  Chip,
  SvgIcon,
  TextField,
  Divider,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { CippBannerListCard } from "../../../components/CippCards/CippBannerListCard";
import CippButtonCard from "../../../components/CippCards/CippButtonCard";
import { CippHead } from "../../../components/CippComponents/CippHead";
import { HeaderedTabbedLayout } from "../../../layouts/HeaderedTabbedLayout";
import { ApiGetCall } from "../../../api/ApiCall";
import { useSettings } from "../../../hooks/use-settings";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { useDialog } from "../../../hooks/use-dialog";
import tabOptions from "./tabOptions.json";
import standardsData from "../../../data/standards.json";
import { createDriftManagementActions } from "./driftManagementActions";
import { ExecutiveReportButton } from "../../../components/ExecutiveReportButton";
import { CippAutoComplete } from "../../../components/CippComponents/CippAutocomplete";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";

const ManageDriftPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const userSettingsDefaults = useSettings();
  // Prioritize URL query parameter, then fall back to settings
  const tenantFilter = router.query.tenantFilter || userSettingsDefaults.currentTenant || "";
  const [anchorEl, setAnchorEl] = useState({});
  const [bulkActionsAnchorEl, setBulkActionsAnchorEl] = useState(null);
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, ready: false });
  const [triggerReport, setTriggerReport] = useState(false);
  const reportButtonRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedItems, setSelectedItems] = useState([]);

  const filterForm = useForm({
    defaultValues: {
      statusFilter: [{ label: "All Deviations", value: "all" }],
    },
  });

  const filterStatus = filterForm.watch("statusFilter") || [
    { label: "All Deviations", value: "all" },
  ];

  // API calls for drift data
  const driftApi = ApiGetCall({
    url: "/api/listTenantDrift",
    data: {
      tenantFilter: tenantFilter,
    },
    queryKey: `TenantDrift-${tenantFilter}`,
  });

  // API call for available drift templates (for What If dropdown)
  const standardsApi = ApiGetCall({
    url: "/api/listStandardTemplates",
    data: {
      type: "drift",
    },
    queryKey: "ListDriftTemplates",
  });

  // API call to get all Intune templates for displayName lookup
  const intuneTemplatesApi = ApiGetCall({
    url: "/api/ListIntuneTemplates",
    queryKey: "ListIntuneTemplates",
  });

  // API call for standards comparison (when templateId is available)
  const comparisonApi = ApiGetCall({
    url: "/api/ListStandardsCompare",
    data: {
      TemplateId: templateId,
      tenantFilter: tenantFilter,
      CompareToStandard: true,
    },
    queryKey: `StandardsCompare-${templateId}-${tenantFilter}`,
    enabled: !!templateId && !!tenantFilter,
  });

  // Process drift data for chart - filter by current tenant and aggregate
  const rawDriftData = driftApi.data || [];
  const tenantDriftData = Array.isArray(rawDriftData)
    ? rawDriftData.filter((item) => item.tenantFilter === tenantFilter)
    : [];

  // Aggregate data across all standards for this tenant
  const processedDriftData = tenantDriftData.reduce(
    (acc, item) => {
      acc.acceptedDeviationsCount += item.acceptedDeviationsCount || 0;
      acc.currentDeviationsCount += item.currentDeviationsCount || 0;
      acc.alignedCount += item.alignedCount || 0;
      acc.customerSpecificDeviations += item.customerSpecificDeviationsCount || 0;
      acc.deniedDeviationsCount += item.deniedDeviationsCount || 0;

      // Use the API's direct arrays instead of filtering allDeviations
      if (item.currentDeviations && Array.isArray(item.currentDeviations)) {
        acc.currentDeviations.push(...item.currentDeviations.filter((dev) => dev !== null));
      }
      if (item.acceptedDeviations && Array.isArray(item.acceptedDeviations)) {
        acc.acceptedDeviations.push(...item.acceptedDeviations.filter((dev) => dev !== null));
      }
      if (item.customerSpecificDeviations && Array.isArray(item.customerSpecificDeviations)) {
        acc.customerSpecificDeviationsList.push(
          ...item.customerSpecificDeviations.filter((dev) => dev !== null),
        );
      }
      if (item.deniedDeviations && Array.isArray(item.deniedDeviations)) {
        acc.deniedDeviationsList.push(...item.deniedDeviations.filter((dev) => dev !== null));
      }

      // Extract compliant standards from ComparisonDetails in driftSettings
      if (
        item.driftSettings?.ComparisonDetails &&
        Array.isArray(item.driftSettings.ComparisonDetails)
      ) {
        const compliantStandards = item.driftSettings.ComparisonDetails.filter(
          (detail) => detail.Compliant === true,
        )
          .map((detail) => {
            // Strip "standards." prefix if present
            let standardName = detail.StandardName;
            if (standardName.startsWith("standards.")) {
              standardName = standardName.substring("standards.".length);
            }

            let displayName = null;

            // For template types, extract the display name from standardSettings
            if (standardName.startsWith("IntuneTemplate.")) {
              const guid = standardName.substring("IntuneTemplate.".length);

              // First try to find in standardSettings
              const intuneTemplates = item.driftSettings?.standardSettings?.IntuneTemplate;
              if (Array.isArray(intuneTemplates)) {
                const template = intuneTemplates.find((t) => t.TemplateList?.value === guid);
                if (template?.TemplateList?.label) {
                  displayName = template.TemplateList.label;
                }
              }

              // If not found in standardSettings, look up in all Intune templates (for tag templates)
              if (!displayName && intuneTemplatesApi.data) {
                const template = intuneTemplatesApi.data.find((t) => t.GUID === guid);
                if (template?.Displayname) {
                  displayName = template.Displayname;
                }
              }

              // If template not found, return null to filter it out later
              if (!displayName) {
                return null;
              }
            } else if (standardName.startsWith("ConditionalAccessTemplate.")) {
              const guid = standardName.substring("ConditionalAccessTemplate.".length);
              const caTemplates = item.driftSettings?.standardSettings?.ConditionalAccessTemplate;
              if (Array.isArray(caTemplates)) {
                const template = caTemplates.find((t) => t.TemplateList?.value === guid);
                if (template?.TemplateList?.label) {
                  displayName = template.TemplateList.label;
                }
              }
              // If template not found, return null to filter it out later
              if (!displayName) {
                return null;
              }
            } else {
              // For non-template standards, keep the "standards." prefix for lookup
              standardName = detail.StandardName;
            }

            return {
              standardName: standardName,
              standardDisplayName: displayName, // Set display name if found from templates
              state: "aligned",
              Status: "Aligned",
              ComplianceStatus: detail.ComplianceStatus,
              StandardValue: detail.StandardValue,
              ReportingDisabled: detail.ReportingDisabled,
              ExpectedValue: detail.ExpectedValue,
              CurrentValue: detail.CurrentValue,
              expectedValue: detail.ExpectedValue || "Compliant with template",
              receivedValue: detail.CurrentValue || detail.StandardValue,
            };
          })
          .filter((item) => item !== null); // Filter out null items where templates weren't found
        acc.alignedStandards.push(...compliantStandards);
      }

      // Use the latest data collection timestamp
      if (
        item.latestDataCollection &&
        (!acc.latestDataCollection ||
          new Date(item.latestDataCollection) > new Date(acc.latestDataCollection))
      ) {
        acc.latestDataCollection = item.latestDataCollection;
      }

      return acc;
    },
    {
      acceptedDeviationsCount: 0,
      currentDeviationsCount: 0,
      alignedCount: 0,
      customerSpecificDeviations: 0,
      deniedDeviationsCount: 0,
      currentDeviations: [],
      acceptedDeviations: [],
      customerSpecificDeviationsList: [],
      deniedDeviationsList: [],
      alignedStandards: [],
      latestDataCollection: null,
    },
  );

  // Transform currentDeviations into deviation items for display
  const getDeviationIcon = (state) => {
    switch (state?.toLowerCase()) {
      case "current":
        return <Warning color="warning" />;
      case "denied":
        return <Error color="error" />;
      case "denieddelete":
      case "denied - delete":
        return <Block color="error" />;
      case "deniedremediate":
      case "denied - remediate":
        return <Cancel color="error" />;
      case "accepted":
        return <CheckCircle color="success" />;
      case "customerspecific":
        return <Info color="info" />;
      case "aligned":
      case "compliant":
        return <CheckCircle color="success" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getDeviationColor = (state) => {
    switch (state?.toLowerCase()) {
      case "current":
        return "warning.main";
      case "denied":
        return "error.main";
      case "denieddelete":
      case "denied - delete":
        return "error.main";
      case "deniedremediate":
      case "denied - remediate":
        return "error.main";
      case "accepted":
        return "success.main";
      case "customerspecific":
        return "info.main";
      case "aligned":
      case "compliant":
        return "success.main";
      default:
        return "warning.main";
    }
  };

  const getDeviationStatusText = (state) => {
    switch (state?.toLowerCase()) {
      case "current":
        return "Current Deviation";
      case "denied":
        return "Denied Deviation";
      case "denieddelete":
      case "denied - delete":
        return "Denied - Delete";
      case "deniedremediate":
      case "denied - remediate":
        return "Denied - Remediate";
      case "accepted":
        return "Accepted Deviation";
      case "customerspecific":
        return "Customer Specific";
      case "aligned":
      case "compliant":
        return "Compliant";
      default:
        return "Deviation";
    }
  };

  // Helper function to get pretty name from standards.json
  const getStandardPrettyName = (standardName) => {
    if (!standardName) return "Unknown Standard";

    // Find the standard in standards.json by name
    const standard = standardsData.find((s) => s.name === standardName);
    if (standard && standard.label) {
      return standard.label;
    }

    // If not found in standards.json, try using standardDisplayName from the deviation object
    // This will be handled in the createDeviationItems function
    return null;
  };

  // Helper function to get description from standards.json
  const getStandardDescription = (standardName) => {
    if (!standardName) return null;

    // Find the standard in standards.json by name
    const standard = standardsData.find((s) => s.name === standardName);
    if (standard) {
      return standard.helpText || standard.docsDescription || standard.executiveText || null;
    }

    return null;
  };

  // Helper function to compare JSON objects and find differences
  const compareJsonObjects = (expected, current) => {
    if (!expected || !current) return null;

    try {
      const expectedObj = typeof expected === "string" ? JSON.parse(expected) : expected;
      const currentObj = typeof current === "string" ? JSON.parse(current) : current;

      // Deep comparison - if they're equal, return null (no diff)
      if (JSON.stringify(expectedObj) === JSON.stringify(currentObj)) {
        return null; // No differences
      }

      // Find differences
      const differences = {};
      const allKeys = new Set([...Object.keys(expectedObj), ...Object.keys(currentObj)]);

      allKeys.forEach((key) => {
        const expectedVal = expectedObj[key];
        const currentVal = currentObj[key];

        if (JSON.stringify(expectedVal) !== JSON.stringify(currentVal)) {
          differences[key] = {
            expected: expectedVal,
            current: currentVal,
          };
        }
      });

      return Object.keys(differences).length > 0 ? differences : null;
    } catch (e) {
      console.error("Error comparing JSON objects:", e);
      return null;
    }
  };

  // Helper function to format differences for display
  const formatDifferences = (differences) => {
    if (!differences || typeof differences !== "object") return null;

    const formatted = [];
    Object.entries(differences).forEach(([key, value]) => {
      formatted.push({
        property: key,
        expected:
          value.expected !== undefined ? JSON.stringify(value.expected, null, 2) : "Not set",
        current: value.current !== undefined ? JSON.stringify(value.current, null, 2) : "Not set",
      });
    });

    return formatted;
  };

  // Helper function to format matching properties for compliant items
  const formatCompliantProperties = (value) => {
    if (!value) return null;

    try {
      const obj = typeof value === "string" ? JSON.parse(value) : value;

      if (typeof obj !== "object" || obj === null) return null;

      const formatted = [];
      Object.entries(obj).forEach(([key, val]) => {
        formatted.push({
          property: key,
          value: val !== undefined ? JSON.stringify(val, null, 2) : "Not set",
        });
      });

      return formatted.length > 0 ? formatted : null;
    } catch (e) {
      return null;
    }
  };

  // Helper function to format policy objects for display
  const formatPolicyValue = (value) => {
    if (!value) return "N/A";

    // If it's already a string, return it
    if (typeof value === "string") {
      // Check if it's a JSON string and try to parse it
      try {
        const parsed = JSON.parse(value);
        return formatPolicyValue(parsed);
      } catch {
        return value;
      }
    }

    // If it's an object (policy object from API)
    if (typeof value === "object" && value !== null) {
      // Pretty-print the object as JSON
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  // Helper function to create deviation items
  const createDeviationItems = (deviations, statusOverride = null) => {
    return (deviations || [])
      .filter((deviation) => {
        // Filter out template deviations where the template cannot be found
        // (these will have null/undefined standardDisplayName)
        if (
          deviation.standardName &&
          (deviation.standardName.startsWith("IntuneTemplate.") ||
            deviation.standardName.startsWith("ConditionalAccessTemplate."))
        ) {
          // For templates, we must have a standardDisplayName
          return !!deviation.standardDisplayName;
        }
        // For non-template standards, always include
        return true;
      })
      .map((deviation, index) => {
        // Check if this should be skipped due to missing license
        const isLicenseSkipped = deviation.LicenseAvailable === false;

        // Check if we have both ExpectedValue and CurrentValue for comparison
        let isActuallyCompliant = false;
        let jsonDifferences = null;

        if (deviation.ExpectedValue && deviation.CurrentValue) {
          jsonDifferences = compareJsonObjects(deviation.ExpectedValue, deviation.CurrentValue);
          // If there are no differences, this is actually compliant
          if (jsonDifferences === null) {
            isActuallyCompliant = true;
          }
        }

        // Prioritize standardDisplayName from drift data (which has user-friendly names for templates)
        // then fallback to standards.json lookup, then raw name
        const prettyName =
          deviation.standardDisplayName ||
          getStandardPrettyName(deviation.standardName) ||
          deviation.standardName ||
          "Unknown Standard";

        // Get description from standards.json first, then fallback to standardDescription from deviation
        const description =
          getStandardDescription(deviation.standardName) ||
          deviation.standardDescription ||
          "No description available";

        // Determine the actual status
        // If actually compliant (values match), mark as aligned regardless of input status
        // If license is skipped, mark as skipped
        // Otherwise use the provided status
        const actualStatus = isActuallyCompliant
          ? "aligned"
          : isLicenseSkipped
            ? "skipped"
            : statusOverride || deviation.Status || deviation.state;
        const actualStatusText = isActuallyCompliant
          ? "Compliant"
          : isLicenseSkipped
            ? "Skipped - No License Available"
            : getDeviationStatusText(actualStatus);

        // For skipped items, show different expected/received values
        let displayExpectedValue = deviation.ExpectedValue || deviation.expectedValue;
        let displayReceivedValue = deviation.CurrentValue || deviation.receivedValue;

        // If we have JSON differences, format them for display
        let formattedDifferences = null;
        let formattedCompliantProps = null;

        if (jsonDifferences && !isLicenseSkipped && !isActuallyCompliant) {
          formattedDifferences = formatDifferences(jsonDifferences);
        } else if ((isActuallyCompliant || actualStatus === "aligned") && displayExpectedValue) {
          // For compliant items, format the properties to show them matching
          formattedCompliantProps = formatCompliantProperties(displayExpectedValue);
        }

        return {
          id: statusOverride ? `${statusOverride}-${index + 1}` : `current-${index + 1}`,
          cardLabelBox: {
            cardLabelBoxHeader: getDeviationIcon(actualStatus),
          },
          text: prettyName,
          subtext: description,
          statusColor: isLicenseSkipped ? "text.secondary" : getDeviationColor(actualStatus),
          statusText: actualStatusText,
          standardName: deviation.standardName, // Store the original standardName for action handlers
          receivedValue: deviation.receivedValue, // Store the original receivedValue for action handlers
          expectedValue: deviation.expectedValue, // Store the original expectedValue for action handlers
          originalDeviation: deviation, // Store the complete original deviation object for reference
          isLicenseSkipped: isLicenseSkipped, // Flag for filtering and disabling actions
          isActuallyCompliant: isActuallyCompliant, // Flag to move to compliant section
          children: (
            <Stack spacing={2} sx={{ p: 2 }}>
              {description && description !== "No description available" && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}

              {isLicenseSkipped && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "warning.lighter",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "warning.main",
                  }}
                >
                  <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
                    ⚠️ This standard was skipped because the required license is not available for
                    this tenant.
                  </Typography>
                </Box>
              )}

              {formattedDifferences && formattedDifferences.length > 0 ? (
                <Stack spacing={2}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Property Differences
                  </Typography>
                  {formattedDifferences.map((diff, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: "primary.main",
                        }}
                      >
                        {diff.property}
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Expected
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "success.lighter",
                              borderRadius: "12px",
                              border: "2px solid",
                              borderColor: "success.main",
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: "success.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check sx={{ color: "white", fontSize: 16 }} />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.8125rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                color: "success.dark",
                              }}
                            >
                              {diff.expected}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Current
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "error.lighter",
                              borderRadius: "12px",
                              border: "2px solid",
                              borderColor: "error.main",
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: "error.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Cancel sx={{ color: "white", fontSize: 16 }} />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.8125rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                color: "error.dark",
                              }}
                            >
                              {diff.current}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : formattedCompliantProps && formattedCompliantProps.length > 0 ? (
                <Stack spacing={2}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Compliant Properties
                  </Typography>
                  {formattedCompliantProps.map((prop, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: "success.main",
                        }}
                      >
                        {prop.property}
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Expected
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "success.lighter",
                              borderRadius: "12px",
                              border: "2px solid",
                              borderColor: "success.main",
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: "success.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check sx={{ color: "white", fontSize: 16 }} />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.8125rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                color: "success.dark",
                              }}
                            >
                              {prop.value}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Current
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "success.lighter",
                              borderRadius: "12px",
                              border: "2px solid",
                              borderColor: "success.main",
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: "success.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check sx={{ color: "white", fontSize: 16 }} />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.8125rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                color: "success.dark",
                              }}
                            >
                              {prop.value}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : displayExpectedValue || displayReceivedValue ? (
                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  {displayExpectedValue && (
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Expected
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor:
                            isActuallyCompliant || actualStatus === "aligned"
                              ? "success.lighter"
                              : "action.hover",
                          borderRadius:
                            isActuallyCompliant || actualStatus === "aligned" ? "12px" : 1,
                          border:
                            isActuallyCompliant || actualStatus === "aligned"
                              ? "2px solid"
                              : "1px solid",
                          borderColor:
                            isActuallyCompliant || actualStatus === "aligned"
                              ? "success.main"
                              : "divider",
                          position: "relative",
                        }}
                      >
                        {(isActuallyCompliant || actualStatus === "aligned") && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              bgcolor: "success.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check sx={{ color: "white", fontSize: 16 }} />
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color:
                              isActuallyCompliant || actualStatus === "aligned"
                                ? "success.dark"
                                : "text.primary",
                          }}
                        >
                          {displayExpectedValue === "Compliant with template"
                            ? displayReceivedValue || "Compliant"
                            : displayExpectedValue}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {displayReceivedValue && (
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Current
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor:
                            isActuallyCompliant || actualStatus === "aligned"
                              ? "success.lighter"
                              : "action.hover",
                          borderRadius:
                            isActuallyCompliant || actualStatus === "aligned" ? "12px" : 1,
                          border:
                            isActuallyCompliant || actualStatus === "aligned"
                              ? "2px solid"
                              : "1px solid",
                          borderColor:
                            isActuallyCompliant || actualStatus === "aligned"
                              ? "success.main"
                              : "divider",
                          position: "relative",
                        }}
                      >
                        {(isActuallyCompliant || actualStatus === "aligned") && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              bgcolor: "success.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check sx={{ color: "white", fontSize: 16 }} />
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color:
                              isActuallyCompliant || actualStatus === "aligned"
                                ? "success.dark"
                                : "text.primary",
                          }}
                        >
                          {displayReceivedValue}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : null}

              {(deviation.Reason ||
                deviation.lastChangedByUser ||
                processedDriftData.latestDataCollection) && (
                <>
                  <Divider />
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {deviation.Reason && (
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: "text.secondary" }}
                        >
                          Reason
                        </Typography>
                        <Typography variant="body2">{deviation.Reason}</Typography>
                      </Box>
                    )}
                    {deviation.lastChangedByUser && (
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: "text.secondary" }}
                        >
                          Changed By
                        </Typography>
                        <Typography variant="body2">{deviation.lastChangedByUser}</Typography>
                      </Box>
                    )}
                    {processedDriftData.latestDataCollection && (
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: "text.secondary" }}
                        >
                          Last Updated
                        </Typography>
                        <Typography variant="body2">
                          {new Date(processedDriftData.latestDataCollection).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          ),
        };
      });
  };

  const deviationItems = createDeviationItems(processedDriftData.currentDeviations);
  const acceptedDeviationItems = createDeviationItems(
    processedDriftData.acceptedDeviations,
    "accepted",
  );
  const customerSpecificDeviationItems = createDeviationItems(
    processedDriftData.customerSpecificDeviationsList,
    "customerspecific",
  );
  const deniedDeviationItems = createDeviationItems(
    processedDriftData.deniedDeviationsList,
    "denied",
  );
  const alignedStandardItems = createDeviationItems(processedDriftData.alignedStandards, "aligned");

  // Separate items by their actual status
  const licenseSkippedItems = deviationItems.filter((item) => item.isLicenseSkipped);
  const compliantFromDeviations = deviationItems.filter((item) => item.isActuallyCompliant);
  const actualDeviationItems = deviationItems.filter(
    (item) => !item.isLicenseSkipped && !item.isActuallyCompliant,
  );

  // Combine compliant items from both sources
  const allAlignedItems = [...alignedStandardItems, ...compliantFromDeviations];

  const handleMenuClick = (event, itemId) => {
    setAnchorEl((prev) => ({ ...prev, [itemId]: event.currentTarget }));
  };

  const handleMenuClose = (itemId) => {
    setAnchorEl((prev) => ({ ...prev, [itemId]: null }));
  };

  const handleAction = (action, itemId) => {
    const deviation = processedDriftData.currentDeviations[itemId - 1];
    if (!deviation) return;

    let status;
    let actionText;
    switch (action) {
      case "accept-customer-specific":
        status = "CustomerSpecific";
        actionText = "accept as customer specific";
        break;
      case "accept":
        status = "Accepted";
        actionText = "accept";
        break;
      case "deny-delete":
        status = "DeniedDelete";
        actionText = "deny and delete";
        break;
      case "deny-remediate":
        status = "DeniedRemediate";
        actionText = "deny and remediate to align with template";
        break;
      default:
        return;
    }

    // Set action data for CippApiDialog
    setActionData({
      data: {
        deviations: [
          {
            standardName: deviation.standardName,
            status: status,
            receivedValue: deviation.receivedValue,
          },
        ],
        tenantFilter: tenantFilter,
      },
      action: {
        text: actionText,
        type: "single",
      },
      ready: true,
    });

    createDialog.handleOpen();
    handleMenuClose(itemId);
  };

  const handleDeviationAction = (action, deviation) => {
    if (!deviation) return;

    let status;
    let actionText;
    switch (action) {
      case "accept-customer-specific":
        status = "CustomerSpecific";
        actionText = "accept as customer specific";
        break;
      case "accept":
        status = "Accepted";
        actionText = "accept";
        break;
      case "deny":
        status = "Denied";
        actionText = "deny";
        break;
      case "deny-delete":
        status = "DeniedDelete";
        actionText = "deny and delete";
        break;
      case "deny-remediate":
        status = "DeniedRemediate";
        actionText = "deny and remediate to align with template";
        break;
      default:
        return;
    }

    // Set action data for CippApiDialog
    setActionData({
      data: {
        deviations: [
          {
            standardName: deviation.standardName, // Use the standardName from the original deviation data
            status: status,
            receivedValue: deviation.receivedValue,
          },
        ],
        tenantFilter: tenantFilter,
      },
      action: {
        text: actionText,
        type: "single",
      },
      ready: true,
    });

    createDialog.handleOpen();
  };

  const handleBulkAction = (action) => {
    if (!selectedItems || selectedItems.length === 0) {
      setBulkActionsAnchorEl(null);
      return;
    }

    let status;
    let actionText;
    switch (action) {
      case "accept-all-customer-specific":
        status = "CustomerSpecific";
        actionText = "accept selected deviations as customer specific";
        break;
      case "accept-all":
        status = "Accepted";
        actionText = "accept selected deviations";
        break;
      case "deny-all":
        status = "Denied";
        actionText = "deny selected deviations";
        break;
      case "deny-all-delete":
        status = "DeniedDelete";
        actionText = "deny selected deviations and delete";
        break;
      case "deny-all-remediate":
        status = "DeniedRemediate";
        actionText = "deny selected deviations and remediate to align with template";
        break;
      default:
        setBulkActionsAnchorEl(null);
        return;
    }

    // Map selected item IDs back to their deviation data
    // IDs are in format: "current-1", "accepted-2", etc.
    const allDeviations = [
      ...deviationItemsWithActions,
      ...acceptedDeviationItemsWithActions,
      ...customerSpecificDeviationItemsWithActions,
      ...deniedDeviationItemsWithActions,
    ];

    const selectedDeviations = selectedItems
      .map((itemId) => {
        const item = allDeviations.find((d) => d.id === itemId);
        return item ? item.originalDeviation : null;
      })
      .filter(Boolean);

    if (selectedDeviations.length === 0) {
      setBulkActionsAnchorEl(null);
      return;
    }

    const deviations = selectedDeviations.map((deviation) => ({
      standardName: deviation.standardName,
      status: status,
      receivedValue: deviation.receivedValue,
    }));

    // Set action data for CippApiDialog
    setActionData({
      data: {
        deviations: deviations,
        tenantFilter: tenantFilter,
        receivedValues: deviations.map((d) => d.receivedValue),
      },
      action: {
        text: actionText,
        type: "bulk",
        count: deviations.length,
      },
      ready: true,
    });

    createDialog.handleOpen();
    setBulkActionsAnchorEl(null);
  };

  const handleRemoveDriftCustomization = () => {
    // Set action data for CippApiDialog
    setActionData({
      data: {
        RemoveDriftCustomization: true,
        tenantFilter: tenantFilter,
      },
      action: {
        text: "remove all drift customizations",
        type: "reset",
      },
      ready: true,
    });

    createDialog.handleOpen();
    setBulkActionsAnchorEl(null);
  };

  // Get current tenant info for report generation
  const currentTenantInfo = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: "ListTenants",
  });

  // Find current tenant data
  const currentTenantData = currentTenantInfo.data?.find(
    (tenant) => tenant.defaultDomainName === tenantFilter,
  );

  // Actions for the ActionsMenu
  const actions = createDriftManagementActions({
    templateId,
    onRefresh: () => {
      driftApi.refetch();
      standardsApi.refetch();
      if (templateId) {
        comparisonApi.refetch();
      }
    },
    onGenerateReport: () => {
      setTriggerReport(true);
    },
    currentTenant: tenantFilter,
  });

  // Effect to trigger the ExecutiveReportButton when needed
  useEffect(() => {
    if (triggerReport && reportButtonRef.current) {
      // Trigger the button click to open the dialog
      reportButtonRef.current.click();
      setTriggerReport(false);
    }
  }, [triggerReport]);

  // Effect to refetch APIs when templateId changes (needed for shallow routing)
  useEffect(() => {
    if (templateId) {
      comparisonApi.refetch();
    }
  }, [templateId]);

  // Effect to clear selected items when tenant changes
  useEffect(() => {
    setSelectedItems([]);
  }, [tenantFilter]);

  // Add action buttons to each deviation item
  const deviationItemsWithActions = actualDeviationItems.map((item) => {
    return {
      ...item,
      cardLabelBoxActions: (
        <Button
          variant="outlined"
          endIcon={<ExpandMore />}
          onClick={(e) => {
            e.stopPropagation();
            handleMenuClick(e, item.id);
          }}
          size="small"
        >
          Actions
        </Button>
      ),
    };
  });

  // Add action buttons to accepted deviation items
  const acceptedDeviationItemsWithActions = acceptedDeviationItems.map((item) => {
    return {
      ...item,
      cardLabelBoxActions: (
        <Button
          variant="outlined"
          endIcon={<ExpandMore />}
          onClick={(e) => {
            e.stopPropagation();
            handleMenuClick(e, `accepted-${item.id}`);
          }}
          size="small"
        >
          Actions
        </Button>
      ),
    };
  });

  // Add action buttons to customer specific deviation items
  const customerSpecificDeviationItemsWithActions = customerSpecificDeviationItems.map((item) => {
    return {
      ...item,
      cardLabelBoxActions: (
        <Button
          variant="outlined"
          endIcon={<ExpandMore />}
          onClick={(e) => {
            e.stopPropagation();
            handleMenuClick(e, `customer-${item.id}`);
          }}
          size="small"
        >
          Actions
        </Button>
      ),
    };
  });

  // Add action buttons to denied deviation items
  const deniedDeviationItemsWithActions = deniedDeviationItems.map((item) => ({
    ...item,
    cardLabelBoxActions: (
      <Button
        variant="outlined"
        endIcon={<ExpandMore />}
        onClick={(e) => {
          e.stopPropagation();
          handleMenuClick(e, `denied-${item.id}`);
        }}
        size="small"
      >
        Actions
      </Button>
    ),
  }));

  // Calculate compliance metrics for badges
  // Accepted and Customer Specific deviations count as compliant since they are user-approved
  // Denied deviations are included in total but not in compliant count (they haven't been fixed yet)
  const totalPolicies =
    processedDriftData.alignedCount +
    processedDriftData.currentDeviationsCount +
    processedDriftData.acceptedDeviationsCount +
    processedDriftData.customerSpecificDeviations +
    processedDriftData.deniedDeviationsCount;

  const compliantCount =
    processedDriftData.alignedCount +
    processedDriftData.acceptedDeviationsCount +
    processedDriftData.customerSpecificDeviations;

  // Alignment Score: Only actual compliance (excluding license-missing items)
  const compliancePercentage =
    totalPolicies > 0 ? Math.round((compliantCount / totalPolicies) * 100) : 0;

  // Calculate missing license percentage
  const missingLicensePercentage =
    totalPolicies > 0 ? Math.round((licenseSkippedItems.length / totalPolicies) * 100) : 0;

  // Total Score: Alignment + License Missing (represents addressable compliance)
  const combinedScore = compliancePercentage + missingLicensePercentage;

  // Helper function to get category from standardName
  const getCategory = (standardName) => {
    if (!standardName) return "Other Standards";
    if (standardName.includes("ConditionalAccessTemplate")) return "Conditional Access Policies";
    if (standardName.includes("IntuneTemplate")) return "Intune Policies";

    // For other standards, look up category in standards.json
    const standard = standardsData.find((s) => s.name === standardName);
    if (standard && standard.cat) {
      return standard.cat;
    }

    return "Other Standards";
  };

  // Apply search and sort filters
  const applyFilters = (items) => {
    let filtered = [...items];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtext?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.standardName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (sortBy === "name") {
      filtered.sort((a, b) => (a.text || "").localeCompare(b.text || ""));
    } else if (sortBy === "status") {
      filtered.sort((a, b) => (a.statusText || "").localeCompare(b.statusText || ""));
    } else if (sortBy === "category") {
      // Sort by category, then by name within each category
      filtered.sort((a, b) => {
        const catA = getCategory(a.standardName);
        const catB = getCategory(b.standardName);
        if (catA !== catB) {
          return catA.localeCompare(catB);
        }
        return (a.text || "").localeCompare(b.text || "");
      });
    }

    return filtered;
  };

  const filteredDeviationItems = applyFilters(deviationItemsWithActions);
  const filteredAcceptedItems = applyFilters(acceptedDeviationItemsWithActions);
  const filteredCustomerSpecificItems = applyFilters(customerSpecificDeviationItemsWithActions);
  const filteredDeniedItems = applyFilters(deniedDeviationItemsWithActions);
  const filteredAlignedItems = applyFilters(allAlignedItems);
  const filteredLicenseSkippedItems = applyFilters(licenseSkippedItems);

  // Helper function to render items grouped by category when category sort is active
  const renderItemsByCategory = (items) => {
    if (sortBy !== "category" || items.length === 0) {
      return (
        <CippBannerListCard
          items={items}
          isCollapsible={true}
          layout={"single"}
          isFetching={driftApi.isFetching}
          onSelectionChange={setSelectedItems}
          selectedItems={selectedItems}
        />
      );
    }

    // Group items by category and collect unique categories
    const groupedItems = {};
    items.forEach((item) => {
      const category = getCategory(item.standardName);
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(item);
    });

    // Sort categories alphabetically
    const categories = Object.keys(groupedItems).sort();

    return (
      <Stack spacing={3}>
        {categories.map((category) => {
          if (groupedItems[category].length === 0) return null;
          return (
            <Box key={category}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                {category}
              </Typography>
              <CippBannerListCard
                items={groupedItems[category]}
                isCollapsible={true}
                layout={"single"}
                isFetching={driftApi.isFetching}
                onSelectionChange={setSelectedItems}
                selectedItems={selectedItems}
              />
            </Box>
          );
        })}
      </Stack>
    );
  };

  // Simple filter for drift templates
  const driftTemplateOptions = standardsApi.data
    ? standardsApi.data
        .filter((template) => template.type === "drift" || template.Type === "drift")
        .map((template) => ({
          label:
            template.displayName ||
            template.templateName ||
            template.name ||
            `Template ${template.GUID}`,
          value: template.GUID,
        }))
    : [];

  // Find currently selected template
  const selectedTemplateOption =
    templateId && driftTemplateOptions.length
      ? driftTemplateOptions.find((option) => option.value === templateId) || null
      : null;
  const title = "Manage Drift";
  const subtitle = [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={actions}
      actionsData={{}}
      isFetching={driftApi.isFetching || standardsApi.isFetching || comparisonApi.isFetching}
    >
      <CippHead title="Manage Drift" />
      <Box sx={{ py: 2 }}>
        {/* Check if there's no drift data */}
        {!driftApi.isFetching &&
        (!rawDriftData || rawDriftData.length === 0 || tenantDriftData.length === 0) ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No Drift Data Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This standard does not have any drift entries, or it is not a drift compatible
              standard.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              To enable drift monitoring for this tenant, please ensure:
            </Typography>
            <Box component="ul" sx={{ textAlign: "left", display: "inline-block", mt: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                A drift template has been created and assigned to this tenant
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                The standard is configured for drift monitoring
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Drift data collection has been completed for this tenant
              </Typography>
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Left side - Alignment Score & Filters */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                {/* Stats Card */}
                <CippButtonCard title="Breakdown">
                  <Stack spacing={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Aligned
                      </Typography>
                      <Chip
                        label={processedDriftData.alignedCount}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Current
                      </Typography>
                      <Chip
                        label={processedDriftData.currentDeviationsCount}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Accepted
                      </Typography>
                      <Chip
                        label={processedDriftData.acceptedDeviationsCount}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Customer Specific
                      </Typography>
                      <Chip
                        label={processedDriftData.customerSpecificDeviations}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Denied
                      </Typography>
                      <Chip
                        label={processedDriftData.deniedDeviationsCount}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Skipped (No License)
                      </Typography>
                      <Chip label={licenseSkippedItems.length} size="small" variant="outlined" />
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        Total
                      </Typography>
                      <Chip label={totalPolicies} size="small" variant="filled" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Alignment Score
                      </Typography>
                      <Chip
                        label={`${compliancePercentage}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        Total Score
                      </Typography>
                      <Chip
                        label={`${combinedScore}%`}
                        size="small"
                        color={
                          combinedScore === 100
                            ? "success"
                            : combinedScore >= 80
                              ? "warning"
                              : combinedScore >= 30
                                ? "warning"
                                : "error"
                        }
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </CippButtonCard>

                {/* Filters Card */}
                <CippButtonCard title="Filters">
                  <Stack spacing={2}>
                    <CippAutoComplete
                      options={driftTemplateOptions}
                      label="Select Drift Template"
                      multiple={false}
                      creatable={false}
                      isFetching={standardsApi.isFetching}
                      defaultValue={selectedTemplateOption}
                      value={selectedTemplateOption}
                      onChange={(selectedTemplate) => {
                        const query = { ...router.query };
                        if (selectedTemplate && selectedTemplate.value) {
                          query.templateId = selectedTemplate.value;
                        } else {
                          delete query.templateId;
                        }
                        router.replace(
                          {
                            pathname: router.pathname,
                            query: query,
                          },
                          undefined,
                          { shallow: true },
                        );
                      }}
                      placeholder="Select a drift template..."
                      disableClearable={true}
                      customAction={{
                        icon: <Edit fontSize="small" />,
                        link: selectedTemplateOption?.value
                          ? `/tenant/standards/templates/template?id=${selectedTemplateOption.value}&type=drift`
                          : undefined,
                        tooltip: "Edit Template",
                        position: "inside",
                      }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search deviations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <CippFormComponent
                      type="autoComplete"
                      name="statusFilter"
                      label="Status"
                      formControl={filterForm}
                      options={[
                        { label: "All Deviations", value: "all" },
                        { label: "Current Deviations", value: "current" },
                        { label: "Accepted", value: "accepted" },
                        { label: "Customer Specific", value: "customerspecific" },
                        { label: "Denied", value: "denied" },
                        { label: "Compliant", value: "compliant" },
                      ]}
                      multiple={true}
                    />

                    <CippAutoComplete
                      options={[
                        { label: "Name", value: "name" },
                        { label: "Status", value: "status" },
                        { label: "Category", value: "category" },
                      ]}
                      label="Sort by"
                      value={
                        sortBy
                          ? {
                              label:
                                sortBy === "name"
                                  ? "Name"
                                  : sortBy === "status"
                                    ? "Status"
                                    : "Category",
                              value: sortBy,
                            }
                          : null
                      }
                      onChange={(newValue) => setSortBy(newValue?.value || "name")}
                      multiple={false}
                    />
                  </Stack>
                </CippButtonCard>
              </Stack>
            </Grid>

            {/* Right side - Deviation Management */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3} sx={{ pr: 2 }}>
                {/* Current Deviations Section */}
                {(!filterStatus ||
                  filterStatus.length === 0 ||
                  filterStatus.some((f) => f.value === "all" || f.value === "current")) && (
                  <Box>
                    {/* Header with bulk actions */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="h6">New Deviations</Typography>
                      {selectedItems.length > 0 && (
                        <Box display="flex" gap={1}>
                          {/* Bulk Actions Dropdown */}
                          <Button
                            variant="outlined"
                            endIcon={<ExpandMore />}
                            onClick={(e) => setBulkActionsAnchorEl(e.currentTarget)}
                            size="small"
                          >
                            Bulk Actions ({selectedItems.length})
                          </Button>
                          <Menu
                            anchorEl={bulkActionsAnchorEl}
                            open={Boolean(bulkActionsAnchorEl)}
                            onClose={() => setBulkActionsAnchorEl(null)}
                          >
                            <MenuItem
                              onClick={() => handleBulkAction("accept-all-customer-specific")}
                            >
                              <CheckBox sx={{ mr: 1, color: "success.main" }} />
                              Accept All Deviations - Customer Specific
                            </MenuItem>
                            <MenuItem onClick={() => handleBulkAction("accept-all")}>
                              <Check sx={{ mr: 1, color: "info.main" }} />
                              Accept All Deviations
                            </MenuItem>
                            {/* Only show delete option if there are template deviations that support deletion */}
                            {processedDriftData.currentDeviations.some(
                              (deviation) =>
                                (deviation.standardName?.includes("ConditionalAccessTemplate") ||
                                  deviation.standardName?.includes("IntuneTemplate")) &&
                                deviation.expectedValue ===
                                  "This policy only exists in the tenant, not in the template.",
                            ) && (
                              <MenuItem onClick={() => handleBulkAction("deny-all-delete")}>
                                <Block sx={{ mr: 1, color: "error.main" }} />
                                Deny All Deviations - Delete
                              </MenuItem>
                            )}
                            <MenuItem onClick={() => handleBulkAction("deny-all-remediate")}>
                              <Cancel sx={{ mr: 1, color: "error.main" }} />
                              Deny All Deviations - Remediate to align with template
                            </MenuItem>
                            <MenuItem onClick={handleRemoveDriftCustomization}>
                              <Block sx={{ mr: 1, color: "warning.main" }} />
                              Remove Drift Customization
                            </MenuItem>
                          </Menu>
                        </Box>
                      )}
                    </Box>
                    {renderItemsByCategory(filteredDeviationItems)}
                  </Box>
                )}

                {/* Accepted Deviations Section */}
                {(!filterStatus ||
                  filterStatus.length === 0 ||
                  filterStatus.some((f) => f.value === "all" || f.value === "accepted")) &&
                  filteredAcceptedItems.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Accepted Deviations
                      </Typography>
                      {renderItemsByCategory(filteredAcceptedItems)}
                    </Box>
                  )}

                {/* Customer Specific Deviations Section */}
                {(!filterStatus ||
                  filterStatus.length === 0 ||
                  filterStatus.some((f) => f.value === "all" || f.value === "customerspecific")) &&
                  filteredCustomerSpecificItems.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Accepted Deviations - Customer Specific
                      </Typography>
                      {renderItemsByCategory(filteredCustomerSpecificItems)}
                    </Box>
                  )}

                {/* Denied Deviations Section */}
                {(!filterStatus ||
                  filterStatus.length === 0 ||
                  filterStatus.some((f) => f.value === "all" || f.value === "denied")) &&
                  filteredDeniedItems.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Denied Deviations
                      </Typography>
                      {renderItemsByCategory(filteredDeniedItems)}
                    </Box>
                  )}

                {/* Compliant Standards Section - Only shown when filtered by All or Compliant */}
                {(!filterStatus ||
                  filterStatus.length === 0 ||
                  filterStatus.some((f) => f.value === "all" || f.value === "compliant")) &&
                  filteredAlignedItems.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Compliant Standards
                      </Typography>
                      <CippBannerListCard
                        items={filteredAlignedItems}
                        isCollapsible={true}
                        layout={"single"}
                        isFetching={driftApi.isFetching}
                      />
                    </Box>
                  )}

                {/* License Skipped Section - Always at the end */}
                {filteredLicenseSkippedItems.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Skipped - No License Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      These standards were skipped because the required licenses are not available
                      for this tenant.
                    </Typography>
                    <CippBannerListCard
                      items={filteredLicenseSkippedItems}
                      isCollapsible={true}
                      layout={"single"}
                      isFetching={driftApi.isFetching}
                    />
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        )}
      </Box>
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={[
            {
              type: "textField",
              name: "reason",
              label: "Reason for change (Mandatory)",
            },
          ]}
          api={{
            url: "/api/ExecUpdateDriftDeviation",
            type: "POST",
            postEntireRow: true,
            confirmText: `Are you sure you'd like to ${actionData.action?.text || "update"} ${
              actionData.action?.type === "single"
                ? "this deviation"
                : actionData.action?.type === "bulk"
                  ? `these ${actionData.action?.count || 0} deviations`
                  : actionData.action?.type === "reset"
                    ? "for this tenant"
                    : "this deviation"
            }?`,
            onSuccess: () => {
              // Clear selected items after successful action
              setSelectedItems([]);
            },
          }}
          row={actionData.data}
          relatedQueryKeys={[`TenantDrift-${tenantFilter}`]}
        />
      )}

      {/* Render all Menu components outside of card structure */}
      {deviationItemsWithActions.map((item) => {
        const supportsDelete =
          (item.standardName?.includes("ConditionalAccessTemplate") ||
            item.standardName?.includes("IntuneTemplate")) &&
          item.expectedValue === "This policy only exists in the tenant, not in the template.";
        return (
          <Menu
            key={`menu-${item.id}`}
            anchorEl={anchorEl[item.id]}
            open={Boolean(anchorEl[item.id])}
            onClose={() => handleMenuClose(item.id)}
          >
            <MenuItem
              onClick={() => {
                handleDeviationAction("accept-customer-specific", item);
                handleMenuClose(item.id);
              }}
            >
              <CheckCircle sx={{ mr: 1, color: "success.main" }} />
              Accept Deviation - Customer Specific
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeviationAction("accept", item);
                handleMenuClose(item.id);
              }}
            >
              <Check sx={{ mr: 1, color: "info.main" }} />
              Accept Deviation
            </MenuItem>
            {supportsDelete && (
              <MenuItem
                onClick={() => {
                  handleDeviationAction("deny-delete", item);
                  handleMenuClose(item.id);
                }}
              >
                <Block sx={{ mr: 1, color: "error.main" }} />
                Deny Deviation - Delete Policy
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                handleDeviationAction("deny-remediate", item);
                handleMenuClose(item.id);
              }}
            >
              <Cancel sx={{ mr: 1, color: "error.main" }} />
              Deny Deviation - Remediate to align with template
            </MenuItem>
          </Menu>
        );
      })}

      {acceptedDeviationItemsWithActions.map((item) => {
        const supportsDelete =
          (item.standardName?.includes("ConditionalAccessTemplate") ||
            item.standardName?.includes("IntuneTemplate")) &&
          item.expectedValue === "This policy only exists in the tenant, not in the template.";
        return (
          <Menu
            key={`menu-accepted-${item.id}`}
            anchorEl={anchorEl[`accepted-${item.id}`]}
            open={Boolean(anchorEl[`accepted-${item.id}`])}
            onClose={() => handleMenuClose(`accepted-${item.id}`)}
          >
            {supportsDelete && (
              <MenuItem
                onClick={() => {
                  handleDeviationAction("deny-delete", item);
                  handleMenuClose(`accepted-${item.id}`);
                }}
              >
                <Block sx={{ mr: 1, color: "error.main" }} />
                Deny - Delete Policy
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                handleDeviationAction("deny-remediate", item);
                handleMenuClose(`accepted-${item.id}`);
              }}
            >
              <Cancel sx={{ mr: 1, color: "error.main" }} />
              Deny - Remediate to align with template
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeviationAction("accept-customer-specific", item);
                handleMenuClose(`accepted-${item.id}`);
              }}
            >
              <CheckCircle sx={{ mr: 1, color: "info.main" }} />
              Accept - Customer Specific
            </MenuItem>
          </Menu>
        );
      })}

      {customerSpecificDeviationItemsWithActions.map((item) => {
        const supportsDelete =
          (item.standardName?.includes("ConditionalAccessTemplate") ||
            item.standardName?.includes("IntuneTemplate")) &&
          item.expectedValue === "This policy only exists in the tenant, not in the template.";
        return (
          <Menu
            key={`menu-customer-${item.id}`}
            anchorEl={anchorEl[`customer-${item.id}`]}
            open={Boolean(anchorEl[`customer-${item.id}`])}
            onClose={() => handleMenuClose(`customer-${item.id}`)}
          >
            {supportsDelete && (
              <MenuItem
                onClick={() => {
                  handleDeviationAction("deny-delete", item);
                  handleMenuClose(`customer-${item.id}`);
                }}
              >
                <Block sx={{ mr: 1, color: "error.main" }} />
                Deny - Delete
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                handleDeviationAction("deny-remediate", item);
                handleMenuClose(`customer-${item.id}`);
              }}
            >
              <Cancel sx={{ mr: 1, color: "error.main" }} />
              Deny - Remediate to align with template
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeviationAction("accept", item);
                handleMenuClose(`customer-${item.id}`);
              }}
            >
              <Check sx={{ mr: 1, color: "success.main" }} />
              Accept
            </MenuItem>
          </Menu>
        );
      })}

      {deniedDeviationItemsWithActions.map((item) => (
        <Menu
          key={`menu-denied-${item.id}`}
          anchorEl={anchorEl[`denied-${item.id}`]}
          open={Boolean(anchorEl[`denied-${item.id}`])}
          onClose={() => handleMenuClose(`denied-${item.id}`)}
        >
          <MenuItem
            onClick={() => {
              handleDeviationAction("accept", item);
              handleMenuClose(`denied-${item.id}`);
            }}
          >
            <Check sx={{ mr: 1, color: "success.main" }} />
            Accept
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeviationAction("accept-customer-specific", item);
              handleMenuClose(`denied-${item.id}`);
            }}
          >
            <CheckCircle sx={{ mr: 1, color: "info.main" }} />
            Accept - Customer Specific
          </MenuItem>
        </Menu>
      ))}

      {/* Hidden ExecutiveReportButton that gets triggered programmatically */}
      <Box sx={{ position: "absolute", top: -9999, left: -9999 }}>
        <ExecutiveReportButton
          ref={reportButtonRef}
          tenantName={currentTenantData?.displayName || tenantFilter}
          tenantId={currentTenantData?.customerId}
          userStats={{
            licensedUsers: 0, // These would come from actual user data APIs
            unlicensedUsers: 0,
            guests: 0,
            globalAdmins: 0,
          }}
          standardsData={standardsApi.data}
          organizationData={currentTenantData}
        />
      </Box>
    </HeaderedTabbedLayout>
  );
};

ManageDriftPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ManageDriftPage;
