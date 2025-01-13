import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import {
  Box,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';
import { Scrollbar } from '../../../components/scrollbar';
import { paths } from '../../../paths';
import { CustomerOrderMenu } from './customer-order-menu';

const statusMap = {
  placed: {
    color: 'info.main',
    label: 'Placed'
  },
  processed: {
    color: 'error.main',
    label: 'Processed'
  },
  complete: {
    color: 'success.main',
    label: 'Complete'
  },
  delivered: {
    color: 'success.main',
    label: 'Delivered'
  }
};

const columns = [
  {
    id: 'id',
    label: 'Order ID',
    sortable: true
  },
  {
    id: 'createdAt',
    label: 'Created',
    sortable: true
  },
  {
    id: 'distribution',
    label: 'Distribution',
    sortable: true
  },
  {
    id: 'status',
    label: 'Status',
    sortable: true
  },
  {
    id: 'totalAmount',
    label: 'Total Amount',
    sortable: true
  }
];

export const CustomerOrdersTable = (props) => {
  const { isLoading = false, items = [], onSortChange, sortBy, sortDir } = props;

  return (
    <Scrollbar>
      <Table sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>
                {column.sortable
                  ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDir : 'asc'}
                      disabled={isLoading}
                      onClick={() => onSortChange?.(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  )
                  : column.label}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((order) => {
            const status = statusMap[order.status];
            const address = [order.address?.city, order.address?.country].join((', '));
            const createdDate = format(order.createdAt, 'dd MMM yyyy');
            const createdTime = format(order.createdAt, 'HH:mm');
            const totalAmount = numeral(order.totalAmount).format(`${order.currency}0,0.00`);

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    color="inherit"
                    component={NextLink}
                    href={paths.dashboard.orders.details}
                    underline="none"
                    variant="subtitle2"
                  >
                    #{order.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div>
                    <Typography
                      color="inherit"
                      variant="inherit"
                    >
                      {createdDate}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="inherit"
                    >
                      {createdTime}
                    </Typography>
                  </div>
                </TableCell>
                <TableCell>
                  <Typography
                    color="inherit"
                    variant="inherit"
                  >
                    {address}
                  </Typography>
                  {order.courier && (
                    <Typography
                      color="text.secondary"
                      variant="inherit"
                    >
                      {order.courier}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {status && (
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Box
                        sx={{
                          backgroundColor: status.color,
                          borderRadius: '50%',
                          height: 8,
                          width: 8
                        }}
                      />
                      <Typography variant="body2">
                        {status.label}
                      </Typography>
                    </Stack>
                  )}
                </TableCell>
                <TableCell>
                  {totalAmount}
                </TableCell>
                <TableCell align="right">
                  <CustomerOrderMenu />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Scrollbar>
  );
};

CustomerOrdersTable.propTypes = {
  isLoading: PropTypes.bool,
  items: PropTypes.array,
  onSortChange: PropTypes.func,
  sortBy: PropTypes.string,
  sortDir: PropTypes.oneOf(['asc', 'desc'])
};
