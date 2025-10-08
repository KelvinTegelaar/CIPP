import React, { useState, useEffect } from "react";
import { Button, InputAdornment, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { ListAlt } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormDomainSelector } from "./CippFormDomainSelector";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippAddRoomListDrawer = ({
  buttonText = "Add Room List",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();
  const tenantDomain = userSettingsDefaults.currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      username: "",
      primDomain: null,
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  const addRoomList = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`RoomLists-${tenantDomain}`],
  });

  // Reset form fields on successful creation
  useEffect(() => {
    if (addRoomList.isSuccess) {
      formControl.reset({
        displayName: "",
        username: "",
        primDomain: null,
      });
    }
  }, [addRoomList.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }

    const formData = formControl.getValues();
    const shippedValues = {
      tenantFilter: tenantDomain,
      displayName: formData.displayName?.trim(),
      username: formData.username?.trim(),
      primDomain: formData.primDomain,
    };

    addRoomList.mutate({
      url: "/api/AddRoomList",
      data: shippedValues,
      relatedQueryKeys: [`RoomLists-${tenantDomain}`],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      displayName: "",
      username: "",
      primDomain: null,
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<ListAlt />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Room List"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={addRoomList.isLoading || !isValid}
            >
              {addRoomList.isLoading
                ? "Creating..."
                : addRoomList.isSuccess
                ? "Create Another"
                : "Create Room List"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              formControl={formControl}
              name="displayName"
              label="Display Name"
              validators={{ required: "Display Name is required" }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              formControl={formControl}
              name="username"
              label="Username"
              validators={{
                required: "Username is required",
                pattern: {
                  value: /^[a-zA-Z0-9\-_\.]+$/,
                  message:
                    "Username can only contain letters, numbers, hyphens, underscores, and periods",
                },
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">@</InputAdornment>,
              }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormDomainSelector
              formControl={formControl}
              name="primDomain"
              label="Primary Domain"
              validators={{ required: "Domain is required" }}
            />
          </Grid>

          <CippApiResults apiObject={addRoomList} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
