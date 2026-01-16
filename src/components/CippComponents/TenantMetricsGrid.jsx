import { Box, Grid, Tooltip, Avatar, Typography, Skeleton } from "@mui/material";
import {
  Person as UserIcon,
  PersonOutline as GuestIcon,
  Group as GroupIcon,
  Apps as AppsIcon,
  Devices as DevicesIcon,
  PhoneAndroid as ManagedIcon,
} from "@mui/icons-material";

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num?.toString() || "0";
};

export const TenantMetricsGrid = ({ data, isLoading }) => {
  const metrics = [
    {
      label: "Users",
      value: data?.UserCount || 0,
      icon: UserIcon,
      color: "primary",
    },
    {
      label: "Guests",
      value: data?.GuestCount || 0,
      icon: GuestIcon,
      color: "info",
    },
    {
      label: "Groups",
      value: data?.GroupCount || 0,
      icon: GroupIcon,
      color: "secondary",
    },
    {
      label: "Service Principals",
      value: data?.ApplicationCount || 0,
      icon: AppsIcon,
      color: "error",
    },
    {
      label: "Devices",
      value: data?.DeviceCount || 0,
      icon: DevicesIcon,
      color: "warning",
    },
    {
      label: "Managed",
      value: data?.ManagedDeviceCount || 0,
      icon: ManagedIcon,
      color: "success",
    },
  ];

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Grid key={metric.label} size={{ xs: 6 }}>
            <Tooltip title={`${metric.value.toLocaleString()} ${metric.label.toLowerCase()}`} arrow>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${metric.color}.main`,
                    color: `${metric.color}.contrastText`,
                    width: 34,
                    height: 34,
                  }}
                >
                  <IconComponent sx={{ fontSize: 24, color: "inherit" }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                    {metric.label}
                  </Typography>
                  <Typography variant="h6" fontSize="1.125rem">
                    {isLoading ? <Skeleton width={50} /> : formatNumber(metric.value)}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
};
