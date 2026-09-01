import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useMockedUser } from "../../../hooks/use-mocked-user";

const companySizeOptions = ["1-10", "11-30", "31-50", "50+"];

const initialValues = {
  companyName: "Devias IO",
  companySize: "1-10",
  email: "chen.simmons@devias.io",
  jobTitle: "Operation",
  name: "Chen Simmons",
  submit: null,
};

const validationSchema = Yup.object({
  companyName: Yup.string().max(255).required("Company name is required"),
  companySize: Yup.string().max(255).oneOf(companySizeOptions).required("Company size is required"),
  email: Yup.string().max(255).email("Must be a valid email").required("Email is required"),
  jobTitle: Yup.string().max(255).required("Job name is required"),
  name: Yup.string().max(255).required("Name is required"),
});

export const AccountDetails = (props) => {
  const user = useMockedUser();
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        toast.success("Settings saved");
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
            <Typography variant="h6">Settings</Typography>
          </Grid>
          <Grid size={{ md: 7, xs: 12 }}>
            <Stack alignItems="center" direction="row" spacing={2} sx={{ mb: 3 }}>
              <Avatar
                src={user.avatar}
                sx={{
                  height: 64,
                  width: 64,
                }}
              />
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button size="small" type="button" variant="outlined">
                    Change
                  </Button>
                  <Button color="inherit" size="small" type="button">
                    Delete
                  </Button>
                </Stack>
                <Typography color="text.secondary" variant="caption">
                  Recommended dimensions: 200x200, maximum file size: 5MB
                </Typography>
              </Stack>
            </Stack>
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2}>
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
                <TextField
                  error={!!(formik.touched.jobTitle && formik.errors.jobTitle)}
                  fullWidth
                  helperText={formik.touched.jobTitle && formik.errors.jobTitle}
                  label="Job title"
                  name="jobTitle"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.jobTitle}
                />
                <TextField
                  error={!!(formik.touched.companyName && formik.errors.companyName)}
                  fullWidth
                  helperText={formik.touched.companyName && formik.errors.companyName}
                  label="Company name"
                  name="companyName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.companyName}
                />
                <TextField
                  error={!!(formik.touched.companySize && formik.errors.companySize)}
                  fullWidth
                  helperText={formik.touched.companySize && formik.errors.companySize}
                  label="Company size"
                  name="companySize"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  select
                  value={formik.values.companySize}
                >
                  {companySizeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              {formik.errors.submit && (
                <FormHelperText error sx={{ mt: 2 }}>
                  {formik.errors.submit}
                </FormHelperText>
              )}
              <Box sx={{ mt: 2 }}>
                <Button size="large" type="submit" variant="contained">
                  Save settings
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
