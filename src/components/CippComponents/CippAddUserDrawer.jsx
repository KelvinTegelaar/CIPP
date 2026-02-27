import React, { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import { useForm, useWatch, useFormState } from "react-hook-form";
import { PersonAdd } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import CippAddEditUser from "../CippFormPages/CippAddEditUser";
import { Stack } from "@mui/system";

export const CippAddUserDrawer = ({
  buttonText = "Add User",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      usageLocation: userSettingsDefaults.usageLocation,
    },
  });

  const createUser = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: [`Users-${userSettingsDefaults.currentTenant}`],
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  const formValues = useWatch({ control: formControl.control, name: "userProperties" });

  useEffect(() => {
    if (formValues) {
      const { userPrincipalName, usageLocation, ...restFields } = formValues.addedFields || {};
      let newFields = { ...restFields };
      if (userPrincipalName) {
        const [mailNickname, domainNamePart] = userPrincipalName.split("@");
        if (mailNickname) {
          newFields.mailNickname = mailNickname;
        }
        if (domainNamePart) {
          newFields.primDomain = { label: domainNamePart, value: domainNamePart };
        }
      }
      if (usageLocation) {
        newFields.usageLocation = { label: usageLocation, value: usageLocation };
      }
      newFields.tenantFilter = userSettingsDefaults.currentTenant;

      // Preserve the currently selected template when copying properties
      const currentTemplate = formControl.getValues("userTemplate");
      if (currentTemplate) {
        newFields.userTemplate = currentTemplate;
      }

      formControl.reset(newFields);
    }
  }, [formValues]);

  useEffect(() => {
    if (createUser.isSuccess) {
      const resetValues = {
        tenantFilter: userSettingsDefaults.currentTenant,
        usageLocation: userSettingsDefaults.usageLocation,
      };

      // Preserve the default template if it exists
      const currentTemplate = formControl.getValues("userTemplate");
      if (currentTemplate?.addedFields?.defaultForTenant) {
        resetValues.userTemplate = currentTemplate;
      }

      formControl.reset(resetValues);
    }
  }, [createUser.isSuccess]);

  const handleSubmit = async () => {
    const isFormValid = await formControl.trigger();
    if (!isFormValid) {
      return;
    }
    const values = formControl.getValues();
    Object.keys(values).forEach((key) => {
      if (values[key] === "" || values[key] === null) {
        delete values[key];
      }
    });
    createUser.mutate({
      url: "/api/AddUser",
      data: values,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    const resetValues = {
      tenantFilter: userSettingsDefaults.currentTenant,
      usageLocation: userSettingsDefaults.usageLocation,
    };

    // Preserve the default template if it exists
    const currentTemplate = formControl.getValues("userTemplate");
    if (currentTemplate?.addedFields?.defaultForTenant) {
      resetValues.userTemplate = currentTemplate;
    }

    formControl.reset(resetValues);
  };

  const handleOpenDrawer = () => {
    const resetValues = {
      tenantFilter: userSettingsDefaults.currentTenant,
      usageLocation: userSettingsDefaults.usageLocation,
    };

    const currentTemplate = formControl.getValues("userTemplate");
    if (currentTemplate?.addedFields?.defaultForTenant) {
      resetValues.userTemplate = currentTemplate;
    }

    formControl.reset(resetValues);
    setDrawerVisible(true);
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={handleOpenDrawer}
        startIcon={<PersonAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add User"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={createUser} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={createUser.isPending || !isValid || (!isDirty && !createUser.isSuccess)}
              >
                {createUser.isPending
                  ? "Creating User..."
                  : createUser.isSuccess
                    ? "Create Another User"
                    : "Create User"}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </Stack>
        }
      >
        <Box sx={{ my: 2 }}>
          <CippAddEditUser
            formControl={formControl}
            userSettingsDefaults={userSettingsDefaults}
            formType="add"
          />
        </Box>
      </CippOffCanvas>
    </>
  );
};
