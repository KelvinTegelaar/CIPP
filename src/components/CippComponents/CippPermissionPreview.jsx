import React, { useState, useEffect, useCallback } from "react";
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
  Divider,
  Tab,
  Tabs,
  Chip,
  SvgIcon,
} from "@mui/material";
import { ApiGetCall } from "/src/api/ApiCall";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { CippCardTabPanel } from "./CippCardTabPanel";

const CippPermissionPreview = ({
  permissions,
  title = "Permission Preview",
  isLoading = false,
  maxHeight = "100%",
  showAppIds = true,
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

  if (!permissions) {
    return (
      <Alert severity="info">
        Select a template with permissions to see what will be consented.
      </Alert>
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

export default CippPermissionPreview;
