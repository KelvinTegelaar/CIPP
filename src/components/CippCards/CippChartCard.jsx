import { useEffect, useState } from "react";
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

const useChartOptions = (labels, chartType) => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      toolbar: {
        show: false,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true | '<img src="/static/icons/reset.png" width="20">',
        },
      },
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

    xaxis: {
      // Categories drive the bar/line axis labels and the tooltip title. Without this, a bar
      // chart's tooltip falls back to the auto series name ("series-1") instead of the label.
      categories: labels,
      labels: {
        show: true,
        rotate: 0,
        style: {
          fontSize: "12px",
        },
      },
      tickPlacement: "on",
    },
    labels,
    legend: {
      show: false,
    },
    plotOptions: {
      // distributed colors each bar (data point) from the colors array so a single-series bar
      // chart keeps the per-item colors, and the tooltip shows the category name per bar.
      bar: {
        distributed: true,
      },
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
      width: chartType === "line" ? 2 : 1,
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
  chartType = "donut",
  title,
  actions,
  headerAction,
  onClick,
  totalLabel = "Total",
  customTotal,
}) => {
  const [range, setRange] = useState("Last 7 days");
  const [barSeries, setBarSeries] = useState([]);
  const chartOptions = useChartOptions(labels, chartType);
  chartSeries = chartSeries.filter((item) => item !== null);
  // Round to 2 decimals - summing fractional series values accumulates floating-point
  // artifacts (e.g. 175.73000000000002). Integer series are unaffected.
  const calculatedTotal = Math.round(chartSeries.reduce((acc, value) => acc + value, 0) * 100) / 100;
  const total = customTotal !== undefined ? customTotal : calculatedTotal;
  useEffect(() => {
    if (chartType === "bar") {
      // Single named series with the labels supplied via xaxis.categories. This keeps the tooltip
      // title tied to the category (e.g. the site name) instead of an auto "series-1" name.
      setBarSeries([{ name: totalLabel, data: chartSeries }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, chartSeries.join(","), labels.join(","), totalLabel]);

  return (
    <Card
      style={{ width: "100%", height: "100%" }}
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick ? {
          boxShadow: (theme) => theme.shadows[8],
          transform: "translateY(-2px)",
        } : {},
      }}
    >
      <CardHeader
        action={
          headerAction ? (
            headerAction
          ) : actions ? (
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
        {
          //if the chartType is not defined, or if the data is fetching, or if the data is empty, show a skeleton
          chartType === undefined || isFetching || chartSeries.length === 0 ? (
            <Skeleton variant="rounded" sx={{ height: 280 }} />
          ) : (
            <Chart
              height={280}
              options={chartOptions}
              series={barSeries && chartType === "bar" ? barSeries : chartSeries}
              type={chartType}
            />
          )
        }
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={1}
          sx={{ py: 1 }}
        >
          {labels.length > 0 && (
            <>
              <Typography variant="h5">{totalLabel}</Typography>
              <Typography variant="h5">{isFetching ? "0" : total}</Typography>
            </>
          )}
        </Stack>
        <Stack spacing={1}>
          {isFetching ? (
            <Skeleton height={30} />
          ) : (
            <>
              {
                //only show the labels if there are labels
                labels.length > 0 &&
                  chartSeries.map((item, index) => (
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
                            // Match ApexCharts' color cycling so the dot lines up with its bar/slice.
                            backgroundColor:
                              chartOptions.colors[index % chartOptions.colors.length],
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
                  ))
              }
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
