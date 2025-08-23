import React, { useState } from "react";
import { Divider, Button } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { PostAdd } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";

export const CippAutopilotStatusPageDrawer = ({
  buttonText = "Add Status Page",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      TimeOutInMinutes: "",
      ErrorMessage: "",
      ShowProgress: false,
      EnableLog: false,
      OBEEOnly: false,
      blockDevice: false,
      Allowretry: false,
      AllowReset: false,
      AllowFail: false,
    },
  });

  const createStatusPage = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["Autopilot Status Pages"],
  });

  const handleSubmit = () => {
    const formData = formControl.getValues();
    createStatusPage.mutate({
      url: "/api/AddEnrollment",
      data: formData,
      relatedQueryKeys: ["Autopilot Status Pages"],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset();
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<PostAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Autopilot Status Page Wizard"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={createStatusPage.isLoading}
            >
              {createStatusPage.isLoading
                ? "Creating..."
                : createStatusPage.isSuccess
                ? "Create Another"
                : "Create Status Page"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          {/* Tenant Selector */}
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              label="Select Tenants"
              formControl={formControl}
              name="selectedTenants"
              type="multiple"
              allTenants={true}
              preselectedEnabled={true}
              validators={{ required: "At least one tenant must be selected" }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Form Fields */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Timeout in minutes"
              name="TimeOutInMinutes"
              formControl={formControl}
              placeholder="60"
              validators={{ required: "Timeout is required" }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Custom Error Message"
              name="ErrorMessage"
              formControl={formControl}
              placeholder="Leave blank to not set."
            />
          </Grid>

          {/* Switches */}
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Show progress to users"
              name="ShowProgress"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Turn on log collection"
              name="EnableLog"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Show status page only with OOBE setup"
              name="OBEEOnly"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Block device usage during setup"
              name="blockDevice"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Allow retry"
              name="Allowretry"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Allow reset"
              name="AllowReset"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Allow users to use device if setup fails"
              name="AllowFail"
              formControl={formControl}
            />
          </Grid>

          <CippApiResults apiObject={createStatusPage} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};