import PropTypes from 'prop-types';
import { Box, Card, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Chart } from '../../../components/chart';

const useChartOptions = (labels) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.warning.main,
      theme.palette.success.main
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
      fillSeriesColor: false,
      y: {
        formatter(value) {
          return `${value}k`;
        }
      }
    }
  };
};

export const ProductInsightsChannel = (props) => {
  const { chartSeries = [], labels = [] } = props;
  const chartOptions = useChartOptions(labels);

  return (
    <Card>
      <CardHeader title="Channel" />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        spacing={3}
        sx={{
          pr: 3,
          py: 3
        }}
      >
        <div>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width={200}
          />
        </div>
        <div>
          <Typography
            color="text.secondary"
            variant="subtitle2"
          >
            Total views
          </Typography>
          <Typography
            sx={{ my: 1 }}
            variant="h4"
          >
            27k
          </Typography>
          <Stack spacing={1}>
            {chartSeries.map((item, index) => (
              <Stack
                alignItems="center"
                direction="row"
                key={labels[index]}
                spacing={1}
              >
                <Box
                  sx={{
                    backgroundColor: chartOptions.colors[index],
                    borderRadius: 1,
                    height: 8,
                    width: 8
                  }}
                />
                <Typography variant="body2">
                  {labels[index]}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </div>
      </Stack>
    </Card>
  );
};

ProductInsightsChannel.propTypes = {
  chartSeries: PropTypes.array,
  labels: PropTypes.array
};
