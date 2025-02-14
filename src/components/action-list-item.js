import PropTypes from "prop-types";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

export const ActionListItem = (props) => {
  const { icon, label, link, onClick, ...other } = props;

  const handleClick = (event) => {
    if (link) {
      if (event.type === "auxclick" && event.button === 1) {
        // Middle mouse button click
        window.open(link, "_blank");
      } else if (event.type === "click") {
        // Left mouse button click
        window.open(link, "_blank");
      }
    } else if (onClick) {
      onClick(event);
    }
  };

  return (
    <ListItemButton {...other} onClick={handleClick} onAuxClick={handleClick}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

ActionListItem.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  link: PropTypes.string,
  onClick: PropTypes.func,
};
