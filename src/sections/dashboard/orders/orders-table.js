import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import {
  Box,
  Checkbox,
  Divider,
  Link,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';
import { Pagination } from '../../../components/pagination';
import { ResourceError } from '../../../components/resource-error';
import { ResourceUnavailable } from '../../../components/resource-unavailable';
import { Scrollbar } from '../../../components/scrollbar';
import { paths } from '../../../paths';
import { OrdersTableMenu } from './orders-table-menu';

const statusMap = {
  complete: {
    color: 'success.main',
    label: 'Complete'
  },
  created: {
    color: 'neutral.500',
    label: 'Created'
  },
  delivered: {
    color: 'warning.main',
    label: 'Delivered'
  },
  placed: {
    color: 'info.main',
    label: 'Placed'
  },
  processed: {
    color: 'error.main',
    label: 'Processed'
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
    id: 'customer',
    label: 'Customer',
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
    label: 'Total',
    sortable: true
  }
];

const getResourcesState = (params) => {
  if (params.isLoading) {
    return 'loading';
  }

  if (params.error) {
    return 'error';
  }

  return params.items.length > 0 ? 'available' : 'unavailable';
};

export const OrdersTable = (props) => {
  const {
    count = 0,
    error,
    isLoading = false,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange,
    onSelectAll,
    onSelectOne,
    onSortChange,
    page = 0,
    rowsPerPage = 0,
    selected = [],
    sortBy = 'createdAt',
    sortDir = 'desc'
  } = props;

  const resourcesState = getResourcesState({
    isLoading,
    error,
    items
  });

  const selectedSome = (selected.length > 0) && (selected.length < items.length);
  const selectedAll = (items.length > 0) && (selected.length === items.length);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}
    >
      <Divider />
      <Scrollbar>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  disabled={!(resourcesState === 'available')}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onSelectAll?.();
                    } else {
                      onDeselectAll?.();
                    }
                  }}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.sortable
                    ? (
                      <TableSortLabel
                        active={sortBy === column.id}
                        direction={sortBy === column.id ? sortDir : 'asc'}
                        disabled={!(resourcesState === 'available')}
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
              const isSelected = !!selected.find((orderId) => orderId === order.id);
              const status = statusMap[order.status];
              const address = [order.address?.city, order.address?.country].join((', '));
              const createdDate = format(order.createdAt, 'dd MMM yyyy');
              const createdTime = format(order.createdAt, 'HH:mm');
              const totalAmount = numeral(order.totalAmount).format(`${order.currency}0,0.00`);

              return (
                <TableRow
                  hover
                  key={order.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          onSelectOne?.(order.id);
                        } else {
                          onDeselectOne?.(order.id);
                        }
                      }}
                    />
                  </TableCell>
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
                  </TableCell>
                  <TableCell>
                    {order.customer && (
                      <Link
                        color="inherit"
                        component={NextLink}
                        href={paths.dashboard.customers.details.index}
                        underline="none"
                        variant="inherit"
                      >
                        {order.customer.name}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      color="inherit"
                      variant="inherit"
                    >
                      {address}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="inherit"
                    >
                      {order.courier}
                    </Typography>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {totalAmount}
                  </TableCell>
                  <TableCell align="right">
                    <OrdersTableMenu />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      {resourcesState === 'available' && (
        <>
          <Divider sx={{ mt: 'auto' }} />
          <Pagination
            onPageChange={onPageChange}
            page={page}
            rowsCount={count}
            rowsPerPage={rowsPerPage}
          />
        </>
      )}
      {resourcesState === 'loading' && (
        <Box sx={{ p: 2 }}>
          <Skeleton height={42} />
          <Skeleton height={42} />
          <Skeleton height={42} />
        </Box>
      )}
      {resourcesState === 'error' && (
        <ResourceError
          message="Something went wrong"
          sx={{
            flexGrow: 1,
            m: 2
          }}
        />
      )}
      {resourcesState === 'unavailable' && (
        <ResourceUnavailable
          message="Resources are not available"
          sx={{
            flexGrow: 1,
            m: 2
          }}
        />
      )}
    </Box>
  );
};

OrdersTable.propTypes = {
  count: PropTypes.number,
  error: PropTypes.string,
  isLoading: PropTypes.bool,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  onSortChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
  sortBy: PropTypes.string,
  sortDir: PropTypes.oneOf(['asc', 'desc'])
};
