import PropTypes from "prop-types";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { Button, Divider, Link, ListItemText, ListSubheader, Menu, MenuItem, SvgIcon, Box, alpha } from "@mui/material";
import { useMemo } from "react";
import { usePopover } from "../hooks/use-popover";
import { resolvePaletteMainColor } from "../theme/utils";
import { getIconByName } from "../utils/icon-registry";
import {
  getActionColor,
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
  sortCategoryEntries,
} from "../utils/action-categories";

export const BulkActionsMenu = (props) => {
  const { buttonName, sx, row, actions = [], ...other } = props;
  const popover = usePopover();
  const groupedActions = useMemo(() => {
    const grouped = actions.reduce((acc, action) => {
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
          ...sx,
        }}
        {...other}
      >
        {buttonName}
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
                    ? { mr: 1, color: actionColor }
                    : { mr: 1, color: (theme) => resolvePaletteMainColor(theme, actionColor) };

                if (action.link) {
                  return (
                    <MenuItem
                      key={`${category}-${index}`}
                      onClick={popover.handleClose}
                      component={Link}
                      href={action.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {getIconByName(action.icon, { sx: iconSx, fontSize: "small" })}
                      <ListItemText primary={action.label} />
                    </MenuItem>
                  );
                }
                return (
                  <MenuItem key={`${category}-${index}`} onClick={action.onClick}>
                    {getIconByName(action.icon, { sx: iconSx, fontSize: "small" })}
                    <ListItemText primary={action.label} />
                  </MenuItem>
                );
              })}
              {groupIndex < groupedActions.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </Box>
          );
        })}
      </Menu>
    </>
  );
};

BulkActionsMenu.propTypes = {
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  selectedCount: PropTypes.number,
};
