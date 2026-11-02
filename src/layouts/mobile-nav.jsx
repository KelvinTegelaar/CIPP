import { useMemo, useState } from "react";
import { CippIcons } from "../utils/icon-registry";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { Box, Divider, InputAdornment, OutlinedInput, Stack, SwipeableDrawer, Typography } from "@mui/material";
import { Logo } from "../components/logo";
import { CippSponsor } from "../components/CippComponents/CippSponsor";
import { Scrollbar } from "../components/scrollbar";
import { paths } from "../paths";
import { MobileNavItem } from "./mobile-nav-item";
import { SideNavBookmarks } from "./side-nav-bookmarks";
import { useSettings } from "../hooks/use-settings";
import { useSwipeCloseTransition } from "../hooks/use-swipe-close-transition";

// 80% of the viewport truncated third-level labels at 320px (256px) and was absurd at
// 899px (719px). Cap it like a real nav drawer.
const MOBILE_NAV_WIDTH = "min(360px, 88vw)";

const renderItems = ({ depth = 0, items, pathname, forceOpen = false }) =>
  items.reduce(
    (acc, item) =>
      reduceChildRoutes({
        acc,
        depth,
        item,
        pathname,
        forceOpen,
      }),
    []
  );

const reduceChildRoutes = ({ acc, depth, item, pathname, forceOpen }) => {
  const checkPath = !!(item.path && pathname);
  // Special handling for root path "/" to avoid matching all paths
  const partialMatch = checkPath && item.path !== "/" ? pathname.includes(item.path) : false;
  const exactMatch = checkPath ? pathname === item.path : false;

  if (item.items) {
    acc.push(
      <MobileNavItem
        active={partialMatch}
        depth={depth}
        external={item.external}
        icon={item.icon}
        // Search results re-render with a different key so collapse state resets open
        key={`${item.title}-${forceOpen ? "open" : "closed"}`}
        openImmediately={forceOpen || partialMatch}
        path={item.path}
        scope={item.scope}
        title={item.title}
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
            depth: depth + 1,
            items: item.items,
            pathname,
            forceOpen,
          })}
        </Stack>
      </MobileNavItem>
    );
  } else {
    acc.push(
      <MobileNavItem
        active={exactMatch}
        depth={depth}
        external={item.external}
        icon={item.icon}
        key={item.title}
        path={item.path}
        scope={item.scope}
        title={item.title}
      />
    );
  }

  return acc;
};

// Prune the nav tree to items whose title matches the query, keeping ancestors of matches.
// A matching branch keeps its whole subtree so its children stay reachable.
const filterNavItems = (items, query) =>
  items.reduce((acc, item) => {
    const selfMatch = item.title?.toLowerCase().includes(query);
    if (item.items) {
      if (selfMatch) {
        acc.push(item);
        return acc;
      }
      const filteredChildren = filterNavItems(item.items, query);
      if (filteredChildren.length > 0) {
        acc.push({ ...item, items: filteredChildren });
      }
      return acc;
    }
    if (selfMatch) {
      acc.push(item);
    }
    return acc;
  }, []);

export const MobileNav = (props) => {
  const { open, onClose, onOpen, items } = props;
  const pathname = usePathname();
  const settings = useSettings();
  const swipeClose = useSwipeCloseTransition(open, onClose);
  const [search, setSearch] = useState("");
  const showSidebarBookmarks = settings.bookmarkSidebar !== false;

  const query = search.trim().toLowerCase();
  const visibleItems = useMemo(
    () => (query ? filterNavItems(items ?? [], query) : (items ?? [])),
    [items, query]
  );

  return (
    <SwipeableDrawer
      anchor="left"
      // MUI's default is `iOS`, so everywhere else a 20px fixed strip covers the left edge.
      // A touch on it flips maybeSwiping (modal opens), and with no touchmove the end handler
      // bails before onOpen/onClose, so the drawer animates in and back out. Swipe-to-close on
      // the open drawer is a separate path and still works.
      disableSwipeToOpen
      onClose={swipeClose.onClose}
      onOpen={onOpen ?? (() => {})}
      open={open}
      slotProps={{
        transition: swipeClose.transitionProps,

        paper: {
          sx: {
            // desktop side-nav renders on background.default, keep the drawer on the same surface
            backgroundColor: "background.default",
            width: MOBILE_NAV_WIDTH,
            // Column layout so the sponsor footer pins to the bottom and the menu scrolls
            // between it and the sticky header, rather than the footer riding the list.
            display: "flex",
            flexDirection: "column",
          },
        }
      }}
      variant="temporary">
      {/* Sticky header: logo (relocated from the mobile top bar) + nav search */}
      <Box sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
        <Box
          component={NextLink}
          href={paths.index}
          onClick={onClose}
          sx={{
            display: "inline-flex",
            height: 24,
            width: 24,
            mb: 1.5,
          }}
        >
          <Logo />
        </Box>
          <OutlinedInput
            fullWidth
            size="small"
            type="search"
            placeholder="Search navigation…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search navigation"
            slotProps={{ input: { enterKeyHint: "search" } }}
          startAdornment={
            <InputAdornment position="start">
              <CippIcons.Search fontSize="small" />
            </InputAdornment>
          }
          sx={{ minHeight: 44 }}
        />
      </Box>
      <Scrollbar
        sx={{
          flexGrow: 1,
          minHeight: 0,
          // wrapper is height:inherit, auto under flex-grow, and the escaped list height
          // scrolls the drawer paper itself
          "& .simplebar-wrapper": {
            height: "100%",
          },
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          component="nav"
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            px: 2,
            pb: 1,
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
            {showSidebarBookmarks && !query && (
              <>
                <SideNavBookmarks collapse={false} />
                <Divider sx={{ my: 1 }} />
              </>
            )}
            {/* Render all menu items */}
            {renderItems({
              depth: 0,
              items: visibleItems,
              pathname,
              forceOpen: Boolean(query),
            })}
            {query && visibleItems.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  px: 1,
                  py: 2
                }}>
                No pages match “{search}”.
              </Typography>
            )}
          </Box>
        </Box>
      </Scrollbar>
      {/* Pinned below the scrolling menu rather than at the end of it, so it stays visible
          without the long nav list pushing it off-screen. Compact: the drawer's vertical
          space belongs to navigation. */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          pb: "calc(env(safe-area-inset-bottom) + 8px)",
        }}
      >
        <CippSponsor compact />
      </Box>
    </SwipeableDrawer>
  );
};

MobileNav.propTypes = {
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  open: PropTypes.bool,
};
