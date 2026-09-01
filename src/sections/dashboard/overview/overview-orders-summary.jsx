import { useState } from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, CardHeader, Divider, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ActionsMenu } from "../../../components/actions-menu";
import { Chart } from "../../../components/chart";

const useChartOptions = (labels) => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
    },
    colors: [
      theme.palette.primary.main,
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

export const OverviewOrdersSummary = (props) => {
  const { chartSeries = [], labels = [] } = props;
  const [range, setRange] = useState("Last 7 days");
  const chartOptions = useChartOptions(labels);

  const total = chartSeries.reduce((acc, value) => acc + value, 0);

  return (
    <Card>
      <CardHeader
        action={
          <ActionsMenu
            color="inherit"
            actions={[
              {
                label: "Last 7 days",
                handler: () => {
                  setRange("Last 7 days");
                },
              },
              {
                label: "Last Month",
                handler: () => {
                  setRange("Last Month");
                },
              },
              {
                label: "Last Year",
                handler: () => {
                  setRange("Last Year");
                },
              },
            ]}
            label={range}
            size="small"
            variant="text"
          />
        }
        title="Warranty Information"
      />
      <Divider />
      <CardContent>
        <Chart height={200} options={chartOptions} series={chartSeries} chartType="donut" />
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={1}
          sx={{ py: 1 }}
        >
          <Typography variant="h5">Total</Typography>
          <Typography variant="h5">{total}</Typography>
        </Stack>
        <Stack spacing={1}>
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
        </Stack>
      </CardContent>
    </Card>
  );
};

OverviewOrdersSummary.propTypes = {
  chartSeries: PropTypes.array,
  labels: PropTypes.array,
};
