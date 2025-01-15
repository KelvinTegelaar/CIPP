import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Stack,
  TextField,
  Typography
} from '@mui/material';

const compositionOptions = ['Leather', 'Metal', 'Plastic', 'Organic'];

const tagOptions = ['Watch', 'Style', 'New', 'Promo', 'Discount', 'Refurbished'];

const getInitialValues = (product) => {
  return {
    brand: product?.brand || '',
    chargeTax: product?.chargeTax || true,
    description: product?.description || '',
    displayName: product?.displayName || '',
    composition: product?.composition || [],
    sku: product?.sku || '',
    submit: null,
    tags: product?.tags || []
  };
};

const validationSchema = Yup.object({
  brand: Yup.string().max(255).required('Brand is required'),
  chargeTax: Yup.boolean(),
  description: Yup.string().max(500).required('Description is required'),
  displayName: Yup.string().max(255).required('Display name is required'),
  composition: Yup.array(),
  sku: Yup.string().max(255).required('SKU is required'),
  tags: Yup.array()
});

export const ProductDetailsDialog = (props) => {
  const { open = false, onClose, product } = props;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(product),
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        // Do API call
        toast.success('Product updated');
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

  if (!product) {
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
        Edit Product
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={3}
            sx={{
              '& > *': {
                width: '50%'
              }
            }}
          >
            <TextField
              disabled
              error={!!(formik.touched.brand && formik.errors.brand)}
              fullWidth
              helperText={formik.touched.brand && formik.errors.brand}
              label="Brand name"
              name="brand"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.brand}
            />
            <TextField
              disabled
              error={!!(formik.touched.sku && formik.errors.sku)}
              fullWidth
              helperText={formik.touched.sku && formik.errors.sku}
              label="SKU"
              name="sku"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.sku}
            />
          </Stack>
          <TextField
            error={!!(formik.touched.displayName && formik.errors.displayName)}
            fullWidth
            helperText={formik.touched.displayName && formik.errors.displayName}
            label="Display name"
            name="displayName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.displayName}
          />
          <TextField
            error={!!(formik.touched.description && formik.errors.description)}
            fullWidth
            helperText={formik.touched.description ? formik.errors.description : ''}
            label="Description"
            multiline
            name="description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            rows={4}
            value={formik.values.description}
          />
          <Autocomplete
            filterSelectedOptions
            multiple
            onChange={(event, value) => { formik.setFieldValue('composition', value); }}
            options={compositionOptions}
            renderInput={(inputProps) => (
              <TextField
                error={!!(formik.touched.composition && formik.errors.composition)}
                helperText={formik.touched.composition ? formik.errors.composition : ''}
                label="Composition"
                placeholder="Feature"
                {...inputProps} />
            )}
            value={formik.values.composition}
          />
          <Autocomplete
            filterSelectedOptions
            multiple
            onChange={(event, value) => { formik.setFieldValue('tags', value); }}
            options={tagOptions}
            renderInput={(inputProps) => (
              <TextField
                error={!!(formik.touched.tags && formik.errors.tags)}
                helperText={formik.touched.tags ? formik.errors.tags : ''}
                label="Tags"
                placeholder="Tag"
                {...inputProps} />
            )}
            value={formik.values.tags}
          />
          <Stack
            alignItems="center"
            direction="row"
          >
            <Checkbox
              checked={formik.values.chargeTax}
              onChange={(event) => { formik.setFieldValue('chargeTax', event.target.checked); }}
            />
            <Typography>
              Charge tax on this product
            </Typography>
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

ProductDetailsDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  product: PropTypes.object
};
