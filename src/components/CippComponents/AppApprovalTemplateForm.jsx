import React, { useState, useEffect } from "react";
import {
  Alert,
  Skeleton,
  Stack,
  Typography,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  Chip,
  SvgIcon,
} from "@mui/material";
import { ApiGetCall, ApiGetCallWithPagination } from "/src/api/ApiCall";
import { CippFormComponent } from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { Grid } from "@mui/system";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { CippCardTabPanel } from "./CippCardTabPanel";

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
  const [selectedPermissionTab, setSelectedPermissionTab] = useState(0);
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

  // Fetch all service principals to get display names
  const {
    data: servicePrincipals,
    isLoading: spLoading,
    isSuccess: spSuccess,
    refetch: refetchServicePrincipals,
  } = ApiGetCallWithPagination({
    url: "/api/ExecServicePrincipals",
    queryKey: "execServicePrincipals",
    enabled: permissionsLoaded || (isEditing && !templateLoading),
  });

  // Refetch service principals when permissions are loaded
  useEffect(() => {
    if (permissionsLoaded && selectedPermissionSet?.addedFields?.Permissions) {
      refetchServicePrincipals();
    }
  }, [permissionsLoaded, selectedPermissionSet, refetchServicePrincipals]);

  // Fetch additional details about the application if needed
  const {
    data: appDetails,
    isLoading: appDetailsLoading,
    isSuccess: appDetailsSuccess,
  } = ApiGetCall({
    url:
      permissionsLoaded && selectedPermissionSet?.addedFields?.Permissions && selectedApp?.value
        ? `/api/ExecServicePrincipals?Id=${selectedApp.value}`
        : null,
    queryKey:
      permissionsLoaded && selectedPermissionSet ? `app-details-${selectedApp?.value}` : null,
    enabled:
      permissionsLoaded &&
      !!selectedPermissionSet?.addedFields?.Permissions &&
      !!selectedApp?.value,
  });

  const handlePermissionTabChange = (event, newValue) => {
    setSelectedPermissionTab(newValue);
  };

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

  // Function to get permission counts for the selected app
  const getPermissionCounts = (permissions) => {
    if (!permissions) return { app: 0, delegated: 0 };

    let appCount = 0;
    let delegatedCount = 0;

    Object.entries(permissions).forEach(([resourceName, perms]) => {
      if (perms.applicationPermissions) {
        appCount += perms.applicationPermissions.length;
      }
      if (perms.delegatedPermissions) {
        delegatedCount += perms.delegatedPermissions.length;
      }
    });

    return { app: appCount, delegated: delegatedCount };
  };

  // Component to display permissions in a more detailed format
  const PermissionDetails = ({ permissions }) => {
    if (!permissions) return null;

    // Helper to get the display name for a resource ID
    const getResourceDisplayName = (resourceId) => {
      if (!spSuccess || !servicePrincipals?.pages?.[0]?.Results) return resourceId;

      const foundSp = servicePrincipals?.pages?.[0]?.Results.find((sp) => sp.appId === resourceId);
      return foundSp ? foundSp.displayName : resourceId;
    };

    // Helper to get the appropriate permission description from service principals data
    const getPermissionDescription = (resourceId, permissionId, permissionType) => {
      if (!spSuccess || !servicePrincipals?.pages?.[0]?.Results) return null;

      const foundSp = servicePrincipals?.pages?.[0]?.Results.find((sp) => sp.appId === resourceId);
      if (!foundSp) return null;

      if (permissionType === "application") {
        // For application permissions, use description
        const foundRole = foundSp.appRoles?.find((role) => role.id === permissionId);
        return foundRole?.description || null;
      } else {
        // For delegated permissions, use userConsentDescription
        const foundScope = foundSp.publishedPermissionScopes?.find(
          (scope) => scope.id === permissionId
        );
        return foundScope?.userConsentDescription || foundScope?.description || null;
      }
    };

    return (
      <Box>
        {permissions &&
          Object.entries(permissions).map(([resourceId, resourcePerms]) => {
            // Skip resources with no permissions or invalid data
            if (
              !resourcePerms ||
              (!resourcePerms.applicationPermissions && !resourcePerms.delegatedPermissions)
            ) {
              return null;
            }

            const resourceName = getResourceDisplayName(resourceId);
            const hasAppPermissions =
              resourcePerms.applicationPermissions &&
              resourcePerms.applicationPermissions.length > 0;
            const hasDelegatedPermissions =
              resourcePerms.delegatedPermissions && resourcePerms.delegatedPermissions.length > 0;

            return (
              <Box key={resourceId} sx={{ mb: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderWidth: 1,
                    borderRadius: 1,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      resourceId === "00000003-0000-0000-c000-000000000000"
                        ? "primary.main"
                        : "secondary.main",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    {resourceName}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ ml: 1, color: "text.secondary" }}
                    >
                      {resourceId}
                    </Typography>
                  </Typography>

                  {hasAppPermissions && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{
                          mb: 0.5,
                          display: "flex",
                          alignItems: "center",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          pb: 0.5,
                        }}
                      >
                        Application Permissions ({resourcePerms.applicationPermissions.length})
                      </Typography>
                      <List dense disablePadding>
                        {resourcePerms.applicationPermissions.map((perm, idx) => {
                          const description =
                            getPermissionDescription(resourceId, perm.id, "application") ||
                            perm.description ||
                            "No description available";
                          return (
                            <React.Fragment key={`app-${perm.id || idx}`}>
                              {idx > 0 && <Divider component="li" variant="inset" />}
                              <ListItem sx={{ py: 0.5 }}>
                                <ListItemText
                                  primary={perm.value || perm.id}
                                  secondary={description}
                                />
                              </ListItem>
                            </React.Fragment>
                          );
                        })}
                      </List>
                    </Box>
                  )}

                  {hasDelegatedPermissions && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="secondary"
                        sx={{
                          mb: 0.5,
                          display: "flex",
                          alignItems: "center",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          pb: 0.5,
                        }}
                      >
                        Delegated Permissions ({resourcePerms.delegatedPermissions.length})
                      </Typography>
                      <List dense disablePadding>
                        {resourcePerms.delegatedPermissions.map((perm, idx) => {
                          const description =
                            getPermissionDescription(resourceId, perm.id, "delegated") ||
                            perm.description ||
                            "No description available";
                          return (
                            <React.Fragment key={`delegated-${perm.id || idx}`}>
                              {idx > 0 && <Divider component="li" variant="inset" />}
                              <ListItem sx={{ py: 0.5 }}>
                                <ListItemText
                                  primary={perm.value || perm.id}
                                  secondary={description}
                                />
                              </ListItem>
                            </React.Fragment>
                          );
                        })}
                      </List>
                    </Box>
                  )}
                </Paper>
              </Box>
            );
          })}
      </Box>
    );
  };

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Stack spacing={2}>
          {templateLoading && <Skeleton variant="rectangular" height={300} />}
          {(!templateLoading || !isEditing) && (
            <>
              <Typography variant="body2">
                {isCopy
                  ? "Create a copy of an existing app approval template with your own modifications."
                  : isEditing
                  ? "Edit this app approval template."
                  : "Create a new app approval template to define application permissions to consent."}
              </Typography>
              <Alert severity="info">
                App approval templates allow you to define an application with its permissions that
                can be deployed to multiple tenants. Select an application and permission set to
                create a template.
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
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Permission Preview</Typography>
            {selectedPermissionSet?.addedFields?.Permissions && (
              <Chip
                color="info"
                variant="outlined"
                size="small"
                label={`${
                  getPermissionCounts(selectedPermissionSet?.addedFields?.Permissions).app
                }/${
                  getPermissionCounts(selectedPermissionSet?.addedFields?.Permissions).delegated
                }`}
                icon={
                  <SvgIcon fontSize="small">
                    <ShieldCheckIcon />
                  </SvgIcon>
                }
                title="Application/Delegated Permissions"
              />
            )}
          </Box>

          {templateLoading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : !selectedPermissionSet?.addedFields?.Permissions || spLoading ? (
            <Alert severity="info">
              {templateLoading
                ? "Loading permission details..."
                : spLoading
                ? "Loading permission information..."
                : "Select a permission set to see what permissions will be consented."}
            </Alert>
          ) : (
            <Paper
              variant="outlined"
              sx={{ p: 2, height: "100%", overflow: "auto", maxHeight: 500 }}
            >
              {!selectedPermissionSet.addedFields?.Permissions ||
              Object.keys(selectedPermissionSet.addedFields.Permissions).length === 0 ? (
                <Alert severity="warning">No permissions data available</Alert>
              ) : (
                <>
                  <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    <Tabs
                      value={selectedPermissionTab}
                      onChange={handlePermissionTabChange}
                      aria-label="permission tabs"
                    >
                      <Tab label="All Permissions" />
                      <Tab label="Application" />
                      <Tab label="Delegated" />
                    </Tabs>
                  </Box>

                  <CippCardTabPanel value={selectedPermissionTab} index={0}>
                    <PermissionDetails
                      permissions={selectedPermissionSet.addedFields.Permissions}
                    />
                  </CippCardTabPanel>

                  <CippCardTabPanel value={selectedPermissionTab} index={1}>
                    <Box>
                      {selectedPermissionSet.addedFields.Permissions &&
                        Object.entries(selectedPermissionSet.addedFields.Permissions)
                          .filter(
                            ([_, perms]) =>
                              perms.applicationPermissions &&
                              perms.applicationPermissions.length > 0
                          )
                          .map(([resourceId, resourcePerms]) => {
                            const resourceName =
                              spSuccess && servicePrincipals?.pages?.[0]?.Results
                                ? servicePrincipals.pages[0].Results.find(
                                    (sp) => sp.appId === resourceId
                                  )?.displayName || resourceId
                                : resourceId;

                            return (
                              <Box key={`app-${resourceId}`} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                  {resourceName}
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ ml: 1, color: "text.secondary" }}
                                  >
                                    {resourceId}
                                  </Typography>
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1 }}>
                                  <List dense disablePadding>
                                    {resourcePerms.applicationPermissions.map((perm, idx) => {
                                      // Get proper application permission description
                                      const description =
                                        spSuccess && servicePrincipals?.pages?.[0]?.Results
                                          ? servicePrincipals.pages[0].Results.find(
                                              (sp) => sp.appId === resourceId
                                            )?.appRoles?.find((role) => role.id === perm.id)
                                              ?.description ||
                                            perm.description ||
                                            "No description available"
                                          : perm.description || "No description available";

                                      return (
                                        <React.Fragment key={`app-${perm.id || idx}`}>
                                          {idx > 0 && <Divider component="li" variant="inset" />}
                                          <ListItem sx={{ py: 0.5 }}>
                                            <ListItemText
                                              primary={perm.value || perm.id}
                                              secondary={description}
                                            />
                                          </ListItem>
                                        </React.Fragment>
                                      );
                                    })}
                                  </List>
                                </Paper>
                              </Box>
                            );
                          })}
                      {!Object.values(selectedPermissionSet.addedFields.Permissions || {}).some(
                        (perms) =>
                          perms.applicationPermissions && perms.applicationPermissions.length > 0
                      ) && (
                        <Alert severity="info">No application permissions in this template.</Alert>
                      )}
                    </Box>
                  </CippCardTabPanel>

                  <CippCardTabPanel value={selectedPermissionTab} index={2}>
                    {/* Similar checks for delegated permissions */}
                    <Box>
                      {selectedPermissionSet.addedFields.Permissions &&
                        Object.entries(selectedPermissionSet.addedFields.Permissions)
                          .filter(
                            ([_, perms]) =>
                              perms.delegatedPermissions && perms.delegatedPermissions.length > 0
                          )
                          .map(([resourceId, resourcePerms]) => {
                            const resourceName =
                              spSuccess && servicePrincipals?.pages?.[0]?.Results
                                ? servicePrincipals.pages[0].Results.find(
                                    (sp) => sp.appId === resourceId
                                  )?.displayName || resourceId
                                : resourceId;

                            return (
                              <Box key={`delegated-${resourceId}`} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                  {resourceName}
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ ml: 1, color: "text.secondary" }}
                                  >
                                    {resourceId}
                                  </Typography>
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1 }}>
                                  <List dense disablePadding>
                                    {resourcePerms.delegatedPermissions.map((perm, idx) => {
                                      // Get proper delegated permission description - prefer userConsentDescription
                                      const spData =
                                        spSuccess && servicePrincipals?.pages?.[0]?.Results
                                          ? servicePrincipals.pages[0].Results.find(
                                              (sp) => sp.appId === resourceId
                                            )
                                          : null;

                                      const permScope = spData
                                        ? spData.publishedPermissionScopes?.find(
                                            (scope) => scope.id === perm.id
                                          )
                                        : null;

                                      const description = permScope
                                        ? permScope.userConsentDescription || permScope.description
                                        : perm.description || "No description available";

                                      return (
                                        <React.Fragment key={`delegated-${perm.id || idx}`}>
                                          {idx > 0 && <Divider component="li" variant="inset" />}
                                          <ListItem sx={{ py: 0.5 }}>
                                            <ListItemText
                                              primary={perm.value || perm.id}
                                              secondary={description}
                                            />
                                          </ListItem>
                                        </React.Fragment>
                                      );
                                    })}
                                  </List>
                                </Paper>
                              </Box>
                            );
                          })}
                      {!Object.values(selectedPermissionSet.addedFields.Permissions || {}).some(
                        (perms) =>
                          perms.delegatedPermissions && perms.delegatedPermissions.length > 0
                      ) && (
                        <Alert severity="info">No delegated permissions in this template.</Alert>
                      )}
                    </Box>
                  </CippCardTabPanel>
                </>
              )}
            </Paper>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AppApprovalTemplateForm;
