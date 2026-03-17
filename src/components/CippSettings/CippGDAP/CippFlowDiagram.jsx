import React from "react";
import { Box, Typography, Chip, Stack, Paper } from "@mui/material";
import { ArrowForward, ArrowDownward } from "@mui/icons-material";

/**
 * Generic Flow Diagram Component
 * Displays a horizontal or vertical flow of connected nodes
 *
 * @param {Array} nodes - Array of node objects with { id, label, icon, color, variant, details }
 * @param {string} direction - 'horizontal' or 'vertical'
 * @param {boolean} showArrows - Whether to show connecting arrows
 * @param {object} nodeSx - Custom styles for nodes
 */
export const CippFlowDiagram = ({
  nodes = [],
  direction = "horizontal",
  showArrows = true,
  nodeSx = {},
  ...other
}) => {
  if (!nodes || nodes.length === 0) return null;

  const isHorizontal = direction === "horizontal";
  const ArrowIcon = isHorizontal ? ArrowForward : ArrowDownward;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: isHorizontal ? "center" : "flex-start",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        gap: 2,
        p: 2,
        overflowX: isHorizontal ? "auto" : "visible",
        overflowY: isHorizontal ? "visible" : "auto",
        ...other.sx,
      }}
      {...other}
    >
      {nodes.map((node, index) => (
        <React.Fragment key={node.id || index}>
          <Paper
            elevation={node.elevation !== undefined ? node.elevation : 2}
            sx={{
              p: node.elevation && node.elevation > 2 ? 2.5 : 2,
              minWidth: node.elevation && node.elevation > 2 ? 180 : 150,
              maxWidth: node.elevation && node.elevation > 2 ? 280 : 250,
              width: isHorizontal ? "auto" : "100%",
              textAlign: "center",
              backgroundColor: node.backgroundColor || node.color || "background.paper",
              border:
                node.borderWidth
                  ? `${node.borderWidth}px solid ${node.borderColor || "primary.main"}`
                  : (node.variant === "outlined" || node.borderColor
                      ? `2px solid ${node.borderColor || "primary.main"}`
                      : 0),
              borderColor: node.borderColor || (node.variant === "outlined" ? "primary.main" : "transparent"),
              position: "relative",
              flexShrink: 0,
              transition: "all 0.2s ease-in-out",
              ...nodeSx,
            }}
          >
            {node.icon && (
              <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
                {node.icon}
              </Box>
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {node.label}
            </Typography>
            {node.subLabel && (
              <Typography variant="caption" color="text.secondary">
                {node.subLabel}
              </Typography>
            )}
            {node.chips && node.chips.length > 0 && (
              <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 1 }} flexWrap="wrap" gap={0.5}>
                {node.chips.map((chip, chipIndex) => (
                  <Chip key={chipIndex} {...chip} size="small" />
                ))}
              </Stack>
            )}
            {node.details && (
              <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
                {typeof node.details === "string" ? (
                  <Typography variant="caption" color="text.secondary">
                    {node.details}
                  </Typography>
                ) : (
                  node.details
                )}
              </Box>
            )}
          </Paper>
          {showArrows && index < nodes.length - 1 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                ...(isHorizontal ? { width: 40 } : { height: 40 }),
              }}
            >
              <ArrowIcon fontSize="small" />
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};
