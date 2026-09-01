import PropTypes from 'prop-types';
import ExclamationCircleIcon from '@heroicons/react/24/outline/ExclamationCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';

const iconMap = {
  error: (
    <SvgIcon
      color="error"
      fontSize="large"
    >
      <ExclamationCircleIcon />
    </SvgIcon>
  ),
  warning: (
    <SvgIcon
      color="warning"
      fontSize="large"
    >
      <ExclamationTriangleIcon />
    </SvgIcon>
  ),
  info: (
    <SvgIcon
      color="info"
      fontSize="large"
    >
      <ExclamationCircleIcon />
    </SvgIcon>
  )
};

export const ConfirmationDialog = (props) => {
  const {
    message = '',
    onCancel,
    onConfirm,
    open = false,
    title,
    variant = 'info',
    confirmLoading = false,
    ...other
  } = props;

  const icon = iconMap[variant];

  const handleDialogClose = (event, reason) => {
    if (confirmLoading) {
      return;
    }
    if (onCancel) {
      onCancel(event);
    }
  };

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      onClose={handleDialogClose}
      open={open}
      {...other}>
      <DialogTitle>
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          {icon}
          <Typography variant="inherit">
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          disabled={confirmLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={confirmLoading}
          onClick={onConfirm}
          variant="contained"
        >
          {confirmLoading ? (
            <CircularProgress color="inherit" size={22} />
          ) : (
            'Confirm'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  message: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['error', 'warning', 'info']),
  confirmLoading: PropTypes.bool
};
