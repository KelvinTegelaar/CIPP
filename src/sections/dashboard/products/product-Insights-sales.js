import PropTypes from 'prop-types';
import { Box, Card, CardHeader, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

export const ProductInsightsSales = (props) => {
  const { chartSeries = [] } = props;
  const chartOptions = useChartOptions();

  return (
    <Card>
      <CardHeader title="Reports Sales" />
      <Divider />
      <Box sx={{ px: 1 }}>
        <Chart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="area"
        />
      </Box>
    </Card>
  );
};

ProductInsightsSales.propTypes = {
  chartSeries: PropTypes.array
};
