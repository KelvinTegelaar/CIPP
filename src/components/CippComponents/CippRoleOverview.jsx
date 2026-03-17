import React from "react";
import { Box, Typography, Chip, Paper, Grid, Tooltip } from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Warning,
  Security,
  Info,
} from "@mui/icons-material";

/**
 * Visual Role Overview Component
 * Displays all roles in a grid with visual status indicators
 */
export const CippRoleOverview = ({ roles = [], onRoleClick }) => {
  if (!roles || roles.length === 0) return null;

  const getRoleStatus = (role) => {
    if (role.isUserHasAccess) {
      return {
        icon: <CheckCircle />,
        color: "success",
        label: "Has Access",
        bgColor: "success.light",
      };
    } else if (role.isAssigned) {
      return {
        icon: <Warning />,
        color: "warning",
        label: "Assigned but No Access",
        bgColor: "warning.light",
      };
    } else if (role.roleExistsInRelationship) {
      return {
        icon: <Info />,
        color: "info",
        label: "In Relationship but Not Assigned",
        bgColor: "info.light",
      };
    } else {
      return {
        icon: <Cancel />,
        color: "default",
        label: "Not In Any Relationship",
        bgColor: "grey.200",
      };
    }
  };

  return (
    <Grid container spacing={2}>
      {roles.map((role) => {
        const status = getRoleStatus(role);
        return (
          <Grid item xs={12} sm={6} md={4} key={role.roleId}>
            <Tooltip title={role.roleDescription || role.roleName} arrow>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: "100%",
                  cursor: onRoleClick ? "pointer" : "default",
                  backgroundColor: status.bgColor,
                  border: 2,
                  borderColor: `${status.color}.main`,
                  transition: "all 0.2s",
                  "&:hover": onRoleClick
                    ? {
                        elevation: 4,
                        transform: "translateY(-2px)",
                      }
                    : {},
                }}
                onClick={() => onRoleClick && onRoleClick(role)}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Box
                    sx={{
                      color: `${status.color}.main`,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Security />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {role.roleName}
                    </Typography>
                    <Chip
                      icon={status.icon}
                      label={status.label}
                      color={status.color}
                      size="small"
                      sx={{ fontSize: "0.7rem" }}
                    />
                    {role.accessPaths && role.accessPaths.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        {role.accessPaths.length} access path{role.accessPaths.length !== 1 ? "s" : ""}
                      </Typography>
                    )}
                    {role.relationshipsWithRole && role.relationshipsWithRole.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        {role.relationshipsWithRole.length} group{role.relationshipsWithRole.length !== 1 ? "s" : ""}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
};
