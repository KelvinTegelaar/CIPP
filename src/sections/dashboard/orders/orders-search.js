import { useCallback } from 'react';
import PropTypes from 'prop-types';
import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import {
  Box,
  Button,
  Divider,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  ToggleButton,
  toggleButtonClasses,
  ToggleButtonGroup
} from '@mui/material';
import { BulkActionsMenu } from '../../../components/bulk-actions-menu';
import { FilterDialog } from '../../../components/filter-dialog';
import { QueryField } from '../../../components/query-field';
import { useDialog } from '../../../hooks/use-dialog';
import {
  containsOperator,
  endsWithOperator,
  equalsOperator,
  greaterThanOperator,
  isAfterOperator,
  isBeforeOperator,
  isBlankOperator,
  isPresentOperator,
  lessThanOperator,
  notContainsOperator,
  notEqualOperator,
  startsWithOperator
} from '../../../utils/filter-operators';

const viewOptions = [
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'Processed',
    value: 'processed'
  },
  {
    label: 'Delivered',
    value: 'delivered'
  },
  {
    label: 'Complete',
    value: 'complete'
  }
];

const filterProperties = [
  {
    label: 'ID',
    name: 'id',
    operators: [
      'contains',
      'endsWith',
      'equals',
      'notContains',
      'startsWith',
      'isBlank',
      'isPresent'
    ]
  },
  {
    label: 'Status',
    name: 'status',
    operators: [
      'contains',
      'endsWith',
      'equals',
      'notContains',
      'startsWith',
      'isBlank',
      'isPresent'
    ]
  },
  {
    label: 'Created',
    name: 'createdAt',
    operators: ['isAfter', 'isBefore', 'isBlank', 'isPresent']
  },
  {
    label: 'Updated',
    name: 'updatedAt',
    operators: ['isAfter', 'isBefore', 'isBlank', 'isPresent']
  },
  {
    label: 'Courier',
    name: 'courier',
    operators: [
      'contains',
      'endsWith',
      'equals',
      'notContains',
      'startsWith',
      'isBlank',
      'isPresent'
    ]
  },
  {
    label: 'Payment Method',
    name: 'paymentMethod',
    operators: [
      'contains',
      'endsWith',
      'equals',
      'notContains',
      'startsWith',
      'isBlank',
      'isPresent'
    ]
  },
  {
    label: 'Total',
    name: 'totalAmount',
    operators: ['equals', 'greaterThan', 'lessThan', 'notEqual', 'isBlank', 'isPresent']
  }
];

const filterOperators = [
  containsOperator,
  endsWithOperator,
  equalsOperator,
  greaterThanOperator,
  isAfterOperator,
  isBeforeOperator,
  isBlankOperator,
  isPresentOperator,
  lessThanOperator,
  notContainsOperator,
  notEqualOperator,
  startsWithOperator
];

export const OrdersSearch = (props) => {
  const {
    disabled = false,
    filters = [],
    mode = 'table',
    onFiltersApply,
    onFiltersClear,
    onModeChange,
    onQueryChange,
    onViewChange,
    query = '',
    selected = [],
    view = 'all'
  } = props;
  const filterDialog = useDialog();

  const handleFiltersApply = useCallback((filters) => {
    filterDialog.handleClose();
    onFiltersApply?.(filters);
  }, [filterDialog, onFiltersApply]);

  const handleFiltersClear = useCallback(() => {
    filterDialog.handleClose();
    onFiltersClear?.();
  }, [filterDialog, onFiltersClear]);

  const hasSelection = mode === 'table' && selected.length > 0;
  const hasFilters = filters.length > 0;

  return (
    <>
      <div>
        <Box
          sx={{
            px: {
              sm: 3
            }
          }}
        >
          <Tabs
            onChange={(event, value) => onViewChange?.(value)}
            value={view}
            variant="scrollable"
          >
            {viewOptions.map((option) => (
              <Tab
                disabled={disabled}
                key={option.label}
                label={option.label}
                value={option.value}
              />
            ))}
          </Tabs>
        </Box>
        <Divider />
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          gap={2}
          sx={{ p: 3 }}
        >
          {hasSelection && (
            <BulkActionsMenu
              disabled={disabled}
              selectedCount={selected.length}
              sx={{
                order: {
                  xs: 4,
                  sm: 1
                }
              }}
            />
          )}
          <QueryField
            disabled={disabled}
            placeholder="Search..."
            onChange={onQueryChange}
            sx={{
              flexGrow: 1,
              order: {
                xs: 1,
                sm: 2
              }
            }}
            value={query}
          />
          <ToggleButtonGroup
            exclusive
            onChange={(event, value) => {
              if (value) {
                onModeChange?.(value);
              }
            }}
            size="small"
            sx={{
              border: (theme) => `1px solid ${theme.palette.divider}`,
              p: 0.5,
              order: 2,
              [`& .${toggleButtonClasses.root}`]: {
                border: 0,
                '&:not(:first-of-type)': {
                  borderRadius: 1
                },
                '&:first-of-type': {
                  borderRadius: 1,
                  mr: 0.5
                }
              }
            }}
            value={mode}
          >
            <ToggleButton value="table">
              <SvgIcon fontSize="small">
                <ListBulletIcon />
              </SvgIcon>
            </ToggleButton>
            <ToggleButton value="dnd">
              <SvgIcon fontSize="small">
                <Squares2X2Icon />
              </SvgIcon>
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            disabled={disabled}
            onClick={filterDialog.handleOpen}
            size="large"
            startIcon={(
              <SvgIcon fontSize="small">
                <AdjustmentsHorizontalIcon />
              </SvgIcon>
            )}
            sx={{ order: 3 }}
            variant={hasFilters ? 'contained' : 'text'}
          >
            Filter
          </Button>
        </Stack>
      </div>
      <FilterDialog
        filters={filters}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
        onClose={filterDialog.handleClose}
        open={filterDialog.open}
        operators={filterOperators}
        properties={filterProperties}
      />
    </>
  );
};

OrdersSearch.propTypes = {
  disabled: PropTypes.bool,
  filters: PropTypes.array,
  mode: PropTypes.oneOf(['dnd', 'table']),
  onFiltersApply: PropTypes.func,
  onFiltersClear: PropTypes.func,
  onModeChange: PropTypes.func,
  onQueryChange: PropTypes.func,
  onViewChange: PropTypes.func,
  query: PropTypes.string,
  selected: PropTypes.array,
  view: PropTypes.oneOf(['all', 'complete', 'delivered', 'processed'])
};
