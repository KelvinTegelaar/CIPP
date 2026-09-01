import PropTypes from 'prop-types';
import numeral from 'numeral';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { Grid } from "@mui/system";
import { alpha, useTheme } from '@mui/material/styles';
import { Chart } from '../../../components/chart';

const useChartOptions = (labels) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: [
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.error.main
    ],
    dataLabels: {
      enabled: false
    },
    grid: {
      padding: {
        left: 0,
        right: 0
      }
    },
    labels,
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      },
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    },
    tooltip: {
      fillSeriesColor: false
    }
  };
};

export const InvoicesStats = (props) => {
  const { chartSeries = [], labels = [] } = props;
  const chartOptions = useChartOptions(labels);

  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
        mb: 4
      }}
    >
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{ md: 6, xs: 12 }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary"
              }}
            >
              Total net income
            </Typography>
            <Typography
              sx={{ mb: 3 }}
              variant="h4"
            >
              $12,200.00
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary"
              }}
            >
              From a total of
              {' '}
              <strong>6</strong>
              {' '}
              Invoices
            </Typography>
          </Grid>
          <Grid
            size={{ md: 6, xs: 12 }}

            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row'
              }
            }}
          >
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              width={150}
            />
            <Box sx={{ flexGrow: 1 }}>
              {chartSeries.map((item, index) => {
                const amount = numeral(item).format('$0,0.00');

                return (
                  <Stack
                    key={labels[index]}
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1
                    }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center"
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: chartOptions.colors[index],
                          borderRadius: '50%',
                          height: 8,
                          width: 8
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary"
                        }}
                      >
                        {labels[index]}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">
                      {amount}
                    </Typography>
                  </Stack>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

InvoicesStats.propTypes = {
  chartSeries: PropTypes.array,
  labels: PropTypes.array
};
