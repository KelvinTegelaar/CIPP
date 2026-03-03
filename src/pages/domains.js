import Head from "next/head";
import { useRef } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDialog } from "../hooks/use-dialog";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { CippDataTable } from "../components/CippTable/CippDataTable";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ApiPostCall } from "../api/ApiCall";
import { useFormik } from "formik";

const Page = () => {
  const ref = useRef();
  const createDialog = useDialog();
  const domainPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: "users",
  });

  const formik = useFormik({
    initialValues: {
      domainName: "",
    },
    onSubmit: async (values, helpers) => {
      try {
        domainPostRequest.mutate({ url: "/api/AddCustomDomain", ...values });
        helpers.resetForm();
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Head>
        <title>Devices</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <ReactQueryDevtools />

        <Container maxWidth="xl" sx={{ height: "100%" }}>
          <Stack spacing={4} sx={{ height: "100%" }}>
            <Card
              sx={{
                display: "flex",
              }}
            >
              <Divider />
              <CippDataTable
                title="Domains"
                cardButton={<Button onClick={createDialog.handleOpen}>Add Domain</Button>}
                actions={[
                  {
                    label: "Delete domain",
                    type: "GET",
                    url: "api/DeleteCustomDomain",
                    data: { domain: "Domain" },
                    icon: <TrashIcon />,
                  },
                ]}
                simple={false}
                api={{ url: "api/ListCustomDomains" }}
                columns={[
                  {
                    header: "Domain",
                    accessorKey: "Domain",
                  },
                  {
                    header: "Status",
                    accessorKey: "Status",
                  },
                ]}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
      <Dialog fullWidth maxWidth="sm" onClose={createDialog.handleClose} open={createDialog.open}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              To add a domain to your instance, set your preferred CNAME to your CIPP default
              domain, then add the domain here.
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Name"
                name="domainName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
            </Stack>
          </DialogContent>
          <DialogContent>
            {domainPostRequest.isPending && (
              <Alert severity="info">
                <CircularProgress size={15} /> Adding domain...
              </Alert>
            )}
            {domainPostRequest.isError && (
              <Alert severity="error">
                Error adding domain: {domainPostRequest.error.response.data}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={createDialog.handleClose}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Add Domain
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
