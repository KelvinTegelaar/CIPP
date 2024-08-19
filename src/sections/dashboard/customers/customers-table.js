import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { format } from 'date-fns';
import StarOutlineIcon from '@heroicons/react/24/outline/StarIcon';
import StarSolidIcon from '@heroicons/react/24/solid/StarIcon';
import {
  Avatar,
  Box,
  Checkbox,
  Divider,
  IconButton,
  Link,
  Skeleton,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import { Pagination } from '../../../components/pagination';
import { ResourceError } from '../../../components/resource-error';
import { ResourceUnavailable } from '../../../components/resource-unavailable';
import { Scrollbar } from '../../../components/scrollbar';
import { paths } from '../../../paths';
import { CustomersTableMenu } from './customers-table-menu';

const columns = [
  {
    id: 'name',
    disablePadding: true,
    label: 'Name',
    sortable: true
  },
  {
    id: 'phone',
    label: 'Phone',
    sortable: true
  },
  {
    id: 'email',
    label: 'Email',
    sortable: true
  },
  {
    id: 'createdAt',
    label: 'Created',
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

export const CustomersTable = (props) => {
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
              <TableCell />
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  padding={column.disablePadding ? 'none' : 'normal'}
                >
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
              {items.map((customer) => {
                const isSelected = !!selected.find((customerId) => customerId === customer.id);
                const createdAt = format(customer.createdAt, 'dd/MM/yyyy HH:mm');

                return (
                  <TableRow
                    hover
                    key={customer.id}
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            onSelectOne?.(customer.id);
                          } else {
                            onDeselectOne?.(customer.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell padding="none">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        <IconButton
                          onClick={() => { }}
                          size="small"
                        >
                          <SvgIcon
                            fontSize="small"
                            sx={{
                              color: customer.isFavorite
                                ? 'warning.main'
                                : 'action.disabled'
                            }}
                          >
                            {customer.isFavorite ? <StarSolidIcon /> : <StarOutlineIcon />}
                          </SvgIcon>
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell padding="none">
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                      >
                        <Avatar
                          src={customer.avatar}
                          sx={{
                            height: 36,
                            width: 36
                          }}
                          variant="rounded"
                        />
                        <Link
                          color="inherit"
                          component={NextLink}
                          href={paths.dashboard.customers.details.index}
                          underline="none"
                          variant="subtitle2"
                        >
                          {customer.name}
                        </Link>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {customer.phone}
                    </TableCell>
                    <TableCell>
                      {customer.email}
                    </TableCell>
                    <TableCell>
                      {createdAt}
                    </TableCell>
                    <TableCell align="right">
                      <CustomersTableMenu />
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

CustomersTable.propTypes = {
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
