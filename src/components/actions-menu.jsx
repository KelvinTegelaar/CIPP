import PropTypes from "prop-types";
import { CippIcons } from "../utils/icon-registry";
import { Button, ListItemText, Menu, MenuItem, SvgIcon } from "@mui/material";
import { usePopover } from "../hooks/use-popover";
import { useActionsDispatch } from "../hooks/use-actions-dispatch";

export const ActionsMenu = (props) => {
  const { actions = [], label = "Actions", data, queryKeys, ...other } = props;
  const popover = usePopover();
  const { visibleActions, isDisabled, dispatch, dialog } = useActionsDispatch({
    actions,
    data,
    queryKeys,
  });

  return (
    <>
      <Button
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        startIcon={
          <SvgIcon fontSize="small">
            <CippIcons.ChevronDownIcon />
          </SvgIcon>
        }
        variant="outlined"
        sx={{
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        onClose={popover.handleClose}
        open={popover.open}
        transformOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
        slotProps={{
          list: {
            dense: true,
            sx: { p: 1 },
          }
        }}
      >
        {visibleActions.map((action, index) => (
          <MenuItem
            disabled={isDisabled(action)}
            key={index}
            onClick={() => {
              dispatch(action);
              popover.handleClose();
            }}
          >
            <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
              {action.icon}
            </SvgIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
      {dialog}
    </>
  );
};

ActionsMenu.propTypes = {
  actions: PropTypes.array,
  label: PropTypes.string,
};
