import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";
import { CippTimeAgo } from "../CippComponents/CippTimeAgo";

export const AssessmentCard = ({ data, isLoading, title, description }) => {
  // Extract data with null safety
  const identityPassed = data?.TestResultSummary?.IdentityPassed || 0;
  const identityFailed = data?.TestResultSummary?.IdentityFailed || 0;
  const identitySkipped = data?.TestResultSummary?.IdentitySkipped || 0;
  const identityInformational = data?.TestResultSummary?.IdentityInformational || 0;
  const identityNeedsAttention = data?.TestResultSummary?.IdentityNeedsAttention || 0;
  const identityTotal = data?.TestResultSummary?.IdentityTotal || 0;
  const devicesPassed = data?.TestResultSummary?.DevicesPassed || 0;
  const devicesFailed = data?.TestResultSummary?.DevicesFailed || 0;
  const devicesSkipped = data?.TestResultSummary?.DevicesSkipped || 0;
  const devicesInformational = data?.TestResultSummary?.DevicesInformational || 0;
  const devicesNeedsAttention = data?.TestResultSummary?.DevicesNeedsAttention || 0;
  const devicesTotal = data?.TestResultSummary?.DevicesTotal || 0;
  const customPassed = data?.TestResultSummary?.CustomPassed || 0;
  const customFailed = data?.TestResultSummary?.CustomFailed || 0;
  const customSkipped = data?.TestResultSummary?.CustomSkipped || 0;
  const customInformational = data?.TestResultSummary?.CustomInformational || 0;
  const customNeedsAttention = data?.TestResultSummary?.CustomNeedsAttention || 0;
  const customTotal = data?.TestResultSummary?.CustomTotal || 0;

  const overallPassed = identityPassed + devicesPassed + customPassed;
  const overallFailed = identityFailed + devicesFailed + customFailed;
  const overallSkipped = identitySkipped + devicesSkipped + customSkipped;
  const overallInformational =
    identityInformational + devicesInformational + customInformational;
  const overallNeedsAttention =
    identityNeedsAttention + devicesNeedsAttention + customNeedsAttention;
  const overallTotal = identityTotal + devicesTotal + customTotal;

  // Determine if we should show section
  const hasIdentityTests = identityTotal > 0;
  const hasDeviceTests = devicesTotal > 0;
  const hasCustomTests = customTotal > 0;

  const testCategories = [
    {
      key: "identity",
      label: "Identity",
      passed: identityPassed,
      failed: identityFailed,
      skipped: identitySkipped,
      informational: identityInformational,
      needsAttention: identityNeedsAttention,
      total: identityTotal,
      show: hasIdentityTests,
    },
    {
      key: "devices",
      label: "Devices",
      passed: devicesPassed,
      failed: devicesFailed,
      skipped: devicesSkipped,
      informational: devicesInformational,
      needsAttention: devicesNeedsAttention,
      total: devicesTotal,
      show: hasDeviceTests,
    },
    {
      key: "custom",
      label: "Custom",
      passed: customPassed,
      failed: customFailed,
      skipped: customSkipped,
      informational: customInformational,
      needsAttention: customNeedsAttention,
      total: customTotal,
      show: hasCustomTests,
    },
  ].filter((category) => category.show);

  const overallCategory = {
    label: "Overall",
    passed: overallPassed,
    failed: overallFailed,
    skipped: overallSkipped,
    informational: overallInformational,
    needsAttention: overallNeedsAttention,
    total: overallTotal,
    show: overallTotal > 0,
  };
  const overallTotalFromValues =
    overallCategory.passed +
    overallCategory.failed +
    overallCategory.skipped +
    overallCategory.informational +
    overallCategory.needsAttention;
  const overallDenominator = overallCategory.total > 0 ? overallCategory.total : overallTotalFromValues;
  const overallPassWidth = overallDenominator > 0 ? (overallCategory.passed / overallDenominator) * 100 : 0;
  const overallFailWidth = overallDenominator > 0 ? (overallCategory.failed / overallDenominator) * 100 : 0;
  const overallSkipWidth = overallDenominator > 0 ? (overallCategory.skipped / overallDenominator) * 100 : 0;
  const overallInfoWidth =
    overallDenominator > 0 ? (overallCategory.informational / overallDenominator) * 100 : 0;
  const overallNeedsAttentionWidth =
    overallDenominator > 0 ? (overallCategory.needsAttention / overallDenominator) * 100 : 0;
  const overallStatusItems = [
    {
      key: "pass",
      value: overallCategory.passed,
      label: "Pass",
      color: "success.main",
    },
    {
      key: "fail",
      value: overallCategory.failed,
      label: "Fail",
      color: "error.main",
    },
    {
      key: "skip",
      value: overallCategory.skipped,
      label: "Skip",
      color: "warning.main",
    },
    {
      key: "info",
      value: overallCategory.informational,
      label: "Info",
      color: "info.main",
    },
    {
      key: "attention",
      value: overallCategory.needsAttention,
      label: "Attention",
      color: "text.primary",
    },
  ].filter((item) => item.value > 0);

  const descriptionText = description || "No description available for the selected test suite.";

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "fit-content" }}>
            <SecurityIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1">{title || "Assessment"}</Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0.75, flexGrow: 1, display: "flex" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            width: "100%",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            {isLoading ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2, width: "100%" }}>
                <Box>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="70%" />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Skeleton variant="rounded" height={28} />
                  <Skeleton variant="rounded" height={28} />
                  <Skeleton variant="rounded" height={28} />
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2, width: "100%" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    Description
                  </Typography>
                  <Tooltip title={descriptionText} arrow placement="top-start">
                    <Typography
                      variant="caption"
                      color="text.primary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.35,
                      }}
                    >
                      {descriptionText}
                    </Typography>
                  </Tooltip>
                </Box>
                {testCategories.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {testCategories.map((category) => {
                      const totalFromValues =
                        category.passed +
                        category.failed +
                        category.skipped +
                        category.informational +
                        category.needsAttention;
                      const denominator = category.total > 0 ? category.total : totalFromValues;
                      const passWidth = denominator > 0 ? (category.passed / denominator) * 100 : 0;
                      const failWidth = denominator > 0 ? (category.failed / denominator) * 100 : 0;
                      const skipWidth = denominator > 0 ? (category.skipped / denominator) * 100 : 0;
                      const infoWidth = denominator > 0 ? (category.informational / denominator) * 100 : 0;
                      const needsAttentionWidth =
                        denominator > 0 ? (category.needsAttention / denominator) * 100 : 0;
                      const statusItems = [
                        {
                          key: "pass",
                          value: category.passed,
                          label: "Pass",
                          color: "success.main",
                        },
                        {
                          key: "fail",
                          value: category.failed,
                          label: "Fail",
                          color: "error.main",
                        },
                        {
                          key: "skip",
                          value: category.skipped,
                          label: "Skip",
                          color: "warning.main",
                        },
                        {
                          key: "info",
                          value: category.informational,
                          label: "Info",
                          color: "info.main",
                        },
                        {
                          key: "attention",
                          value: category.needsAttention,
                          label: "Attention",
                          color: "text.primary",
                        },
                      ].filter((item) => item.value > 0);

                      return (
                        <Box key={category.key}>
                          <Typography variant="caption" color="text.secondary">
                            {category.label + ` (${category.total})`}
                          </Typography>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              mt: 0.25,
                              overflow: "hidden",
                              display: "flex",
                              bgcolor: "action.hover",
                            }}
                          >
                            <Box sx={{ width: `${passWidth}%`, bgcolor: "success.main" }} />
                            <Box sx={{ width: `${failWidth}%`, bgcolor: "error.main" }} />
                            <Box sx={{ width: `${skipWidth}%`, bgcolor: "warning.main" }} />
                            <Box sx={{ width: `${infoWidth}%`, bgcolor: "info.main" }} />
                            <Box sx={{ width: `${needsAttentionWidth}%`, bgcolor: "text.primary" }} />
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mt: 0.25,
                              display: "block",
                              whiteSpace: "normal",
                              lineHeight: 1.25,
                            }}
                          >
                            {statusItems.length > 0 ? (
                              statusItems.map((item, index) => (
                                <Box key={item.key} component="span">
                                  {index > 0 ? " / " : ""}
                                  <Box component="span" sx={{ color: item.color }}>
                                    {item.value} {item.label}
                                  </Box>
                                </Box>
                              ))
                            ) : (
                              <Box component="span">No results</Box>
                            )}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      No assessment tests available
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              alignItems: "flex-end",
              gap: 2,
            }}
          >
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

            {isLoading ? (
              <Box sx={{ width: "100%" }}>
                <Skeleton variant="rounded" height={28} />
              </Box>
            ) : overallCategory.show && (
              <Box sx={{ textAlign: "left", width: "100%" }}>
                <Typography variant="caption" color="text.secondary">
                  {overallCategory.label + ` (${overallCategory.total})`}
                </Typography>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    mt: 0.25,
                    overflow: "hidden",
                    display: "flex",
                    bgcolor: "action.hover",
                  }}
                >
                  <Box sx={{ width: `${overallPassWidth}%`, bgcolor: "success.main" }} />
                  <Box sx={{ width: `${overallFailWidth}%`, bgcolor: "error.main" }} />
                  <Box sx={{ width: `${overallSkipWidth}%`, bgcolor: "warning.main" }} />
                  <Box sx={{ width: `${overallInfoWidth}%`, bgcolor: "info.main" }} />
                  <Box sx={{ width: `${overallNeedsAttentionWidth}%`, bgcolor: "text.primary" }} />
                </Box>
                <Typography variant="caption" sx={{ display: "block", lineHeight: 1.25, mt: 0.25 }}>
                  {overallStatusItems.length > 0 ? (
                    overallStatusItems.map((item, index) => (
                      <Box key={item.key} component="span">
                        {index > 0 ? " / " : ""}
                        <Box component="span" sx={{ color: item.color }}>
                          {item.value} {item.label}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box component="span" color="text.secondary">
                      No results
                    </Box>
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
