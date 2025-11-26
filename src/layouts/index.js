import { useCallback, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Alert,
  Button,
  Dialog,
  Divider,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { Stack } from "@mui/system";
import { styled } from "@mui/material/styles";
import { useSettings } from "../hooks/use-settings";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";
import { ApiGetCall } from "../api/ApiCall";
import { useDispatch } from "react-redux";
import { showToast } from "../store/toasts";
import { Box, Container, Grid } from "@mui/system";
import { CippImageCard } from "../components/CippCards/CippImageCard";
import Page from "../pages/onboardingv2";
import { useDialog } from "../hooks/use-dialog";
import { nativeMenuItems } from "/src/layouts/config";
import { CippBreadcrumbNav } from "../components/CippComponents/CippBreadcrumbNav";

const SIDE_NAV_WIDTH = 270;
const SIDE_NAV_PINNED_WIDTH = 50;
const TOP_NAV_HEIGHT = 50;

const useMobileNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handlePathnameChange = useCallback(() => {
    if (open) {
      setOpen(false);
    }
  }, [open]);

  useEffect(() => {
    handlePathnameChange();
  }, [pathname]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    handleClose,
    handleOpen,
    open,
  };
};

const LayoutRoot = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: TOP_NAV_HEIGHT,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: SIDE_NAV_WIDTH,
  },
}));

const LayoutContainer = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
});

