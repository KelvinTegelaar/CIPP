import { Box, Typography, Divider, Skeleton } from "@mui/material";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

export const SecureScoreChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <>
        <Box sx={{ height: 250 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          The Secure Score measures your security posture across your tenant.
        </Typography>
        <Divider sx={{ mt: 2 }} />
        <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton width={80} height={60} />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={80} height={60} />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={80} height={60} />
          </Box>
        </Box>
      </>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <>
        <Box sx={{ height: 250 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No secure score data available
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          The Secure Score measures your security posture across your tenant.
        </Typography>
        <Divider sx={{ mt: 2 }} />
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Enable secure score monitoring in your tenant
          </Typography>
        </Box>
      </>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => new Date(a.createdDateTime) - new Date(b.createdDateTime)
  );

  const chartData = sortedData.map((score) => ({
    date: new Date(score.createdDateTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: score.currentScore,
    percentage: Math.round((score.currentScore / score.maxScore) * 100),
  }));

  const latestScore = sortedData[sortedData.length - 1];
  const latestPercentage = Math.round((latestScore.currentScore / latestScore.maxScore) * 100);

  return (
    <>
      <Box sx={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
            <YAxis tick={{ fontSize: 12 }} tickMargin={8} domain={[0, "dataMax + 20"]} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              formatter={(value, name) => {
                if (name === "score") return [value.toFixed(2), "Score"];
                if (name === "percentage") return [value + "%", "Percentage"];
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        The Secure Score measures your security posture across your tenant.
      </Typography>
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Latest %
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {latestPercentage}%
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Current Score
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {latestScore.currentScore.toFixed(2)}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Max Score
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {latestScore.maxScore.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </>
  );
};
