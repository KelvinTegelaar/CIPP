import PropTypes from "prop-types";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

export const ActionListItem = (props) => {
  const { icon, label, ...other } = props;

  return (
    <ListItemButton {...other}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

ActionListItem.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
};
