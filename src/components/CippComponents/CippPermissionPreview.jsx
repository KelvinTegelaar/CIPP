import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Skeleton,
  Stack,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Chip,
  SvgIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { ExpandMore } from "@mui/icons-material";
import { CippCardTabPanel } from "./CippCardTabPanel";
import { ApiGetCall } from "../../api/ApiCall";

const CippPermissionPreview = ({
  permissions,
  title = "Permission Preview",
  isLoading = false,
  maxHeight = "100%",
  showAppIds = true,
  galleryTemplate = null,
  applicationManifest = null,
}) => {
  const [selectedPermissionTab, setSelectedPermissionTab] = useState(0);
  const [servicePrincipalDetails, setServicePrincipalDetails] = useState({});
  const [resourceIds, setResourceIds] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Extract resource IDs from permissions object
  useEffect(() => {
    if (permissions && typeof permissions === "object") {
      const ids = Object.keys(permissions);
      setResourceIds(ids);
    }
  }, [permissions]);

  // Function to fetch individual service principal details
  const fetchServicePrincipalDetails = useCallback(async (resourceId) => {
    try {
      const response = await fetch(`/api/ExecServicePrincipals?AppId=${resourceId}`);
      const data = await response.json();

      if (data?.Results) {
        setServicePrincipalDetails((prev) => ({
          ...prev,
          [resourceId]: data.Results,
        }));
      }
    } catch (error) {
      console.error(`Error fetching details for ${resourceId}:`, error);
    }
  }, []);

  // Fetch details for each resource ID
  useEffect(() => {
    const fetchAllDetails = async () => {
      if (resourceIds.length > 0) {
        setLoadingDetails(true);
        const promises = resourceIds.map((id) => fetchServicePrincipalDetails(id));
        await Promise.all(promises);
        setLoadingDetails(false);
      }
    };

    fetchAllDetails();
  }, [resourceIds, fetchServicePrincipalDetails]);

  const handlePermissionTabChange = (event, newValue) => {
    setSelectedPermissionTab(newValue);
  };

  // Function to get permission counts
  const getPermissionCounts = (permissions) => {
    if (!permissions) return { app: 0, delegated: 0 };

    let appCount = 0;
    let delegatedCount = 0;

    Object.entries(permissions).forEach(([resourceName, perms]) => {
      if (perms.applicationPermissions) {
        appCount += perms?.applicationPermissions?.length ?? 0;
      }
      if (perms.delegatedPermissions) {
        delegatedCount += perms?.delegatedPermissions?.length ?? 0;
      }
    });

    return { app: appCount, delegated: delegatedCount };
  };

  // Helper to get the display name for a resource ID
  const getResourceDisplayName = (resourceId) => {
    const spDetails = servicePrincipalDetails[resourceId];
    return spDetails?.displayName || resourceId;
  };

  // Helper to get the appropriate permission description
  const getPermissionDescription = (resourceId, permissionId, permissionType) => {
    const spDetails = servicePrincipalDetails[resourceId];
    if (!spDetails) return null;

    if (permissionType === "application") {
      const foundRole = spDetails.appRoles?.find((role) => role.id === permissionId);
      return foundRole?.description || null;
    } else {
      const foundScope = spDetails.publishedPermissionScopes?.find(
        (scope) => scope.id === permissionId
      );
      return foundScope?.userConsentDescription || foundScope?.description || null;
    }
  };

  // Better checks for permissions object to prevent rendering errors
  if (isLoading || loadingDetails) {
    return (
      <>
        <Typography variant="subtitle1">{title}</Typography>
        <Skeleton variant="rectangular" height={300} />
      </>
    );
  }

  if (!permissions && !galleryTemplate && !applicationManifest) {
    return (
      <Alert severity="info">
        Select a template with permissions to see what will be consented.
      </Alert>
    );
  }

  // If we have gallery template data, show that instead of permissions
  if (galleryTemplate) {
    return (
      <Stack spacing={2}>
        <Typography variant="subtitle1">{title}</Typography>
        <Box sx={{ height: "100%", overflow: "auto", maxHeight }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderLeftWidth: 4,
              borderLeftColor: "primary.main",
            }}
          >
            {/* App Logo and Name */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {galleryTemplate.addedFields?.logoUrl && (
                <Box sx={{ mr: 2 }}>
                  <img
                    src={galleryTemplate.addedFields.logoUrl}
                    alt={galleryTemplate.addedFields?.displayName || galleryTemplate.label}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                      borderRadius: 4,
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </Box>
              )}
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {galleryTemplate.addedFields?.displayName || galleryTemplate.label}
                </Typography>
                {galleryTemplate.addedFields?.publisher && (
                  <Typography variant="body2" color="text.secondary">
                    by {galleryTemplate.addedFields.publisher}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Description */}
            {galleryTemplate.addedFields?.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.primary">
                  {galleryTemplate.addedFields.description}
                </Typography>
              </Box>
            )}

            {/* Categories */}
            {galleryTemplate.addedFields?.categories &&
              galleryTemplate.addedFields.categories.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    Categories:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {galleryTemplate.addedFields.categories.map((category, idx) => (
                      <Chip
                        key={idx}
                        label={category}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}

            {/* SSO Modes */}
            {galleryTemplate.addedFields?.supportedSingleSignOnModes &&
              galleryTemplate.addedFields.supportedSingleSignOnModes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    Supported SSO Modes:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {galleryTemplate.addedFields.supportedSingleSignOnModes.map((mode, idx) => (
                      <Chip
                        key={idx}
                        label={mode}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    ))}
                  </Box>
                </Box>
              )}

            {/* Provisioning Types */}
            {galleryTemplate.addedFields?.supportedProvisioningTypes &&
              galleryTemplate.addedFields.supportedProvisioningTypes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    Supported Provisioning:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {galleryTemplate.addedFields.supportedProvisioningTypes.map((type, idx) => (
                      <Chip key={idx} label={type} size="small" variant="outlined" color="info" />
                    ))}
                  </Box>
                </Box>
              )}

            {/* Home Page URL */}
            {galleryTemplate.addedFields?.homePageUrl && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  Home Page:
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href={galleryTemplate.addedFields.homePageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "primary.main", textDecoration: "none" }}
                >
                  {galleryTemplate.addedFields.homePageUrl}
                </Typography>
              </Box>
            )}

            {/* Template ID */}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary">
                Template ID: {galleryTemplate.value}
              </Typography>
            </Box>

            {/* Auto-consent note */}
            <Alert severity="info" sx={{ mt: 2 }}>
              Gallery templates will automatically consent to the required permissions defined in
              the template's app registration. No manual permission configuration needed.
            </Alert>
          </Paper>
        </Box>
      </Stack>
    );
  }

  // If we have application manifest data, show that instead of permissions
  if (applicationManifest) {
    return (
      <ApplicationManifestPreview
        applicationManifest={applicationManifest}
        title={title}
        maxHeight={maxHeight}
      />
    );
  }

  // Ensure permissions is an object and has entries
  if (
    typeof permissions !== "object" ||
    permissions === null ||
    Object.keys(permissions).length === 0
  ) {
    return <Alert severity="warning">No permissions data available in this template.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Chip
          color="info"
          variant="outlined"
          size="small"
          label={`${getPermissionCounts(permissions).app}/${
            getPermissionCounts(permissions).delegated
          }`}
          icon={
            <SvgIcon fontSize="small">
              <ShieldCheckIcon />
            </SvgIcon>
          }
          title="Application/Delegated Permissions"
        />
      </Box>

      <Box sx={{ height: "100%", overflow: "auto", maxHeight }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={selectedPermissionTab}
            onChange={handlePermissionTabChange}
            aria-label="permission tabs"
            size="small"
          >
            <Tab label="All Permissions" />
            <Tab label="Application" />
            <Tab label="Delegated" />
          </Tabs>
        </Box>

        <CippCardTabPanel value={selectedPermissionTab} index={0}>
          <Box>
            {Object.entries(permissions).map(([resourceId, resourcePerms]) => {
              const resourceName = getResourceDisplayName(resourceId);
              const hasAppPermissions =
                resourcePerms.applicationPermissions &&
                resourcePerms.applicationPermissions.length > 0;
              const hasDelegatedPermissions =
                resourcePerms.delegatedPermissions && resourcePerms.delegatedPermissions.length > 0;

              return (
                <Box key={resourceId} sx={{ my: 2 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderLeftWidth: 4,
                      borderLeftColor:
                        resourceId === "00000003-0000-0000-c000-000000000000"
                          ? "primary.main"
                          : "secondary.main",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {resourceName}
                      {showAppIds && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ ml: 1, color: "text.secondary" }}
                        >
                          {resourceId}
                        </Typography>
                      )}
                    </Typography>

                    {hasAppPermissions && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          Application Permissions ({resourcePerms.applicationPermissions.length})
                        </Typography>
                        <List dense disablePadding>
                          {resourcePerms.applicationPermissions.map((perm, idx) => {
                            const description =
                              getPermissionDescription(resourceId, perm.id, "application") ||
                              perm.description ||
                              "No description available";
                            return (
                              <ListItem key={`app-${perm.id || idx}`} sx={{ py: 0 }}>
                                <ListItemText
                                  primary={perm.value || perm.id}
                                  secondary={description}
                                  primaryTypographyProps={{ variant: "caption" }}
                                  secondaryTypographyProps={{ variant: "caption" }}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    )}

                    {hasDelegatedPermissions && (
                      <Box sx={{ mt: hasAppPermissions ? 1 : 0 }}>
                        <Typography variant="body2" color="secondary" fontWeight="medium">
                          Delegated Permissions ({resourcePerms.delegatedPermissions.length})
                        </Typography>
                        <List dense disablePadding>
                          {resourcePerms.delegatedPermissions.map((perm, idx) => {
                            const description =
                              getPermissionDescription(resourceId, perm.id, "delegated") ||
                              perm.description ||
                              "No description available";
                            return (
                              <ListItem key={`delegated-${perm.id || idx}`} sx={{ py: 0 }}>
                                <ListItemText
                                  primary={perm.value || perm.id}
                                  secondary={description}
                                  primaryTypographyProps={{ variant: "caption" }}
                                  secondaryTypographyProps={{ variant: "caption" }}
                                />
                              </ListItem>
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
        </CippCardTabPanel>

        <CippCardTabPanel value={selectedPermissionTab} index={1}>
          <Box>
            {Object.entries(permissions)
              .filter(
                ([_, perms]) =>
                  perms.applicationPermissions && perms.applicationPermissions.length > 0
              )
              .map(([resourceId, resourcePerms]) => {
                const resourceName = getResourceDisplayName(resourceId);
                return (
                  <Box key={`app-${resourceId}`} sx={{ my: 2 }}>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {resourceName}
                        {showAppIds && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, color: "text.secondary" }}
                          >
                            {resourceId}
                          </Typography>
                        )}
                      </Typography>
                      <List dense disablePadding>
                        {resourcePerms.applicationPermissions.map((perm, idx) => {
                          const description =
                            getPermissionDescription(resourceId, perm.id, "application") ||
                            perm.description ||
                            "No description available";
                          return (
                            <ListItem key={`app-${perm.id || idx}`} sx={{ py: 0 }}>
                              <ListItemText
                                primary={perm.value || perm.id}
                                secondary={description}
                                primaryTypographyProps={{ variant: "caption" }}
                                secondaryTypographyProps={{ variant: "caption" }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Paper>
                  </Box>
                );
              })}
            {!Object.values(permissions).some(
              (perms) => perms.applicationPermissions && perms.applicationPermissions.length > 0
            ) && <Alert severity="info">No application permissions in this template.</Alert>}
          </Box>
        </CippCardTabPanel>

        <CippCardTabPanel value={selectedPermissionTab} index={2}>
          <Box>
            {Object.entries(permissions)
              .filter(
                ([_, perms]) => perms.delegatedPermissions && perms.delegatedPermissions.length > 0
              )
              .map(([resourceId, resourcePerms]) => {
                const resourceName = getResourceDisplayName(resourceId);
                return (
                  <Box key={`delegated-${resourceId}`} sx={{ my: 2 }}>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {resourceName}
                        {showAppIds && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, color: "text.secondary" }}
                          >
                            {resourceId}
                          </Typography>
                        )}
                      </Typography>
                      <List dense disablePadding>
                        {resourcePerms.delegatedPermissions.map((perm, idx) => {
                          const description =
                            getPermissionDescription(resourceId, perm.id, "delegated") ||
                            perm.description ||
                            "No description available";
                          return (
                            <ListItem key={`delegated-${perm.id || idx}`} sx={{ py: 0 }}>
                              <ListItemText
                                primary={perm.value || perm.id}
                                secondary={description}
                                primaryTypographyProps={{ variant: "caption" }}
                                secondaryTypographyProps={{ variant: "caption" }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Paper>
                  </Box>
                );
              })}
            {!Object.values(permissions).some(
              (perms) => perms.delegatedPermissions && perms.delegatedPermissions.length > 0
            ) && <Alert severity="info">No delegated permissions in this template.</Alert>}
          </Box>
        </CippCardTabPanel>
      </Box>
    </Stack>
  );
};

// Component to handle individual service principal resource details
const ServicePrincipalResourceDetails = ({
  resource,
  servicePrincipalId,
  expandedResource,
  handleAccordionChange,
}) => {
  // Fetch individual service principal details using ApiGetCall
  const {
    data: servicePrincipalData,
    isSuccess: spDetailSuccess,
    isFetching: spDetailFetching,
    isLoading: spDetailLoading,
  } = ApiGetCall({
    url: "/api/ExecServicePrincipals",
    data: { Id: servicePrincipalId },
    queryKey: `execServicePrincipal-details-${servicePrincipalId}`,
    waiting: !!servicePrincipalId,
  });

  const spDetails = servicePrincipalData?.Results;

  // Helper to get permission details
  const getPermissionDetails = (permissionId, type) => {
    if (!spDetails) return { name: permissionId, description: "Loading..." };

    if (type === "Role") {
      const foundRole = spDetails.appRoles?.find((role) => role.id === permissionId);
      return {
        name: foundRole?.value || permissionId,
        description: foundRole?.description || "No description available",
      };
    } else {
      const foundScope = spDetails.publishedPermissionScopes?.find(
        (scope) => scope.id === permissionId
      );
      return {
        name: foundScope?.value || permissionId,
        description:
          foundScope?.userConsentDescription ||
          foundScope?.description ||
          "No description available",
      };
    }
  };

  const resourceName = spDetails?.displayName || resource.resourceAppId;
  const appPermissions = resource.resourceAccess?.filter((access) => access.type === "Role") || [];
  const delegatedPermissions =
    resource.resourceAccess?.filter((access) => access.type === "Scope") || [];

  return (
    <Accordion
      key={resource.resourceAppId}
      expanded={expandedResource === resource.resourceAppId}
      onChange={handleAccordionChange(resource.resourceAppId)}
      variant="outlined"
      sx={{ mb: 1 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: "100%", mr: 1 }}
        >
          <Typography variant="subtitle2">
            {spDetailLoading || spDetailFetching ? "Loading..." : resourceName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              color="info"
              variant="outlined"
              size="small"
              label={`${appPermissions.length}/${delegatedPermissions.length}`}
              icon={
                <SvgIcon fontSize="small">
                  <ShieldCheckIcon />
                </SvgIcon>
              }
              title="Application/Delegated Permissions"
            />
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {(spDetailLoading || spDetailFetching) && (
          <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />
        )}

        {spDetailSuccess && spDetails && (
          <>
            {appPermissions.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="primary" fontWeight="medium" sx={{ mb: 1 }}>
                  Application Permissions ({appPermissions.length})
                </Typography>
                <List dense>
                  {appPermissions.map((permission, idx) => {
                    const permDetails = getPermissionDetails(permission.id, "Role");
                    return (
                      <ListItem key={`app-${permission.id || idx}`} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={permDetails.name}
                          secondary={permDetails.description}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: "medium",
                          }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {delegatedPermissions.length > 0 && (
              <Box>
                <Typography variant="body2" color="secondary" fontWeight="medium" sx={{ mb: 1 }}>
                  Delegated Permissions ({delegatedPermissions.length})
                </Typography>
                <List dense>
                  {delegatedPermissions.map((permission, idx) => {
                    const permDetails = getPermissionDetails(permission.id, "Scope");
                    return (
                      <ListItem key={`delegated-${permission.id || idx}`} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={permDetails.name}
                          secondary={permDetails.description}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: "medium",
                          }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// Component to handle Application Manifest preview with detailed permission expansion
const ApplicationManifestPreview = ({ applicationManifest, title, maxHeight }) => {
  const [expandedResource, setExpandedResource] = useState(false);

  // Get unique resource IDs from required resource access
  const resourceIds =
    applicationManifest.requiredResourceAccess?.map((resource) => resource.resourceAppId) || [];

  // Fetch the service principal list to get object IDs
  const {
    data: servicePrincipals = [],
    isSuccess: spSuccess,
    isFetching: spFetching,
    isLoading: spLoading,
  } = ApiGetCall({
    url: "/api/ExecServicePrincipals",
    data: { Select: "appId,displayName,id" },
    queryKey: "execServicePrincipalList-cipp-permission-preview",
    waiting: true,
  });

  // Helper to get service principal ID by appId
  const getServicePrincipalId = (appId) => {
    if (spSuccess && servicePrincipals?.Results) {
      const sp = servicePrincipals.Results.find((sp) => sp.appId === appId);
      return sp?.id || null;
    }
    return null;
  };

  const handleAccordionChange = (panel) => (event, newExpanded) => {
    setExpandedResource(newExpanded ? panel : false);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">{title}</Typography>
      <Box sx={{ height: "100%", overflow: "auto", maxHeight }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderLeftWidth: 4,
            borderLeftColor: "warning.main",
          }}
        >
          {/* App Basic Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {applicationManifest.displayName || "Custom Application"}
            </Typography>
            {applicationManifest.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {applicationManifest.description}
              </Typography>
            )}
          </Box>

          {/* Application Properties */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Application Properties:
            </Typography>
            <List dense>
              {applicationManifest.signInAudience && (
                <ListItem>
                  <ListItemText
                    primary="Sign-in Audience"
                    secondary={applicationManifest.signInAudience}
                  />
                </ListItem>
              )}
              {applicationManifest.web?.redirectUris &&
                applicationManifest.web.redirectUris.length > 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Redirect URIs"
                      secondary={applicationManifest.web.redirectUris.join(", ")}
                    />
                  </ListItem>
                )}
            </List>
          </Box>

          {/* Required Resource Access with detailed permissions */}
          {applicationManifest.requiredResourceAccess &&
            applicationManifest.requiredResourceAccess.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  Required Permissions:
                </Typography>
                {(spLoading || spFetching) && (
                  <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />
                )}
                {spSuccess &&
                  servicePrincipals?.Results &&
                  applicationManifest.requiredResourceAccess.map((resource, index) => {
                    const servicePrincipalId = getServicePrincipalId(resource.resourceAppId);

                    return (
                      <ServicePrincipalResourceDetails
                        key={resource.resourceAppId}
                        resource={resource}
                        servicePrincipalId={servicePrincipalId}
                        expandedResource={expandedResource}
                        handleAccordionChange={handleAccordionChange}
                      />
                    );
                  })}
              </Box>
            )}

          {/* Custom application note */}
          {/* Validation warning for signInAudience */}
          {applicationManifest.signInAudience &&
            applicationManifest.signInAudience !== "AzureADMyOrg" && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Invalid signInAudience: "{applicationManifest.signInAudience}"
                </Typography>
                <Typography variant="body2">
                  For security reasons, Application Manifests must have signInAudience set to
                  "AzureADMyOrg" or not defined in the JSON. This template cannot be deployed with
                  the current signInAudience value.
                </Typography>
              </Alert>
            )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            This application will be created from a custom manifest. All permissions and
            configuration are defined within the manifest JSON.
          </Alert>
        </Paper>
      </Box>
    </Stack>
  );
};

export default CippPermissionPreview;
