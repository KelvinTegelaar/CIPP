import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog.jsx";
import { 
  Button,
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
  PersonAdd, 
  Delete, 
  Sync, 
  Add, 
  Edit, 
  Sell,
  Computer,
  Person,
  Inventory,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useDialog } from "../../../../hooks/use-dialog";
import Link from "next/link";
import { getInitials, stringToColor } from "../../../../utils/get-initials";

const Page = () => {
  const pageTitle = "Autopilot Devices";
  const createDialog = useDialog();
  const theme = useTheme();

  const actions = [
    {
      label: "Assign device",
      icon: <PersonAdd />,
      type: "POST",
      url: "/api/ExecAssignAPDevice",
      data: {
        device: "id",
        serialNumber: "serialNumber",
      },
      confirmText: "Select the user to assign the device to",
      fields: [
        {
          type: "autoComplete",
          name: "user",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGraphRequest",
            dataKey: "Results",
            data: {
              Endpoint: "users",
              manualPagination: true,
              $select: "id,userPrincipalName,displayName",
              $count: true,
              $orderby: "displayName",
              $top: 999,
            },
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              userPrincipalName: "userPrincipalName",
              addressableUserName: "displayName",
            },
          },
        },
      ],
      color: "info",
      category: "edit",
    },
    {
      label: "Rename Device",
      icon: <Edit />,
      type: "POST",
      url: "/api/ExecRenameAPDevice",
      data: {
        deviceId: "id",
        serialNumber: "serialNumber",
      },
      confirmText: "Enter the new display name for the device.",
      fields: [
        {
          type: "textField",
          name: "displayName",
          label: "New Display Name",
          required: true,
          validate: (value) => {
            if (!value) {
              return "Display name is required.";
            }
            if (value.length > 15) {
              return "Display name must be 15 characters or less.";
            }
            if (/\s/.test(value)) {
              return "Display name cannot contain spaces.";
            }
            if (!/^[a-zA-Z0-9-]+$/.test(value)) {
              return "Display name can only contain letters, numbers, and hyphens.";
            }
            if (/^[0-9]+$/.test(value)) {
              return "Display name cannot contain only numbers.";
            }
            return true; // Indicates validation passed
          },
        },
      ],
      color: "secondary",
      category: "edit",
    },
    {
      label: "Edit Group Tag",
      icon: <Sell />,
      type: "POST",
      url: "/api/ExecSetAPDeviceGroupTag",
      data: {
        deviceId: "id",
        serialNumber: "serialNumber",
      },
      confirmText: "Enter the new group tag for the device.",
      fields: [
        {
          type: "textField",
          name: "groupTag",
          label: "Group Tag",
          validate: (value) => {
            if (value && value.length > 128) {
              return "Group tag cannot exceed 128 characters.";
            }
            return true; // Validation passed
          },
        },
      ],
      color: "secondary",
      category: "edit",
    },
    {
      label: "Delete Device",
      icon: <Delete />,
      type: "POST",
      url: "/api/RemoveAPDevice",
      data: { ID: "id" },
      confirmText: "Are you sure you want to delete this device?",
      color: "error",
      category: "danger",
    },
  ];

  // Helper for enrollment state
  const getEnrollmentStateInfo = (state) => {
    switch (String(state || "").toLowerCase()) {
      case "enrolled":
        return { label: "Enrolled", color: theme.palette.success.main, icon: <CheckCircle fontSize="small" /> };
      case "pendingregistration":
      case "pending":
        return { label: "Pending", color: theme.palette.warning.main, icon: <Pending fontSize="small" /> };
      case "failed":
        return { label: "Failed", color: theme.palette.error.main, icon: <ErrorIcon fontSize="small" /> };
      default:
        return { label: state || "Unknown", color: theme.palette.grey[500], icon: <Pending fontSize="small" /> };
    }
  };

  const offCanvas = {
    actions: actions,
    children: (row) => {
      const stateInfo = getEnrollmentStateInfo(row.enrollmentState);
      
      return (
        <Stack spacing={3}>
          {/* Hero Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: stringToColor(row.displayName || row.serialNumber || "A"),
                  width: 56,
                  height: 56,
                }}
              >
                <Computer />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {row.displayName || row.serialNumber || "Unknown Device"}
                </Typography>
                {row.manufacturer && (
                  <Typography variant="body2" color="text.secondary">
                    {row.manufacturer} {row.model}
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
              Enrollment Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={stateInfo.icon}
                label={stateInfo.label}
                sx={{ 
                  fontWeight: 600, 
                  bgcolor: alpha(stateInfo.color, 0.1),
                  color: stateInfo.color,
                  borderColor: stateInfo.color,
                }}
                variant="outlined"
              />
              {row.groupTag && (
                <Chip
                  icon={<Sell fontSize="small" />}
                  label={row.groupTag}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Device Details */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Inventory fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Device Details
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Serial Number</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: "monospace",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.5,
                  }}
                >
                  {row.serialNumber}
                </Typography>
              </Stack>
              {row.manufacturer && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Manufacturer</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {row.manufacturer}
                  </Typography>
                </Stack>
              )}
              {row.model && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Model</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {row.model}
                  </Typography>
                </Stack>
              )}
              {row.productKey && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Product Key</Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: "monospace",
                      bgcolor: alpha(theme.palette.text.primary, 0.05),
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.5,
                    }}
                  >
                    {row.productKey}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Assignment */}
          {row.userPrincipalName && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Assignment
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Assigned User</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {row.userPrincipalName}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      );
    },
  };

  const simpleColumns = [
    "displayName",
    "serialNumber",
    "model",
    "manufacturer",
    "groupTag",
    "enrollmentState",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListAPDevices"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <>
            <Button component={Link} href="/endpoint/autopilot/add-device" startIcon={<Add />}>
              Add Autopilot Devices
            </Button>
            <Button onClick={createDialog.handleOpen} startIcon={<Sync />}>
              Sync Devices
            </Button>
          </>
        }
      />
      <CippApiDialog
        title="Sync Autopilot Devices"
        createDialog={createDialog}
        api={{
          type: "POST",
          url: "/api/ExecSyncAPDevices",
          data: {},
          confirmText:
            "Are you sure you want to sync Autopilot devices? This can only be done every 10 minutes.",
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
