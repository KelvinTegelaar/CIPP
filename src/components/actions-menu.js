import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem, SvgIcon } from '@mui/material';
import { usePopover } from '../hooks/use-popover';

export const ActionsMenu = (props) => {
  const { actions = [], label = 'Actions', ...other } = props;
  const popover = usePopover();

  return (
    <>
      <Button
        endIcon={(
          <SvgIcon fontSize="small">
            <ChevronDownIcon />
          </SvgIcon>
        )}
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        size="large"
        variant="contained"
        {...other}>
        {label}
      </Button>
      <Menu
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        open={popover.open}
        onClose={popover.handleClose}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top'
        }}
      >
        {actions.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              popover.handleClose();
              item.handler?.();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

ActionsMenu.propTypes = {
  actions: PropTypes.array,
  label: PropTypes.string
};
