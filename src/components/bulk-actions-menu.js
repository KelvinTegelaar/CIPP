import PropTypes from "prop-types";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { Button, Link, ListItemText, Menu, MenuItem, SvgIcon } from "@mui/material";
import { usePopover } from "../hooks/use-popover";
import { FilePresent, Laptop, Mail, Share, Shield, ShieldMoon, PrecisionManufacturing, BarChart } from "@mui/icons-material";
import { GlobeAltIcon, UsersIcon, ServerIcon } from "@heroicons/react/24/outline";

function getIconByName(iconName) {
  switch (iconName) {
    case "GlobeAltIcon":
      return <GlobeAltIcon />;
    case "Mail":
      return <Mail />;
    case "UsersIcon":
      return <UsersIcon />;
    case "FilePresent":
      return <FilePresent />;
    case "ServerIcon":
      return <ServerIcon />;
    case "Laptop":
      return <Laptop />;
    case "Share":
      return <Share />;
    case "Shield":
      return <Shield />;
    case "ShieldMoon":
      return <ShieldMoon />;
    case "PrecisionManufacturing":
      return <PrecisionManufacturing />;
    case "BarChart":
      return <BarChart />;
    default:
      return null;
  }
}

export const BulkActionsMenu = (props) => {
  const { buttonName, sx, row, actions = [], ...other } = props;
  const popover = usePopover();

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
        {actions.map((action, index) => {
          if (action.link) {
            return (
              <MenuItem
                key={index}
                onClick={popover.handleClose}
                component={Link}
                href={action.link}
                target="_blank"
                rel="noreferrer"
              >
                <SvgIcon sx={{ mr: 1 }}>{getIconByName(action.icon)}</SvgIcon>
                <ListItemText primary={action.label} />
              </MenuItem>
            );
          } else {
            return (
              <MenuItem key={index} onClick={action.onClick}>
                <SvgIcon sx={{ mr: 1 }}>{getIconByName(action.icon)}</SvgIcon>
                <ListItemText primary={action.label} />
              </MenuItem>
            );
          }
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
