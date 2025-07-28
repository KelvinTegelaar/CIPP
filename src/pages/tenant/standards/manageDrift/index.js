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
import tabOptions from "./tabOptions.json";

const ManageDriftPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const userSettingsDefaults = useSettings();
  const tenantFilter = userSettingsDefaults.currentTenant || "";
  const [anchorEl, setAnchorEl] = useState({});
  const [bulkActionsAnchorEl, setBulkActionsAnchorEl] = useState(null);
  const [whatIfAnchorEl, setWhatIfAnchorEl] = useState(null);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [apiData, setApiData] = useState({});

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
    ? rawDriftData.filter(item => item.tenantFilter === tenantFilter)
    : [];
  
  // Aggregate data across all standards for this tenant
  const processedDriftData = tenantDriftData.reduce((acc, item) => {
    acc.acceptedDeviationsCount += item.acceptedDeviationsCount || 0;
    acc.currentDeviationsCount += item.currentDeviationsCount || 0;
    acc.alignedCount += item.alignedCount || 0;
    acc.customerSpecificDeviations += item.customerSpecificDeviations || 0;
    
    // Collect all current deviations
    if (item.currentDeviations && Array.isArray(item.currentDeviations)) {
      acc.currentDeviations.push(...item.currentDeviations.filter(dev => dev !== null));
    }
    
    // Use the latest data collection timestamp
    if (item.latestDataCollection && (!acc.latestDataCollection || new Date(item.latestDataCollection) > new Date(acc.latestDataCollection))) {
      acc.latestDataCollection = item.latestDataCollection;
    }
    
    return acc;
  }, {
    acceptedDeviationsCount: 0,
    currentDeviationsCount: 0,
    alignedCount: 0,
    customerSpecificDeviations: 0,
    currentDeviations: [],
    latestDataCollection: null
  });

  const chartLabels = [
    "Accepted Deviations",
    "Current Deviations",
    "Aligned Policies",
    "Customer Specific Deviations",
  ];
  const chartSeries = [
    processedDriftData.acceptedDeviationsCount || 0,
    processedDriftData.currentDeviationsCount || 0,
    processedDriftData.alignedCount || 0,
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

  const deviationItems = (processedDriftData.currentDeviations || []).map((deviation, index) => ({
    id: index + 1,
    cardLabelBox: {
      cardLabelBoxHeader: getDeviationIcon(deviation.state),
    },
    text: deviation.standardName || "Unknown Standard",
    subtext: deviation.standardDescription || "No description available",
    statusColor: getDeviationColor(deviation.state),
    statusText: getDeviationStatusText(deviation.state),
    propertyItems: [
      { label: "Standard Name", value: deviation.standardName || "N/A" },
      { label: "Description", value: deviation.standardDescription || "N/A" },
      { label: "Expected Value", value: deviation.expectedValue || "N/A" },
      { label: "Current Value", value: deviation.receivedValue || "N/A" },
      { label: "Status", value: getDeviationStatusText(deviation.state) },
      {
        label: "Last Updated",
        value: processedDriftData.latestDataCollection
          ? new Date(processedDriftData.latestDataCollection).toLocaleString()
          : "N/A",
      },
    ].filter((item) => item.value !== "N/A"), // Filter out N/A values
  }));

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
    switch (action) {
      case "accept-customer-specific":
        status = "CustomerSpecific";
        break;
      case "accept":
        status = "Accepted";
        break;
      case "bring-into-standard":
        status = "Accepted";
        break;
      case "deny-remove":
        status = "Denied";
        break;
      default:
        return;
    }

    // Use CippApiDialog for the API call
    const apiData = {
      url: `/api/ExecUpdateDriftDeviation?TenantFilter=${tenantFilter}`,
      data: {
        deviations: [{
          standardName: deviation.standardName,
          status: status,
        }],
      },
    };

    // Set the API data for CippApiDialog
    setApiData(apiData);
    setApiDialogOpen(true);

    handleMenuClose(itemId);
  };

  const handleBulkAction = (action) => {
    if (!processedDriftData.currentDeviations || processedDriftData.currentDeviations.length === 0) {
      setBulkActionsAnchorEl(null);
      return;
    }

    let status;
    switch (action) {
      case "accept-all-customer-specific":
        status = "CustomerSpecific";
        break;
      case "accept-all":
        status = "Accepted";
        break;
      case "deny-all":
        status = "Denied";
        break;
      default:
        setBulkActionsAnchorEl(null);
        return;
    }

    const deviations = processedDriftData.currentDeviations.map(deviation => ({
      standardName: deviation.standardName,
      status: status,
    }));

    // Use CippApiDialog for the API call
    const apiData = {
      url: `/api/ExecUpdateDriftDeviation?TenantFilter=${tenantFilter}`,
      data: {
        deviations: deviations,
      },
    };

    // Set the API data for CippApiDialog
    setApiData(apiData);
    setApiDialogOpen(true);

    setBulkActionsAnchorEl(null);
  };

  const handleWhatIfAction = (standardId) => {
    console.log(`What If Analysis with standard: ${standardId}`);
    // Here you would implement the what-if analysis
    setWhatIfAnchorEl(null);
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
              {/* Header with bulk actions */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
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
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <CippApiDialog
        open={apiDialogOpen}
        onClose={() => setApiDialogOpen(false)}
        data={apiData}
        onSuccess={() => {
          driftApi.refetch();
          setApiDialogOpen(false);
        }}
      />
    </HeaderedTabbedLayout>
  );
};

ManageDriftPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ManageDriftPage;
