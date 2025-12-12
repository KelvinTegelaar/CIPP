import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Grid } from "@mui/system";
const initialValues = {
  newPassword: "",
  password: "",
  submit: null,
};

const validationSchema = Yup.object({
  newPassword: Yup.string().min(7).max(255).required("New password is required"),
  password: Yup.string().min(7).max(255).required("Old password is required"),
});

export const AccountPassword = (props) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        toast.success("Password changed");
        helpers.resetForm();
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
      } catch (err) {
        console.error(err);
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ md: 5, xs: 12 }}>
            <Typography variant="h6">Change password</Typography>
          </Grid>
          <Grid size={{ md: 7, xs: 12 }}>
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Old password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                />
                <TextField
                  error={!!(formik.touched.newPassword && formik.errors.newPassword)}
                  fullWidth
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                  label="New password"
                  name="newPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.newPassword}
                />
              </Stack>
              {formik.errors.submit && (
                <FormHelperText error sx={{ mt: 2 }}>
                  {formik.errors.submit}
                </FormHelperText>
              )}
              <Box sx={{ mt: 2 }}>
                <Button size="large" type="submit" variant="contained">
                  Change password
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
