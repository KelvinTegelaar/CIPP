import NextLink from "next/link";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { Box, Divider, Drawer, Stack } from "@mui/material";
import { Logo } from "../components/logo";
import { Scrollbar } from "../components/scrollbar";
import { paths } from "../paths";
import { MobileNavItem } from "./mobile-nav-item";
import { SideNavBookmarks } from "./side-nav-bookmarks";
import { CippTenantSelector } from "../components/CippComponents/CippTenantSelector";
import { useSettings } from "../hooks/use-settings";

const MOBILE_NAV_WIDTH = "80%";

const renderItems = ({ depth = 0, items, pathname }) =>
  items.reduce(
    (acc, item) =>
      reduceChildRoutes({
        acc,
        depth,
        item,
        pathname,
      }),
    []
  );

const reduceChildRoutes = ({ acc, depth, item, pathname }) => {
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
        key={item.title}
        openImmediately={partialMatch}
        path={item.path}
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
        title={item.title}
      />
    );
  }

  return acc;
};

export const MobileNav = (props) => {
  const { open, onClose, items } = props;
  const pathname = usePathname();
  const settings = useSettings();
  const showSidebarBookmarks = settings.bookmarkSidebar !== false;

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          width: MOBILE_NAV_WIDTH,
        },
      }}
      variant="temporary"
    >
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            pt: 2,
            px: 2,
          }}
        >
          <Box
            component={NextLink}
            href={paths.index}
            sx={{
              display: "inline-flex",
              height: 24,
              width: 24,
            }}
          >
            <Logo />
          </Box>
        </Box>
        <Box sx={{ ml: 2, mt: 2 }}>
          <CippTenantSelector refreshButton={true} tenantButton={false} />
        </Box>
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
                <SideNavBookmarks collapse={false} />
                <Divider sx={{ my: 1 }} />
              </>
            )}
            {/* Render all menu items */}
            {renderItems({
              depth: 0,
              items,
              pathname,
            })}
          </Box>
        </Box>
      </Scrollbar>
    </Drawer>
  );
};

MobileNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
