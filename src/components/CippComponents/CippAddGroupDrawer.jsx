import React, { useState, useEffect } from "react";
import { CippIcons } from "../../utils/icon-registry"
import { Alert, Button, Box } from "@mui/material";
import { useForm, useFormState } from "react-hook-form";
import { Stack } from "@mui/system";
import { CippOffCanvas } from "./CippOffCanvas";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import CippAddGroupForm from "../CippFormPages/CippAddGroupForm";

export const CippAddGroupDrawer = ({
  buttonText = "Add Group",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  // The domain selector only auto-picks the default domain on mount, so the form is
  // remounted after each create to restore the same state as a fresh open.
  const [formResetKey, setFormResetKey] = useState(0);
  const { currentTenant } = useSettings();

  // Group creation targets a single tenant; under "All Tenants" the submit would post
  // tenantFilter=AllTenants, so it is blocked.
  const isAllTenants = !currentTenant || currentTenant === "AllTenants";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: { tenantFilter: currentTenant },
  });

  // Matches the Groups list queryKey so a new group shows up without a manual refresh
  const createGroup = ApiPostCall({
    relatedQueryKeys: [`groups-${currentTenant}`],
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  useEffect(() => {
    if (createGroup.isSuccess) {
      formControl.reset({ tenantFilter: currentTenant });
      setFormResetKey((key) => key + 1);
    }
  }, [createGroup.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    const isFormValid = await formControl.trigger();
    if (!isFormValid) {
      return;
    }
    const values = formControl.getValues();
    Object.keys(values).forEach((key) => {
      if (values[key] === "" || values[key] === null || values[key] === undefined) {
        delete values[key];
      }
    });
    createGroup.mutate({
      url: "/api/AddGroup",
      data: values,
    });
  };

  const handleCloseDrawer = (event, reason) => {
    // Closing resets the form, so a stray backdrop click or Escape would wipe the input.
    // The X and Close buttons call this without a reason.
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
    setDrawerVisible(false);
    formControl.reset({ tenantFilter: currentTenant });
  };

  const handleOpenDrawer = () => {
    formControl.reset({ tenantFilter: currentTenant });
    setDrawerVisible(true);
  };

  return (
    <>
      <PermissionButton
        {...(PermissionButton !== Button ? { requiredPermissions } : {})}
        onClick={handleOpenDrawer}
        startIcon={<CippIcons.GroupAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Group"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={createGroup} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={
                  isAllTenants ||
                  createGroup.isPending ||
                  !isValid ||
                  (!isDirty && !createGroup.isSuccess)
                }
              >
                {createGroup.isPending
                  ? "Creating Group..."
                  : createGroup.isSuccess
                    ? "Create Another Group"
                    : "Create Group"}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </Stack>
        }
      >
        <Box sx={{ my: 2 }}>
          {isAllTenants && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Group creation is single-tenant only. Select a specific tenant using the tenant
              selector before adding a group.
            </Alert>
          )}
          <CippAddGroupForm key={formResetKey} formControl={formControl} />
        </Box>
      </CippOffCanvas>
    </>
  );
};
