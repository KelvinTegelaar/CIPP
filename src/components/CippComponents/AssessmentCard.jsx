import { Card, CardHeader, CardContent, Box, Typography, Skeleton } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { CippTimeAgo } from "../CippComponents/CippTimeAgo";

export const AssessmentCard = ({ data, isLoading }) => {
  // Extract data with null safety
  const identityPassed = data?.TestResultSummary?.IdentityPassed || 0;
  const identityTotal = data?.TestResultSummary?.IdentityTotal || 0;
  const devicesPassed = data?.TestResultSummary?.DevicesPassed || 0;
  const devicesTotal = data?.TestResultSummary?.DevicesTotal || 0;
  const customPassed = data?.TestResultSummary?.CustomPassed || 0;
  const customTotal = data?.TestResultSummary?.CustomTotal || 0;

  // Determine if we should show identity section
  const hasIdentityTests = identityTotal > 0;

  // Determine if we should show devices section
  const hasDeviceTests = devicesTotal > 0;

  // Determine if we should show custom tests in the chart
  const hasCustomTests = customTotal > 0;

  // Calculate percentages for the radial chart
  // If no tests, set to 100% (complete)
  const devicesPercentage = hasDeviceTests ? (devicesPassed / devicesTotal) * 100 : 100;
  const identityPercentage = hasIdentityTests ? (identityPassed / identityTotal) * 100 : 100;
  const customPercentage = hasCustomTests ? (customPassed / customTotal) * 100 : 100;

  const chartData = [
    {
      value: devicesPercentage,
      fill: "#22c55e",
    },
    {
      value: identityPercentage,
      fill: "#3b82f6",
    },
    {
      value: customPercentage,
      fill: "#f59e0b",
    }
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
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 2 }}>
              {hasIdentityTests && (
                <Box>
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
              )}
              {hasDeviceTests && (
                <Box>
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
              {hasCustomTests && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Custom
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {isLoading ? (
                      <Skeleton width={80} />
                    ) : (
                      <>
                        {customPassed}/{customTotal}
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
            </Box>
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
