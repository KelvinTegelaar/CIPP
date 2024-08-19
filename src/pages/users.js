import Head from "next/head";
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
  Icon,
  IconButton,
  Stack,
  SvgIcon,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useDialog } from "../hooks/use-dialog";
import { Layout as DashboardLayout } from "../layouts/dashboard";
import { CippDataTable } from "../components/CippTable/CippDataTable";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CopyAll, Delete, Update } from "@mui/icons-material";
import { CippAutoComplete } from "../components/CippComponents/CippAutocomplete";
import { ApiPostCall } from "../api/ApiCall";
import { useMemo, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

const Page = () => {
  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: "users",
  });
  const handleRoleChange = (userid, email, role) => {
    actionPostRequest.mutate({
      url: `/api/UpdateUser?userid=${userid}&role=${role}&email=${email}`,
      data: {},
    });
  };
  const createDialog = useDialog();
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let combinedRoles = "";
    if (role.includes("superadmin")) {
      //superadmin needs atleast superadmin +admin, so if superadmin is selected, we add admin as well
      combinedRoles = role.includes("superadmin") ? role.join(",") : role.concat("admin").join(",");
    } else {
      combinedRoles = role.join(",");
    }
    const requestData = {
      email: formData.get("email"),
      role: combinedRoles,
      ManagementAccess: formData.get("managementAccess") === "on",
    };

    actionPostRequest.mutate({ url: "/api/InviteUsers", ...requestData });
  };
  const [role, setRole] = useState([]);
  const columns = [
    {
      header: "Email",
      accessorKey: "DisplayName",
    },
    {
      accessorKey: "Role",
      header: "Roles",
      minSize: 450,
      Cell: ({ cell, row, table }) => (
        <>
          <CippAutoComplete
            name={`role-${cell.row.original.Name}`}
            isFetching={actionPostRequest.isPending}
            options={["admin", "editor", "readonly", "superadmin"]}
            onChange={(e, nv) => handleRoleChange(row.original.Name, row.original.DisplayName, nv)}
            defaultValue={cell
              .getValue()
              .split(",")
              .filter((x) => x !== "anonymous" && x !== "authenticated")}
          />
        </>
      ),
    },
    {
      header: "Management Access",
      accessorKey: "ManagementAccess",
      Cell: ({ cell, row, table }) => (cell.getValue() ? "Yes" : "No"),
    },
  ];
  return (
    <>
      <Head>
        <title>Users</title>
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
                cardButton={<Button onClick={createDialog.handleOpen}>Add User</Button>}
                title="Users"
                noDataButton={{
                  createText: "Create a user",
                  createFunction: createDialog.handleOpen,
                }}
                actions={[
                  {
                    label: "Grant Management Access",
                    type: "GET",
                    url: "api/UpdateUser",
                    data: { userid: "Name", email: "DisplayName", managementAccess: true },
                    icon: <Update />,
                    multiPost: false,
                  },
                  {
                    label: "Remove Management Access",
                    type: "GET",
                    url: "api/UpdateUser",
                    data: { userid: "Name", email: "DisplayName", managementAccess: false },
                    icon: <Update />,
                    multiPost: false,
                  },
                  {
                    label: "Delete User",
                    type: "POST",
                    url: "api/DeleteUser",
                    data: { email: "DisplayName" },
                    icon: <Delete />,
                    multiPost: false,
                  },
                ]}
                simple={false}
                api={{ url: "api/ListUsers" }}
                columns={columns}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
      <Dialog fullWidth maxWidth="sm" onClose={createDialog.handleClose} open={createDialog.open}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add User</DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <TextField fullWidth label="User Principal Name / Email" name="email" />
              <CippAutoComplete
                name="role"
                label="Role"
                isFetching={actionPostRequest.isPending}
                options={["admin", "editor", "readonly", "superadmin"]}
                onChange={(e, nv) => setRole(nv)}
              />

              <label>Management Access</label>
              <Switch label="Management Access" name="managementAccess" />
            </Stack>
          </DialogContent>
          <DialogContent>
            {actionPostRequest.isPending && (
              <Alert severity="info">
                <CircularProgress size={15} /> Generating Invite...
              </Alert>
            )}
            {actionPostRequest.isError && (
              <Alert severity="error">
                Error generating invite: {actionPostRequest.error.message}
              </Alert>
            )}
            {actionPostRequest.isSuccess && (
              <>
                <Alert severity="success">
                  Successfully created invite. Please copy the invite URL and send this to the user.
                </Alert>
                <Box
                  component="section"
                  sx={{ p: 2, border: "1px dashed grey", overflow: "hidden" }}
                >
                  {actionPostRequest.data.data.Link}
                  <CopyToClipboard text={actionPostRequest.data.data.Link}>
                    <Tooltip title="Copy to clipboard">
                      <IconButton size="small">
                        <SvgIcon>
                          <CopyAll />
                        </SvgIcon>
                      </IconButton>
                    </Tooltip>
                  </CopyToClipboard>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={createDialog.handleClose}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Add User
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
