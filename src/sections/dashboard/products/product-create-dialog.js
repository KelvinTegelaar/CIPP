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
  Stack,
  TextField
} from '@mui/material';

const initialValues = {
  description: '',
  name: '',
  submit: null
};

const validationSchema = Yup.object({
  description: Yup.string().max(500).required('Description is required'),
  name: Yup.string().max(255).required('Name is required')
});

export const ProductCreateDialog = (props) => {
  const { open = false, onClose, ...other } = props;
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        toast.success('Product created');
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        helpers.resetForm();
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
      <DialogTitle>
        Create Product
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TextField
            error={!!(formik.touched.name && formik.errors.name)}
            fullWidth
            helperText={formik.touched.name && formik.errors.name}
            label="Product name"
            name="name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
          />
          <TextField
            error={!!(formik.touched.description && formik.errors.description)}
            fullWidth
            helperText={formik.touched.description && formik.errors.description}
            label="Description"
            multiline
            name="description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            rows={4}
            value={formik.values.description}
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
          Create Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ProductCreateDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
