import { useState } from "react";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { Box, Divider, Drawer, Stack, Typography } from "@mui/material";
import { Scrollbar } from "../components/scrollbar";
import { SideNavItem } from "./side-nav-item";
import { useSettings } from "../hooks/use-settings";

const SIDE_NAV_WIDTH = 270;
const SIDE_NAV_COLLAPSED_WIDTH = 73; // icon size + padding + border right
const TOP_NAV_HEIGHT = 64;

const markOpenItems = (items, pathname) => {
  return items.map((item) => {
    const checkPath = !!(item.path && pathname);
    const exactMatch = checkPath ? pathname === item.path : false;
    // Use startsWith for partial matches so that subpages not in the menu still keep parent open
    const partialMatch = checkPath ? pathname.startsWith(item.path) : false;

    let openImmediately = exactMatch;
    let newItems = item.items || [];

    if (newItems.length > 0) {
      newItems = markOpenItems(newItems, pathname);
      const childOpen = newItems.some((child) => child.openImmediately);
      // Parent should open if exactMatch, childOpen, or partialMatch
      openImmediately = openImmediately || childOpen || partialMatch;
    } else {
      // For leaf items, consider them open if exact or partial match
      openImmediately = openImmediately || partialMatch;
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
  const partialMatch = checkPath && pathname.startsWith(item.path);

  // Consider item active if exactMatch or partialMatch for leaf items
  // For parent items, being active is determined by their children or openImmediately
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
  //select a random sponsor image based on priority, priority 1 should be higher than priority 2 or higher
  const currentSettings = useSettings();
  const theme = currentSettings?.currentTheme?.value;
  const sponsorimages = [
    {
      link: "https://rewst.io",
      imagesrc: theme === "light" ? "/sponsors/rewst.png" : "/sponsors/rewst_dark.png",
      priority: 1,
    },
    {
      link: "https://rightofboom.com",
      imagesrc: theme === "light" ? "/sponsors/RoB-light.svg" : "/sponsors/RoB.png",
      priority: 1,
    },
    {
      link: "https://ninjaone.com",
      imagesrc: theme === "light" ? "/sponsors/ninjaone.png" : "/sponsors/ninjaone_white.png",
      priority: 1,
    },
    {
      link: "https://augmentt.com",
      imagesrc: theme === "light" ? "/sponsors/augmentt-light.png" : "/sponsors/augmentt-dark.png",
      priority: 1,
    },
    {
      link: "https://huntress.com",
      imagesrc: "/sponsors/huntress_teal.png",
      priority: 1,
    },
  ];

  const randomSponsorImage = () => {
    let totalPriority = 0;
    for (let i = 0; i < sponsorimages.length; i++) {
      totalPriority += sponsorimages[i].priority;
    }
    let random = Math.floor(Math.random() * totalPriority);
    let runningTotal = 0;
    for (let i = 0; i < sponsorimages.length; i++) {
      runningTotal += sponsorimages[i].priority;
      if (random < runningTotal) {
        return sponsorimages[i];
      }
    }
  };

  const randomimg = randomSponsorImage();
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
          <Typography
            color="text.secondary"
            variant="caption"
            sx={{ lineHeight: 4, textAlign: "center" }}
          >
            This application is sponsored by
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={randomimg.imagesrc}
              alt="sponsor"
              style={{ cursor: "pointer" }}
              onClick={() => window.open(randomimg.link)}
              width={"100px"}
            />
          </Box>
        </Box>
      </Scrollbar>
    </Drawer>
  );
};

SideNav.propTypes = {
  onPin: PropTypes.func,
  pinned: PropTypes.bool,
};
