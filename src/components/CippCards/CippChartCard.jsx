import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ActionsMenu } from "../actions-menu";
import { Chart } from "../chart";

const useChartOptions = (labels) => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
    },
    colors: [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.neutral[200],
    ],
    dataLabels: {
      enabled: false,
    },
    labels,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    states: {
      active: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    stroke: {
      width: 0,
    },
    theme: {
      mode: theme.palette.mode,
    },
    tooltip: {
      fillSeriesColor: false,
    },
  };
};

export const CippChartCard = ({
  isFetching,
  chartSeries = [],
  labels = [],
  chartType,
  title,
  actions,
}) => {
  const [range, setRange] = useState("Last 7 days");
  const chartOptions = useChartOptions(labels);

  const total = chartSeries.reduce((acc, value) => acc + value, 0);

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader
        action={
          actions ? (
            <ActionsMenu
              color="inherit"
              actions={actions}
              label={range}
              size="small"
              variant="text"
            />
          ) : null
        }
        title={title}
      />
      <Divider />
      <CardContent>
        {isFetching ? (
          <Skeleton variant="rounded" sx={{ height: 280 }} />
        ) : (
          <Chart height={280} options={chartOptions} series={chartSeries} type={chartType} />
        )}
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={1}
          sx={{ py: 1 }}
        >
          <Typography variant="h5">Total</Typography>
          <Typography variant="h5">{isFetching ? "0" : total}</Typography>
        </Stack>
        <Stack spacing={1}>
          {isFetching ? (
            <Skeleton height={30} />
          ) : (
            <>
              {chartSeries.map((item, index) => (
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  key={labels[index]}
                  spacing={1}
                  sx={{ py: 1 }}
                >
                  <Stack alignItems="center" direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        backgroundColor: chartOptions.colors[index],
                        borderRadius: "50%",
                        height: 8,
                        width: 8,
                      }}
                    />
                    <Typography color="text.secondary" variant="body2">
                      {labels[index]}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" variant="body2">
                    {item}
                  </Typography>
                </Stack>
              ))}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
