import { Box, Grid, Tooltip, Avatar, Typography, Skeleton } from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { useRouter } from 'next/router'

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num?.toString() || '0'
}

export const TenantMetricsGrid = ({ data, isLoading }) => {
  const router = useRouter()

  const metrics = [
    {
      label: 'Users',
      value: data?.UserCount || 0,
      icon: CippIcons.Person,
      color: 'primary',
      path: '/identity/administration/users',
    },
    {
      label: 'Guests',
      value: data?.GuestCount || 0,
      icon: CippIcons.PersonOutlined,
      color: 'info',
      path: '/identity/administration/users',
    },
    {
      label: 'Groups',
      value: data?.GroupCount || 0,
      icon: CippIcons.Group,
      color: 'secondary',
      path: '/identity/administration/groups',
    },
    {
      label: 'Service Principals',
      value: data?.ApplicationCount || 0,
      icon: CippIcons.Apps,
      color: 'error',
      path: '/tenant/administration/applications/enterprise-apps',
    },
    {
      label: 'Devices',
      value: data?.DeviceCount || 0,
      icon: CippIcons.Devices,
      color: 'warning',
      path: '/identity/administration/devices',
    },
    {
      label: 'Managed',
      value: data?.ManagedDeviceCount || 0,
      icon: CippIcons.PhoneAndroid,
      color: 'success',
      path: '/identity/administration/devices',
    },
  ]

  const handleClick = (metric) => {
    if (metric.path) {
      router.push(metric.path)
    }
  }

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => {
        const IconComponent = metric.icon
        // Two-up at every width on purpose, phones included: the tile is sized for a
        // narrow column (28px avatar, 0.6rem label) and the dashboard reads better as a
        // 2x3 block than as six stacked rows. mobile-layout-ok
        return (
          <Grid key={metric.label} size={{ xs: 6 }}>
            <Tooltip
              title={`View ${metric.value.toLocaleString()} ${metric.label.toLowerCase()}`}
              arrow
            >
              <Box
                onClick={() => handleClick(metric)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 1, sm: 1.5, md: 2 },
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  minWidth: 0,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: `${metric.color}.main`,
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${metric.color}.main`,
                    color: `${metric.color}.contrastText`,
                    width: { xs: 28, sm: 32, md: 34 },
                    height: { xs: 28, sm: 32, md: 34 },
                    flexShrink: 0,
                  }}
                >
                  <IconComponent
                    sx={{
                      fontSize: { xs: 18, sm: 22, md: 24 },
                      color: 'inherit',
                    }}
                  />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' }
                    }}>
                    {metric.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' }
                    }}
                  >
                    {isLoading ? (
                      <Skeleton width={40} />
                    ) : (
                      formatNumber(metric.value)
                    )}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
}
