import React, { useState } from "react";
import { Button, Alert, Box } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { PersonAdd } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippHVEUserDrawer = ({
  buttonText = "Add HVE User",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      displayName: "",
      password: "",
      primarySMTPAddress: "",
    },
  });

  const createHVEUser = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["Mailboxes"],
  });

  const handleSubmit = () => {
    const formData = formControl.getValues();
    const postData = {
      tenantFilter: formData.tenantFilter,
      displayName: formData.displayName,
      password: formData.password,
      primarySMTPAddress: formData.primarySMTPAddress,
    };
    createHVEUser.mutate({
      url: "/api/ExecHVEUser",
      data: postData,
      relatedQueryKeys: ["Mailboxes"],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: userSettingsDefaults.currentTenant,
      displayName: "",
      password: "",
      primarySMTPAddress: "",
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<PersonAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add HVE User"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={createHVEUser.isLoading}
            >
              {createHVEUser.isLoading
                ? "Creating User..."
                : createHVEUser.isSuccess
                ? "Create Another User"
                : "Create HVE User"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box>
                <strong>HVE SMTP Configuration Settings:</strong>
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                  <li>
                    <strong>Server:</strong> smtp-hve.office365.com
                  </li>
                  <li>
                    <strong>Port:</strong> 587
                  </li>
                  <li>
                    <strong>Encryption:</strong> STARTTLS
                  </li>
                  <li>
                    <strong>TLS Support:</strong> TLS 1.2 and TLS 1.3
                  </li>
                </Box>
                <Box sx={{ mt: 1, fontSize: "0.875rem", fontStyle: "italic" }}>
                  Use these settings to configure your email client for HVE access.
                </Box>
              </Box>
            </Alert>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Display Name"
              name="displayName"
              formControl={formControl}
              validators={{ required: "Display name is required" }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="password"
              fullWidth
              label="Password"
              name="password"
              inputType="password"
              formControl={formControl}
              validators={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Primary SMTP Address"
              name="primarySMTPAddress"
              formControl={formControl}
              validators={{
                required: "Primary SMTP address is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address format",
                },
              }}
            />
          </Grid>

          <CippApiResults apiObject={createHVEUser} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
