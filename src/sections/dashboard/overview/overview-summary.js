import PropTypes from 'prop-types';
import { Avatar, Card, CardActions, Divider, Stack, Typography } from '@mui/material';

export const OverviewSummary = (props) => {
  const { action, value, icon, label, ...other } = props;

  return (
    <Card {...other}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        sx={{ p: 2 }}
      >
        <Avatar
          sx={{
            backgroundColor: 'primary.alpha12',
            color: 'primary.main'
          }}
        >
          {icon}
        </Avatar>
        <div>
          <Typography
            color="text.secondary"
            variant="overline"
          >
            {label}
          </Typography>
          <Typography variant="h6">
            {value}
          </Typography>
        </div>
      </Stack>
      <Divider />
      <CardActions
        sx={{
          px: 3,
          py: 1
        }}
      >
        {action}
      </CardActions>
    </Card>
  );
};

OverviewSummary.propTypes = {
  action: PropTypes.node,
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired
};
