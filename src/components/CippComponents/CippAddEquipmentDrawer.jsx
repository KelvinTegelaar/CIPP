import React, { useState, useEffect } from "react";
import { Button, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { AddBusiness } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormDomainSelector } from "./CippFormDomainSelector";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippAddEquipmentDrawer = ({
  buttonText = "Add Equipment Mailbox",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      username: "",
      domain: null,
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  const addEquipment = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`EquipmentMailbox-${tenantDomain}`],
  });

  // Reset form fields on successful creation
  useEffect(() => {
    if (addEquipment.isSuccess) {
      formControl.reset();
    }
  }, [addEquipment.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }

    const formData = formControl.getValues();
    const shippedValues = {
      tenantID: tenantDomain,
      domain: formData.domain?.value,
      displayName: formData.displayName.trim(),
      username: formData.username.trim(),
      userPrincipalName: formData.username.trim() + "@" + (formData.domain?.value || "").trim(),
    };

    addEquipment.mutate({
      url: "/api/AddEquipmentMailbox",
      data: shippedValues,
      relatedQueryKeys: [`EquipmentMailbox-${tenantDomain}`],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      displayName: "",
      username: "",
      domain: null,
      location: "",
      department: "",
      company: "",
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<AddBusiness />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Equipment Mailbox"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={addEquipment.isLoading || !isValid}
            >
              {addEquipment.isLoading
                ? "Creating..."
                : addEquipment.isSuccess
                ? "Create Another"
                : "Create Equipment Mailbox"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          {/* Display Name */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Display Name"
              name="displayName"
              formControl={formControl}
              validators={{ required: "Display Name is required" }}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Username and Domain */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Username"
              name="username"
              formControl={formControl}
              validators={{ required: "Username is required" }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormDomainSelector
              formControl={formControl}
              name="domain"
              label="Primary Domain name"
              validators={{ required: "Please select a domain" }}
            />
          </Grid>

          <CippApiResults apiObject={addEquipment} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
