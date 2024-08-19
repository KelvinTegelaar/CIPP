import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';

const countryOptions = ['USA', 'Germany', 'Spain', 'Italy'];

const getInitialValues = (customer) => {
  return {
    address: customer?.street || '',
    country: customer?.country || '',
    email: customer?.email || '',
    name: customer?.name || '',
    phone: customer?.phone || '',
    submit: null
  };
};

const validationSchema = Yup.object({
  address: Yup
    .string()
    .max(255),
  country: Yup
    .string()
    .oneOf(countryOptions),
  email: Yup
    .string()
    .max(255)
    .email('Must be a valid email')
    .required('Email is required'),
  name: Yup
    .string()
    .max(255)
    .required('Name is required'),
  phone: Yup
    .string()
    .max(255)
});

export const CustomerDialog = (props) => {
  const { action = 'create', customer, open = false, onClose } = props;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(customer),
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        if (action === 'update') {
          // Do API call
          toast.success('Customer updated');
        } else {
          // Do API call
          toast.success('Customer created');
        }

        helpers.resetForm();
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);

        // You might want to return the created/updated customer instead
        // and let the parent component handle the redirect or other post action.

        onClose?.();
      } catch (err) {
        console.error(err);
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

  if (action === 'update' && !customer) {
    return null;
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      TransitionProps={{
        onExited: () => formik.resetForm()
      }}
    >
      <DialogTitle>
        {action === 'update' ? 'Update Customer' : 'Create Customer'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            error={!!(formik.touched.email && formik.errors.email)}
            fullWidth
            helperText={formik.touched.email && formik.errors.email}
            label="Email address"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            required
            type="email"
            value={formik.values.email}
          />
          <TextField
            error={!!(formik.touched.name && formik.errors.name)}
            fullWidth
            helperText={formik.touched.name && formik.errors.name}
            label="Name"
            name="name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            required
            value={formik.values.name}
          />
          <TextField
            error={!!(formik.touched.phone && formik.errors.phone)}
            fullWidth
            helperText={formik.touched.phone && formik.errors.phone}
            label="Phone number"
            name="phone"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.phone}
          />
          <TextField
            error={!!(formik.touched.country && formik.errors.country)}
            fullWidth
            helperText={formik.touched.country && formik.errors.country}
            label="Country"
            name="country"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            select
            value={formik.values.country}
          >
            {countryOptions.map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            error={!!(formik.touched.address && formik.errors.address)}
            fullWidth
            helperText={formik.touched.address && formik.errors.address}
            label="Street"
            name="address"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.address}
          />
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
        >
          Cancel
        </Button>
        <Button
          disabled={formik.isSubmitting}
          onClick={() => { formik.handleSubmit(); }}
          variant="contained"
        >
          {action === 'update' ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CustomerDialog.propTypes = {
  action: PropTypes.oneOf(['create', 'update']),
  customer: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool
};
