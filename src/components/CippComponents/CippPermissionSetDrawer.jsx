import React, { useState, useEffect, useMemo } from "react";
import { Button, Typography, Alert, Box, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Edit, Add } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import CippAppPermissionBuilder from "./CippAppPermissionBuilder";

export const CippPermissionSetDrawer = ({
  buttonText = "New Permission Set",
  isEditMode = false,
  templateId = null,
  requiredPermissions = [],
  PermissionButton = Button,
  onSuccess = () => {},
  drawerVisible: controlledDrawerVisible,
  setDrawerVisible: controlledSetDrawerVisible,
  rowAction = false,
}) => {
  const [internalDrawerVisible, internalSetDrawerVisible] = useState(false);
  const drawerVisible =
    controlledDrawerVisible !== undefined ? controlledDrawerVisible : internalDrawerVisible;
  const setDrawerVisible =
    controlledSetDrawerVisible !== undefined
      ? controlledSetDrawerVisible
      : internalSetDrawerVisible;

  const [initialPermissions, setInitialPermissions] = useState(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // Fetch existing template data in edit mode
  const templateInfo = ApiGetCall({
    url: templateId ? `/api/ExecAppPermissionTemplate?TemplateId=${templateId}` : null,
    queryKey: templateId ? ["execAppPermissionTemplate", templateId, refetchKey] : null,
    waiting: !!drawerVisible && !!isEditMode && !!templateId,
  });

  // Default form values
  const defaultFormValues = useMemo(
    () => ({
      templateName: "",
    }),
    []
  );

  const formControl = useForm({
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  // API call for submit
  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ExecAppPermissionTemplate", "execAppPermissionTemplate"],
  });

  // Process template data for editing
  useEffect(() => {
    if (isEditMode && templateInfo.isSuccess && templateInfo.data) {
      const template = Array.isArray(templateInfo.data) ? templateInfo.data[0] : templateInfo.data;

      if (template) {
        setInitialPermissions({
          TemplateId: template.TemplateId,
          Permissions: template.Permissions,
          TemplateName: template.TemplateName,
        });
        formControl.setValue("templateName", template.TemplateName, {
          shouldValidate: true,
          shouldDirty: false,
        });
      }
    } else if (!isEditMode && drawerVisible) {
      // Initialize with empty structure for new templates
      setInitialPermissions({
        Permissions: {},
        TemplateName: "New Permission Set",
      });
      formControl.setValue("templateName", "New Permission Set");
    }
  }, [templateInfo.isSuccess, templateInfo.data, isEditMode, drawerVisible]);

  const handleUpdatePermissions = (data) => {
    let payload = {
      ...data,
    };

    if (isEditMode && templateId) {
      // For editing, include the template ID
      payload.TemplateId = templateId;
    }

    // Use the current value from the text field
    payload.TemplateName = formControl.getValues("templateName");

    updatePermissions.mutate(
      {
        url: "/api/ExecAppPermissionTemplate?Action=Save",
        data: payload,
        queryKey: "execAppPermissionTemplate",
      },
      {
        onSuccess: (data) => {
          if (onSuccess) {
            onSuccess(data);
          }
          // Refresh the data
          setRefetchKey((prev) => prev + 1);

          // Close the drawer after successful save
          setDrawerVisible(false);

          // Reset form for next use
          if (!isEditMode) {
            formControl.reset(defaultFormValues);
            setInitialPermissions(null);
          }
        },
      }
    );
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    if (!isEditMode) {
      formControl.reset(defaultFormValues);
      setInitialPermissions(null);
    }
  };

  return (
    <>
      {!rowAction && (
        <PermissionButton
          onClick={() => setDrawerVisible(true)}
          startIcon={isEditMode ? <Edit /> : <Add />}
          requiredPermissions={requiredPermissions}
        >
          {buttonText}
        </PermissionButton>
      )}
      <CippOffCanvas
        title={isEditMode ? `Edit Permission Set` : "Add Permission Set"}
        visible={drawerVisible}
        onClose={handleDrawerClose}
        size="xl"
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="body2">
              {isEditMode
                ? "Modify the permissions in this permission set. Any changes will affect all applications using this permission set."
                : "Create a new permission set to define a collection of application permissions."}
            </Typography>

            <Alert severity="info">
              Permission sets allow you to define collections of permissions that can be applied to
              applications consistently.
            </Alert>

            <CippFormComponent
              formControl={formControl}
              name="templateName"
              label="Permission Set Name"
              type="textField"
              required={true}
              validators={{ required: "Permission set name is required" }}
            />

            {templateInfo.isFetching && isEditMode && (
              <Alert severity="info">Loading permission set data...</Alert>
            )}

            {initialPermissions && !templateInfo.isFetching && (
              <>
                <Alert severity="info">
                  Choose the permissions you want to assign to this permission set. Microsoft Graph
                  is the default Service Principal added and you can choose to add additional
                  Service Principals as needed. Note that some Service Principals do not have any
                  published permissions to choose from.
                </Alert>

                <CippAppPermissionBuilder
                  formControl={formControl}
                  currentPermissions={initialPermissions}
                  onSubmit={handleUpdatePermissions}
                  updatePermissions={updatePermissions}
                  removePermissionConfirm={true}
                  appDisplayName={formControl.watch("templateName") || "New Permission Set"}
                  key={refetchKey}
                />
              </>
            )}

            <CippApiResults apiObject={updatePermissions} />
          </Stack>
        </Box>
      </CippOffCanvas>
    </>
  );
};

export default CippPermissionSetDrawer;