export const Layout = (props) => {
  const { children, allTenantsSupport = true } = props;
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const settings = useSettings();
  const mobileNav = useMobileNav();
  const [userSettingsComplete, setUserSettingsComplete] = useState(false);
  const [fetchingVisible, setFetchingVisible] = useState([]);
  const [menuItems, setMenuItems] = useState(nativeMenuItems);
  const lastUserSettingsUpdate = useRef(null);
  const currentTenant = settings?.currentTenant;
  const [hideSidebar, setHideSidebar] = useState(false);

  const swaStatus = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmeswa",
    staleTime: 120000,
    refetchOnWindowFocus: true,
  });

  const currentRole = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
    waiting: !swaStatus.isSuccess || swaStatus.data?.clientPrincipal === null,
  });

  useEffect(() => {
    if (currentRole.isSuccess && !currentRole.isFetching) {
      const userRoles = currentRole.data?.clientPrincipal?.userRoles;
      const userPermissions = currentRole.data?.permissions;
      if (!userRoles) {
        setMenuItems([]);
        setHideSidebar(true);
        return;
      }
      const filterItemsByRole = (items) => {
        return items
          .map((item) => {
            // Check permission with pattern matching support
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
                      .replace(/\./g, "\\.") // Escape dots
                      .replace(/\*/g, ".*"); // Convert * to .*
                    const regex = new RegExp(`^${regexPattern}$`);
                    return regex.test(userPerm);
                  }

                  return false;
                });
              });
              if (!hasPermission) {
                return null;
              }
            } else {
              return null;
            }
            // check sub-items
            if (item.items && item.items.length > 0) {
              const filteredSubItems = filterItemsByRole(item.items).filter(Boolean);
              return { ...item, items: filteredSubItems };
            }

            return item;
          })
          .filter(Boolean);
      };
      const filteredMenu = filterItemsByRole(nativeMenuItems);
      setMenuItems(filteredMenu);
    } else if (
      swaStatus.isLoading ||
      swaStatus.data?.clientPrincipal === null ||
      swaStatus.data === undefined ||
      currentRole.isLoading
    ) {
      setHideSidebar(true);
    }
  }, [
    currentRole.isSuccess,
    swaStatus.data,
    swaStatus.isLoading,
    currentRole.data?.clientPrincipal?.userRoles,
    currentRole.data?.permissions,
    currentRole.isFetching,
  ]);

  const handleNavPin = useCallback(() => {
    settings.handleUpdate({
      pinNav: !settings.pinNav,
    });
  }, [settings]);

  const offset = settings.pinNav ? SIDE_NAV_WIDTH : SIDE_NAV_PINNED_WIDTH;

  const userSettingsAPI = ApiGetCall({
    url: "/api/ListUserSettings",
    queryKey: "userSettings",
  });

  useEffect(() => {
    if (userSettingsAPI.isSuccess && !userSettingsAPI.isFetching) {
      // Only update if the data has actually changed (using dataUpdatedAt as a proxy)
      const dataUpdatedAt = userSettingsAPI.dataUpdatedAt;
      if (dataUpdatedAt && dataUpdatedAt !== lastUserSettingsUpdate.current) {
        //if userSettingsAPI.data contains offboardingDefaults.user, delete that specific key.
        if (userSettingsAPI.data.offboardingDefaults?.user) {
          delete userSettingsAPI.data.offboardingDefaults.user;
        }
        if (userSettingsAPI.data.offboardingDefaults?.keepCopy) {
          delete userSettingsAPI.data.offboardingDefaults.keepCopy;
        }
        if (userSettingsAPI?.data?.currentTheme) {
          delete userSettingsAPI.data.currentTheme;
        }
        // get current devtools settings
        var showDevtools = settings.showDevtools;
        // get current bookmarks
        var bookmarks = settings.bookmarks;

        settings.handleUpdate({
          ...userSettingsAPI.data,
          bookmarks,
          showDevtools,
        });

        // Track this update and set completion status
        lastUserSettingsUpdate.current = dataUpdatedAt;
        setUserSettingsComplete(true);
      }
    }
  }, [
    userSettingsAPI.isSuccess,
    userSettingsAPI.data,
    userSettingsAPI.isFetching,
    userSettingsAPI.dataUpdatedAt,
  ]);

  const version = ApiGetCall({
    url: "/version.json",
    queryKey: "LocalVersion",
  });

  const alertsAPI = ApiGetCall({
    url: `/api/GetCippAlerts?localversion=${version?.data?.version}`,
    queryKey: "alertsDashboard",
    waiting: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!hideSidebar && version.isFetched && !alertsAPI.isFetched) {
      alertsAPI.waiting = true;
      alertsAPI.refetch();
    }
  }, [version, alertsAPI, hideSidebar]);

  useEffect(() => {
    if (alertsAPI.isSuccess && !alertsAPI.isFetching) {
      setFetchingVisible(new Array(alertsAPI.data.length).fill(true));
    }
  }, [alertsAPI.isSuccess, alertsAPI.data, alertsAPI.isFetching]);
  const [setupCompleted, setSetupCompleted] = useState(true);
  const createDialog = useDialog();
  const dispatch = useDispatch();
  useEffect(() => {
    if (alertsAPI.isSuccess && !alertsAPI.isFetching) {
      if (alertsAPI.data.length > 0) {
        alertsAPI.data.forEach((alert) => {
          dispatch(
            showToast({
              message: alert.Alert,
              title: alert.title,
              toastError: alert,
            })
          );
        });
      }
    }
    if (alertsAPI.isSuccess && !alertsAPI.isFetching) {
      if (alertsAPI.data.length > 0) {
        const setupCompleted = alertsAPI.data.find((alert) => alert.setupCompleted === false);
        if (setupCompleted) {
          setSetupCompleted(false);
        }
      }
    }
  }, [alertsAPI.isSuccess]);

  return (
    <>
      {hideSidebar === false && (
        <>
          <TopNav onNavOpen={mobileNav.handleOpen} openNav={mobileNav.open} />
          {mdDown && (
            <MobileNav items={menuItems} onClose={mobileNav.handleClose} open={mobileNav.open} />
          )}
          {!mdDown && <SideNav items={menuItems} onPin={handleNavPin} pinned={!!settings.pinNav} />}
        </>
      )}
      <LayoutRoot
        sx={{
          pl: {
            md: (hideSidebar ? "0" : offset) + "px",
          },
        }}
      >
        <LayoutContainer>
          <Dialog
            fullWidth
            maxWidth="lg"
            onClose={createDialog.handleClose}
            open={createDialog.open}
          >
            <DialogTitle>Setup Wizard</DialogTitle>
            <DialogContent>
              <Page />
            </DialogContent>
          </Dialog>
          {!setupCompleted && (
            <Box sx={{ flexGrow: 1, py: 2 }}>
              <Container maxWidth={false}>
                <Alert severity="info">
                  Setup has not been completed.
                  <Button onClick={createDialog.handleOpen}>Start Wizard</Button>
                </Alert>
              </Container>
            </Box>
          )}
          {(currentTenant === "AllTenants" || !currentTenant) && !allTenantsSupport ? (
            <Box sx={{ flexGrow: 1 }}>
              <Container maxWidth={false}>
                <CippBreadcrumbNav mode="hierarchical" />
                <Grid container spacing={3}>
                  <Grid size={6}>
                    <CippImageCard
                      title="Not supported"
                      imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
                      text={
                        "The page does not support all Tenants, please select a different tenant using the tenant selector."
                      }
                    />
                  </Grid>
                </Grid>
              </Container>
            </Box>
          ) : (
            <Stack>
              <Box sx={{ mx: 3, mt: 3 }}>
                <CippBreadcrumbNav mode="hierarchical" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {children}
            </Stack>
          )}
          <Footer />
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
};
