import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Breadcrumbs, Link, Typography, Box, IconButton, Tooltip } from "@mui/material";
import { NavigateNext, History, AccountTree } from "@mui/icons-material";
import { nativeMenuItems } from "../../layouts/config";
import { useSettings } from "../../hooks/use-settings";

const MAX_HISTORY_STORAGE = 20; // Maximum number of pages to keep in history
const MAX_BREADCRUMB_DISPLAY = 5; // Maximum number of breadcrumbs to display at once

export const CippBreadcrumbNav = () => {
  const router = useRouter();
  const settings = useSettings();
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState(settings.breadcrumbMode || "hierarchical");
  const lastRouteRef = useRef(null);
  const titleCheckCountRef = useRef(0);
  const titleCheckIntervalRef = useRef(null);

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

      const currentPage = {
        title: pageTitle,
        path: router.pathname,
        query: { ...router.query },
        fullUrl: router.asPath,
        timestamp: Date.now(),
      };

      setHistory((prevHistory) => {
        // Check if this exact URL is already the last entry
        const lastEntry = prevHistory[prevHistory.length - 1];
        if (lastEntry && lastEntry.fullUrl === currentPage.fullUrl) {
          // Update title if it changed, but don't add duplicate
          if (lastEntry.title !== currentPage.title) {
            // Stop checking once we have a valid title
            if (titleCheckIntervalRef.current) {
              clearInterval(titleCheckIntervalRef.current);
              titleCheckIntervalRef.current = null;
            }
            const updated = [...prevHistory];
            updated[updated.length - 1] = currentPage;
            return updated;
          }
          // Stop checking if title hasn't changed
          if (titleCheckIntervalRef.current) {
            clearInterval(titleCheckIntervalRef.current);
            titleCheckIntervalRef.current = null;
          }
          return prevHistory;
        }

        // Check if this URL exists anywhere in history (user clicked back or navigated to previous page)
        const existingIndex = prevHistory.findIndex(
          (entry) => entry.fullUrl === currentPage.fullUrl
        );

        if (existingIndex !== -1) {
          // User navigated back - truncate everything after this point and update the entry
          if (titleCheckIntervalRef.current) {
            clearInterval(titleCheckIntervalRef.current);
            titleCheckIntervalRef.current = null;
          }
          const updated = prevHistory.slice(0, existingIndex + 1);
          updated[existingIndex] = currentPage; // Update with latest timestamp/title
          return updated;
        }

        // Check if the last 2 entries have the same title (duplicate pages with different URLs)
        // This happens when navigating between tabs on the same page
        if (prevHistory.length > 0) {
          const lastTitle = prevHistory[prevHistory.length - 1]?.title;
          if (lastTitle === currentPage.title) {
            // Replace the last entry instead of adding a duplicate
            if (titleCheckIntervalRef.current) {
              clearInterval(titleCheckIntervalRef.current);
              titleCheckIntervalRef.current = null;
            }
            const updated = [...prevHistory];
            updated[updated.length - 1] = currentPage;
            return updated;
          }
        }

        // Stop checking once we have a valid title and added it to history
        if (titleCheckIntervalRef.current) {
          clearInterval(titleCheckIntervalRef.current);
          titleCheckIntervalRef.current = null;
        }

        // Add new page to history
        const newHistory = [...prevHistory, currentPage];

        // Keep only the last MAX_HISTORY_STORAGE pages
        if (newHistory.length > MAX_HISTORY_STORAGE) {
          return newHistory.slice(-MAX_HISTORY_STORAGE);
        }

        return newHistory;
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
      router.push({
        pathname: page.path,
        query: page.query,
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

        const pageTitle = document.title.replace(" - CIPP", "").trim();
        const parts = pageTitle.split(" - ");
        const cleanTitle =
          parts.length > 1 && parts[parts.length - 1].includes(".")
            ? parts.slice(0, -1).join(" - ").trim()
            : pageTitle;

        if (cleanTitle && cleanTitle !== "CIPP" && !cleanTitle.toLowerCase().includes("loading")) {
          setCurrentPageTitle(cleanTitle);
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
    const breadcrumbPath = [];

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
          });
        }

        // Check if this item matches the current path
        if (item.path && pathsMatch(item.path, currentPath)) {
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

    // Check if we're on a tab page by looking for the base path in result
    // and the current path being different (e.g., base: /user, current: /user/edit)
    if (result.length > 0) {
      const lastItem = result[result.length - 1];
      if (lastItem.path && lastItem.path !== currentPath && currentPath.startsWith(lastItem.path)) {
        // Use the tracked page title if available, otherwise fall back to document.title
        const tabTitle = currentPageTitle || document.title.replace(" - CIPP", "").trim();

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
          });
        }
      }
    }

    return result;
  };

  // Handle click for hierarchical breadcrumbs
  const handleHierarchicalClick = (path) => {
    if (path) {
      router.push(path);
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
    const breadcrumbs = buildHierarchicalBreadcrumbs();

    // Don't show if no breadcrumbs found
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
                onClick={() => handleHierarchicalClick(crumb.path)}
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
