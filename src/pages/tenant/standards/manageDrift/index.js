import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useRouter } from "next/router";
import {
  Check,
  Warning,
  ExpandMore,
  CheckCircle,
  Sync,
  Block,
  Science,
  CheckBox,
  Cancel,
  Policy,
  Error,
  Info,
} from "@mui/icons-material";
import { Box, Stack, Typography, Button, Menu, MenuItem } from "@mui/material";
import { Grid } from "@mui/system";
import { useState } from "react";
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

const ManageDriftPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const userSettingsDefaults = useSettings();
  const tenantFilter = userSettingsDefaults.currentTenant || "";
  const [anchorEl, setAnchorEl] = useState({});
  const [bulkActionsAnchorEl, setBulkActionsAnchorEl] = useState(null);
  const [whatIfAnchorEl, setWhatIfAnchorEl] = useState(null);
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, ready: false });

  // API calls for drift data
  const driftApi = ApiGetCall({
    url: "/api/listTenantDrift",
    data: {
      TenantFilter: tenantFilter,
    },
    queryKey: `TenantDrift-${tenantFilter}`,
  });

  // API call for available standards (for What If dropdown)
  const standardsApi = ApiGetCall({
    url: "/api/ListStandards",
    queryKey: "ListStandards-drift",
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

      // Collect all current deviations
      if (item.currentDeviations && Array.isArray(item.currentDeviations)) {
        acc.currentDeviations.push(...item.currentDeviations.filter((dev) => dev !== null));
      }

      // Collect accepted deviations
      if (item.acceptedDeviations && Array.isArray(item.acceptedDeviations)) {
        acc.acceptedDeviations.push(...item.acceptedDeviations.filter((dev) => dev !== null));
      }

      // Collect customer specific deviations
      if (item.customerSpecificDeviations && Array.isArray(item.customerSpecificDeviations)) {
        acc.customerSpecificDeviationsList.push(
          ...item.customerSpecificDeviations.filter((dev) => dev !== null)
        );
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
      currentDeviations: [],
      acceptedDeviations: [],
      customerSpecificDeviationsList: [],
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
      // Get pretty name from standards.json first, then fallback to standardDisplayName, then raw name
      const prettyName =
        getStandardPrettyName(deviation.standardName) ||
        deviation.standardDisplayName ||
        deviation.standardName ||
        "Unknown Standard";

      // Get description from standards.json first, then fallback to standardDescription from deviation
      const description = getStandardDescription(deviation.standardName) ||
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
      case "bring-into-standard":
        status = "Accepted";
        actionText = "bring into standard";
        break;
      case "deny-remove":
        status = "Denied";
        actionText = "deny and remove";
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
      default:
        return;
    }

    // Set action data for CippApiDialog
    setActionData({
      data: {
        deviations: [
          {
            standardName: deviation.text, // Use the text field which contains standardName
            status: status,
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
      default:
        setBulkActionsAnchorEl(null);
        return;
    }

    const deviations = processedDriftData.currentDeviations.map((deviation) => ({
      standardName: deviation.standardName,
      status: status,
    }));

    // Set action data for CippApiDialog
    setActionData({
      data: {
        deviations: deviations,
        TenantFilter: tenantFilter,
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

  const handleWhatIfAction = (standardId) => {
    console.log(`What If Analysis with standard: ${standardId}`);
    // Here you would implement the what-if analysis
    setWhatIfAnchorEl(null);
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

  // Actions for the ActionsMenu
  const actions = [
    {
      label: "Refresh Data",
      icon: <Sync />,
      noConfirm: true,
      customFunction: () => {
        driftApi.refetch();
        standardsApi.refetch();
        if (templateId) {
          comparisonApi.refetch();
        }
      },
    },
  ];

  // Process standards data for "What If" dropdown
  const availableStandards = (standardsApi.data || []).map((standard) => ({
    id: standard.GUID || standard.id || standard.name,
    name: standard.displayName || standard.name || "Unknown Standard",
  }));

  // Add action buttons to each deviation item
  const deviationItemsWithActions = deviationItems.map((item) => ({
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
          <MenuItem onClick={() => handleAction("bring-into-standard", item.id)}>
            <Sync sx={{ mr: 1, color: "primary.main" }} />
            Bring into Drift Standard
          </MenuItem>
          <MenuItem onClick={() => handleAction("deny-remove", item.id)}>
            <Block sx={{ mr: 1, color: "error.main" }} />
            Deny - Remove Policy
          </MenuItem>
        </Menu>
      </>
    ),
  }));

  // Add action buttons to accepted deviation items
  const acceptedDeviationItemsWithActions = acceptedDeviationItems.map((item) => ({
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
          <MenuItem onClick={() => handleDeviationAction("deny", item)}>
            <Block sx={{ mr: 1, color: "error.main" }} />
            Deny
          </MenuItem>
          <MenuItem onClick={() => handleDeviationAction("accept-customer-specific", item)}>
            <CheckCircle sx={{ mr: 1, color: "info.main" }} />
            Accept - Customer Specific
          </MenuItem>
        </Menu>
      </>
    ),
  }));

  // Add action buttons to customer specific deviation items
  const customerSpecificDeviationItemsWithActions = customerSpecificDeviationItems.map((item) => ({
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
          <MenuItem onClick={() => handleDeviationAction("deny", item)}>
            <Block sx={{ mr: 1, color: "error.main" }} />
            Deny
          </MenuItem>
          <MenuItem onClick={() => handleDeviationAction("accept", item)}>
            <Check sx={{ mr: 1, color: "success.main" }} />
            Accept
          </MenuItem>
        </Menu>
      </>
    ),
  }));

  const title = "Manage Drift";
  const subtitle = [
    {
      icon: <Policy />,
      text: `Template ID: ${templateId || "Loading..."}`,
    },
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      backUrl="/tenant/standards/list-standards"
      actions={actions}
      actionsData={{}}
      isFetching={driftApi.isFetching || standardsApi.isFetching || comparisonApi.isFetching}
    >
      <CippHead title="Manage Drift" />
      <Box sx={{ py: 2 }}>
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
                      <MenuItem onClick={() => handleBulkAction("deny-all")}>
                        <Cancel sx={{ mr: 1, color: "error.main" }} />
                        Deny All Deviations
                      </MenuItem>
                      <MenuItem onClick={handleRemoveDriftCustomization}>
                        <Block sx={{ mr: 1, color: "warning.main" }} />
                        Remove Drift Customization
                      </MenuItem>
                    </Menu>

                    {/* What If Button */}
                    <Button
                      variant="outlined"
                      endIcon={<ExpandMore />}
                      onClick={(e) => setWhatIfAnchorEl(e.currentTarget)}
                      size="small"
                      startIcon={<Science />}
                    >
                      What If
                    </Button>
                    <Menu
                      anchorEl={whatIfAnchorEl}
                      open={Boolean(whatIfAnchorEl)}
                      onClose={() => setWhatIfAnchorEl(null)}
                    >
                      {availableStandards.map((standard) => (
                        <MenuItem key={standard.id} onClick={() => handleWhatIfAction(standard.id)}>
                          <Science sx={{ mr: 1, color: "primary.main" }} />
                          {standard.name}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </Box>
                <CippBannerListCard
                  items={deviationItemsWithActions}
                  isCollapsible={true}
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
                    isFetching={driftApi.isFetching}
                  />
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          api={{
            url: "/api/ExecUpdateDriftDeviation",
            type: "POST",
            data: {
              deviations: "deviations",
              TenantFilter: "TenantFilter",
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
    </HeaderedTabbedLayout>
  );
};

ManageDriftPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ManageDriftPage;
