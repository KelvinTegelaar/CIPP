import React, { useState, useEffect, useRef } from "react";
import { Paper, Typography, Box, Chip, Popper, ListItem, useTheme } from "@mui/material";
import { useCustomVariables } from "/src/hooks/useCustomVariables";

/**
 * Autocomplete component specifically for custom variables
 * Shows when user types % in a text field
 */
export const CippVariableAutocomplete = React.memo(({
  open,
  anchorEl,
  onClose,
  onSelect,
  searchQuery = "",
  tenantFilter = null,
  includeSystemVariables = false,
  position = { top: 0, left: 0 }, // Cursor position for floating box
}) => {
  const theme = useTheme();
  const { variables, isLoading, groupedVariables } = useCustomVariables(
    tenantFilter,
    includeSystemVariables
  );
  const [filteredVariables, setFilteredVariables] = useState([]);

  // Filter variables based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredVariables(variables);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = variables.filter(
      (variable) =>
        variable.name.toLowerCase().includes(lowerQuery) ||
        variable.description.toLowerCase().includes(lowerQuery)
    );
    setFilteredVariables(filtered);
  }, [searchQuery, variables]);

  const handleSelect = (event, value) => {
    if (value && onSelect) {
      onSelect(value.variable); // Pass the full variable string like %tenantname%
    }
    onClose();
  };

  if (!open) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  if (!variables || variables.length === 0) {
    return null;
  }

  if (filteredVariables.length === 0) {
    return null;
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      style={{ zIndex: theme.zIndex.modal + 100 }}
    >
      <Paper
        data-cipp-autocomplete="true"
        elevation={8}
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          maxHeight: 240,
          overflow: "auto",
          minWidth: 300,
          maxWidth: 500,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {filteredVariables.map((variable, index) => (
          <ListItem
            key={variable.variable}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSelect(e, variable);
            }}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
              px: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              cursor: "pointer",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: theme.palette.primary.main,
                  fontSize: "0.875rem",
                }}
              >
                {variable.variable}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.25,
                  fontSize: "0.75rem",
                }}
              >
                {variable.description}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0, ml: 1 }}>
              <Chip
                label={variable.type}
                size="small"
                color={variable.type === "reserved" ? "primary" : "secondary"}
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                }}
              />
            </Box>
          </ListItem>
        ))}
      </Paper>
    </Popper>
  );
});
