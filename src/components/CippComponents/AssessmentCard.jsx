import { Card, CardHeader, CardContent, Box, Typography, Skeleton } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { CippTimeAgo } from "../CippComponents/CippTimeAgo";

export const AssessmentCard = ({ data, isLoading }) => {
  // Extract data with null safety
  const identityPassed = data?.TestResultSummary?.IdentityPassed || 0;
  const identityTotal = data?.TestResultSummary?.IdentityTotal || 1;
  const devicesPassed = data?.TestResultSummary?.DevicesPassed || 0;
  const devicesTotal = data?.TestResultSummary?.DevicesTotal || 0;

  // Determine if we should show devices section
  const hasDeviceTests = devicesTotal > 0;

  // Calculate percentages for the radial chart
  // If no device tests, set devices to 100% (complete)
  const devicesPercentage = hasDeviceTests ? (devicesPassed / devicesTotal) * 100 : 100;
  const identityPercentage = (identityPassed / identityTotal) * 100;

  const chartData = [
    {
      value: devicesPercentage,
      fill: "#22c55e",
    },
    {
      value: identityPercentage,
      fill: "#3b82f6",
    },
  ];

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SecurityIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1">Assessment</Typography>
          </Box>
        }
        sx={{ pb: 1.5 }}
      />
      <CardContent>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Identity
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {isLoading ? (
                  <Skeleton width={80} />
                ) : (
                  <>
                    {identityPassed}/{identityTotal}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      tests
                    </Typography>
                  </>
                )}
              </Typography>
            </Box>
            {hasDeviceTests && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Devices
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {isLoading ? (
                    <Skeleton width={80} />
                  ) : (
                    <>
                      {devicesPassed}/{devicesTotal}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        tests
                      </Typography>
                    </>
                  )}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Data Collection
              </Typography>
              <Typography variant="body2" fontSize="0.75rem">
                {isLoading ? (
                  <Skeleton width={100} />
                ) : data?.ExecutedAt ? (
                  <CippTimeAgo data={data?.ExecutedAt} />
                ) : (
                  "Not Available"
                )}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ width: "40%", maxWidth: 120, aspectRatio: 1 }}>
            {isLoading ? (
              <Skeleton variant="circular" width="100%" height="100%" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="20%"
                  outerRadius="100%"
                  data={chartData}
                  startAngle={90}
                  endAngle={450}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" background cornerRadius={5} />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
