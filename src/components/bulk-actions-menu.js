import PropTypes from "prop-types";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { Button, ListItemText, Menu, MenuItem, SvgIcon } from "@mui/material";
import { usePopover } from "../../hooks/use-popover";
import { ApiPostCall } from "../api/ApiCall";

export const BulkActionsMenu = (props) => {
  const { disabled, onArchive, onDelete, selectedCount = 0, sx, row, actions, ...other } = props;
  const popover = usePopover();
  const deleteRequest = ApiPostCall({
    url: "/api/DeleteDevices",
    relatedQueryKeys: "Clients",
  });
  return (
    <>
      <Button
        disabled={disabled}
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        startIcon={
          <SvgIcon fontSize="small">
            <ChevronDownIcon />
          </SvgIcon>
        }
        variant="outlined"
        sx={{
          flexShrink: 0,
          whiteSpace: "nowrap",
          ...sx,
        }}
        {...other}
      >
        Bulk Actions
      </Button>
      <Menu
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        MenuListProps={{
          dense: true,
          sx: { p: 1 },
        }}
        onClose={popover.handleClose}
        open={popover.open}
        transformOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
      >
        <MenuItem
          onClick={() =>
            deleteRequest.mutate({
              ids: row.map((row) => row.original.RowKey),
            })
          }
          sx={{ borderRadius: 1 }}
        >
          <ListItemText>Delete ({selectedCount})</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

BulkActionsMenu.propTypes = {
  disabled: PropTypes.bool,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  selectedCount: PropTypes.number,
};
