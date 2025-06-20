import { useState, useEffect } from "react";
import { Alert, Skeleton, Stack, Typography, Button, Box } from "@mui/material";
import { CippFormComponent } from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { Grid } from "@mui/system";
import CippPermissionPreview from "./CippPermissionPreview";

const AppApprovalTemplateForm = ({
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
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // When templateData changes, update the form
  useEffect(() => {
    if (!isEditing && !isCopy) {
      formControl.setValue("templateName", "New App Deployment Template");
      formControl.setValue("appType", "EnterpriseApp");
      setPermissionsLoaded(false);
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

        // Set permission set and trigger loading of permissions
        const permissionSetValue = {
          label: templateData[0].PermissionSetName || "Custom Permissions",
          value: templateData[0].PermissionSetId,
          addedFields: {
            Permissions: templateData[0].Permissions || {},
          },
        };

        formControl.setValue("permissionSetId", permissionSetValue);
        setSelectedPermissionSet(permissionSetValue);
        setPermissionsLoaded(true);
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

        // Set permission set and trigger loading of permissions
        const permissionSetValue = {
          label: templateData[0].PermissionSetName || "Custom Permissions",
          value: templateData[0].PermissionSetId,
          addedFields: {
            Permissions: templateData[0].Permissions || {},
          },
        };

        formControl.setValue("permissionSetId", permissionSetValue);
        setSelectedPermissionSet(permissionSetValue);
        setPermissionsLoaded(true);
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

  // Watch for permission set selection changes
  const selectedPermissionSetValue = formControl.watch("permissionSetId");

  useEffect(() => {
    if (selectedPermissionSetValue?.value) {
      setSelectedPermissionSet(selectedPermissionSetValue);
      setPermissionsLoaded(true);
    } else {
      setSelectedPermissionSet(null);
      setPermissionsLoaded(false);
    }
  }, [selectedPermissionSetValue]);

  // Handle initial data loading for editing and copying
  useEffect(() => {
    // When editing or copying, ensure permission data is properly loaded
    if (isEditing || isCopy) {
      if (templateData?.[0]?.Permissions) {
        // Ensure permissions are immediately available for the preview
        setPermissionsLoaded(true);
      }
    }
  }, [isEditing, isCopy, templateData]);

  // Handle form submission
  const handleSubmit = (data) => {
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
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Stack spacing={2}>
          <Typography variant="h6">App Approval Template Details</Typography>
          {templateLoading && <Skeleton variant="rectangular" height={300} />}
          {(!templateLoading || !isEditing) && (
            <>
              <Alert severity="info">
                App approval templates allow you to define an application with its permissions that
                can be deployed to multiple tenants. Select a multi-tenant application and
                permission set to create a template. If your application is not listed, check the
                Supported account types in the App Registration properties in Entra.
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
                    signInAudience: "signInAudience",
                  },
                  dataFilter: (data) => {
                    return data.filter(
                      (item) => item.addedFields?.signInAudience === "AzureADMultipleOrgs"
                    );
                  },
                  showRefresh: true,
                }}
                multiple={false}
                creatable={false}
                required={true}
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
                creatable={false}
                required={true}
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
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CippPermissionPreview
          permissions={selectedPermissionSet?.addedFields?.Permissions}
          isLoading={templateLoading}
          title="Permission Preview"
        />
      </Grid>
    </Grid>
  );
};

export default AppApprovalTemplateForm;
