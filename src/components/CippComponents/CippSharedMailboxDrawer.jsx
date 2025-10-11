import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { Add } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormDomainSelector } from "./CippFormDomainSelector";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import { Grid } from "@mui/system";

export const CippSharedMailboxDrawer = ({
  buttonText = "Add Shared Mailbox",
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

  const createSharedMailbox = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["Mailboxes"],
  });

  const handleSubmit = () => {
    const formData = formControl.getValues();
    const postData = {
      tenantID: tenantDomain,
      displayName: formData.displayName,
      username: formData.username,
      domain: formData.domain?.value,
    };
    createSharedMailbox.mutate({
      url: "/api/AddSharedMailbox",
      data: postData,
      relatedQueryKeys: ["Mailboxes"],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      displayName: "",
      username: "",
      domain: null,
    });
  };

  // Reset form on successful creation, preserving the selected domain
  useEffect(() => {
    if (createSharedMailbox.isSuccess) {
      const domain = formControl.getValues("domain");
      formControl.reset({
        displayName: "",
        username: "",
        domain: domain,
      });
    }
  }, [createSharedMailbox.isSuccess, formControl]);

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<Add />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Shared Mailbox"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={createSharedMailbox.isLoading}
            >
              {createSharedMailbox.isLoading
                ? "Creating Mailbox..."
                : createSharedMailbox.isSuccess
                ? "Create Another Mailbox"
                : "Create Shared Mailbox"}
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
              label="Display Name"
              name="displayName"
              formControl={formControl}
              validators={{ required: "Display Name is required" }}
            />
          </Grid>

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
              label="Domain"
              required
            />
          </Grid>

          <CippApiResults apiObject={createSharedMailbox} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
