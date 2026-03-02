import { Box, Grid, Tooltip, Avatar, Typography, Skeleton } from "@mui/material";
import { useRouter } from "next/router";
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
  const router = useRouter();

  const metrics = [
    {
      label: "Users",
      value: data?.UserCount || 0,
      icon: UserIcon,
      color: "primary",
      path: "/identity/administration/users",
    },
    {
      label: "Guests",
      value: data?.GuestCount || 0,
      icon: GuestIcon,
      color: "info",
      path: "/identity/administration/users",
    },
    {
      label: "Groups",
      value: data?.GroupCount || 0,
      icon: GroupIcon,
      color: "secondary",
      path: "/identity/administration/groups",
    },
    {
      label: "Service Principals",
      value: data?.ApplicationCount || 0,
      icon: AppsIcon,
      color: "error",
      path: "/tenant/administration/applications/enterprise-apps",
    },
    {
      label: "Devices",
      value: data?.DeviceCount || 0,
      icon: DevicesIcon,
      color: "warning",
      path: "/identity/administration/devices",
    },
    {
      label: "Managed",
      value: data?.ManagedDeviceCount || 0,
      icon: ManagedIcon,
      color: "success",
      path: "/identity/administration/devices",
    },
  ];

  const handleClick = (metric) => {
    if (metric.path) {
      router.push(metric.path);
    }
  };

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Grid key={metric.label} size={{ xs: 6 }}>
            <Tooltip
              title={`View ${metric.value.toLocaleString()} ${metric.label.toLowerCase()}`}
              arrow
            >
              <Box
                onClick={() => handleClick(metric)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: `${metric.color}.main`,
                    backgroundColor: "action.hover",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
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
