import { useState } from "react";
import { Button, Link, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { GroupAdd, Delete } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormLicenseSelector } from "./CippFormLicenseSelector";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import countryList from "/src/data/countryList.json";

export const CippBulkUserDrawer = ({
  buttonText = "Bulk Add Users",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);
  const initialState = useSettings();

  const addedFields = initialState?.defaultAttributes
    ? initialState.userAttributes.map((item) => item.label)
    : [];

  const fields = [
    "givenName",
    "surName",
    "displayName",
    "mailNickName",
    "domain",
    "JobTitle",
    "streetAddress",
    "PostalCode",
    "City",
    "State",
    "Department",
    "MobilePhone",
    "businessPhones",
    ...addedFields,
  ];

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: initialState.currentTenant,
      usageLocation: initialState.usageLocation || "US",
      bulkUser: [],
      licenses: [],
    },
  });

  const bulkUserData = useWatch({ control: formControl.control, name: "bulkUser" });

  const createBulkUsers = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["Users"],
  });

  // Register the bulkUser field with validation
  formControl.register("bulkUser", {
    validate: (value) => Array.isArray(value) && value.length > 0,
  });

  const handleRemoveItem = (row) => {
    if (row === undefined) return false;
    const currentData = formControl.getValues("bulkUser") || [];
    const index = currentData.findIndex((item) => item === row);
    const newData = [...currentData];
    newData.splice(index, 1);
    formControl.setValue("bulkUser", newData, { shouldValidate: true });
  };

  const handleAddItem = () => {
    const newRowData = formControl.getValues("addrow");
    if (newRowData === undefined) return false;
    const currentData = formControl.getValues("bulkUser") || [];
    const newData = [...currentData, newRowData];
    formControl.setValue("bulkUser", newData, { shouldValidate: true });
    setAddRowDialogOpen(false);
    formControl.reset({
      ...formControl.getValues(),
      addrow: {},
    });
  };

  const handleSubmit = () => {
    const formData = formControl.getValues();
    createBulkUsers.mutate({
      url: "/api/AddUserBulk",
      data: formData,
      relatedQueryKeys: ["Users"],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: initialState.currentTenant,
      usageLocation: initialState.usageLocation || "US",
      bulkUser: [],
      licenses: [],
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
        title="Bulk Add Users"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={createBulkUsers.isLoading || !bulkUserData || bulkUserData.length === 0}
            >
              {createBulkUsers.isLoading
                ? "Creating Users..."
                : createBulkUsers.isSuccess
                ? "Create More Users"
                : "Create Users"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Usage Location"
              fullWidth
              name="usageLocation"
              multiple={false}
              defaultValue="US"
              options={countryList.map(({ Code, Name }) => ({
                label: Name,
                value: Code,
              }))}
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormLicenseSelector
              fullWidth
              label="Assign License"
              name="licenses"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Link
              href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(
                fields.join(",") + "\n"
              )}`}
              download="BulkUser.csv"
            >
              Download Example CSV
            </Link>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent type="CSVReader" name="bulkUser" formControl={formControl} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button size="small" onClick={() => setAddRowDialogOpen(true)}>
              Add User Manually
            </Button>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippDataTable
              actions={actions}
              title="User Preview"
              data={bulkUserData || []}
              simple={false}
              simpleColumns={fields}
              noCard={true}
            />
          </Grid>

          <CippApiResults apiObject={createBulkUsers} />
        </Grid>

        <Dialog
          open={addRowDialogOpen}
          onClose={() => setAddRowDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add a new user</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ py: 1 }}>
              {fields.map((field) => (
                <Grid size={{ md: 6, xs: 12 }} key={field}>
                  <CippFormComponent
                    name={`addrow.${field}`}
                    label={getCippTranslation(field)}
                    type="textField"
                    formControl={formControl}
                  />
                </Grid>
              ))}
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
