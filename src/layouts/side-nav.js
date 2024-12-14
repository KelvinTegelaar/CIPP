import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { Box, Divider, Drawer, Stack } from "@mui/material";
import { Scrollbar } from "../components/scrollbar";
import { SideNavItem } from "./side-nav-item";

const SIDE_NAV_WIDTH = 270;
const SIDE_NAV_COLLAPSED_WIDTH = 73; // icon size + padding + border right
const TOP_NAV_HEIGHT = 64;

const markOpenItems = (items, pathname) => {
  return items.map((item) => {
    const checkPath = !!(item.path && pathname);
    const exactMatch = checkPath ? pathname === item.path : false;

    let openImmediately = exactMatch;
    let newItems = item.items || [];

    // If this item has children, recursively process them
    if (newItems.length > 0) {
      newItems = markOpenItems(newItems, pathname);
      // If any child is openImmediately or the current item's path partially matches the pathname, this should be open
      const childOpen = newItems.some((child) => child.openImmediately);
      const partialMatch = checkPath ? pathname.includes(item.path) : false;
      openImmediately = openImmediately || childOpen || partialMatch;
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
  const exactMatch = item.path === pathname;
  const isActive = exactMatch;
  const hasChildren = item.items && item.items.length > 0;

  if (hasChildren) {
    // Use item.openImmediately which we determined before
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
      </SideNavItem>
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
      />
    );
  }

  return acc;
};

export const SideNav = (props) => {
  const { items, onPin, pinned = false } = props;
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const collapse = !(pinned || hovered);

  // Preprocess items to mark which should be open
  const processedItems = markOpenItems(items, pathname);

  return (
    <Drawer
      open
      variant="permanent"
      PaperProps={{
        onMouseEnter: () => {
          setHovered(true);
        },
        onMouseLeave: () => {
          setHovered(false);
        },
        sx: {
          backgroundColor: "background.default",
          height: `calc(100% - ${TOP_NAV_HEIGHT}px)`,
          overflowX: "hidden",
          top: TOP_NAV_HEIGHT,
          transition: "width 250ms ease-in-out",
          width: collapse ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH,
          zIndex: (theme) => theme.zIndex.appBar - 100,
        },
      }}
    >
      <Scrollbar
        sx={{
          height: "100%",
          overflowX: "hidden",
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
            {renderItems({
              collapse,
              depth: 0,
              items: processedItems,
              pathname,
            })}
          </Box>
          <Divider />
        </Box>
      </Scrollbar>
    </Drawer>
  );
};

SideNav.propTypes = {
  onPin: PropTypes.func,
  pinned: PropTypes.bool,
};
