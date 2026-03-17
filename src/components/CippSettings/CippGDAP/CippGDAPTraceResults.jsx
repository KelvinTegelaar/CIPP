import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
  Alert,
  Grid,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  Warning,
  Security,
  Group,
  AccountTree,
  InfoOutlined,
} from "@mui/icons-material";
import { CippCodeBlock } from "../../CippComponents/CippCodeBlock";
import { CippPathVisualization } from "./CippPathVisualization";
import { getCippRoleTranslation } from "../../../utils/get-cipp-role-translation";

export const CippGDAPTraceResults = ({ data, isLoading, error }) => {
  const [expandedRoles, setExpandedRoles] = useState({});
  const [expandedRelationships, setExpandedRelationships] = useState({});

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Tracing GDAP access path...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="h6">Error</Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data available. Please run the trace first.
      </Alert>
    );
  }

  const handleRoleExpand = (roleId) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const handleRelationshipExpand = (relationshipId) => {
    setExpandedRelationships((prev) => ({
      ...prev,
      [relationshipId]: !prev[relationshipId],
    }));
  };

  const { tenantName, userUPN, userDisplayName, roles, relationships, summary, error: dataError } = data;

  if (dataError) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="h6">Trace completed with issues</Typography>
        <Typography variant="body2">{dataError}</Typography>
      </Alert>
    );
  }

  const getRoleStatusChip = (role) => {
    if (role.isUserHasAccess) {
      return <Chip icon={<CheckCircle />} label="Has Access" color="success" size="small" />;
    } else if (role.isAssigned) {
      return <Chip icon={<Warning />} label="Assigned but No Access" color="warning" size="small" />;
    } else if (role.roleExistsInRelationship) {
      return <Chip icon={<Warning />} label="In Relationship but Not Assigned" color="info" size="small" />;
    } else {
      return <Chip icon={<Cancel />} label="Not In Any Relationship" color="default" size="small" />;
    }
  };

  const renderMembershipPath = (path) => {
    if (!path || path.length === 0) return null;

    const sortedPath = [...path].sort((a, b) => {
      if (a.sequence !== undefined && b.sequence !== undefined) {
        return a.sequence - b.sequence;
      }
      return 0;
    });

    const hasMultipleGroups = sortedPath.length > 1;

    return (
      <Stack spacing={1} sx={{ mt: 1 }}>
        {sortedPath.map((step, index) => (
          <Box key={step.groupId || index}>
            <Stack direction="row" spacing={1} alignItems="center">
              {hasMultipleGroups && step.sequence !== undefined && (
                <Chip
                  label={`Step ${step.sequence + 1}`}
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 60 }}
                />
              )}
              {step.membershipType === "direct" && (
                <Chip
                  icon={<Group />}
                  label="Direct"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
              {step.membershipType === "nested" && (
                <Chip
                  icon={<AccountTree />}
                  label="Nested"
                  color="info"
                  size="small"
                  variant="outlined"
                />
              )}
              {step.membershipType === "not_member" && (
                <Chip
                  icon={<Cancel />}
                  label="Not Member"
                  color="error"
                  size="small"
                  variant="outlined"
                />
              )}
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {step.groupName || step.groupId}
              </Typography>
            </Stack>
            {index < sortedPath.length - 1 && (
              <Box sx={{ pl: hasMultipleGroups ? 8 : 4, py: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  ↓
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Summary Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trace Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Tenant
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {tenantName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                User
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {userDisplayName || userUPN}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Relationships
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {summary?.totalRelationships || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Roles with Access
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", color: "success.main" }}>
                {summary?.rolesWithAccess || 0} / {summary?.totalRoles || 15}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Roles Assigned but No Access
                </Typography>
                <Tooltip
                  title="These GDAP roles are assigned to groups in the relationship, but the user is not a member of any of those groups (or not through a path that grants access). Add the user to the correct group(s) to grant access."
                  placement="top"
                  arrow
                >
                  <IconButton size="small" sx={{ p: 0.25 }}>
                    <InfoOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="body1" sx={{ fontWeight: "medium", color: "warning.main" }}>
                {summary?.rolesAssignedButNoAccess || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Roles In Relationship but Not Assigned
                </Typography>
                <Tooltip
                  title="These roles exist in at least one GDAP relationship but are not assigned to any groups yet. Add the role to a group in the relationship to allow access."
                  placement="top"
                  arrow
                >
                  <IconButton size="small" sx={{ p: 0.25 }}>
                    <InfoOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="body1" sx={{ fontWeight: "medium", color: "info.main" }}>
                {summary?.rolesInRelationshipButNotAssigned || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Roles Not In Any Relationship
                </Typography>
                <Tooltip
                  title="These roles are not available in any of your GDAP relationships. The customer tenant would need to add these roles to a relationship before you can assign them to groups."
                  placement="top"
                  arrow
                >
                  <IconButton size="small" sx={{ p: 0.25 }}>
                    <InfoOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {summary?.rolesNotInAnyRelationship || 0}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Roles Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Security sx={{ verticalAlign: "middle", mr: 1 }} />
            GDAP Roles Access
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1}>
            {roles && roles.length > 0 ? (
              roles.map((role) => (
                <Accordion
                  key={role.roleId}
                  id={`role-${role.roleId}`}
                  expanded={expandedRoles[role.roleId] || false}
                  onChange={() => handleRoleExpand(role.roleId)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
                      {getRoleStatusChip(role)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                          {role.roleName}
                        </Typography>
                        {role.roleDescription && (
                          <Typography variant="caption" color="text.secondary">
                            {role.roleDescription}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {role.isUserHasAccess && role.accessPaths && role.accessPaths.length > 0 ? (
                        <>
                          <Typography variant="subtitle2" color="success.main" sx={{ mb: 2 }}>
                            Access Paths ({role.accessPaths.length}):
                          </Typography>
                          {role.accessPaths.map((path, pathIndex) => (
                            <Box key={pathIndex} sx={{ mb: 3 }}>
                              <CippPathVisualization
                                userDisplayName={userDisplayName}
                                userUPN={userUPN}
                                membershipPath={path.membershipPath}
                                groupName={path.groupName}
                                roleName={role.roleName}
                                relationshipName={path.relationshipName}
                                customerTenantName={path.customerTenantName}
                                isMember={true}
                              />
                            </Box>
                          ))}
                        </>
                      ) : role.isAssigned ? (
                        <>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            Role is assigned but user does not have access through any group.
                          </Alert>
                          {role.relationshipsWithRole && role.relationshipsWithRole.length > 0 && (
                            <>
                              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                Assigned Groups ({role.relationshipsWithRole.length}):
                              </Typography>
                              {role.relationshipsWithRole.map((rel, relIndex) => (
                                <Box key={relIndex} sx={{ mb: 2 }}>
                                  <CippPathVisualization
                                    userDisplayName={userDisplayName}
                                    userUPN={userUPN}
                                    membershipPath={rel.membershipPath}
                                    groupName={rel.groupName}
                                    roleName={role.roleName}
                                    relationshipName={rel.relationshipName}
                                    isMember={rel.isUserMember}
                                  />
                                </Box>
                              ))}
                            </>
                          )}
                        </>
                      ) : role.roleExistsInRelationship ? (
                        <>
                          <Alert severity="info">
                            This role exists in at least one GDAP relationship but is not assigned to any groups.
                          </Alert>
                          {role.relationshipsWithRoleAvailable && role.relationshipsWithRoleAvailable.length > 0 && (
                            <>
                              <Typography variant="subtitle2">Available in relationships:</Typography>
                              {role.relationshipsWithRoleAvailable.map((rel, relIndex) => (
                                <Box key={relIndex} sx={{ pl: 2 }}>
                                  <Typography variant="body2">
                                    • {rel.relationshipName} ({rel.relationshipStatus})
                                  </Typography>
                                </Box>
                              ))}
                            </>
                          )}
                        </>
                      ) : (
                        <Alert severity="info">This role is not available in any GDAP relationship.</Alert>
                      )}

                      {role.relationshipsWithRole && role.relationshipsWithRole.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            All relationships with this role: {role.relationshipsWithRole.length}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Alert severity="info">No roles found.</Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Relationships Section */}
      {relationships && relationships.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AccountTree sx={{ verticalAlign: "middle", mr: 1 }} />
              GDAP Relationships
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {relationships.map((relationship) => (
                <Accordion
                  key={relationship.relationshipId}
                  expanded={expandedRelationships[relationship.relationshipId] || false}
                  onChange={() => handleRelationshipExpand(relationship.relationshipId)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
                      <Chip
                        label={relationship.relationshipStatus}
                        color={relationship.relationshipStatus === "active" ? "success" : "default"}
                        size="small"
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                        {relationship.relationshipName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                        {relationship.groups?.length || 0} groups
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Customer Tenant: {relationship.customerTenantName || relationship.customerTenantId}
                        </Typography>
                      </Box>
                      {relationship.groups && relationship.groups.length > 0 ? (
                        <>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Groups ({relationship.groups.length}):
                          </Typography>
                          {relationship.groups.map((group, groupIndex) => {
                            const groupRole = roles?.find((r) =>
                              r.relationshipsWithRole?.some((rel) => rel.groupId === group.groupId)
                            );
                            const firstRoleDef = group.roles?.[0];
                            const roleName =
                              groupRole?.roleName ||
                              firstRoleDef?.displayName ||
                              (firstRoleDef?.roleDefinitionId
                                ? getCippRoleTranslation(firstRoleDef.roleDefinitionId)
                                : null) ||
                              "Role";

                            return (
                              <Box key={groupIndex} sx={{ mb: 3 }}>
                                <CippPathVisualization
                                  userDisplayName={userDisplayName}
                                  userUPN={userUPN}
                                  membershipPath={group.membershipPath}
                                  groupName={group.groupName}
                                  roleName={roleName}
                                  relationshipName={relationship.relationshipName}
                                  customerTenantName={relationship.customerTenantName}
                                  isMember={group.isMember}
                                />
                                {group.roles && group.roles.length > 1 && (
                                  <Box sx={{ mt: 1, pl: 2 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: "block", mb: 0.5 }}
                                    >
                                      Additional Roles:
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                      {group.roles.slice(1).map((role, roleIndex) => (
                                        <Chip
                                          key={roleIndex}
                                          label={
                                            role.displayName ||
                                            (role.roleDefinitionId
                                              ? getCippRoleTranslation(role.roleDefinitionId)
                                              : null) ||
                                            role.roleDefinitionId
                                          }
                                          size="small"
                                          variant="outlined"
                                        />
                                      ))}
                                    </Stack>
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </>
                      ) : (
                        <Alert severity="info">No groups found in this relationship.</Alert>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON View (Collapsible) */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">View Raw JSON</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CippCodeBlock
                code={JSON.stringify(data, null, 2)}
                language="json"
                showLineNumbers={true}
                type="syntax"
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  );
};
