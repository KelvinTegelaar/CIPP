import { useState } from "react";
import { Button, Link, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { GroupAdd, Delete } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippBulkInviteGuestDrawer = ({
  buttonText = "Bulk Invite Guests",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);
  const initialState = useSettings();

  const fields = ["displayName", "mail", "redirectUri"];

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: initialState.currentTenant,
      sendInvite: true,
      message: "",
      bulkGuests: [],
    },
  });

  const bulkGuestsData = useWatch({ control: formControl.control, name: "bulkGuests" });

  const inviteGuestsBulk = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Users-${initialState.currentTenant}`],
  });

  formControl.register("bulkGuests", {
    validate: (value) => Array.isArray(value) && value.length > 0,
  });

  const handleRemoveItem = (row) => {
    if (row === undefined) return false;
    const currentData = formControl.getValues("bulkGuests") || [];
    // Match Bulk User drawer behavior first (reference equality)
    let index = currentData.findIndex((item) => item === row);

    // Fallback: table/CSV layers can change object references
    if (index < 0) {
      const normalize = (value) =>
        String(value ?? "")
          .trim()
          .toLowerCase();
      const targetDisplayName = normalize(row?.displayName);
      const targetMail = normalize(row?.mail);
      const targetRedirectUri = normalize(row?.redirectUri);

      index = currentData.findIndex((item) => {
        return (
          normalize(item?.displayName) === targetDisplayName &&
          normalize(item?.mail) === targetMail &&
          normalize(item?.redirectUri) === targetRedirectUri
        );
      });
    }

    if (index < 0) return false;
    const newData = [...currentData];
    newData.splice(index, 1);
    formControl.setValue("bulkGuests", newData, { shouldValidate: true });
  };

  const handleAddItem = () => {
    const newRowData = formControl.getValues("addrow");
    if (!newRowData) return;

    const nextRow = {
      displayName: newRowData.displayName ?? "",
      mail: newRowData.mail ?? "",
      redirectUri: newRowData.redirectUri ?? "",
    };

    if (!nextRow.displayName || !nextRow.mail) {
      return;
    }

    const currentData = formControl.getValues("bulkGuests") || [];
    formControl.setValue("bulkGuests", [...currentData, nextRow], { shouldValidate: true });
    setAddRowDialogOpen(false);
    formControl.reset({
      ...formControl.getValues(),
      addrow: {},
    });
  };

  const handleSubmit = () => {
    const formData = formControl.getValues();
    const tenantFilter = formData.tenantFilter;

    const payload = (formData.bulkGuests || []).map((row) => ({
      tenantFilter,
      displayName: row?.displayName ?? "",
      mail: row?.mail ?? "",
      redirectUri: row?.redirectUri ?? "",
      message: formData.message ?? "",
      sendInvite: !!formData.sendInvite,
    }));

    inviteGuestsBulk.mutate({
      url: "/api/AddGuest",
      bulkRequest: true,
      data: payload,
      relatedQueryKeys: [`Users-${initialState.currentTenant}`],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: initialState.currentTenant,
      sendInvite: true,
      message: "",
      bulkGuests: [],
    });
  };

  const actions = [
    {
      icon: <Delete />,
      label: "Delete Row",
      confirmText: "Are you sure you want to delete this row?",
      customFunction: handleRemoveItem,
      noConfirm: true,
    },
  ];

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<GroupAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Bulk Invite Guest Users"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={
                inviteGuestsBulk.isLoading || !bulkGuestsData || bulkGuestsData.length === 0
              }
            >
              {inviteGuestsBulk.isLoading
                ? "Sending Invites..."
                : inviteGuestsBulk.isSuccess
                  ? "Send More Invites"
                  : "Send Invites"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              fullWidth
              label="Send invite via e-mail"
              name="sendInvite"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Custom invite message"
              name="message"
              multiline
              minRows={3}
              placeholder="Optional message included in all invite emails"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Link
              href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(
                fields.join(",") + "\n",
              )}`}
              download="BulkGuestInvite.csv"
            >
              Download Example CSV
            </Link>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent type="CSVReader" name="bulkGuests" formControl={formControl} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button size="small" onClick={() => setAddRowDialogOpen(true)}>
              Add Guest Manually
            </Button>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippDataTable
              actions={actions}
              title="Guest Preview"
              data={bulkGuestsData || []}
              simple={false}
              simpleColumns={fields}
              noCard={true}
            />
          </Grid>

          <CippApiResults apiObject={inviteGuestsBulk} />
        </Grid>

        <Dialog
          open={addRowDialogOpen}
          onClose={() => setAddRowDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add a new guest</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ py: 1 }}>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  name="addrow.displayName"
                  label="Display Name"
                  type="textField"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  name="addrow.mail"
                  label="E-mail Address"
                  type="textField"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  name="addrow.redirectUri"
                  label="Redirect URL"
                  type="textField"
                  formControl={formControl}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setAddRowDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddItem}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </CippOffCanvas>
    </>
  );
};
