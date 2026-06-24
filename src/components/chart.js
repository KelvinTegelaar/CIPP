import { styled } from '@mui/material/styles';
import { ResponsiveContainer, BarChart, LineChart, AreaChart, PieChart } from 'recharts';

const ChartBase = ({ type = 'bar', height = 300, children, ...rest }) => {
  const containers = { bar: BarChart, line: LineChart, area: AreaChart, donut: PieChart, pie: PieChart };
  const Container = containers[type] ?? BarChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Container {...rest}>{children}</Container>
    </ResponsiveContainer>
  );
};

export const Chart = styled(ChartBase)({});
