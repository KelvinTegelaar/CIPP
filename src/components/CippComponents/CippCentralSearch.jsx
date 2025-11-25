import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useRouter } from "next/router";
import { nativeMenuItems } from "/src/layouts/config";
import { usePermissions } from "/src/hooks/use-permissions";

/**
 * Recursively collects only leaf items (those without sub-items).
 * If an item has an `items` array, we skip that item itself (treat it as a "folder")
 * and continue flattening deeper.
 */
function getLeafItems(items = []) {
  let result = [];

  for (const item of items) {
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      // recurse into children
      result = result.concat(getLeafItems(item.items));
    } else {
      // no child items => this is a leaf
      result.push(item);
    }
  }

  return result;
}

/**
 * Load all tabOptions.json files dynamically
 */
async function loadTabOptions() {
  const tabOptionPaths = [
    "/email/administration/exchange-retention",
    "/cipp/custom-data",
    "/cipp/super-admin",
    "/tenant/standards/list-standards",
    "/tenant/manage",
    "/tenant/administration/applications",
    "/tenant/administration/tenants",
    "/tenant/administration/audit-logs",
    "/identity/administration/users/user",
    "/tenant/administration/securescore",
    "/tenant/gdap-management",
    "/tenant/gdap-management/relationships/relationship",
    "/cipp/settings",
  ];

  const tabOptions = [];

  for (const basePath of tabOptionPaths) {
    try {
      const module = await import(`/src/pages${basePath}/tabOptions.json`);
      const options = module.default || module;

      // Add each tab option with metadata
      options.forEach((option) => {
        tabOptions.push({
          title: option.label,
          path: option.path,
          type: "tab",
          basePath: basePath,
        });
      });
    } catch (error) {
      // Silently skip if file doesn't exist or can't be loaded
      console.debug(`Could not load tabOptions for ${basePath}:`, error);
    }
  }

  return tabOptions;
}

/**
 * Filter menu items based on user permissions and roles
 */
