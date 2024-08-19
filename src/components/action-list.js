import PropTypes from 'prop-types';
import { List } from '@mui/material';

export const ActionList = (props) => {
  const { children } = props;

  return (
    <List
      dense
      sx={{
        backgroundColor: (theme) => theme.palette.mode === 'dark'
          ? 'neutral.900'
          : 'neutral.50'
      }}
    >
      {children}
    </List>
  );
};

ActionList.propTypes = {
  children: PropTypes.node
};
