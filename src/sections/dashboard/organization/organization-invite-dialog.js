import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { wait } from '../../../utils/wait';

const roleOptions = [
  {
    description: 'Edit access',
    label: 'Editor',
    value: 'editor'
  },
  {
    description: 'Full access & billing',
    label: 'Administrator',
    value: 'administrator'
  }
];

const initialValues = {
  email: '',
  name: '',
  role: 'editor',
  submit: null
};

const validationSchema = Yup.object({
  email: Yup
    .string()
    .max(255)
    .email('Must be a valid email')
    .required('Email is required'),
  name: Yup
    .string()
    .max(255)
    .required('Name is required'),
  role: Yup
    .mixed()
    .oneOf(roleOptions.map((option) => option.value))
});

export const OrganizationInviteDialog = (props) => {
  const { open = false, onClose, ...other } = props;
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await wait(250);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        onClose?.();
      } catch (err) {
        console.error(err);
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      TransitionProps={{
        onExited: () => formik.resetForm()
      }}
      {...other}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          Invite a member
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              error={!!(formik.touched.name && formik.errors.name)}
              fullWidth
              helperText={formik.touched.name && formik.errors.name}
              label="Name"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            <TextField
              error={!!(formik.touched.email && formik.errors.email)}
              fullWidth
              helperText={formik.touched.email && formik.errors.email}
              label="Email address"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
            />
            <Stack spacing={2}>
              <Typography variant="subtitle2">
                Role
              </Typography>
              <Card variant="outlined">
                <RadioGroup
                  name="role"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.role}
                >
                  {roleOptions.map((option, index) => {
                    const hasDivider = roleOptions.length > index + 1;

                    return (
                      <Fragment key={option.value}>
                        <FormControlLabel
                          disableTypography
                          control={<Radio />}
                          label={(
                            <div>
                              <Typography>
                                {option.label}
                              </Typography>
                              <Typography
                                color="text.secondary"
                                variant="caption"
                              >
                                {option.description}
                              </Typography>
                            </div>
                          )}
                          sx={{ p: 1.5 }}
                          value={option.value}
                        />
                        {hasDivider && <Divider />}
                      </Fragment>
                    );
                  })}
                </RadioGroup>
              </Card>
              {formik.touched.role && formik.errors.role && (
                <FormHelperText error>
                  {formik.errors.role}
                </FormHelperText>
              )}
            </Stack>
          </Stack>
          {formik.errors.submit && (
            <FormHelperText
              error
              sx={{ mt: 2 }}
            >
              {formik.errors.submit}
            </FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            Send Invite
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

OrganizationInviteDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
