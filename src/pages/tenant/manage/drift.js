import { Layout as DashboardLayout } from "/src/layouts/index.js";
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
} from "@mui/icons-material";
import { Box, Stack, Typography, Button, Menu, MenuItem, Chip, SvgIcon } from "@mui/material";
import { Grid } from "@mui/system";
import { useState, useEffect, useRef } from "react";
import { CippChartCard } from "/src/components/CippCards/CippChartCard";
import { CippBannerListCard } from "/src/components/CippCards/CippBannerListCard";
import { CippHead } from "/src/components/CippComponents/CippHead";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import { ApiGetCall } from "/src/api/ApiCall";
import { useSettings } from "/src/hooks/use-settings";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { useDialog } from "/src/hooks/use-dialog";
import tabOptions from "./tabOptions.json";
import standardsData from "/src/data/standards.json";
import { createDriftManagementActions } from "./driftManagementActions";
import { ExecutiveReportButton } from "/src/components/ExecutiveReportButton";
import { CippAutoComplete } from "../../../components/CippComponents/CippAutocomplete";

const ManageDriftPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const userSettingsDefaults = useSettings();
  const tenantFilter = userSettingsDefaults.currentTenant || "";
  const [anchorEl, setAnchorEl] = useState({});
  const [bulkActionsAnchorEl, setBulkActionsAnchorEl] = useState(null);
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, ready: false });
  const [triggerReport, setTriggerReport] = useState(false);
  const reportButtonRef = useRef(null);

  // API calls for drift data
  const driftApi = ApiGetCall({
    url: "/api/listTenantDrift",
    data: {
      TenantFilter: tenantFilter,
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

  // API call for standards comparison (when templateId is available)
  const comparisonApi = ApiGetCall({
    url: "/api/ListStandardsCompare",
    data: {
      TemplateId: templateId,
      TenantFilter: tenantFilter,
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
          ...item.customerSpecificDeviations.filter((dev) => dev !== null)
        );
      }
      if (item.deniedDeviations && Array.isArray(item.deniedDeviations)) {
        acc.deniedDeviationsList.push(...item.deniedDeviations.filter((dev) => dev !== null));
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
      latestDataCollection: null,
    }
  );

  const chartLabels = [
    "Aligned Policies",
    "Accepted Deviations",
    "Current Deviations",
    "Customer Specific Deviations",
  ];
  const chartSeries = [
    processedDriftData.alignedCount || 0,
    processedDriftData.acceptedDeviationsCount || 0,
    processedDriftData.currentDeviationsCount || 0,
    processedDriftData.customerSpecificDeviations || 0,
  ];

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

  // Helper function to create deviation items
  const createDeviationItems = (deviations, statusOverride = null) => {
    return (deviations || []).map((deviation, index) => {
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

      return {
        id: index + 1,
        cardLabelBox: {
          cardLabelBoxHeader: getDeviationIcon(
            statusOverride || deviation.Status || deviation.state
          ),
        },
        text: prettyName,
        subtext: description,
        statusColor: getDeviationColor(statusOverride || deviation.Status || deviation.state),
        statusText: getDeviationStatusText(statusOverride || deviation.Status || deviation.state),
        standardName: deviation.standardName, // Store the original standardName for action handlers
        receivedValue: deviation.receivedValue, // Store the original receivedValue for action handlers
        expectedValue: deviation.expectedValue, // Store the original expectedValue for action handlers
        originalDeviation: deviation, // Store the complete original deviation object for reference
        propertyItems: [
          { label: "Standard Name", value: prettyName },
          { label: "Description", value: description },
          { label: "Expected Value", value: deviation.expectedValue || "N/A" },
          { label: "Current Value", value: deviation.receivedValue || "N/A" },
          {
            label: "Status",
            value: getDeviationStatusText(statusOverride || deviation.Status || deviation.state),
          },
          {
            label: "Reason",
            value: deviation.Reason || "N/A",
          },
          {
            label: "User",
            value: deviation.lastChangedByUser || "N/A",
          },
          {
            label: "Last Updated",
            value: processedDriftData.latestDataCollection
              ? new Date(processedDriftData.latestDataCollection).toLocaleString()
              : "N/A",
          },
        ].filter((item) => item.value !== "N/A" && item.value !== "No description available"), // Filter out N/A values and empty descriptions
      };
    });
  };

  const deviationItems = createDeviationItems(processedDriftData.currentDeviations);
  const acceptedDeviationItems = createDeviationItems(
    processedDriftData.acceptedDeviations,
    "accepted"
  );
  const customerSpecificDeviationItems = createDeviationItems(
    processedDriftData.customerSpecificDeviationsList,
    "customerspecific"
  );
  const deniedDeviationItems = createDeviationItems(
    processedDriftData.deniedDeviationsList,
    "denied"
  );

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
        TenantFilter: tenantFilter,
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
        TenantFilter: tenantFilter,
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
    if (
      !processedDriftData.currentDeviations ||
      processedDriftData.currentDeviations.length === 0
    ) {
      setBulkActionsAnchorEl(null);
      return;
    }

    let status;
    let actionText;
    switch (action) {
      case "accept-all-customer-specific":
        status = "CustomerSpecific";
        actionText = "accept all deviations as customer specific";
        break;
      case "accept-all":
        status = "Accepted";
        actionText = "accept all deviations";
        break;
      case "deny-all":
        status = "Denied";
        actionText = "deny all deviations";
        break;
      case "deny-all-delete":
        status = "DeniedDelete";
        actionText = "deny all deviations and delete";
        break;
      case "deny-all-remediate":
        status = "DeniedRemediate";
        actionText = "deny all deviations and remediate to align with template";
        break;
      default:
        setBulkActionsAnchorEl(null);
        return;
    }

    const deviations = processedDriftData.currentDeviations.map((deviation) => ({
      standardName: deviation.standardName,
      status: status,
      receivedValue: deviation.receivedValue,
    }));

    // Set action data for CippApiDialog
    setActionData({
      data: {
        deviations: deviations,
        TenantFilter: tenantFilter,
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
        TenantFilter: tenantFilter,
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
    (tenant) => tenant.defaultDomainName === tenantFilter
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

  // Add action buttons to each deviation item
  const deviationItemsWithActions = deviationItems.map((item) => {
    // Check if this is a template that supports delete action
    const supportsDelete =
      (item.standardName?.includes("ConditionalAccessTemplate") ||
        item.standardName?.includes("IntuneTemplate")) &&
      item.expectedValue === "This policy only exists in the tenant, not in the template.";

    return {
      ...item,
      actionButton: (
        <>
          <Button
            variant="outlined"
            endIcon={<ExpandMore />}
            onClick={(e) => handleMenuClick(e, item.id)}
            size="small"
          >
            Actions
          </Button>
          <Menu
            anchorEl={anchorEl[item.id]}
            open={Boolean(anchorEl[item.id])}
            onClose={() => handleMenuClose(item.id)}
          >
            <MenuItem onClick={() => handleAction("accept-customer-specific", item.id)}>
              <CheckCircle sx={{ mr: 1, color: "success.main" }} />
              Accept Deviation - Customer Specific
            </MenuItem>
            <MenuItem onClick={() => handleAction("accept", item.id)}>
              <Check sx={{ mr: 1, color: "info.main" }} />
              Accept Deviation
            </MenuItem>
            {supportsDelete && (
              <MenuItem onClick={() => handleAction("deny-delete", item.id)}>
                <Block sx={{ mr: 1, color: "error.main" }} />
                Deny Deviation - Delete Policy
              </MenuItem>
            )}
            <MenuItem onClick={() => handleAction("deny-remediate", item.id)}>
              <Cancel sx={{ mr: 1, color: "error.main" }} />
              Deny Deviation - Remediate to align with template
            </MenuItem>
          </Menu>
        </>
      ),
    };
  });

  // Add action buttons to accepted deviation items
  const acceptedDeviationItemsWithActions = acceptedDeviationItems.map((item) => {
    // Check if this is a template that supports delete action
    const supportsDelete =
      (item.standardName?.includes("ConditionalAccessTemplate") ||
        item.standardName?.includes("IntuneTemplate")) &&
      item.expectedValue === "This policy only exists in the tenant, not in the template.";

    return {
      ...item,
      actionButton: (
        <>
          <Button
            variant="outlined"
            endIcon={<ExpandMore />}
            onClick={(e) => handleMenuClick(e, `accepted-${item.id}`)}
            size="small"
          >
            Actions
          </Button>
          <Menu
            anchorEl={anchorEl[`accepted-${item.id}`]}
            open={Boolean(anchorEl[`accepted-${item.id}`])}
            onClose={() => handleMenuClose(`accepted-${item.id}`)}
          >
            {supportsDelete && (
              <MenuItem onClick={() => handleDeviationAction("deny-delete", item)}>
                <Block sx={{ mr: 1, color: "error.main" }} />
                Deny - Delete Policy
              </MenuItem>
            )}
            <MenuItem onClick={() => handleDeviationAction("deny-remediate", item)}>
              <Cancel sx={{ mr: 1, color: "error.main" }} />
              Deny - Remediate to align with template
            </MenuItem>
            <MenuItem onClick={() => handleDeviationAction("accept-customer-specific", item)}>
              <CheckCircle sx={{ mr: 1, color: "info.main" }} />
              Accept - Customer Specific
            </MenuItem>
          </Menu>
        </>
      ),
    };
  });

  // Add action buttons to customer specific deviation items
  const customerSpecificDeviationItemsWithActions = customerSpecificDeviationItems.map((item) => {
    // Check if this is a template that supports delete action
    const supportsDelete =
      (item.standardName?.includes("ConditionalAccessTemplate") ||
        item.standardName?.includes("IntuneTemplate")) &&
      item.expectedValue === "This policy only exists in the tenant, not in the template.";

    return {
      ...item,
      actionButton: (
        <>
          <Button
            variant="outlined"
            endIcon={<ExpandMore />}
            onClick={(e) => handleMenuClick(e, `customer-${item.id}`)}
            size="small"
          >
            Actions
          </Button>
          <Menu
            anchorEl={anchorEl[`customer-${item.id}`]}
            open={Boolean(anchorEl[`customer-${item.id}`])}
            onClose={() => handleMenuClose(`customer-${item.id}`)}
          >
            {supportsDelete && (
              <MenuItem onClick={() => handleDeviationAction("deny-delete", item)}>
                <Block sx={{ mr: 1, color: "error.main" }} />
                Deny - Delete
              </MenuItem>
            )}
            <MenuItem onClick={() => handleDeviationAction("deny-remediate", item)}>
              <Cancel sx={{ mr: 1, color: "error.main" }} />
              Deny - Remediate to align with template
            </MenuItem>
            <MenuItem onClick={() => handleDeviationAction("accept", item)}>
              <Check sx={{ mr: 1, color: "success.main" }} />
              Accept
            </MenuItem>
          </Menu>
        </>
      ),
    };
  });

  // Add action buttons to denied deviation items
  const deniedDeviationItemsWithActions = deniedDeviationItems.map((item) => ({
    ...item,
    actionButton: (
      <>
        <Button
          variant="outlined"
          endIcon={<ExpandMore />}
          onClick={(e) => handleMenuClick(e, `denied-${item.id}`)}
          size="small"
        >
          Actions
        </Button>
        <Menu
          anchorEl={anchorEl[`denied-${item.id}`]}
          open={Boolean(anchorEl[`denied-${item.id}`])}
          onClose={() => handleMenuClose(`denied-${item.id}`)}
        >
          <MenuItem onClick={() => handleDeviationAction("accept", item)}>
            <Check sx={{ mr: 1, color: "success.main" }} />
            Accept
          </MenuItem>
          <MenuItem onClick={() => handleDeviationAction("accept-customer-specific", item)}>
            <CheckCircle sx={{ mr: 1, color: "info.main" }} />
            Accept - Customer Specific
          </MenuItem>
        </Menu>
      </>
    ),
  }));

  // Calculate compliance metrics for badges
  const totalPolicies =
    processedDriftData.alignedCount +
    processedDriftData.currentDeviationsCount +
    processedDriftData.acceptedDeviationsCount +
    processedDriftData.customerSpecificDeviations;

  const compliancePercentage =
    totalPolicies > 0 ? Math.round((processedDriftData.alignedCount / totalPolicies) * 100) : 0;

  const missingLicensePercentage = 0; // This would need to be calculated from actual license data
  const combinedScore = compliancePercentage + missingLicensePercentage;

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
  const subtitle = [
    {
      icon: <Policy />,
      text: (
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
              { shallow: true }
            );
          }}
          sx={{ minWidth: 300 }}
          placeholder="Select a drift template..."
        />
      ),
    },
    // Add compliance badges when data is available
    ...(totalPolicies > 0
      ? [
          {
            component: (
              <Stack alignItems="center" flexWrap="wrap" direction="row" spacing={2}>
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
                />
                <Chip
                  label={`${combinedScore}% Combined Score`}
                  variant="outlined"
                  size="small"
                  color={
                    combinedScore >= 80 ? "success" : combinedScore >= 60 ? "warning" : "error"
                  }
                />
              </Stack>
            ),
          },
        ]
      : []),
  ];

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
            {/* Left side - Chart */}
            <Grid size={{ xs: 12, md: 4 }}>
              <CippChartCard
                title="Drift Overview"
                chartType="donut"
                chartSeries={chartSeries}
                labels={chartLabels}
                isFetching={driftApi.isFetching}
              />
            </Grid>

            {/* Right side - Deviation Management */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                {/* Current Deviations Section */}
                <Box>
                  {/* Header with bulk actions */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6">Current Deviations</Typography>
                    <Box display="flex" gap={1}>
                      {/* Bulk Actions Dropdown */}
                      <Button
                        variant="outlined"
                        endIcon={<ExpandMore />}
                        onClick={(e) => setBulkActionsAnchorEl(e.currentTarget)}
                        size="small"
                      >
                        Bulk Actions
                      </Button>
                      <Menu
                        anchorEl={bulkActionsAnchorEl}
                        open={Boolean(bulkActionsAnchorEl)}
                        onClose={() => setBulkActionsAnchorEl(null)}
                      >
                        <MenuItem onClick={() => handleBulkAction("accept-all-customer-specific")}>
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
                              "This policy only exists in the tenant, not in the template."
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
                  </Box>
                  <CippBannerListCard
                    items={deviationItemsWithActions}
                    isCollapsible={true}
                    layout={"single"}
                    isFetching={driftApi.isFetching}
                  />
                </Box>

                {/* Accepted Deviations Section */}
                {acceptedDeviationItemsWithActions.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Accepted Deviations
                    </Typography>
                    <CippBannerListCard
                      items={acceptedDeviationItemsWithActions}
                      isCollapsible={true}
                      layout={"single"}
                      isFetching={driftApi.isFetching}
                    />
                  </Box>
                )}

                {/* Customer Specific Deviations Section */}
                {customerSpecificDeviationItemsWithActions.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Accepted Deviations - Customer Specific
                    </Typography>
                    <CippBannerListCard
                      items={customerSpecificDeviationItemsWithActions}
                      isCollapsible={true}
                      layout={"single"}
                      isFetching={driftApi.isFetching}
                    />
                  </Box>
                )}

                {/* Denied Deviations Section */}
                {deniedDeviationItemsWithActions.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Denied Deviations
                    </Typography>
                    <CippBannerListCard
                      items={deniedDeviationItemsWithActions}
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
            data: {
              deviations: "deviations",
            },
            confirmText: `Are you sure you'd like to ${actionData.action?.text || "update"} ${
              actionData.action?.type === "single"
                ? "this deviation"
                : actionData.action?.type === "bulk"
                ? `these ${actionData.action?.count || 0} deviations`
                : actionData.action?.type === "reset"
                ? "for this tenant"
                : "this deviation"
            }?`,
          }}
          row={actionData.data}
          relatedQueryKeys={[`TenantDrift-${tenantFilter}`]}
        />
      )}

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
