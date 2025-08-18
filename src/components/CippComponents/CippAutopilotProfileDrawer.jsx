import React, { useState } from "react";
import { Divider, Button } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { AccountCircle } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import languageList from "/src/data/languageList.json";
import { ApiPostCall } from "../../api/ApiCall";

export const CippAutopilotProfileDrawer = ({
  buttonText = "Add Profile",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      DisplayName: "",
      Description: "",
      DeviceNameTemplate: "",
      languages: null,
      CollectHash: true,
      Assignto: true,
      DeploymentMode: true,
      HideTerms: true,
      HidePrivacy: true,
      HideChangeAccount: true,
      NotLocalAdmin: true,
      allowWhiteglove: true,
      Autokeyboard: true,
    },
  });

  const createProfile = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["Autopilot Profiles"],
  });

  const handleSubmit = () => {
    const formData = formControl.getValues();
    createProfile.mutate({
      url: "/api/AddAutopilotConfig",
      data: formData,
      relatedQueryKeys: ["Autopilot Profiles"],
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
        startIcon={<AccountCircle />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Autopilot Profile Wizard"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={createProfile.isLoading}
            >
              {createProfile.isLoading
                ? "Creating..."
                : createProfile.isSuccess
                ? "Create Another"
                : "Create Profile"}
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
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Display Name"
              name="DisplayName"
              formControl={formControl}
              validators={{ required: "Display Name is required" }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Language"
              name="languages"
              options={languageList.map(({ language, tag, "Geographic area": geographicArea }) => ({
                value: tag,
                label: `${language} - ${geographicArea}`, // Format as "language - geographic area" for display
              }))}
              formControl={formControl}
              multiple={false}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Description"
              name="Description"
              formControl={formControl}
              placeholder="Leave blank for none"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Unique Name Template"
              name="DeviceNameTemplate"
              formControl={formControl}
              placeholder="Leave blank for none"
            />
          </Grid>

          {/* Switches */}
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Convert all targeted devices to Autopilot"
              name="CollectHash"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Assign to all devices"
              name="Assignto"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Self-deploying mode"
              name="DeploymentMode"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Hide Terms and conditions"
              name="HideTerms"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Hide Privacy Settings"
              name="HidePrivacy"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Hide Change Account Options"
              name="HideChangeAccount"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Setup user as standard user (Leave unchecked to setup user as local admin)"
              name="NotLocalAdmin"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Allow White Glove OOBE"
              name="allowWhiteglove"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Automatically configure keyboard"
              name="Autokeyboard"
              formControl={formControl}
            />
          </Grid>

          <CippApiResults apiObject={createProfile} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};