import { useState, useEffect, use } from "react";
import { Alert, Skeleton, Stack, Typography, Button, Box, Link } from "@mui/material";
import { CippFormComponent } from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { CippApiResults } from "./CippApiResults";
import { Grid } from "@mui/system";
import CippPermissionPreview from "./CippPermissionPreview";
import { useWatch } from "react-hook-form";
import { CippPermissionSetDrawer } from "./CippPermissionSetDrawer";

const AppApprovalTemplateForm = ({
  formControl,
  templateData,
  templateLoading,
  isEditing,
  isCopy,
  updatePermissions,
  onSubmit,
  refetchKey,
  hideSubmitButton = false, // New prop to hide the submit button when used in a drawer
}) => {
  const [selectedPermissionSet, setSelectedPermissionSet] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [permissionSetDrawerVisible, setPermissionSetDrawerVisible] = useState(false);

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

  // Watch for application manifest changes
  const selectedApplicationManifest = useWatch({
    control: formControl?.control,
    name: "applicationManifest",
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
          (templateData[0].GalleryTemplateId
            ? "GalleryTemplate"
            : templateData[0].ApplicationManifest
            ? "ApplicationManifest"
            : "EnterpriseApp");
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
        } else if (appType === "ApplicationManifest") {
          // For Application Manifest, load the manifest JSON
          if (templateData[0].ApplicationManifest) {
            formControl.setValue(
              "applicationManifest",
              JSON.stringify(templateData[0].ApplicationManifest, null, 2)
            );
          }
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
          (templateData[0].GalleryTemplateId
            ? "GalleryTemplate"
            : templateData[0].ApplicationManifest
            ? "ApplicationManifest"
            : "EnterpriseApp");
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
        } else if (appType === "ApplicationManifest") {
          // For Application Manifest, load the manifest JSON
          if (templateData[0].ApplicationManifest) {
            formControl.setValue(
              "applicationManifest",
              JSON.stringify(templateData[0].ApplicationManifest, null, 2)
            );
          }
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
          // For Gallery Templates and Application Manifests, no permission set needed
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
    let appDisplayName, appId, galleryTemplateId, applicationManifest;

    if (data.appType === "GalleryTemplate") {
      appDisplayName =
        data.galleryTemplateId?.addedFields?.displayName || data.galleryTemplateId?.label;
      appId = data.galleryTemplateId?.addedFields?.applicationId;
      galleryTemplateId = data.galleryTemplateId?.value;
    } else if (data.appType === "ApplicationManifest") {
      try {
        applicationManifest = JSON.parse(data.applicationManifest);

        // Validate signInAudience - only allow null/undefined or "AzureADMyOrg"
        if (
          applicationManifest.signInAudience &&
          applicationManifest.signInAudience !== "AzureADMyOrg"
        ) {
          return; // Don't submit if validation fails
        }

        // Extract app name from manifest
        appDisplayName =
          applicationManifest.displayName ||
          applicationManifest.appDisplayName ||
          "Custom Application";
        // Application ID will be generated during deployment for manifests
        appId = null;
      } catch (error) {
        console.error("Failed to parse application manifest:", error);
        return; // Don't submit if manifest is invalid
      }
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

    // For Application Manifests, store the manifest data
    if (data.appType === "ApplicationManifest") {
      payload.Permissions = null; // Permissions defined in manifest
      payload.ApplicationManifest = applicationManifest;
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
      applicationManifest: data.applicationManifest,
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
        formControl.setValue("applicationManifest", currentValues.applicationManifest, {
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
                can be deployed to multiple tenants. Choose from three template types:
                <br />
                <br />
                <strong>• Enterprise Application:</strong> Deploy existing multi-tenant apps from
                your tenant. Requires "Multiple organizations" or "Personal Microsoft accounts" in
                App Registration settings.
                <br />
                <strong>• Gallery Template:</strong> Deploy pre-configured applications from
                Microsoft's Enterprise Application Gallery with standard permissions.
                <br />
                <strong>• Application Manifest:</strong> Deploy custom applications using JSON
                manifests. For security, only single-tenant apps (AzureADMyOrg) are supported.
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
                  { label: "Application Manifest", value: "ApplicationManifest" },
                ]}
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
                  helperText="Select a multi-tenant application to deploy in this template."
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
                compareValue="ApplicationManifest"
                formControl={formControl}
              >
                <CippFormComponent
                  formControl={formControl}
                  name="applicationManifest"
                  label="Application Manifest (JSON)"
                  type="textField"
                  multiline
                  rows={10}
                  helperText="Paste your application manifest JSON here. Use the 'Microsoft Graph App Manifest' format. For security reasons, signInAudience must be 'AzureADMyOrg' or not specified."
                  validators={{
                    required: "Application manifest is required",
                    validate: (value) => {
                      try {
                        const manifest = JSON.parse(value);

                        // Check for minimum required property
                        if (!manifest.displayName) {
                          return "Application manifest must include a 'displayName' property";
                        }

                        // Validate signInAudience if present
                        if (manifest.signInAudience && manifest.signInAudience !== "AzureADMyOrg") {
                          return "signInAudience must be null, undefined, or 'AzureADMyOrg' for security reasons";
                        }

                        return true;
                      } catch (e) {
                        return "Invalid JSON format";
                      }
                    },
                  }}
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
                  helperText={
                    <>
                      Select a permission set to apply to this application.{" "}
                      <CippPermissionSetDrawer
                        buttonText="Create Permission Set"
                        isEditMode={false}
                        drawerVisible={permissionSetDrawerVisible}
                        setDrawerVisible={setPermissionSetDrawerVisible}
                      />
                    </>
                  }
                />
              </CippFormCondition>

              {!hideSubmitButton && (
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
              )}
            </>
          )}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CippPermissionPreview
          permissions={
            selectedAppType === "GalleryTemplate" || selectedAppType === "ApplicationManifest"
              ? null // Gallery templates and Application Manifests will handle permissions differently
              : selectedPermissionSet?.addedFields?.Permissions
          }
          isLoading={templateLoading}
          title={
            selectedAppType === "GalleryTemplate"
              ? "Gallery Template Info"
              : selectedAppType === "ApplicationManifest"
              ? "Application Manifest"
              : "Permission Preview"
          }
          galleryTemplate={selectedAppType === "GalleryTemplate" ? selectedGalleryTemplate : null}
          applicationManifest={
            selectedAppType === "ApplicationManifest" && selectedApplicationManifest
              ? (() => {
                  try {
                    return JSON.parse(selectedApplicationManifest);
                  } catch (e) {
                    return null; // Return null if JSON is invalid
                  }
                })()
              : null
          }
        />
      </Grid>
    </Grid>
  );
};

export default AppApprovalTemplateForm;
