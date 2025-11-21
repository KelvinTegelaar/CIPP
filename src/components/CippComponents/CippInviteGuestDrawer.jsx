import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { Send } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippInviteGuestDrawer = ({
  buttonText = "Invite Guest",
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
      mail: "",
      redirectUri: "",
      sendInvite: false,
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  const inviteGuest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Users-${userSettingsDefaults.currentTenant}`],
  });

  // Reset form fields on successful invitation
  useEffect(() => {
    if (inviteGuest.isSuccess) {
      formControl.reset();
    }
  }, [inviteGuest.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }
    const formData = formControl.getValues();
    inviteGuest.mutate({
      url: "/api/AddGuest",
      data: formData,
      relatedQueryKeys: [`Users-${userSettingsDefaults.currentTenant}`],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: userSettingsDefaults.currentTenant,
      displayName: "",
      mail: "",
      redirectUri: "",
      sendInvite: false,
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<Send />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Invite Guest User"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={inviteGuest.isLoading || !isValid}
            >
              {inviteGuest.isLoading
                ? "Sending Invite..."
                : inviteGuest.isSuccess
                ? "Send Another Invite"
                : "Send Invite"}
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
              type="textField"
              fullWidth
              label="Display Name"
              name="displayName"
              formControl={formControl}
              validators={{ required: "Display name is required" }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="E-mail Address"
              name="mail"
              formControl={formControl}
              validators={{
                required: "Email address is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
            />
          </Grid>
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Redirect URL"
              name="redirectUri"
              placeholder="Optional Redirect URL defaults to https://myapps.microsoft.com if blank"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="switch"
              fullWidth
              label="Send invite via e-mail"
              name="sendInvite"
              formControl={formControl}
            />
          </Grid>

          <CippApiResults apiObject={inviteGuest} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