function filterItemsByPermissionsAndRoles(items, userPermissions, userRoles) {
  return items.filter((item) => {
    // Check roles if specified
    if (item.roles && item.roles.length > 0) {
      const hasRole = item.roles.some((requiredRole) => userRoles.includes(requiredRole));
      if (!hasRole) {
        return false;
      }
    }

    // Check permissions with pattern matching support
    if (item.permissions && item.permissions.length > 0) {
      const hasPermission = userPermissions?.some((userPerm) => {
        return item.permissions.some((requiredPerm) => {
          // Exact match
          if (userPerm === requiredPerm) {
            return true;
          }

          // Pattern matching - check if required permission contains wildcards
          if (requiredPerm.includes("*")) {
            // Convert wildcard pattern to regex
            const regexPattern = requiredPerm
              .replace(/\\/g, "\\\\") // Escape backslashes
              .replace(/\./g, "\\.") // Escape dots
              .replace(/\*/g, ".*"); // Convert * to .*
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(userPerm);
          }

          return false;
        });
      });
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  });
}

export const CippCentralSearch = ({ handleClose, open }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { userPermissions, userRoles } = usePermissions();
  const [tabOptions, setTabOptions] = useState([]);

  // Load tab options on mount
  useEffect(() => {
    loadTabOptions().then(setTabOptions);
  }, []);

  // Flatten and filter the menu items based on user permissions
  const flattenedMenuItems = useMemo(() => {
    const allLeafItems = getLeafItems(nativeMenuItems);

    // Helper to build full breadcrumb path
    const buildBreadcrumbPath = (items, targetPath) => {
      const searchRecursive = (items, currentPath = []) => {
        for (const item of items) {
          // Skip Dashboard root
          const shouldAddToPath = item.title !== "Dashboard" || item.path !== "/";
          const newPath = shouldAddToPath ? [...currentPath, item.title] : currentPath;

          // Check if this item itself matches
          if (item.path) {
            const normalizedItemPath = item.path.replace(/\/$/, "");
            const normalizedTargetPath = targetPath.replace(/\/$/, "");

            // Check if this item's path starts with target (item is under target path)
            if (normalizedItemPath !== "/" && normalizedItemPath.startsWith(normalizedTargetPath)) {
              // Return the full path
              return newPath;
            }
          }

          // Check if this item's children match (for container items without paths)
          if (item.items && item.items.length > 0) {
            const childResult = searchRecursive(item.items, newPath);
            if (childResult.length > 0) {
              return childResult;
            }
          }
        }
        return [];
      };

      return searchRecursive(items);
    };

    const filteredMainMenu = filterItemsByPermissionsAndRoles(
      allLeafItems,
      userPermissions,
      userRoles
    ).map((item) => {
      const rawBreadcrumbs = buildBreadcrumbPath(nativeMenuItems, item.path) || [];
      // Remove the leaf item's own title to avoid duplicate when rendering
      const trimmedBreadcrumbs =
        rawBreadcrumbs.length > 0 && rawBreadcrumbs[rawBreadcrumbs.length - 1] === item.title
          ? rawBreadcrumbs.slice(0, -1)
          : rawBreadcrumbs;
      return {
        ...item,
        breadcrumbs: trimmedBreadcrumbs,
      };
    });

    // Index leaf items by path for direct permission lookup
    const leafItemIndex = allLeafItems.reduce((acc, item) => {
      if (item.path) acc[item.path.replace(/\/$/, "")] = item;
      return acc;
    }, {});

    // Filter tab options based on the actual page item's permissions
    const filteredTabOptions = tabOptions
      .map((tab) => {
        const normalizedTabPath = tab.path.replace(/\/$/, "");
        const normalizedBasePath = tab.basePath?.replace(/\/$/, "");

        // Try exact match first
        let pageItem = leafItemIndex[normalizedTabPath];

        // Fallback: find any menu item whose path starts with the basePath
        if (!pageItem && normalizedBasePath) {
          pageItem = allLeafItems.find((item) => {
            const normalizedItemPath = item.path?.replace(/\/$/, "");
            return normalizedItemPath && normalizedItemPath.startsWith(normalizedBasePath);
          });
        }

        if (!pageItem) return null; // No matching page definition

        // Permission/role check using the page item directly
        const hasAccessToPage =
          filterItemsByPermissionsAndRoles([pageItem], userPermissions, userRoles).length > 0;
        if (!hasAccessToPage) return null;

        // Build breadcrumbs using the pageItem's path (which exists in menu tree)
        const breadcrumbs = buildBreadcrumbPath(nativeMenuItems, pageItem.path) || [];
        // Remove duplicate last crumb if equal to tab title (will be appended during render)
        const trimmedBreadcrumbs =
          breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1] === tab.title
            ? breadcrumbs.slice(0, -1)
            : breadcrumbs;
        return {
          ...tab,
          breadcrumbs: trimmedBreadcrumbs,
        };
      })
      .filter(Boolean);

    return [...filteredMainMenu, ...filteredTabOptions];
  }, [userPermissions, userRoles, tabOptions]);

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Optionally handle Enter key
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // do something if needed, e.g., analytics or highlight
    }
  };

  // Filter leaf items by matching title, path, or breadcrumbs
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredItems = flattenedMenuItems.filter((leaf) => {
    const inTitle = leaf.title?.toLowerCase().includes(normalizedSearch);
    const inPath = leaf.path?.toLowerCase().includes(normalizedSearch);
    const inBreadcrumbs = leaf.breadcrumbs?.some((crumb) =>
      crumb?.toLowerCase().includes(normalizedSearch)
    );
    // If there's no search value, show no results (you could change this logic)
    return normalizedSearch ? inTitle || inPath || inBreadcrumbs : false;
  });

  // Helper to bold‐highlight the matched text
  const highlightMatch = (text = "") => {
    if (!normalizedSearch) return text;
    const parts = text.split(new RegExp(`(${normalizedSearch})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === normalizedSearch ? (
        <Typography component="span" fontWeight="bold" key={i}>
          {part}
        </Typography>
      ) : (
        part
      )
    );
  };

  // Helper to get item type label
  const getItemTypeLabel = (item) => {
    if (item.type === "tab") {
      return "Tab";
    }
    return "Page";
  };

  // Click handler: shallow navigate with Next.js
  const handleCardClick = (path) => {
    router.push(path, undefined, { shallow: true });
    handleClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
      <DialogTitle>CIPP Search</DialogTitle>
      <DialogContent />
      <DialogContent>
        <Box>
          <TextField
            fullWidth
            label="Search any menu item or page in CIPP"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={(event) => {
              // Select all text on focus if there's content
              if (event.target.value) {
                event.target.select();
              }
            }}
            value={searchValue}
            autoFocus
          />

          {/* Show results or "No results" */}
          {searchValue.trim().length > 0 ? (
            filteredItems.length > 0 ? (
              <Grid container spacing={2} mt={2}>
                {filteredItems.map((item, index) => (
                  <Grid size={{ md: 12, sm: 12, xs: 12 }} key={index}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardActionArea
                        onClick={() => handleCardClick(item.path)}
                        aria-label={`Navigate to ${item.title}`}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography variant="h6">{highlightMatch(item.title)}</Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                backgroundColor: item.type === "tab" ? "info.main" : "primary.main",
                                color: "white",
                                fontSize: "0.7rem",
                              }}
                            >
                              {getItemTypeLabel(item)}
                            </Typography>
                          </Box>
                          {item.breadcrumbs && item.breadcrumbs.length > 0 && (
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                              {item.breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                  {highlightMatch(crumb)}
                                  {idx < item.breadcrumbs.length - 1 && " > "}
                                </React.Fragment>
                              ))}
                              {" > "}
                              {highlightMatch(item.title)}
                            </Typography>
                          )}
                          <Typography variant="body2" color="textSecondary">
                            Path: {highlightMatch(item.path)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box mt={2}>No results found.</Box>
            )
          ) : (
            <Box mt={2}>
              <Typography variant="body2">Type something to search by title or path.</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
