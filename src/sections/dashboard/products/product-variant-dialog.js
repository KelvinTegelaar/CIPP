import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  SvgIcon,
  TextField,
  Typography
} from '@mui/material';
import { FileDropzone } from '../../../components/file-dropzone';
import { createResourceId } from '../../../utils/create-resource-id';
import { alpha } from '@mui/material/styles';

const currencyOptions = [
  {
    label: 'EUR',
    value: '€'
  },
  {
    label: 'USD',
    value: '$'
  }
];

const getInitialValues = (variant) => {
  return {
    currency: variant?.currency || '$',
    description: variant?.description || '',
    image: variant?.image || '',
    name: variant?.name || '',
    price: variant?.price || 0,
    sku: variant?.sku || '',
    submit: null
  };
};

const validationSchema = Yup.object({
  currency: Yup
    .string()
    .oneOf(currencyOptions.map((option) => option.value))
    .required('Currency is required'),
  description: Yup
    .string()
    .max(1024)
    .required('Description name is required'),
  image: Yup.string(),
  name: Yup
    .string()
    .max(255)
    .required('Variant name is required'),
  price: Yup
    .number()
    .required('Price is required'),
  sku: Yup
    .string()
    .max(255)
    .required('Sku is required')
});

export const ProductVariantDialog = (props) => {
  const {
    action = 'create',
    onClose,
    onVariantCreated,
    onVariantUpdated,
    open = false,
    variant,
    ...other
  } = props;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(variant),
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        if (action === 'update') {
          // Do API call
          const updated = {
            ...variant,
            currency: values.currency,
            description: values.description,
            image: values.image,
            name: values.name,
            price: values.price,
            sku: values.sku
          };

          toast.success('Variant updated');
          onVariantUpdated?.(updated);
        } else {
          // Do API call
          const created = {
            id: createResourceId(),
            createdAt: new Date().getTime(),
            currency: values.currency,
            description: values.description,
            image: values.image,
            name: values.name,
            price: values.price,
            quantity: 1,
            sku: values.sku
          };

          toast.success('Variant created');
          onVariantCreated?.(created);
        }

        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
      } catch (err) {
        console.error(err);
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

  const currencyLabel = currencyOptions.find((option) => option.value
    === formik.values.currency)?.label;

  if (action === 'update' && !variant) {
    return null;
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      TransitionProps={{
        onExited: () => {
          formik.resetForm();
        }
      }}
      {...other}>
      <DialogTitle>
        {action === 'update' ? 'Update Variant' : 'Add Variant'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            error={!!(formik.touched.name && formik.errors.name)}
            fullWidth
            helperText={formik.touched.name && formik.errors.name}
            label="Name"
            name="name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="e.g Green"
            value={formik.values.name}
          />
          <TextField
            error={!!(formik.touched.sku && formik.errors.sku)}
            fullWidth
            helperText={formik.touched.sku && formik.errors.sku}
            label="SKU"
            name="sku"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="D-293TX"
            value={formik.values.sku}
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
            placeholder="Product description"
            rows={4}
            value={formik.values.description}
          />
          <TextField
            error={!!(formik.touched.currency && formik.errors.currency)}
            helperText={formik.touched.currency && formik.errors.currency}
            label="Currency"
            name="currency"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            select
            sx={{ minWidth: 236 }}
            value={formik.values.currency}
          >
            {currencyOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            error={!!(formik.touched.price && formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
            label="Price"
            name="price"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="number"
            sx={{ maxWidth: 236 }}
            value={formik.values.price}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {currencyLabel}
                </InputAdornment>
              )
            }}
          />
          <Stack spacing={2}>
            <Typography variant="subtitle2">
              Image
            </Typography>
            {formik.values.image
              ? (
                <Box
                  sx={{
                    backgroundImage: `url(${formik.values.image})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    borderRadius: 1,
                    height: 126,
                    overflow: 'hidden',
                    position: 'relative',
                    width: 126,
                    '&:hover': {
                      '& > div': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      alignItems: 'center',
                      backgroundColor: (theme) => alpha(theme.palette.neutral[900], 0.8),
                      display: 'flex',
                      height: '100%',
                      justifyContent: 'center',
                      left: 0,
                      opacity: 0,
                      position: 'absolute',
                      top: 0,
                      width: '100%'
                    }}
                  >
                    <IconButton
                      color="error"
                      onClick={() => formik.setFieldValue('image', '')}
                    >
                      <SvgIcon fontSize="small">
                        <TrashIcon />
                      </SvgIcon>
                    </IconButton>
                  </Box>
                </Box>
              )
              : (
                <FileDropzone
                  accept={{ 'image/*': [] }}
                  onDrop={(files) => formik.setFieldValue('image', URL.createObjectURL(files[0]))}
                  sx={{
                    height: 126,
                    width: 126
                  }}
                />
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
        >
          Cancel
        </Button>
        <Button
          onClick={() => { formik.handleSubmit(); }}
          variant="contained"
        >
          {action === 'update' ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ProductVariantDialog.propTypes = {
  action: PropTypes.oneOf(['create', 'update']),
  onClose: PropTypes.func,
  onVariantCreated: PropTypes.func,
  onVariantUpdated: PropTypes.func,
  open: PropTypes.bool,
  variant: PropTypes.object
};
