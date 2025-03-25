import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import PropTypes from "prop-types";
import { Button, ListItemText, Menu, MenuItem, SvgIcon } from "@mui/material";
import { usePopover } from "../hooks/use-popover";
import { useState } from "react";
import { useDialog } from "../hooks/use-dialog";
import { CippApiDialog } from "./CippComponents/CippApiDialog";

export const ActionsMenu = (props) => {
  const { actions = [], label = "Actions", data, queryKeys, ...other } = props;
  const popover = usePopover();
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const createDialog = useDialog();
  const handleActionDisabled = (row, action) => {
    //add nullsaftey for row. It can sometimes be undefined(still loading) or null(no data)
    if (!row) {
      return true;
    }
    if (action?.condition) {
      return !action?.condition(row);
    }
    return false;
  };
  return (
    <>
      <Button
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
        }}
      >
        Actions
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
        {actions
          ?.filter((action) => !action.link || action.showInActionsMenu)
          .map((action, index) => (
            <MenuItem
              disabled={handleActionDisabled(data, action)}
              key={index}
              onClick={() => {
                setActionData({
                  data: data,
                  action: action,
                  ready: true,
                });

                if (action?.noConfirm && action.customFunction) {
                  action.customFunction(data, action, {});
                } else {
                  createDialog.handleOpen();
                  popover.handleClose();
                }
              }}
            >
              <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                {action.icon}
              </SvgIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
      </Menu>
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={actionData.action?.fields}
          api={actionData.action}
          row={actionData.data}
          relatedQueryKeys={queryKeys}
        />
      )}
    </>
  );
};

ActionsMenu.propTypes = {
  actions: PropTypes.array,
  label: PropTypes.string,
};
