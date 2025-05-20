import React, { useState, useEffect } from "react";
import { Alert, Skeleton, Stack, Typography, Button, Box } from "@mui/material";
import { ApiGetCall } from "/src/api/ApiCall";
import { CippFormComponent } from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";

const AppDeploymentTemplateForm = ({
  formControl,
  templateData,
  templateLoading,
  isEditing,
  isCopy,
  updatePermissions,
  onSubmit,
  refetchKey,
}) => {
  const [selectedPermissionSet, setSelectedPermissionSet] = useState(null);

  // When templateData changes, update the form
  useEffect(() => {
    if (!isEditing && !isCopy) {
      formControl.setValue("templateName", "New App Deployment Template");
      formControl.setValue("appType", "EnterpriseApp");
    } else if (templateData && isCopy) {
      // When copying, we want to load the template data but not the ID
      if (templateData[0]) {
        const copyName = `Copy of ${templateData[0].TemplateName}`;
        formControl.setValue("templateName", copyName);
        formControl.setValue("appId", {
          label: `${templateData[0].AppName || "Unknown"} (${templateData[0].AppId})`,
          value: templateData[0].AppId,
          addedFields: {
            displayName: templateData[0].AppName,
          },
        });
        formControl.setValue("permissionSetId", {
          label: templateData[0].PermissionSetName || "Custom Permissions",
          value: templateData[0].PermissionSetId,
        });
      }
    } else if (templateData) {
      // For editing, load all template data
      if (templateData[0]) {
        formControl.setValue("templateName", templateData[0].TemplateName);
        formControl.setValue("appId", {
          label: `${templateData[0].AppName || "Unknown"} (${templateData[0].AppId})`,
          value: templateData[0].AppId,
          addedFields: {
            displayName: templateData[0].AppName,
          },
        });
        formControl.setValue("permissionSetId", {
          label: templateData[0].PermissionSetName || "Custom Permissions",
          value: templateData[0].PermissionSetId,
        });
      }
    }
  }, [templateData, isCopy, isEditing, formControl]);

  // Watch for app selection changes to update template name
  const selectedApp = formControl.watch("appId");

  useEffect(() => {
    // Update template name when app is selected if we're in add mode and name hasn't been manually changed
    if (selectedApp && !isEditing && !isCopy) {
      const currentName = formControl.getValues("templateName");
      // Only update if it's still the default or empty
      if (currentName === "New App Deployment Template" || !currentName) {
        // Extract app name from the label (format is usually "AppName (AppId)")
        const appName = selectedApp.label.split(" (")[0];
        if (appName) {
          formControl.setValue("templateName", `${appName} Template`);
        }
      }
    }
  }, [selectedApp, isEditing, isCopy, formControl]);

  // Handle form submission
  const handleSubmit = (data) => {
    // Remove console.log in production
    const appDisplayName =
      data.appId?.addedFields?.displayName ||
      (data.appId?.label ? data.appId.label.split(" (")[0] : undefined);

    const payload = {
      TemplateName: data.templateName,
      AppId: data.appId?.value,
      AppName: appDisplayName,
      PermissionSetId: data.permissionSetId?.value,
      PermissionSetName: data.permissionSetId?.label,
      Permissions: data.permissionSetId?.addedFields?.Permissions,
    };

    if (isEditing && !isCopy && templateData?.[0]?.TemplateId) {
      payload.TemplateId = templateData[0].TemplateId;
    }

    // Store values before submission to set them back afterward
    const currentValues = {
      templateName: data.templateName,
      appId: data.appId,
      permissionSetId: data.permissionSetId,
    };

    onSubmit(payload);

    // After submission, set the values back to what they were but mark as clean
    // This will only apply to add page, as edit will get refreshed data
    if (!isEditing) {
      setTimeout(() => {
        formControl.setValue("templateName", currentValues.templateName, { shouldDirty: false });
        formControl.setValue("appId", currentValues.appId, { shouldDirty: false });
        formControl.setValue("permissionSetId", currentValues.permissionSetId, {
          shouldDirty: false,
        });
      }, 100);
    }
  };

  return (
    <Stack spacing={2}>
      {templateLoading && <Skeleton variant="rectangular" height={300} />}
      {(!templateLoading || !isEditing) && (
        <>
          <Typography variant="body2">
            {isCopy
              ? "Create a copy of an existing app deployment template with your own modifications."
              : isEditing
              ? "Edit this app deployment template."
              : "Create a new app deployment template to define application deployment settings."}
          </Typography>
          <Alert severity="info">
            App deployment templates allow you to define an application with its permissions that
            can be deployed to multiple tenants. Select an application and permission set to create
            a template.
          </Alert>

          <CippFormComponent
            formControl={formControl}
            name="templateName"
            label="Template Name"
            type="textField"
            validators={{ required: "Template name is required" }}
          />

          <CippFormComponent
            formControl={formControl}
            name="appId"
            label="Select Application"
            type="autoComplete"
            api={{
              url: "/api/ExecServicePrincipals",
              queryKey: "execServicePrincipals",
              dataKey: "Results",
              labelField: (item) => `${item.displayName} (${item.appId})`,
              valueField: "appId",
              addedField: {
                displayName: "displayName",
              },
              showRefresh: true,
            }}
            multiple={false}
            validators={{ required: "Application is required" }}
          />

          <CippFormComponent
            formControl={formControl}
            name="permissionSetId"
            label="Select Permission Set"
            type="autoComplete"
            api={{
              url: "/api/ExecAppPermissionTemplate",
              queryKey: "execAppPermissionTemplate",
              labelField: (item) => item.TemplateName,
              valueField: "TemplateId",
              addedField: {
                Permissions: "Permissions",
              },
              showRefresh: true,
            }}
            multiple={false}
            validators={{ required: "Permission Set is required" }}
          />

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={updatePermissions.isPending}
              >
                {isEditing ? "Update Template" : "Create Template"}
              </Button>
            </Box>
            <CippApiResults apiObject={updatePermissions} />
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default AppDeploymentTemplateForm;
