import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import {
  Paper,
  Avatar,
  Typography,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Box, Stack } from "@mui/system";
import { 
  Book, 
  DoDisturb, 
  Done, 
  Edit,
  Rule,
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
  Comment,
} from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippAddTransportRuleDrawer } from "../../../../components/CippComponents/CippAddTransportRuleDrawer";
import { CippTransportRuleDrawer } from "../../../../components/CippComponents/CippTransportRuleDrawer";
import { useSettings } from "../../../../hooks/use-settings";
import { useRef } from "react";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { getInitials, stringToColor } from "../../../../utils/get-initials";

const Page = () => {
  const pageTitle = "Transport Rules";
  const cardButtonPermissions = ["Exchange.TransportRule.ReadWrite"];
  const tableRef = useRef();
  const currentTenant = useSettings().currentTenant;
  const theme = useTheme();

  const handleRuleSuccess = () => {
    // Refresh the table after successful create/edit
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
  };

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      url: "/api/AddTransportTemplate",
      postEntireRow: true,
      confirmText: "Are you sure you want to create a template based on this rule?",
      icon: <Book />,
      category: "edit",
    },
    {
      label: "Enable Rule",
      type: "POST",
      url: "/api/AddEditTransportRule",
      data: {
        Enabled: "!Enabled",
        ruleId: "Guid",
        Name: "Name",
      },
      condition: (row) => row.State === "Disabled",
      confirmText: "Are you sure you want to enable this rule?",
      icon: <Done />,
      category: "manage",
    },
    {
      label: "Edit Rule",
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <CippTransportRuleDrawer
          isEditMode={true}
          ruleId={row.Guid}
          requiredPermissions={cardButtonPermissions}
          onSuccess={handleRuleSuccess}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
      icon: <Edit />,
      multiPost: false,
      category: "edit",
    },
    {
      label: "Disable Rule",
      type: "POST",
      url: "/api/AddEditTransportRule",
      data: {
        Enabled: "!Disabled",
        ruleId: "Guid",
        Name: "Name",
      },
      condition: (row) => row.State === "Enabled",
      confirmText: "Are you sure you want to disable this rule?",
      icon: <DoDisturb />,
      category: "manage",
    },
    {
      label: "Delete Rule",
      type: "POST",
      url: "/api/RemoveTransportRule",
      data: {
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "error",
      icon: <TrashIcon />,
      category: "danger",
    },
  ];

  const offCanvas = {
    actions: actions,
    children: (row) => {
      const isEnabled = row.State === "Enabled";
      const statusColor = isEnabled ? theme.palette.success.main : theme.palette.error.main;
      
      return (
        <Stack spacing={3}>
          {/* Hero Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(statusColor, 0.15)} 0%, ${alpha(statusColor, 0.05)} 100%)`,
              borderLeft: `4px solid ${statusColor}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: stringToColor(row.Name || "R"),
                  width: 56,
                  height: 56,
                }}
              >
                <Rule />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {row.Name || "Unknown Rule"}
                </Typography>
                {row.Tenant && (
                  <Typography variant="body2" color="text.secondary">
                    {row.Tenant}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>

          {/* Status */}
          <Box>
            <Typography 
              variant="overline" 
              color="text.secondary" 
              sx={{ fontWeight: 600, letterSpacing: 1, mb: 1.5, display: "block" }}
            >
              Rule Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={isEnabled ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                label={row.State || "Unknown"}
                color={isEnabled ? "success" : "error"}
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
              {row.Mode && (
                <Chip
                  label={row.Mode}
                  variant="outlined"
                  size="small"
                />
              )}
              {row.RuleErrorAction && (
                <Chip
                  label={`Error: ${row.RuleErrorAction}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Rule Details */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Rule fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Rule Details
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Rule ID</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: "monospace",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.5,
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {row.Guid}
                </Typography>
              </Stack>
              {row.WhenChanged && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Last Modified</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getCippFormatting(row.WhenChanged, "WhenChanged")}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Created/Modified By */}
          {(row.CreatedBy || row.LastModifiedBy) && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Audit Information
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {row.CreatedBy && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Created By</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                        {row.CreatedBy}
                      </Typography>
                    </Stack>
                  )}
                  {row.LastModifiedBy && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Last Modified By</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                        {row.LastModifiedBy}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Description/Comments */}
          {(row.Description || row.Comments) && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Comment fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Description
                  </Typography>
                </Stack>
                {row.Description && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                      mb: row.Comments ? 2 : 0,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {row.Description}
                    </Typography>
                  </Paper>
                )}
                {row.Comments && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Comments:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {row.Comments}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </>
          )}
        </Stack>
      );
    },
  };

  const simpleColumns = [
    "Name",
    "State",
    "Mode",
    "RuleErrorAction",
    "WhenChanged",
    "Comments",
    "Tenant",
  ];

  const filters = [
    {
      filterName: "Enabled Rules",
      value: [{ id: "State", value: "Enabled" }],
      type: "column",
    },
    {
      filterName: "Disabled Rules",
      value: [{ id: "State", value: "Disabled" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      ref={tableRef}
      title={pageTitle}
      apiUrl="/api/ListTransportRules"
      apiDataKey="Results"
      queryKey={`Transport Rules - ${currentTenant}`}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filters}
      cardButton={
        <>
          <CippAddTransportRuleDrawer requiredPermissions={cardButtonPermissions} />
          <CippTransportRuleDrawer
            buttonText="New Transport Rule"
            isEditMode={false}
            requiredPermissions={cardButtonPermissions}
            onSuccess={handleRuleSuccess}
          />
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;
export default Page;
