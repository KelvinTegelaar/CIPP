import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { Box, Divider, Drawer, Stack } from "@mui/material";
import { SideNavItem } from "./side-nav-item";
import { SideNavBookmarks } from "./side-nav-bookmarks";
import { ApiGetCall } from "../api/ApiCall.jsx";
import { CippSponsor } from "../components/CippComponents/CippSponsor";
import { useSettings } from "../hooks/use-settings";

const SIDE_NAV_WIDTH = 270;
const SIDE_NAV_COLLAPSED_WIDTH = 73; // icon size + padding + border right
const TOP_NAV_HEIGHT = 64;

const markOpenItems = (items, pathname) => {
  return items.map((item) => {
    const checkPath = !!(item.path && pathname);
    const exactMatch = checkPath ? pathname === item.path : false;
    // Special handling for root path "/" to avoid matching all paths
    const partialMatch = checkPath && item.path !== "/" ? pathname.startsWith(item.path) : false;

    let openImmediately = exactMatch;
    let newItems = item.items || [];

    if (newItems.length > 0) {
      newItems = markOpenItems(newItems, pathname);
      const childOpen = newItems.some((child) => child.openImmediately);
      openImmediately = openImmediately || childOpen || exactMatch; // Ensure parent opens if child is open
    } else {
      openImmediately = openImmediately || partialMatch; // Leaf items open on partial match
    }

    return {
      ...item,
      items: newItems,
      openImmediately,
    };
  });
};

const renderItems = ({ collapse = false, depth = 0, items, pathname }) =>
  items.reduce((acc, item) => reduceChildRoutes({ acc, collapse, depth, item, pathname }), []);

const reduceChildRoutes = ({ acc, collapse, depth, item, pathname }) => {
  const checkPath = !!(item.path && pathname);
  const exactMatch = checkPath && pathname === item.path;
  // Special handling for root path "/" to avoid matching all paths
  const partialMatch = checkPath && item.path !== "/" ? pathname.startsWith(item.path) : false;

  const hasChildren = item.items && item.items.length > 0;
  const isActive = exactMatch || (partialMatch && !hasChildren);

  if (hasChildren) {
    acc.push(
      <SideNavItem
        active={isActive}
        collapse={collapse}
        depth={depth}
        external={item.external}
        icon={item.icon}
        key={item.title}
        openImmediately={item.openImmediately}
        path={item.path}
        title={item.title}
        type={item.type}
      >
        <Stack
          component="ul"
          spacing={0.5}
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
          }}
        >
          {renderItems({
            collapse,
            depth: depth + 1,
            items: item.items,
            pathname,
          })}
        </Stack>
      </SideNavItem>,
    );
  } else {
    acc.push(
      <SideNavItem
        active={isActive}
        collapse={collapse}
        depth={depth}
        external={item.external}
        icon={item.icon}
        key={item.title}
        path={item.path}
        title={item.title}
      />,
    );
  }

  return acc;
};

export const SideNav = (props) => {
  const { items, onPin, pinned = false } = props;
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const collapse = !(pinned || hovered);
  const { data: profile } = ApiGetCall({ url: "/api/me", queryKey: "authmecipp" });
  const settings = useSettings();
  const showSidebarBookmarks = settings.bookmarkSidebar !== false;
  const paperRef = useRef(null);

  // Intercept wheel events on the side nav to fully isolate scroll.
  // preventDefault stops wheel events from reaching the main content,
  // and manual scrollTop has no momentum so it stops instantly when the cursor leaves.
  // Uses RAF-based easing to smooth out discrete mouse wheel jumps.
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;

    let targetScrollTop = el.scrollTop;
    let animating = false;

    const animate = () => {
      const diff = targetScrollTop - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = targetScrollTop;
        animating = false;
        return;
      }
      el.scrollTop += diff * 0.25;
      requestAnimationFrame(animate);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const maxScroll = el.scrollHeight - el.clientHeight;
      targetScrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop + e.deltaY));
      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // Preprocess items to mark which should be open
  const processedItems = markOpenItems(items, pathname);
  return (
    <>
      {profile?.clientPrincipal && profile?.clientPrincipal?.userRoles?.length > 2 && (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            ref: paperRef,
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
            sx: {
              backgroundColor: "background.default",
              height: `calc(100% - ${TOP_NAV_HEIGHT}px)`,
              overflowX: "hidden",
              overflowY: "auto",
              scrollbarGutter: "stable",
              top: TOP_NAV_HEIGHT,
              transition: "width 250ms ease-in-out",
              width: collapse ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH,
              zIndex: (theme) => theme.zIndex.appBar - 100,
            },
          }}
        >
          <Box
            component="nav"
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              p: 2,
            }}
          >
            <Box
              component="ul"
              sx={{
                flexGrow: 1,
                listStyle: "none",
                m: 0,
                p: 0,
              }}
            >
              {/* Bookmarks section above Dashboard */}
              {showSidebarBookmarks && (
                <>
                  <SideNavBookmarks collapse={collapse} />
                  <Divider sx={{ my: 1 }} />
                </>
              )}
              {/* Render all menu items */}
              {renderItems({
                collapse,
                depth: 0,
                items: processedItems,
                pathname,
              })}
            </Box>{" "}
            {/* Add this closing tag */}
            {profile?.clientPrincipal && (
              <Box
                sx={{ position: "sticky", bottom: 0, backgroundColor: "background.default", pt: 1 }}
              >
                <CippSponsor />
              </Box>
            )}
          </Box>{" "}
          {/* Closing tag for the parent Box */}
        </Drawer>
      )}
    </>
  );
};

SideNav.propTypes = {
  onPin: PropTypes.func,
  pinned: PropTypes.bool,
};
