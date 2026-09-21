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

const useChartOptions = (labels, chartType, colors) => {
  const theme = useTheme();
  const longBarLabels =
    chartType === "bar" &&
    (labels.length > 6 || labels.some((label) => String(label ?? "").length > 18));

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
    colors: colors ?? [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.neutral[200],
    ],
    dataLabels: {
      enabled: false,
    },
    // ApexCharts' theme.mode does not touch the grid, so its #e0e0e0 default draws
    // near-white rules on a dark card. Both are the theme's own divider instead.
    grid: {
      borderColor: theme.palette.divider,
    },

    xaxis: {
      // Categories drive the bar/line axis labels and the tooltip title. Without this, a bar
      // chart's tooltip falls back to the auto series name ("series-1") instead of the label.
      categories: labels,
      labels: {
        // Long SharePoint/site names overlap when forced upright under every bar. The card already
        // lists full names below; keep categories for tooltips and hide the crowded axis text.
        show: !longBarLabels,
        rotate: 0,
        hideOverlappingLabels: true,
        trim: true,
        style: {
          fontSize: "12px",
        },
      },
      axisBorder: {
        color: theme.palette.divider,
      },
      axisTicks: {
        color: theme.palette.divider,
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
  colors,
}) => {
  const [range, setRange] = useState("Last 7 days");
  const [barSeries, setBarSeries] = useState([]);
  const chartOptions = useChartOptions(labels, chartType, colors);
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
          //if the chartType is not defined or the data is fetching, show a skeleton; an empty
          //series after loading is real data ("nothing to chart"), not a loading state
          chartType === undefined || isFetching ? (
            <Skeleton variant="rounded" sx={{ height: 280 }} />
          ) : chartSeries.length === 0 ? (
            <Box
              sx={{
                height: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                No data to display
              </Typography>
            </Box>
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
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            py: 1
          }}>
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
                      direction="row"
                      key={labels[index]}
                      spacing={1}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 1
                      }}>
                      {/* minWidth: 0 both here and on the label: labels are API free text
                          (recipient addresses, SharePoint URLs), and flexbox's min-width:
                          auto otherwise refuses to shrink them, pushing rows out of the card */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: "center",
                          flexGrow: 1,
                          minWidth: 0
                        }}>
                        <Box
                          sx={{
                            // Match ApexCharts' color cycling so the dot lines up with its bar/slice.
                            backgroundColor:
                              chartOptions.colors[index % chartOptions.colors.length],
                            borderRadius: "50%",
                            height: 8,
                            width: 8,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          title={labels[index]}
                          sx={{
                            color: "text.secondary",
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {labels[index]}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          flexShrink: 0
                        }}>
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
