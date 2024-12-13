import { useCallback } from "react";
import PropTypes from "prop-types";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { useFilters } from "../hooks/use-filters";
import { FilterDialogItem } from "./filter-dialog-item";

export const FilterDialog = (props) => {
  const {
    filters = [],
    onApply,
    onClear,
    onClose,
    open = false,
    operators = [],
    properties = [],
  } = props;
  const filtersController = useFilters(operators, properties, filters);

  const handleApply = useCallback(() => {
    if (filtersController.valid) {
      onApply?.(filtersController.filters);
    }
  }, [filtersController.filters, filtersController.valid, onApply]);

  const displayClear = filters.length > 0;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: 500,
          width: "100%",
        },
      }}
    >
      <DialogTitle
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          display: "flex",
        }}
      >
        <Typography variant="inherit">Filter</Typography>
        <IconButton onClick={onClose} size="small">
          <SvgIcon fontSize="small">
            <XMarkIcon />
          </SvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          divider={
            <Divider textAlign="left">
              <Chip color="primary" label="AND" size="small" />
            </Divider>
          }
        >
          {filtersController.filters.map((filter, index) => {
            const displayAdd = filtersController.filters.length === index + 1;

            return (
              <FilterDialogItem
                displayAdd={displayAdd}
                disableAdd={!filtersController.valid}
                filter={filter}
                index={index}
                key={index}
                onAdd={filtersController.handleFilterAdd}
                onOperatorChange={filtersController.handleOperatorChange}
                onPropertyChange={filtersController.handlePropertyChange}
                onRemoveFilter={filtersController.handleFilterRemove}
                onValueChange={filtersController.handleValueChange}
                operators={operators}
                properties={properties}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        {displayClear && (
          <Button color="error" onClick={onClear}>
            Clear ({filters.length})
          </Button>
        )}
        <Button disabled={!filtersController.valid} onClick={handleApply} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FilterDialog.propTypes = {
  onApply: PropTypes.func,
  onClear: PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  operators: PropTypes.array,
  properties: PropTypes.array,
};
