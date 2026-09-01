import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Stack,
  TextField
} from '@mui/material';
import { paths } from '../../../paths';

const initialValues = {
  customerEmail: '',
  customerName: '',
  submit: null
};

const validationSchema = Yup.object({
  customerEmail: Yup
    .string()
    .max(255)
    .email('Must be a valid email')
    .required('Customer email is required'),
  customerName: Yup
    .string()
    .max(255)
    .required('Customer name is required')
});

export const OrderCreateDialog = (props) => {
  const { open = false, onClose, ...other } = props;
  const router = useRouter();
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        // Do API call

        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        helpers.resetForm();

        // You might want to return the created order instead
        // and let the parent component handle the redirect or other post action.

        router.push(paths.dashboard.orders.details);
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
      <DialogTitle>
        Create Order
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TextField
            error={!!(formik.touched.customerName && formik.errors.customerName)}
            fullWidth
            helperText={formik.touched.customerName ? formik.errors.customerName : ''}
            label="Customer Name"
            name="customerName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.customerName}
          />
          <TextField
            error={!!(formik.touched.customerEmail && formik.errors.customerEmail)}
            fullWidth
            helperText={formik.touched.customerEmail ? formik.errors.customerEmail : ''}
            label="Customer Email"
            name="customerEmail"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="email"
            value={formik.values.customerEmail}
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
          onClick={() => { formik.handleSubmit(); }}
          variant="contained"
          disabled={formik.isSubmitting}
        >
          Create Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OrderCreateDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
