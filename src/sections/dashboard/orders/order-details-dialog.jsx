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

const statusOptions = [
  {
    label: 'Placed',
    value: 'placed'
  },
  {
    label: 'Processed',
    value: 'processed'
  },
  {
    label: 'Delivered',
    value: 'delivered'
  },
  {
    label: 'Complete',
    value: 'complete'
  }
];

const countryOptions = [
  {
    value: 'USA',
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Austin']
  },
  {
    value: 'Germany',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Dortmund', 'Bremen']
  },
  {
    value: 'Spain',
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Málaga', 'Sevilla']
  },
  {
    value: 'Italy',
    cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo']
  }
];

const getInitialValues = (order) => {
  return {
    city: order?.address?.city || '',
    country: order?.address?.country || '',
    email: order?.customer?.email || '',
    phone: order?.customer?.phone || '',
    status: order?.status || '',
    street: order?.address?.street || '',
    submit: null
  };
};

const validationSchema = Yup.object({
  address: Yup
    .string()
    .max(255)
    .required('Address is required'),
  country: Yup
    .string()
    .max(255)
    .oneOf(countryOptions.map((option) => option.value))
    .required('Country is required'),
  email: Yup
    .string()
    .max(255)
    .email('Must be a valid email')
    .required('Email is required'),
  phone: Yup
    .string()
    .max(255)
    .required('Phone number is required'),
  city: Yup
    .string()
    .max(255)
    .required('City is required'),
  status: Yup
    .string()
    .max(255)
    .required('Status is required')
});

export const OrderDetailsDialog = (props) => {
  const { open = false, onClose, order } = props;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(order),
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        toast.success('Order updated');
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

  const cityOptions = countryOptions.find((option) => option.value
    === formik.values.country)?.cities || [];

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
        Edit order
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TextField
            error={!!(formik.touched.email && formik.errors.email)}
            fullWidth
            helperText={formik.touched.email && formik.errors.email}
            label="Email"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="email"
            value={formik.values.email}
          />
          <TextField
            error={!!(formik.touched.street && formik.errors.street)}
            fullWidth
            helperText={formik.touched.street && formik.errors.street}
            label="Address"
            name="street"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.street}
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
            error={!!(formik.touched.status && formik.errors.status)}
            fullWidth
            helperText={formik.touched.status && formik.errors.status}
            label="Status"
            name="status"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            select
            value={formik.values.status}
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
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
                key={option.value}
                value={option.value}
              >
                {option.value}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            error={!!(formik.touched.city && formik.errors.city)}
            fullWidth
            disabled={!formik.values.country}
            helperText={formik.touched.city && formik.errors.city}
            label="City"
            name="city"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            select
            value={formik.values.city}
          >
            {cityOptions.map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </TextField>
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
          onClick={() => { formik.handleSubmit(); }}
          variant="contained"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OrderDetailsDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  order: PropTypes.object
};
