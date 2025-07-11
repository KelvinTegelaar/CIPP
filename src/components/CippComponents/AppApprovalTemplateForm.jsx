import { useState, useEffect, use } from "react";
import { Alert, Skeleton, Stack, Typography, Button, Box } from "@mui/material";
import { CippFormComponent } from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { CippApiResults } from "./CippApiResults";
import { Grid } from "@mui/system";
import CippPermissionPreview from "./CippPermissionPreview";
import { useWatch } from "react-hook-form";

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

  // Watch for app type selection changes
  const selectedAppType = useWatch({
    control: formControl?.control,
    name: "appType",
    defaultValue: "EnterpriseApp",
  });
  const selectedGalleryTemplate = useWatch({
    control: formControl?.control,
    name: "galleryTemplateId",
  });

  // Watch for app selection changes to update template name
  const selectedApp = useWatch({
    control: formControl?.control,
    name: "appId",
  });

  // When templateData changes, update the form
  useEffect(() => {
    if (!formControl) return; // Early return if formControl is not available

    if (!isEditing && !isCopy) {
      formControl.setValue("templateName", "New App Deployment Template");
      formControl.setValue("appType", "EnterpriseApp");
      setPermissionsLoaded(false);
    } else if (templateData && isCopy) {
      // When copying, we want to load the template data but not the ID
      if (templateData[0]) {
        const copyName = `Copy of ${templateData[0].TemplateName}`;
        formControl.setValue("templateName", copyName);

        // Set app type based on whether it's a gallery template, defaulting to EnterpriseApp for backward compatibility
        const appType =
          templateData[0].AppType ||
          (templateData[0].GalleryTemplateId ? "GalleryTemplate" : "EnterpriseApp");
        formControl.setValue("appType", appType);

        if (appType === "GalleryTemplate") {
          formControl.setValue("galleryTemplateId", {
            label: templateData[0].AppName || "Unknown",
            value: templateData[0].GalleryTemplateId,
            addedFields: {
              displayName: templateData[0].AppName,
              applicationId: templateData[0].AppId,
              // Include saved gallery information for proper display
              ...(templateData[0].GalleryInformation || {}),
            },
          });
        } else {
          formControl.setValue("appId", {
            label: `${templateData[0].AppName || "Unknown"} (${templateData[0].AppId})`,
            value: templateData[0].AppId,
            addedFields: {
              displayName: templateData[0].AppName,
            },
          });
        }

        // Set permission set and trigger loading of permissions (only for Enterprise Apps)
        if (appType === "EnterpriseApp") {
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
        } else {
          // For Gallery Templates, no permission set needed
          setSelectedPermissionSet(null);
          setPermissionsLoaded(false);
        }
      }
    } else if (templateData) {
      // For editing, load all template data
      if (templateData[0]) {
        formControl.setValue("templateName", templateData[0].TemplateName);

        // Set app type based on whether it's a gallery template, defaulting to EnterpriseApp for backward compatibility
        const appType =
          templateData[0].AppType ||
          (templateData[0].GalleryTemplateId ? "GalleryTemplate" : "EnterpriseApp");
        formControl.setValue("appType", appType);

        if (appType === "GalleryTemplate") {
          formControl.setValue("galleryTemplateId", {
            label: templateData[0].AppName || "Unknown",
            value: templateData[0].GalleryTemplateId,
            addedFields: {
              displayName: templateData[0].AppName,
              applicationId: templateData[0].AppId,
              // Include saved gallery information for proper display
              ...(templateData[0].GalleryInformation || {}),
            },
          });
        } else {
          formControl.setValue("appId", {
            label: `${templateData[0].AppName || "Unknown"} (${templateData[0].AppId})`,
            value: templateData[0].AppId,
            addedFields: {
              displayName: templateData[0].AppName,
            },
          });
        }

        // Set permission set and trigger loading of permissions (only for Enterprise Apps)
        if (appType === "EnterpriseApp") {
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
        } else {
          // For Gallery Templates, no permission set needed
          setSelectedPermissionSet(null);
          setPermissionsLoaded(false);
        }
      }
    }
  }, [templateData, isCopy, isEditing, formControl]);

  useEffect(() => {
    if (!formControl) return; // Early return if formControl is not available

    // Update template name when app is selected if we're in add mode and name hasn't been manually changed
    if (!isEditing && !isCopy) {
      const currentName = formControl.getValues("templateName");
      // Only update if it's still the default or empty
      if (currentName === "New App Deployment Template" || !currentName) {
        let appName = null;

        if (selectedAppType === "GalleryTemplate" && selectedGalleryTemplate) {
          appName =
            selectedGalleryTemplate.addedFields?.displayName || selectedGalleryTemplate.label;
        } else if (selectedAppType === "EnterpriseApp" && selectedApp) {
          // Extract app name from the label (format is usually "AppName (AppId)")
          appName = selectedApp.label.split(" (")[0];
        }

        if (appName) {
          formControl.setValue("templateName", `${appName} Template`);
        }
      }
    }
  }, [selectedApp, selectedGalleryTemplate, selectedAppType, isEditing, isCopy, formControl]);

  // Watch for permission set selection changes
  const selectedPermissionSetValue = useWatch({
    control: formControl?.control,
    name: "permissionSetId",
  });

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
    let appDisplayName, appId, galleryTemplateId;

    if (data.appType === "GalleryTemplate") {
      appDisplayName =
        data.galleryTemplateId?.addedFields?.displayName || data.galleryTemplateId?.label;
      appId = data.galleryTemplateId?.addedFields?.applicationId;
      galleryTemplateId = data.galleryTemplateId?.value;
    } else {
      appDisplayName =
        data.appId?.addedFields?.displayName ||
        (data.appId?.label ? data.appId.label.split(" (")[0] : undefined);
      appId = data.appId?.value;
    }

    const payload = {
      TemplateName: data.templateName,
      AppType: data.appType,
      AppId: appId,
      AppName: appDisplayName,
    };

    // Only include permission set data for Enterprise Apps
    if (data.appType === "EnterpriseApp") {
      payload.PermissionSetId = data.permissionSetId?.value;
      payload.PermissionSetName = data.permissionSetId?.label;
      payload.Permissions = data.permissionSetId?.addedFields?.Permissions;
    }
    // For Gallery Templates, permissions will be auto-handled from the template's app registration
    if (data.appType === "GalleryTemplate") {
      payload.Permissions = null; // No permissions needed for Gallery Templates
      payload.GalleryTemplateId = galleryTemplateId;
      payload.GalleryInformation = selectedGalleryTemplate?.addedFields || {};
    }

    if (isEditing && !isCopy && templateData?.[0]?.TemplateId) {
      payload.TemplateId = templateData[0].TemplateId;
    }

    // Store values before submission to set them back afterward
    const currentValues = {
      templateName: data.templateName,
      appType: data.appType,
      appId: data.appId,
      galleryTemplateId: data.galleryTemplateId,
      permissionSetId: data.permissionSetId,
    };

    onSubmit(payload);

    // After submission, set the values back to what they were but mark as clean
    // This will only apply to add page, as edit will get refreshed data
    if (!isEditing) {
      setTimeout(() => {
        formControl.setValue("templateName", currentValues.templateName, { shouldDirty: false });
        formControl.setValue("appType", currentValues.appType, { shouldDirty: false });
        formControl.setValue("appId", currentValues.appId, { shouldDirty: false });
        formControl.setValue("galleryTemplateId", currentValues.galleryTemplateId, {
          shouldDirty: false,
        });
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
                can be deployed to multiple tenants. You can select either an existing multi-tenant
                Enterprise Application or deploy from the Microsoft Gallery. If your Enterprise App
                is not listed, check the Supported account types in the App Registration properties
                in Entra.
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
                name="appType"
                label="Application Type"
                type="select"
                clearable={false}
                options={[
                  { label: "Enterprise Application", value: "EnterpriseApp" },
                  { label: "Gallery Template", value: "GalleryTemplate" },
                ]}
                multiple={false}
                creatable={false}
                required={true}
                validators={{ required: "Application type is required" }}
              />
              <CippFormCondition
                field="appType"
                compareType="is"
                compareValue="EnterpriseApp"
                formControl={formControl}
              >
                <CippFormComponent
                  formControl={formControl}
                  name="appId"
                  label="Select Enterprise Application"
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
                        (item) =>
                          item.addedFields?.signInAudience === "AzureADMultipleOrgs" ||
                          item.addedFields?.signInAudience === "AzureADandPersonalMicrosoftAccount"
                      );
                    },
                    showRefresh: true,
                  }}
                  multiple={false}
                  creatable={false}
                  required={true}
                  validators={{ required: "Application is required" }}
                />
              </CippFormCondition>
              <CippFormCondition
                field="appType"
                compareType="is"
                compareValue="GalleryTemplate"
                formControl={formControl}
              >
                <CippFormComponent
                  formControl={formControl}
                  name="galleryTemplateId"
                  label="Select Gallery Template"
                  type="autoComplete"
                  api={{
                    url: "/api/ListGraphRequest",
                    queryKey: "listApplicationTemplates",
                    data: {
                      Endpoint: "applicationTemplates",
                      $select:
                        "id,displayName,description,categories,publisher,logoUrl,homePageUrl,supportedSingleSignOnModes,supportedProvisioningTypes",
                      $top: 999,
                    },
                    dataKey: "Results",
                    labelField: (item) => item.displayName,
                    valueField: "id",
                    addedField: {
                      displayName: "displayName",
                      applicationId: "applicationId",
                      description: "description",
                      categories: "categories",
                      publisher: "publisher",
                      logoUrl: "logoUrl",
                      homePageUrl: "homePageUrl",
                      supportedSingleSignOnModes: "supportedSingleSignOnModes",
                      supportedProvisioningTypes: "supportedProvisioningTypes",
                    },
                    showRefresh: true,
                  }}
                  multiple={false}
                  creatable={false}
                  required={true}
                  sortOptions={true}
                  validators={{ required: "Gallery template is required" }}
                />
              </CippFormCondition>

              <CippFormCondition
                field="appType"
                compareType="is"
                compareValue="EnterpriseApp"
                formControl={formControl}
              >
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
              </CippFormCondition>

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
          permissions={
            selectedAppType === "GalleryTemplate"
              ? null // Gallery templates will auto-handle permissions
              : selectedPermissionSet?.addedFields?.Permissions
          }
          isLoading={templateLoading}
          title={
            selectedAppType === "GalleryTemplate" ? "Gallery Template Info" : "Permission Preview"
          }
          galleryTemplate={selectedAppType === "GalleryTemplate" ? selectedGalleryTemplate : null}
        />
      </Grid>
    </Grid>
  );
};

export default AppApprovalTemplateForm;
