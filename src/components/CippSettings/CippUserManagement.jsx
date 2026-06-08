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
  const [bulkEditUsers, setBulkEditUsers] = useState(null);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: { UPN: "", Roles: [] },
  });

  const usersQuery = ApiGetCall({
    url: "/api/ListCIPPUsers",
    queryKey: "cippUsersList",
  });

  const userAction = ApiPostCall({
    relatedQueryKeys: ["cippUsersList"],
  });

  const pageData = usersQuery.data?.pages?.[0] ?? usersQuery.data ?? {};
  const allRoles = Array.isArray(pageData.AvailableRoles) ? pageData.AvailableRoles : [];
  const roleOptions = allRoles.map((r) => ({
    label: `${r.RoleName} (${r.Type})`,
    value: r.RoleName,
  }));
  const existingUsers = Array.isArray(pageData.Users) ? pageData.Users : [];
  const existingUpns = new Set(existingUsers.map((u) => u.UPN.toLowerCase()));

  const openAddDialog = () => {
    setEditingUser(null);
    formControl.reset({ UPN: "", Roles: [] });
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingUser(row);
    // Show only manual roles for editing — auto roles are managed by sync
    const editableRoles = (row.ManualRoles ?? row.Roles ?? []).map((r) => {
      const match = roleOptions.find((opt) => opt.value === r);
      return match ?? { label: r, value: r };
    });
    formControl.reset({ UPN: row.UPN, Roles: editableRoles });
    setDialogOpen(true);
  };

  const handleSaveUser = (data) => {
    const roles = Array.isArray(data.Roles) ? data.Roles.map((r) => r.value ?? r) : [data.Roles];

    // Bulk edit: apply same roles to all selected users
    const upns = bulkEditUsers ? bulkEditUsers.map((u) => u.UPN) : [data.UPN];

    upns.forEach((upn) => {
      userAction.mutate({
        url: "/api/ExecCIPPUsers",
        data: {
          Action: "AddUpdate",
          UPN: upn,
          Roles: roles,
        },
      });
    });

    formControl.reset({ UPN: "", Roles: [] });
    setEditingUser(null);
    setBulkEditUsers(null);
    setDialogOpen(false);
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
      customBulkHandler: ({ data, clearSelection }) => {
        setBulkEditUsers(data);
        setEditingUser(null);
        formControl.reset({ UPN: "", Roles: [] });
        setDialogOpen(true);
      },
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

  const sourceLabel = (source) => {
    switch (source) {
      case "Auto":
        return "Auto-synced from Entra groups";
      case "Both":
        return "Auto-synced + Manual";
      case "Manual":
        return "Manually assigned";
      default:
        return source || "—";
    }
  };

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
          <Typography variant="subtitle2" color="text.secondary">
            Source
          </Typography>
          <Typography variant="body2">{sourceLabel(row.Source)}</Typography>
        </Box>
        <Divider />
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Effective Roles
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(row.Roles ?? []).map((role, idx) => (
              <Chip key={idx} label={role} size="small" color="primary" variant="outlined" />
            ))}
          </Stack>
        </Box>
        {(row.ManualRoles ?? []).length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Manual Roles
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {row.ManualRoles.map((role, idx) => (
                  <Chip key={idx} label={role} size="small" color="info" variant="outlined" />
                ))}
              </Stack>
            </Box>
          </>
        )}
        {(row.AutoRoles ?? []).length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Auto Roles (from Entra groups)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {row.AutoRoles.map((role, idx) => (
                  <Chip key={idx} label={role} size="small" color="success" variant="outlined" />
                ))}
              </Stack>
            </Box>
          </>
        )}
        {row.LastSync && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Last Synced
              </Typography>
              <Typography variant="body2">
                {new Date(row.LastSync).toLocaleString()}
              </Typography>
            </Box>
          </>
        )}
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
        simpleColumns={["UPN", "Roles", "Source"]}
        offCanvas={offCanvas}
      />

      <CippApiResults apiObject={userAction} />

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setBulkEditUsers(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {bulkEditUsers
            ? `Bulk Edit Roles — ${bulkEditUsers.length} users`
            : editingUser
              ? `Edit Roles — ${editingUser.UPN}`
              : "Add CIPP User"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Alert severity="info">
              {bulkEditUsers
                ? `Set the manual roles for ${bulkEditUsers.length} selected users. This will replace their existing manual roles. Auto-synced roles from Entra groups will not be affected.`
                : editingUser
                  ? "Update the manually assigned roles for this user. Auto-synced roles from Entra groups are managed separately and will not be affected."
                  : "Add a user by their email address (UPN) and assign one or more roles. These are stored as manual assignments and won't be overwritten by the automatic Entra group sync."}
            </Alert>
            {bulkEditUsers && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Selected Users
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {bulkEditUsers.map((u, idx) => (
                    <Chip key={idx} label={u.UPN} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}
            {!editingUser && !bulkEditUsers && (
              <CippFormComponent
                type="textField"
                name="UPN"
                label="User Email (UPN)"
                placeholder="user@contoso.com"
                formControl={formControl}
                validators={{
                  required: "Email is required",
                  validate: (value) => {
                    if (existingUpns.has(value?.trim()?.toLowerCase())) {
                      return "This user already exists. Use Edit Roles to update their permissions.";
                    }
                    return true;
                  },
                }}
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
          <Button onClick={() => { setDialogOpen(false); setBulkEditUsers(null); }}>Cancel</Button>
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
