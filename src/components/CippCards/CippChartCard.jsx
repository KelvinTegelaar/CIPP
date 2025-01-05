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
}) => {
  const [range, setRange] = useState("Last 7 days");
  const [barSeries, setBarSeries] = useState([]);
  const chartOptions = useChartOptions(labels, chartType);
  chartSeries = chartSeries.filter((item) => item !== null);
  const total = chartSeries.reduce((acc, value) => acc + value, 0);
  useEffect(() => {
    if (chartType === "bar") {
      setBarSeries(
        labels.map((label, index) => ({
          data: [{ x: label, y: chartSeries[index] }],
        }))
      );
    }
  }, [chartType, chartSeries.length, labels]);

  return (
    <Card style={{ width: "100%", height: "100%" }}>
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
              <Typography variant="h5">Total</Typography>
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
                  ))
              }
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
