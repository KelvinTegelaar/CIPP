import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ActionsMenu } from '../../../components/actions-menu';
import { Chart } from '../../../components/chart';

const useChartOptions = () => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    legend: {
      show: true
    },
    colors: [theme.palette.primary.main],
    dataLabels: {
      enabled: false
    },
    fill: {
      type: 'gradient'
    },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    stroke: {
      width: 3
    },
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        color: theme.palette.divider,
        show: true
      },
      axisTicks: {
        color: theme.palette.divider,
        show: true
      },
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -12,
        style: {
          colors: theme.palette.text.secondary
        }
      }
    }
  };
};

export const SalesKpi = (props) => {
  const { chartSeries = [], stats = [] } = props;
  const [range, setRange] = useState('Last 7 days');
  const chartOptions = useChartOptions();

  return (
    <Card>
      <CardHeader
        action={(
          <ActionsMenu
            color="inherit"
            actions={[
              {
                label: 'Last 7 days',
                handler: () => { setRange('Last 7 days'); }
              },
              {
                label: 'Last Month',
                handler: () => { setRange('Last Month'); }
              },
              {
                label: 'Last Year',
                handler: () => { setRange('Last Year'); }
              }
            ]}
            label={range}
            size="small"
            variant="text"
          />
        )}
        title="Key Performance Indicators"
      />
      <Divider />
      <CardContent>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(5, 1fr)'
            }
          }}
        >
          {stats.map((item) => (
            <Box
              key={item.label}
              sx={{
                alignItems: 'center',
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? 'neutral.900'
                  : 'neutral.50',
                borderRadius: 1,
                p: 2
              }}
            >
              <Typography
                color="text.secondary"
                variant="overline"
              >
                {item.label}
              </Typography>
              <Typography variant="h6">
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Chart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="area"
        />
      </CardContent>
    </Card>
  );
};

SalesKpi.propTypes = {
  chartSeries: PropTypes.array,
  stats: PropTypes.array
};
