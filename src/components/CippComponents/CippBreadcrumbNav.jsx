import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Breadcrumbs, Link, Typography, Box, IconButton, Tooltip } from "@mui/material";
import { NavigateNext, History, AccountTree } from "@mui/icons-material";
import { nativeMenuItems } from "../../layouts/config";
import { useSettings } from "../../hooks/use-settings";

const MAX_HISTORY_STORAGE = 20; // Maximum number of pages to keep in history
const MAX_BREADCRUMB_DISPLAY = 5; // Maximum number of breadcrumbs to display at once

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
    }
  }

  return tabOptions;
}

export const CippBreadcrumbNav = () => {
  const router = useRouter();
  const settings = useSettings();
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState(settings.breadcrumbMode || "hierarchical");
  const [tabOptions, setTabOptions] = useState([]);
  const lastRouteRef = useRef(null);
  const titleCheckCountRef = useRef(0);
  const titleCheckIntervalRef = useRef(null);

  // Helper function to filter out unnecessary query parameters
  const getCleanQueryParams = (query) => {
    const cleaned = { ...query };
    // Remove tenantFilter if it's "AllTenants" or not explicitly needed
    if (cleaned.tenantFilter === "AllTenants" || cleaned.tenantFilter === undefined) {
      delete cleaned.tenantFilter;
    }
    return cleaned;
  };

  // Helper function to clean page titles
  const cleanPageTitle = (title) => {
    if (!title) return title;
    // Remove AllTenants and any surrounding separators
    return title
      .replace(/\s*-\s*AllTenants\s*/, "")
      .replace(/AllTenants\s*-\s*/, "")
      .replace(/AllTenants/, "")
      .trim();
  };

  // Load tab options on mount
  useEffect(() => {
    loadTabOptions().then(setTabOptions);
  }, []);

  useEffect(() => {
    // Only update when the route actually changes, not on every render
    const currentRoute = router.asPath;

    // Skip if this is the same route as last time
    if (lastRouteRef.current === currentRoute) {
      return;
    }

    lastRouteRef.current = currentRoute;

    // Clear any existing title check interval
    if (titleCheckIntervalRef.current) {
      clearInterval(titleCheckIntervalRef.current);
      titleCheckIntervalRef.current = null;
    }

    // Reset check counter
    titleCheckCountRef.current = 0;

    // Function to check and update title
    const checkTitle = () => {
      titleCheckCountRef.current++;

      // Stop checking after 50 attempts (5 seconds) to prevent infinite intervals
      if (titleCheckCountRef.current > 50) {
        if (titleCheckIntervalRef.current) {
          clearInterval(titleCheckIntervalRef.current);
          titleCheckIntervalRef.current = null;
        }
        return;
      }

      let pageTitle = document.title.replace(" - CIPP", "").trim();

      // Remove tenant domain from title (e.g., "Groups - domain.onmicrosoft.com" -> "Groups")
      // But only if it looks like a domain (contains a dot)
      const parts = pageTitle.split(" - ");
      if (parts.length > 1 && parts[parts.length - 1].includes(".")) {
        pageTitle = parts.slice(0, -1).join(" - ").trim();
      }

      // Clean AllTenants from title
      pageTitle = cleanPageTitle(pageTitle);

      // Skip if title is empty, generic, or error page
      if (
        !pageTitle ||
        pageTitle === "CIPP" ||
        pageTitle.toLowerCase().includes("error") ||
        pageTitle === "404" ||
        pageTitle === "500"
      ) {
        return;
      }

      // Normalize URL for comparison (remove trailing slashes and query params)
      const normalizeUrl = (url) => {
        // Remove query params and trailing slashes for comparison
        return url.split("?")[0].replace(/\/$/, "").toLowerCase();
      };

      const currentPage = {
        title: pageTitle,
        path: router.pathname,
        query: { ...router.query },
        fullUrl: router.asPath,
        timestamp: Date.now(),
      };

      const normalizedCurrentUrl = normalizeUrl(currentPage.fullUrl);

      setHistory((prevHistory) => {
        // Check if last entry has same title AND similar path (prevent duplicate with same content)
        const lastEntry = prevHistory[prevHistory.length - 1];
        if (lastEntry) {
          const sameTitle = lastEntry.title.trim() === currentPage.title.trim();
          const samePath = normalizeUrl(lastEntry.fullUrl) === normalizedCurrentUrl;

          if (sameTitle && samePath) {
            // Exact duplicate - don't add, just stop checking
            if (titleCheckIntervalRef.current) {
              clearInterval(titleCheckIntervalRef.current);
              titleCheckIntervalRef.current = null;
            }
            return prevHistory;
          }

          if (samePath && !sameTitle) {
            // Same URL but title changed - update the entry
            const updated = [...prevHistory];
            updated[prevHistory.length - 1] = {
              ...currentPage,
              query: getCleanQueryParams(currentPage.query),
            };
            if (titleCheckIntervalRef.current) {
              clearInterval(titleCheckIntervalRef.current);
              titleCheckIntervalRef.current = null;
            }
            return updated;
          }
        }

        // Find if this URL exists anywhere EXCEPT the last position in history
        const existingIndex = prevHistory.findIndex((entry, index) => {
          // Skip the last entry since we already checked it above
          if (index === prevHistory.length - 1) return false;
          return normalizeUrl(entry.fullUrl) === normalizedCurrentUrl;
        });

        // URL not in history (except possibly as last entry which we handled) - add as new entry
        if (existingIndex === -1) {
          const cleanedCurrentPage = {
            ...currentPage,
            query: getCleanQueryParams(currentPage.query),
          };
          const newHistory = [...prevHistory, cleanedCurrentPage];

          // Keep only the last MAX_HISTORY_STORAGE pages
          const trimmedHistory =
            newHistory.length > MAX_HISTORY_STORAGE
              ? newHistory.slice(-MAX_HISTORY_STORAGE)
              : newHistory;

          // Don't stop checking yet - title might still be loading
          return trimmedHistory;
        }

        // URL exists in history but not as last entry - user navigated back
        // Truncate history after this point and update the entry
        if (titleCheckIntervalRef.current) {
          clearInterval(titleCheckIntervalRef.current);
          titleCheckIntervalRef.current = null;
        }
        const updated = prevHistory.slice(0, existingIndex + 1);
        updated[existingIndex] = {
          ...currentPage,
          query: getCleanQueryParams(currentPage.query),
        };
        return updated;
      });
    };

    // Start checking for title updates
    titleCheckIntervalRef.current = setInterval(checkTitle, 100);

    return () => {
      if (titleCheckIntervalRef.current) {
        clearInterval(titleCheckIntervalRef.current);
        titleCheckIntervalRef.current = null;
      }
    };
  }, [router.asPath, router.pathname, router.query]);

  const handleBreadcrumbClick = (index) => {
    const page = history[index];
    if (page) {
      const cleanedQuery = getCleanQueryParams(page.query);
      router.push({
        pathname: page.path,
        query: cleanedQuery,
      });
    }
  };

  // State to track current page title for hierarchical mode
  const [currentPageTitle, setCurrentPageTitle] = useState(null);
  const hierarchicalTitleCheckRef = useRef(null);
  const hierarchicalCheckCountRef = useRef(0);

  // Watch for title changes to update hierarchical breadcrumbs
  useEffect(() => {
    if (mode === "hierarchical") {
      // Clear any existing interval
      if (hierarchicalTitleCheckRef.current) {
        clearInterval(hierarchicalTitleCheckRef.current);
        hierarchicalTitleCheckRef.current = null;
      }

      // Reset counter
      hierarchicalCheckCountRef.current = 0;

      const updateTitle = () => {
        hierarchicalCheckCountRef.current++;

        // Stop after 20 attempts (10 seconds) to prevent infinite checking
        if (hierarchicalCheckCountRef.current > 20) {
          if (hierarchicalTitleCheckRef.current) {
            clearInterval(hierarchicalTitleCheckRef.current);
            hierarchicalTitleCheckRef.current = null;
          }
          return;
        }

        let pageTitle = document.title.replace(" - CIPP", "").trim();
        const parts = pageTitle.split(" - ");
        const cleanTitle =
          parts.length > 1 && parts[parts.length - 1].includes(".")
            ? parts.slice(0, -1).join(" - ").trim()
            : pageTitle;

        // Clean AllTenants from title
        const finalTitle = cleanPageTitle(cleanTitle);

        if (finalTitle && finalTitle !== "CIPP" && !finalTitle.toLowerCase().includes("loading")) {
          setCurrentPageTitle(finalTitle);
          // Stop checking once we have a valid title
          if (hierarchicalTitleCheckRef.current) {
            clearInterval(hierarchicalTitleCheckRef.current);
            hierarchicalTitleCheckRef.current = null;
          }
        }
      };

      // Initial update
      updateTitle();

      // Only start interval if we don't have a valid title yet
      if (!currentPageTitle || currentPageTitle.toLowerCase().includes("loading")) {
        hierarchicalTitleCheckRef.current = setInterval(updateTitle, 500);
      }

      return () => {
        if (hierarchicalTitleCheckRef.current) {
          clearInterval(hierarchicalTitleCheckRef.current);
          hierarchicalTitleCheckRef.current = null;
        }
      };
    }
  }, [mode, router.pathname]);

  // Build hierarchical breadcrumbs from config.js navigation structure
  const buildHierarchicalBreadcrumbs = () => {
    const currentPath = router.pathname;

    // Helper to check if paths match (handles dynamic routes)
    const pathsMatch = (menuPath, currentPath) => {
      if (!menuPath) return false;

      // Exact match
      if (menuPath === currentPath) return true;

      // Check if current path starts with menu path (for nested routes)
      // e.g., menu: "/identity/administration/users" matches "/identity/administration/users/edit"
      if (currentPath.startsWith(menuPath + "/")) return true;

      return false;
    };

    const findPathInMenu = (items, path = []) => {
      for (const item of items) {
        const currentBreadcrumb = [...path];

        // Add current item to path if it has a title
        // Include all items (headers, groups, and pages) to show full hierarchy
        if (item.title) {
          currentBreadcrumb.push({
            title: item.title,
            path: item.path,
            type: item.type,
            query: {}, // Menu items don't have query params by default
          });
        }

        // Check if this item matches the current path
        if (item.path && pathsMatch(item.path, currentPath)) {
          // If this is the current page, include current query params (cleaned)
          if (item.path === currentPath) {
            const lastItem = currentBreadcrumb[currentBreadcrumb.length - 1];
            if (lastItem) {
              lastItem.query = getCleanQueryParams(router.query);
            }
          }
          return currentBreadcrumb;
        }

        // Recursively search children
        if (item.items && item.items.length > 0) {
          const result = findPathInMenu(item.items, currentBreadcrumb);
          if (result.length > 0) {
            return result;
          }
        }
      }
      return [];
    };

    let result = findPathInMenu(nativeMenuItems);

    // If we found a menu item, check if the current path matches any tab
    // If so, tabOptions wins and we use its label
    if (result.length > 0 && tabOptions.length > 0) {
      const normalizedCurrentPath = currentPath.replace(/\/$/, "");

      // Check if current path matches any tab (exact match)
      const matchingTab = tabOptions.find((tab) => {
        const normalizedTabPath = tab.path.replace(/\/$/, "");
        return normalizedTabPath === normalizedCurrentPath;
      });

      if (matchingTab) {
        // Tab matches the current path - use tab's label instead of config's
        result = result.map((item, idx) => {
          if (idx === result.length - 1) {
            return {
              ...item,
              title: matchingTab.title,
              type: "tab",
            };
          }
          return item;
        });
      }
    }

    // If not found in main menu, check if it's a tab page
    if (result.length === 0 && tabOptions.length > 0) {
      const normalizedCurrentPath = currentPath.replace(/\/$/, "");

      // Find matching tab option
      const matchingTab = tabOptions.find((tab) => {
        const normalizedTabPath = tab.path.replace(/\/$/, "");
        return normalizedTabPath === normalizedCurrentPath;
      });

      if (matchingTab) {
        // Find the base page in the menu and build full path to it
        const normalizedBasePath = matchingTab.basePath?.replace(/\/$/, "");

        // Recursively find the base page and build breadcrumb path
        const findBasePageWithPath = (items, path = []) => {
          for (const item of items) {
            const currentBreadcrumb = [...path];

            // Add current item to path if it has a title
            if (item.title) {
              currentBreadcrumb.push({
                title: item.title,
                path: item.path,
                type: item.type,
                query: {}, // Menu items don't have query params by default
              });
            }

            // Check if this item matches the base path
            if (item.path) {
              const normalizedItemPath = item.path.replace(/\/$/, "");
              if (
                normalizedItemPath === normalizedBasePath ||
                normalizedItemPath.startsWith(normalizedBasePath)
              ) {
                return currentBreadcrumb;
              }
            }

            // Recursively search children
            if (item.items && item.items.length > 0) {
              const found = findBasePageWithPath(item.items, currentBreadcrumb);
              if (found.length > 0) {
                return found;
              }
            }
          }
          return [];
        };

        const basePagePath = findBasePageWithPath(nativeMenuItems);

        if (basePagePath.length > 0) {
          result = basePagePath;

          // Add the tab as the final breadcrumb with current query params (cleaned)
          result.push({
            title: matchingTab.title,
            path: matchingTab.path,
            type: "tab",
            query: getCleanQueryParams(router.query), // Include current query params for tab page
          });
        }
      }
    }

    // Check if we're on a nested page under a menu item (e.g., edit page)
    if (result.length > 0) {
      const lastItem = result[result.length - 1];
      if (lastItem.path && lastItem.path !== currentPath && currentPath.startsWith(lastItem.path)) {
        // Use the tracked page title if available, otherwise fall back to document.title
        let tabTitle = currentPageTitle || document.title.replace(" - CIPP", "").trim();

        // Clean AllTenants from title
        tabTitle = cleanPageTitle(tabTitle);

        // Add tab as an additional breadcrumb item
        if (
          tabTitle &&
          tabTitle !== lastItem.title &&
          !tabTitle.toLowerCase().includes("loading")
        ) {
          result.push({
            title: tabTitle,
            path: currentPath,
            type: "tab",
            query: getCleanQueryParams(router.query), // Include current query params (cleaned)
          });
        }
      }
    }

    return result;
  };

  // Handle click for hierarchical breadcrumbs
  const handleHierarchicalClick = (path, query) => {
    if (path) {
      const cleanedQuery = getCleanQueryParams(query);
      if (cleanedQuery && Object.keys(cleanedQuery).length > 0) {
        router.push({
          pathname: path,
          query: cleanedQuery,
        });
      } else {
        router.push(path);
      }
    }
  };

  // Toggle between modes
  const toggleMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "hierarchical" ? "history" : "hierarchical";
      settings.handleUpdate({ breadcrumbMode: newMode });
      return newMode;
    });
  };

  // Render based on mode
  if (mode === "hierarchical") {
    let breadcrumbs = buildHierarchicalBreadcrumbs();

    // Fallback: If no breadcrumbs found in navigation config, generate from URL path
    if (breadcrumbs.length === 0) {
      const pathSegments = router.pathname.split("/").filter((segment) => segment);

      if (pathSegments.length > 0) {
        breadcrumbs = pathSegments.map((segment, index) => {
          // Build the path up to this segment
          const path = "/" + pathSegments.slice(0, index + 1).join("/");

          // Format segment as title (replace hyphens with spaces, capitalize words)
          const title = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return {
            title,
            path,
            type: "fallback",
            query: index === pathSegments.length - 1 ? getCleanQueryParams(router.query) : {},
          };
        });

        // If we have a current page title from document.title, use it for the last breadcrumb
        if (
          currentPageTitle &&
          currentPageTitle !== "CIPP" &&
          !currentPageTitle.toLowerCase().includes("loading")
        ) {
          breadcrumbs[breadcrumbs.length - 1].title = cleanPageTitle(currentPageTitle);
        }
      }
    }

    // Don't show if still no breadcrumbs found
    if (breadcrumbs.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mb: 1, width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Switch to history mode">
          <IconButton size="small" onClick={toggleMode} sx={{ p: 0.5 }}>
            <AccountTree fontSize="small" />
          </IconButton>
        </Tooltip>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="page hierarchy"
          sx={{ fontSize: "0.875rem", flexGrow: 1 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            // Items without paths (headers/groups) - show as text
            if (!crumb.path) {
              return (
                <Typography
                  key={index}
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{ fontWeight: isLast ? 500 : 400 }}
                >
                  {crumb.title}
                </Typography>
              );
            }

            // All items with paths are clickable, including the last one
            return (
              <Link
                key={index}
                component="button"
                variant="subtitle2"
                onClick={() => handleHierarchicalClick(crumb.path, crumb.query)}
                sx={{
                  textDecoration: "none",
                  color: isLast ? "text.primary" : "text.secondary",
                  fontWeight: isLast ? 500 : 400,
                  "&:hover": {
                    textDecoration: "underline",
                    color: "primary.main",
                  },
                }}
              >
                {crumb.title}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
    );
  }

  // Default mode: history-based breadcrumbs
  // Don't show breadcrumbs if we have no history
  if (history.length === 0) {
    return null;
  }

  // Show only the last MAX_BREADCRUMB_DISPLAY items
  const visibleHistory = history.slice(-MAX_BREADCRUMB_DISPLAY);

  return (
    <Box sx={{ mb: 1, width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
      <Tooltip title="Switch to hierarchy mode">
        <IconButton size="small" onClick={toggleMode} sx={{ p: 0.5 }}>
          <History fontSize="small" />
        </IconButton>
      </Tooltip>
      <Breadcrumbs
        maxItems={MAX_BREADCRUMB_DISPLAY}
        separator={<NavigateNext fontSize="small" />}
        aria-label="navigation history"
        sx={{ fontSize: "0.875rem", flexGrow: 1 }}
      >
        {visibleHistory.map((page, index) => {
          const isLast = index === visibleHistory.length - 1;
          // Calculate the actual index in the full history
          const actualIndex = history.length - visibleHistory.length + index;

          if (isLast) {
            return (
              <Typography
                key={index}
                color="text.primary"
                variant="subtitle2"
                sx={{ fontWeight: 500 }}
              >
                {page.title}
              </Typography>
            );
          }

          return (
            <Link
              key={actualIndex}
              component="button"
              variant="subtitle2"
              onClick={() => handleBreadcrumbClick(actualIndex)}
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                "&:hover": {
                  textDecoration: "underline",
                  color: "primary.main",
                },
              }}
            >
              {page.title}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};
