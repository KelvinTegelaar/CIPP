import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

const MAX_HISTORY_STORAGE = 20; // Maximum number of pages to keep in history
const MAX_BREADCRUMB_DISPLAY = 5; // Maximum number of breadcrumbs to display at once

export const CippBreadcrumbNav = () => {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const lastRouteRef = useRef(null);

  useEffect(() => {
    // Only update when the route actually changes, not on every render
    const currentRoute = router.asPath;

    // Skip if this is the same route as last time
    if (lastRouteRef.current === currentRoute) {
      return;
    }

    lastRouteRef.current = currentRoute;

    // Wait a tick for document.title to be updated
    const timer = setTimeout(() => {
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
            const updated = [...prevHistory];
            updated[updated.length - 1] = currentPage;
            return updated;
          }
          return prevHistory;
        }

        // Check if this URL exists anywhere in history (user clicked back or navigated to previous page)
        const existingIndex = prevHistory.findIndex(
          (entry) => entry.fullUrl === currentPage.fullUrl
        );

        if (existingIndex !== -1) {
          // User navigated back - truncate everything after this point and update the entry
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
            const updated = [...prevHistory];
            updated[updated.length - 1] = currentPage;
            return updated;
          }
        }

        // Add new page to history
        const newHistory = [...prevHistory, currentPage];

        // Keep only the last MAX_HISTORY_STORAGE pages
        if (newHistory.length > MAX_HISTORY_STORAGE) {
          return newHistory.slice(-MAX_HISTORY_STORAGE);
        }

        return newHistory;
      });
    }, 100); // Small delay to let title update

    return () => clearTimeout(timer);
  }, [router.asPath]);

  const handleBreadcrumbClick = (index) => {
    const page = history[index];
    if (page) {
      router.push({
        pathname: page.path,
        query: page.query,
      });
    }
  };

  // Don't show breadcrumbs if we have no history
  if (history.length === 0) {
    return null;
  }

  // Show only the last MAX_BREADCRUMB_DISPLAY items
  const visibleHistory = history.slice(-MAX_BREADCRUMB_DISPLAY);

  return (
    <Box sx={{ mb: 1, width: "100%" }}>
      <Breadcrumbs
        maxItems={MAX_BREADCRUMB_DISPLAY}
        separator={<NavigateNext fontSize="small" />}
        aria-label="navigation history"
        sx={{ fontSize: "0.875rem" }}
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
