import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, Divider, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ActionsMenu } from '../../../components/actions-menu';
import { Chart } from '../../../components/chart';

const useChartOptions = (categories) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    colors: [
      theme.palette.primary.main
    ],
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    legend: {
      show: false
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '45%',
        distributed: true
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
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    }
  };
};

const tabOptions = [
  {
    label: 'Watches',
    value: 'watches'
  },
  {
    label: 'Mouse Pads',
    value: 'mouse_pads'
  },
  {
    label: 'Shoes',
    value: 'shoes'
  },
  {
    label: 'Cameras',
    value: 'cameras'
  },
  {
    label: 'Phones',
    value: 'phones'
  }
];

export const SalesBreakdown = (props) => {
  const { categories = [], chartSeries = [] } = props;
  const chartOptions = useChartOptions(categories);
  const [tab, setTab] = useState('watches');
  const [range, setRange] = useState('Last 7 days');

  const handleTabChange = useCallback((value) => {
    setTab(value);
  }, []);

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
        title="Products Breakdown"
      />
      <Divider />
      <Box sx={{ px: 3 }}>
        <Tabs
          onChange={(event, value) => handleTabChange(value)}
          value={tab}
          variant="scrollable"
        >
          {tabOptions.map((option) => (
            <Tab
              key={option.label}
              label={option.label}
              value={option.value}
            />
          ))}
        </Tabs>
      </Box>
      <Divider />
      <Box sx={{ px: 2 }}>
        <Chart
          height={320}
          options={chartOptions}
          series={chartSeries}
          type="bar"
        />
      </Box>
    </Card>
  );
};

SalesBreakdown.propTypes = {
  categories: PropTypes.array,
  chartSeries: PropTypes.array
};
