import PropTypes from 'prop-types';
import NextLink from 'next/link';
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
import { InvoicesTableMenu } from './invoices-table-menu';

const statusMap = {
  draft: {
    color: 'warning.main',
    label: 'Draft'
  },
  ongoing: {
    color: 'info.main',
    label: 'Ongoing'
  },
  overdue: {
    color: 'error.main',
    label: 'Overdue'
  },
  paid: {
    color: 'success.main',
    label: 'Paid'
  }
};

const columns = [
  {
    id: 'ref',
    disablePadding: true,
    label: 'Invoice Ref',
    sortable: true
  },
  {
    id: 'issueDate',
    label: 'Issue Date',
    sortable: true
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    sortable: true
  },
  {
    id: 'totalAmount',
    label: 'Total',
    sortable: true
  },
  {
    id: 'paymentMethod',
    label: 'Payment Method',
    sortable: true
  },
  {
    id: 'status',
    label: 'Status',
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

export const InvoicesTable = (props) => {
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
    sortBy = 'issueDate',
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
          {resourcesState === 'available' && (
            <TableBody>
              {items.map((invoice) => {
                const isSelected = !!selected.find((invoiceId) => invoiceId === invoice.id);
                const status = statusMap[invoice.status];
                const issueDate = format(invoice.issueDate, 'dd MMM yyyy');
                const dueDate = format(invoice.dueDate, 'dd MMM yyyy');
                const totalAmount = numeral(invoice.totalAmount).format(`${invoice.currency}0,0.00`);

                return (
                  <TableRow
                    hover
                    key={invoice.id}
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            onSelectOne?.(invoice.id);
                          } else {
                            onDeselectOne?.(invoice.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        color="inherit"
                        component={NextLink}
                        href={paths.dashboard.invoices.details.index}
                        underline="none"
                        variant="subtitle2"
                      >
                        {invoice.ref}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {issueDate}
                    </TableCell>
                    <TableCell>
                      {dueDate}
                    </TableCell>
                    <TableCell>
                      {totalAmount}
                    </TableCell>
                    <TableCell>
                      {invoice.paymentMethod}
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
                      <InvoicesTableMenu />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
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
        <Box sx={{ m: 2 }}>
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

InvoicesTable.propTypes = {
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
