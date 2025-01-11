import { useMemo } from 'react';
import PropTypes from 'prop-types';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { Button, FilledInput, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

export const FilterDialogItem = (props) => {
  const {
    disableAdd = false,
    displayAdd = false,
    filter,
    index = 0,
    onAdd,
    onOperatorChange,
    onPropertyChange,
    onRemoveFilter,
    onValueChange,
    operators = [],
    properties = []
  } = props;

  const property = useMemo(() => {
    return properties.find((property) => property.name === filter.property);
  }, [filter, properties]);

  const operator = useMemo(() => {
    return operators.find((operator) => operator.name === filter.operator);
  }, [filter, operators]);

  const operatorOptions = useMemo(() => {
    return (property?.operators || [])
      .map((name) => operators.find((operator) => operator.name === name))
      .filter((operator) => !!operator);
  }, [property, operators]);

  return (
    <Stack spacing={1}>
      <Typography variant="caption">
        Where
      </Typography>
      <Stack spacing={2}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <Select
            fullWidth
            onChange={(event) => onPropertyChange?.(index, event.target.value)}
            value={filter.property || ''}
          >
            {properties.map((property) => (
              <MenuItem
                key={property.name}
                value={property.name}
              >
                {property.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            disabled={operatorOptions.length < 1}
            fullWidth
            onChange={(event) => onOperatorChange?.(index, event.target.value)}
            value={operator?.name || ''}
          >
            {operatorOptions.map((operator) => (
              <MenuItem
                key={operator.name}
                value={operator.name}
              >
                {operator.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        {operator?.field === 'date' && (
          <DatePicker
            onChange={(date) => {
              if (date) {
                onValueChange?.(index, date);
              }
            }}
            renderInput={(inputProps) => (
              <TextField
                fullWidth
                {...inputProps} />
            )}
            value={filter.value || null}
          />
        )}
        {operator?.field === 'string' && (
          <FilledInput
            fullWidth
            onChange={(event) => onValueChange?.(index, event.target.value)}
            value={filter.value || ''}
          />
        )}
        {operator?.field === 'number' && (
          <FilledInput
            fullWidth
            type="number"
            onChange={(event) => onValueChange?.(index, event.target.value)}
            value={filter.value || ''}
          />
        )}
      </Stack>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        justifyContent="flex-end"
      >
        {displayAdd && (
          <Button
            disabled={disableAdd}
            onClick={() => onAdd?.(index + 1)}
            size="small"
            startIcon={<PlusIcon />}
          >
            Add
          </Button>
        )}
        <Button
          color="inherit"
          onClick={() => onRemoveFilter?.(index)}
          size="small"
        >
          Remove
        </Button>
      </Stack>
    </Stack>
  );
};

FilterDialogItem.propTypes = {
  disableAdd: PropTypes.bool,
  displayAdd: PropTypes.bool,
  filter: PropTypes.object.isRequired,
  index: PropTypes.number,
  onAdd: PropTypes.func,
  onOperatorChange: PropTypes.func,
  onPropertyChange: PropTypes.func,
  onRemoveFilter: PropTypes.func,
  onValueChange: PropTypes.func,
  operators: PropTypes.array,
  properties: PropTypes.array
};
