import React from "react";
import { Box, Typography, Chip, Stack, Paper } from "@mui/material";
import {
  Person,
  Group,
  Security,
  AccountTree,
  CheckCircle,
  Cancel,
  Warning,
} from "@mui/icons-material";
import { CippFlowDiagram } from "./CippFlowDiagram";

/**
 * Visual Path Component for GDAP Access Traces
 * Shows a visual representation of the access path from User → Groups → Role
 */
export const CippPathVisualization = ({
  userDisplayName,
  userUPN,
  membershipPath = [],
  groupName,
  roleName,
  relationshipName,
  customerTenantName,
  isMember = true,
  ...other
}) => {
  // Color scheme matching sankey diagrams
  const colors = {
    user: "hsl(28, 100%, 53%)", // Orange - enabled users
    success: "hsl(99, 70%, 50%)", // Green - compliant, has access
    error: "hsl(0, 100%, 50%)", // Red - errors, no access
    info: "hsl(200, 70%, 50%)", // Blue - nested groups, info
    warning: "hsl(39, 100%, 50%)", // Yellow/Orange - warnings
    teal: "hsl(140, 70%, 50%)", // Teal - security defaults
    grey: "hsl(0, 0%, 60%)", // Grey - disabled
  };

  if (!membershipPath || membershipPath.length === 0) {
    // Fallback: show simple path even without detailed membership path
    const nodes = [
      {
        id: "user",
        label: userDisplayName || userUPN,
        subLabel: "User",
        icon: <Person sx={{ color: colors.user }} />,
        backgroundColor: `${colors.user}20`, // 20% opacity
        borderColor: colors.user,
        chips: [],
      },
      {
        id: "group",
        label: groupName || "Unknown Group",
        subLabel: "Security Group",
        icon: isMember ? <CheckCircle sx={{ color: colors.success }} /> : <Cancel sx={{ color: colors.error }} />,
        backgroundColor: isMember ? `${colors.success}20` : `${colors.error}20`,
        borderColor: isMember ? colors.success : colors.error,
        chips: [
          {
            label: isMember ? "Member" : "Not Member",
            sx: { backgroundColor: isMember ? colors.success : colors.error, color: "white" },
            size: "small",
          },
        ],
      },
      {
        id: "role",
        label: roleName || "Role",
        subLabel: "GDAP Role",
        icon: <Security sx={{ color: isMember ? colors.success : colors.grey }} />,
        backgroundColor: isMember ? `${colors.success}20` : `${colors.grey}20`,
        borderColor: isMember ? colors.success : colors.grey,
        chips: [
          {
            label: isMember ? "Has Access" : "No Access",
            sx: { backgroundColor: isMember ? colors.success : colors.grey, color: "white" },
            size: "small",
          },
        ],
      },
    ];

    return (
      <Box sx={{ my: 2 }} {...other}>
        {relationshipName && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Relationship: {relationshipName}
            {customerTenantName && ` → ${customerTenantName}`}
          </Typography>
        )}
        <CippFlowDiagram nodes={nodes} direction="horizontal" />
      </Box>
    );
  }

  // Sort path by sequence if available
  const sortedPath = [...membershipPath].sort((a, b) => {
    if (a.sequence !== undefined && b.sequence !== undefined) {
      return a.sequence - b.sequence;
    }
    return 0;
  });

  // Build nodes for the flow diagram
  const nodes = [];

  // Start with user node
  nodes.push({
    id: "user",
    label: userDisplayName || userUPN,
    subLabel: "User",
    icon: <Person sx={{ color: colors.user }} />,
    backgroundColor: `${colors.user}20`,
    borderColor: colors.user,
    chips: [],
  });

  // Add group nodes from the path
  sortedPath.forEach((step, index) => {
    const isFirstGroup = index === 0;
    const isLastGroup = index === sortedPath.length - 1;
    const isDirect = step.membershipType === "direct";
    const isNested = step.membershipType === "nested";
    const isNotMember = step.membershipType === "not_member";
    const isIntermediate = !isFirstGroup && !isLastGroup;

    const chips = [];

    if (isNotMember) {
      chips.push({
        label: "Not Member",
        sx: { backgroundColor: colors.error, color: "white" },
        icon: <Cancel />,
      });
    } else if (isDirect) {
      chips.push({
        label: "Direct",
        sx: { backgroundColor: colors.success, color: "white" },
        icon: <Group />,
      });
    } else if (isNested) {
      if (isLastGroup && sortedPath.length === 1) {
        // no chip
      } else {
        chips.push({
          label: "Nested",
          sx: { backgroundColor: colors.info, color: "white" },
          icon: <AccountTree />,
        });
      }
    }

    if (sortedPath.length > 1 && step.sequence !== undefined) {
      chips.push({
        label: `Step ${step.sequence + 1}`,
        variant: "outlined",
        size: "small",
        sx: { borderColor: colors.info, color: colors.info, fontWeight: "bold" },
      });
    }

    if (isLastGroup && !isNotMember) {
      chips.push({
        label: "GDAP Mapped",
        sx: { backgroundColor: colors.teal, color: "white", fontWeight: "bold" },
        size: "small",
      });
    }

    let groupColor;
    let subLabel;
    let nodeElevation = 2;
    let nodeBorderWidth = 0;

    if (isNotMember) {
      groupColor = colors.error;
      subLabel = "Target Group (No Access)";
    } else if (isLastGroup) {
      groupColor = colors.teal;
      if (isDirect) {
        subLabel = "GDAP Mapped Group (Direct)";
      } else if (isNested) {
        subLabel =
          sortedPath.length === 1 ? "GDAP Mapped Group (User Nested)" : "GDAP Mapped Group (Nested)";
      } else {
        subLabel = "GDAP Mapped Group";
      }
      nodeElevation = 4;
      nodeBorderWidth = 3;
    } else if (isFirstGroup && isDirect) {
      groupColor = colors.success;
      subLabel = "User's Direct Group";
    } else if (isFirstGroup && isNested) {
      groupColor = colors.info;
      subLabel = "User's Group (via nesting)";
    } else if (isIntermediate) {
      groupColor = colors.info;
      subLabel = "Intermediate Group";
      nodeElevation = 1;
    } else {
      groupColor = colors.info;
      subLabel = "Group";
    }

    nodes.push({
      id: `group-${step.groupId || index}`,
      label: step.groupName || step.groupId || "Unknown Group",
      subLabel: subLabel,
      icon:
        isNotMember ? (
          <Cancel sx={{ color: colors.error }} />
        ) : (
          <Group sx={{ color: groupColor, fontSize: isLastGroup ? "2rem" : "1.5rem" }} />
        ),
      backgroundColor: `${groupColor}${isLastGroup ? "30" : "20"}`,
      borderColor: groupColor,
      borderWidth: nodeBorderWidth,
      elevation: nodeElevation,
      chips: chips,
    });
  });

  const hasAccess = !sortedPath.some((step) => step.membershipType === "not_member");
  const roleColor = hasAccess ? colors.success : colors.grey;
  nodes.push({
    id: "role",
    label: roleName || "Role",
    subLabel: "GDAP Role",
    icon: <Security sx={{ color: roleColor }} />,
    backgroundColor: `${roleColor}20`,
    borderColor: roleColor,
    chips: [
      {
        label: hasAccess ? "Has Access" : "No Access",
        sx: { backgroundColor: roleColor, color: "white" },
        icon: hasAccess ? <CheckCircle /> : <Cancel />,
      },
    ],
  });

  return (
    <Box sx={{ my: 2 }} {...other}>
      {relationshipName && (
        <Paper elevation={0} sx={{ p: 1, mb: 2, bgcolor: "background.default" }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">
              <strong>Relationship:</strong> {relationshipName}
            </Typography>
            {customerTenantName && (
              <>
                <Typography variant="caption" color="text.secondary">
                  →
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Customer:</strong> {customerTenantName}
                </Typography>
              </>
            )}
          </Stack>
        </Paper>
      )}
      <CippFlowDiagram nodes={nodes} direction="horizontal" />
    </Box>
  );
};
