import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { format } from 'date-fns';
import {
  Avatar,
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
import { ProductsTableMenu } from './products-table-menu';

const statusMap = {
  draft: {
    color: 'info.main',
    label: 'Draft'
  },
  published: {
    color: 'success.main',
    label: 'Published'
  }
};

const columns = [
  {
    id: 'name',
    label: 'Name',
    sortable: true
  },
  {
    id: 'createdAt',
    label: 'Created',
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

export const ProductsTable = (props) => {
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
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  disabled={resourcesState !== 'available'}
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
                        disabled={resourcesState !== 'available'}
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
              {items.map((product) => {
                const isSelected = !!selected.find((productId) => productId === product.id);
                const status = statusMap[product.status];
                const createdDate = format(product.createdAt, 'dd MMM yyyy');
                const createdTime = format(product.createdAt, 'HH:mm');

                return (
                  <TableRow
                    hover
                    key={product.id}
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            onSelectOne?.(product.id);
                          } else {
                            onDeselectOne?.(product.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                      >
                        <Avatar
                          src={product.image}
                          sx={{
                            width: 64,
                            height: 64
                          }}
                          variant="rounded"
                        />
                        <div>
                          <Link
                            color="inherit"
                            component={NextLink}
                            href={paths.dashboard.products.details.index}
                            underline="none"
                            variant="subtitle2"
                          >
                            {product.name}
                          </Link>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                          >
                            12 in stock for 1 variant
                          </Typography>
                        </div>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography
                          color="inherit"
                          variant="body2"
                        >
                          {createdDate}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          {createdTime}
                        </Typography>
                      </div>
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
                    <TableCell align="right">
                      <ProductsTableMenu />
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

ProductsTable.propTypes = {
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
