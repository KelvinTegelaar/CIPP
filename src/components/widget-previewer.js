import PropTypes from 'prop-types';
import { Card, Stack, Typography } from '@mui/material';

export const WidgetPreviewer = (props) => {
  const { title, description, children, ...other } = props;

  return (
    <Stack
      spacing={2}
      {...other}>
      <Stack spacing={1}>
        {typeof title === 'string'
          ? (
            <Typography variant="subtitle1">
              {title}
            </Typography>
          )
          : title}
        {typeof description === 'string'
          ? (
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {description}
            </Typography>
          )
          : description}
      </Stack>
      <Card>
        {children}
      </Card>
    </Stack>
  );
};

WidgetPreviewer.propTypes = {
  children: PropTypes.node.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};
