import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { TrashIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "../CippTable/CippDataTable";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";

export const CippUserManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: { UPN: "", Roles: [] },
  });

  const rolesQuery = ApiGetCall({
    url: "/api/ListCustomRole",
    queryKey: "customRoleList",
  });

  const userAction = ApiPostCall({
    relatedQueryKeys: ["cippUsersList"],
  });

  const allRoles = Array.isArray(rolesQuery.data) ? rolesQuery.data : [];
  const roleOptions = allRoles.map((r) => ({
    label: `${r.RoleName} (${r.Type})`,
    value: r.RoleName,
  }));

  const openAddDialog = () => {
    setEditingUser(null);
    formControl.reset({ UPN: "", Roles: [] });
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingUser(row);
    const currentRoles = (row.Roles ?? []).map((r) => {
      const match = roleOptions.find((opt) => opt.value === r);
      return match ?? { label: r, value: r };
    });
    formControl.reset({ UPN: row.UPN, Roles: currentRoles });
    setDialogOpen(true);
  };

  const handleSaveUser = (data) => {
    const roles = Array.isArray(data.Roles) ? data.Roles.map((r) => r.value ?? r) : [data.Roles];
    userAction.mutate(
      {
        url: "/api/ExecCIPPUsers",
        data: {
          Action: "AddUpdate",
          UPN: data.UPN,
          Roles: roles,
        },
      },
      {
        onSuccess: () => {
          formControl.reset({ UPN: "", Roles: [] });
          setEditingUser(null);
          setDialogOpen(false);
        },
      }
    );
  };

  const actions = [
    {
      label: "Edit Roles",
      icon: (
        <SvgIcon>
          <PencilIcon />
        </SvgIcon>
      ),
      noConfirm: true,
      customFunction: (row) => openEditDialog(row),
    },
    {
      label: "Delete User",
      icon: (
        <SvgIcon>
          <TrashIcon />
        </SvgIcon>
      ),
      confirmText: "Are you sure you want to remove this user's access to CIPP?",
      url: "/api/ExecCIPPUsers",
      type: "POST",
      data: {
        Action: "Delete",
        UPN: "UPN",
      },
      relatedQueryKeys: ["cippUsersList"],
    },
  ];

  const offCanvas = {
    children: (row) => (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Email / UPN
          </Typography>
          <Typography variant="body1">{row.UPN}</Typography>
        </Box>
        <Divider />
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Assigned Roles
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(row.Roles ?? []).map((role, idx) => (
              <Chip key={idx} label={role} size="small" color="primary" variant="outlined" />
            ))}
          </Stack>
        </Box>
      </Stack>
    ),
  };

  return (
    <Box>
      <CippDataTable
        actions={actions}
        title="CIPP Users"
        cardButton={
          <Button
            variant="contained"
            size="small"
            startIcon={
              <SvgIcon>
                <PlusIcon />
              </SvgIcon>
            }
            onClick={openAddDialog}
          >
            Add User
          </Button>
        }
        api={{
          url: "/api/ListCIPPUsers",
          dataKey: "Users",
        }}
        queryKey="cippUsersList"
        simpleColumns={["UPN", "Roles"]}
        offCanvas={offCanvas}
      />

      <CippApiResults apiObject={userAction} />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingUser ? `Edit Roles — ${editingUser.UPN}` : "Add CIPP User"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Alert severity="info">
              {editingUser
                ? "Update the roles assigned to this user."
                : "Add a user by their email address (UPN) and assign one or more roles. If the user already exists, their roles will be updated."}
            </Alert>
            {!editingUser && (
              <CippFormComponent
                type="textField"
                name="UPN"
                label="User Email (UPN)"
                placeholder="user@contoso.com"
                formControl={formControl}
                validators={{ required: "Email is required" }}
              />
            )}
            <CippFormComponent
              type="autoComplete"
              name="Roles"
              label="Roles"
              multiple={true}
              creatable={false}
              options={roleOptions}
              formControl={formControl}
              validators={{ required: "At least one role is required" }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={formControl.handleSubmit(handleSaveUser)}
            disabled={userAction.isPending}
          >
            {userAction.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CippUserManagement;
