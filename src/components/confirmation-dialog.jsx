import PropTypes from 'prop-types';
import { CippIcons } from '../utils/icon-registry';
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
      <CippIcons.ExclamationCircleIcon />
    </SvgIcon>
  ),
  warning: (
    <SvgIcon
      color="warning"
      fontSize="large"
    >
      <CippIcons.ExclamationTriangleIcon />
    </SvgIcon>
  ),
  info: (
    <SvgIcon
      color="info"
      fontSize="large"
    >
      <CippIcons.ExclamationCircleIcon />
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
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center"
          }}
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
