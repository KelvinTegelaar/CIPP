import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Popper,
  ListItem,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { ApiGetCall } from "/src/api/ApiCall";
import { useSettings } from "/src/hooks/use-settings.js";
import { getCippError } from "/src/utils/get-cipp-error";

/**
 * Autocomplete component specifically for custom variables
 * Shows when user types % in a text field
 */
export const CippVariableAutocomplete = React.memo(
  ({
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
    const settings = useSettings();

    // State management similar to CippAutocomplete
    const [variables, setVariables] = useState([]);
    const [getRequestInfo, setGetRequestInfo] = useState({ url: "", waiting: false, queryKey: "" });
    const [filteredVariables, setFilteredVariables] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0); // For keyboard navigation

    // Get current tenant like CippAutocomplete does
    const currentTenant = tenantFilter || settings.currentTenant;

    // API call using the same pattern as CippAutocomplete
    const actionGetRequest = ApiGetCall({
      ...getRequestInfo,
    });

    // Setup API request when component mounts or tenant changes
    useEffect(() => {
      if (open) {
        // Normalize tenant filter
        const normalizedTenantFilter = currentTenant === "AllTenants" ? null : currentTenant;

        // Build API URL
        let apiUrl = "/api/ListCustomVariables";
        const params = new URLSearchParams();

        if (normalizedTenantFilter) {
          params.append("tenantFilter", normalizedTenantFilter);
        }

        if (!includeSystemVariables) {
          params.append("includeSystem", "false");
        }

        if (params.toString()) {
          apiUrl += `?${params.toString()}`;
        }

        // Generate query key
        const queryKey = `CustomVariables-${normalizedTenantFilter || "global"}-${
          includeSystemVariables ? "withSystem" : "noSystem"
        }`;

        setGetRequestInfo({
          url: apiUrl,
          waiting: true,
          queryKey: queryKey,
          staleTime: Infinity, // Never goes stale like in the updated hook
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        });
      }
    }, [open, currentTenant, includeSystemVariables]);

    // Process API response like CippAutocomplete does
    useEffect(() => {
      if (actionGetRequest.isSuccess && actionGetRequest.data?.Results) {
        const processedVariables = actionGetRequest.data.Results.map((variable) => ({
          // Core properties
          name: variable.Name,
          variable: variable.Variable,
          label: variable.Variable, // What shows in autocomplete
          value: variable.Variable, // What gets inserted

          // Metadata for display and filtering
          description: variable.Description,
          type: variable.Type, // 'reserved' or 'custom'
          category: variable.Category, // 'system', 'tenant', 'partner', 'cipp', 'global', 'tenant-custom'

          // Custom variable specific
          ...(variable.Type === "custom" && {
            customValue: variable.Value,
            scope: variable.Scope,
          }),

          // For grouping in autocomplete
          group:
            variable.Type === "reserved"
              ? `Reserved (${variable.Category})`
              : variable.category === "global"
              ? "Global Custom Variables"
              : "Tenant Custom Variables",
        }));

        setVariables(processedVariables);
      }

      if (actionGetRequest.isError) {
        setVariables([
          {
            label: getCippError(actionGetRequest.error),
            value: "error",
            name: "error",
            variable: "error",
            description: "Error loading variables",
          },
        ]);
      }
    }, [actionGetRequest.isSuccess, actionGetRequest.isError, actionGetRequest.data]);

    // Filter variables based on search query
    useEffect(() => {
      if (!searchQuery) {
        setFilteredVariables(variables);
        setSelectedIndex(0); // Reset selection when filtering
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const filtered = variables.filter(
        (variable) =>
          variable.name?.toLowerCase().includes(lowerQuery) ||
          variable.description?.toLowerCase().includes(lowerQuery)
      );
      setFilteredVariables(filtered);
      setSelectedIndex(0); // Reset selection when filtering
    }, [searchQuery, variables]);

    const handleSelect = (event, value) => {
      if (value && onSelect) {
        onSelect(value.variable); // Pass the full variable string like %tenantname%
      }
      onClose();
    };

    // Keyboard navigation handlers
    const handleKeyDown = useCallback(
      (event) => {
        if (!open || filteredVariables.length === 0) return;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            setSelectedIndex((prev) => (prev < filteredVariables.length - 1 ? prev + 1 : 0));
            break;
          case "ArrowUp":
            event.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredVariables.length - 1));
            break;
          case "Tab":
          case "Enter":
            event.preventDefault();
            if (filteredVariables[selectedIndex]) {
              handleSelect(event, filteredVariables[selectedIndex]);
            }
            break;
          case "Escape":
            event.preventDefault();
            onClose();
            break;
        }
      },
      [open, filteredVariables, selectedIndex, onClose]
    );

    // Set up keyboard event listeners
    useEffect(() => {
      if (open) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [open, handleKeyDown]);

    if (!open) {
      return null;
    }

    // Show loading state like CippAutocomplete
    if (actionGetRequest.isLoading && (!variables || variables.length === 0)) {
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
              maxWidth: 300,
              maxHeight: 200,
              p: 1,
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Loading variables...
              </Typography>
            </Box>
          </Paper>
        </Popper>
      );
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
              ref={
                index === selectedIndex
                  ? (el) => {
                      // Scroll selected item into view
                      if (el) {
                        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
                      }
                    }
                  : null
              }
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
                backgroundColor:
                  index === selectedIndex ? theme.palette.action.selected : "transparent",
                borderLeft:
                  index === selectedIndex
                    ? `3px solid ${theme.palette.primary.main}`
                    : "3px solid transparent",
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
  }
);
