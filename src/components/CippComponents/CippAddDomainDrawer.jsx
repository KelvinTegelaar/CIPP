import { useState, useEffect } from "react";
import { Button, Box, Alert } from "@mui/material";
import { useForm, useFormState } from "react-hook-form";
import { AddCircleOutline } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import { Stack } from "@mui/system";
import { CippFormComponent } from "./CippFormComponent";

export const CippAddDomainDrawer = ({
  buttonText = "Add Domain",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  const createDomain = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: [`Domains - ${userSettingsDefaults.currentTenant}`],
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  useEffect(() => {
    if (createDomain.isSuccess) {
      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
      });
    }
  }, [createDomain.isSuccess]);

  const handleSubmit = (values) => {
    createDomain.mutate({
      url: "/api/AddDomain",
      data: values,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: userSettingsDefaults.currentTenant,
    });
  };

  const formFields = [
    {
      type: "textField",
      name: "domain",
      label: "Domain Name",
      placeholder: "example.com",
      required: "Domain name is required",
    },
  ];

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<AddCircleOutline />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Domain"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={createDomain} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={
                  createDomain.isPending || !isValid || (!isDirty && !createDomain.isSuccess)
                }
              >
                {createDomain.isPending
                  ? "Adding Domain..."
                  : createDomain.isSuccess
                  ? "Add Another Domain"
                  : "Add Domain"}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Alert severity="info">
            Add a new domain to the current tenant. Ensure that the appropriate DNS records are
            configured by checking the verification and service records after adding the domain. You
            can find these in the "More info" section once the domain is added.
          </Alert>
          <CippFormComponent
            formControl={formControl}
            fields={formFields}
            name="domain"
            label="Domain Name"
          />
        </Stack>
      </CippOffCanvas>
    </>
  );
};
