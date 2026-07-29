import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import PropTypes from "prop-types";
import {
  Button,
  Divider,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  SvgIcon,
  Box,
  alpha,
} from "@mui/material";
import { useMemo, useState } from "react";
import { usePopover } from "../hooks/use-popover";
import { useDialog } from "../hooks/use-dialog";
import { CippApiDialog } from "./CippComponents/CippApiDialog";
import { resolvePaletteMainColor } from "../theme/utils";
import {
  getActionColor,
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
  sortCategoryEntries,
} from "../utils/action-categories";

export const ActionsMenu = (props) => {
  const { actions = [], label = "Actions", data, queryKeys, ...other } = props;
  const popover = usePopover();
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const [customComponentData, setCustomComponentData] = useState({ data: {}, action: {} });
  const [customComponentVisible, setCustomComponentVisible] = useState(false);
  const createDialog = useDialog();

  const groupedActions = useMemo(() => {
    const filtered = actions?.filter((action) => !action.link || action.showInActionsMenu) || [];
    const grouped = filtered.reduce((acc, action) => {
      const category =
        typeof action.category === "string" && action.category.trim().length > 0
          ? action.category.trim()
          : "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    }, {});
    return sortCategoryEntries(Object.entries(grouped));
  }, [actions]);
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
        {label}
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
        {groupedActions.map(([category, categoryActions], groupIndex) => {
          const categoryColor = getCategoryColor(category);
          const headerBgColor = categoryColor === "text.secondary" 
            ? (theme) => alpha(theme.palette.grey[500], 0.08)
            : (theme) => alpha(resolvePaletteMainColor(theme, categoryColor), 0.08);
          const headerTextColor = categoryColor === "text.secondary"
            ? "text.secondary"
            : (theme) => resolvePaletteMainColor(theme, categoryColor);
            
          return (
            <Box key={category}>
              <ListSubheader
                disableSticky
                sx={{
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.06em",
                  fontWeight: 700,
                  lineHeight: 1.8,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  bgcolor: headerBgColor,
                  color: headerTextColor,
                  borderRadius: 0.5,
                  mx: 0.5,
                  mt: groupIndex > 0 ? 0.5 : 0,
                  py: 0.5,
                }}
              >
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
              </ListSubheader>
              {categoryActions.map((action, index) => {
                const actionColor = getActionColor(action, category);
                const iconSx =
                  actionColor === "text.secondary"
                    ? { minWidth: "30px", color: actionColor }
                    : { minWidth: "30px", color: (theme) => resolvePaletteMainColor(theme, actionColor) };

                return (
                  <MenuItem
                    disabled={handleActionDisabled(data, action)}
                    key={`${category}-${index}`}
                    onClick={() => {
                      if (action?.noConfirm && action.customFunction) {
                        action.customFunction(data, action, {});
                        popover.handleClose();
                        return;
                      }

                      if (typeof action?.customComponent === "function") {
                        setCustomComponentData({ data: data, action: action });
                        setCustomComponentVisible(true);
                        popover.handleClose();
                        return;
                      }

                      setActionData({
                        data: data,
                        action: action,
                        ready: true,
                      });
                      createDialog.handleOpen();
                      popover.handleClose();
                    }}
                  >
                    <SvgIcon fontSize="small" sx={iconSx}>
                      {action.icon}
                    </SvgIcon>
                    <ListItemText>{action.label}</ListItemText>
                  </MenuItem>
                );
              })}
              {groupIndex < groupedActions.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </Box>
          );
        })}
      </Menu>
      {customComponentVisible &&
        customComponentData?.action &&
        typeof customComponentData.action.customComponent === "function" &&
        customComponentData.action.customComponent(customComponentData.data, {
          drawerVisible: customComponentVisible,
          setDrawerVisible: setCustomComponentVisible,
        })}
      {actionData.ready && typeof actionData.action?.customComponent !== "function" && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={actionData.action?.fields}
          api={actionData.action}
          row={actionData.data}
          relatedQueryKeys={queryKeys}
          {...actionData.action}
        />
      )}
    </>
  );
};

ActionsMenu.propTypes = {
  actions: PropTypes.array,
  label: PropTypes.string,
  queryKeys: PropTypes.array,
};
