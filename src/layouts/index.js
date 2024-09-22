import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Alert, Box, Collapse, IconButton, Link, Typography, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSettings } from "../hooks/use-settings";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";
import { ApiGetCall } from "../api/ApiCall";
import { Close } from "@mui/icons-material";

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

  useEffect(
    () => {
      handlePathnameChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );

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
  const { children } = props;
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const settings = useSettings();
  const mobileNav = useMobileNav();
  const [userSettingsComplete, setUserSettingsComplete] = useState(false);
  const [fetchingVisible, setFetchingVisible] = useState([]);

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
    if (userSettingsAPI.isSuccess && !userSettingsAPI.isFetching && !userSettingsComplete) {
      settings.handleUpdate(userSettingsAPI.data);
      setUserSettingsComplete(true);
    }
  }, [
    userSettingsAPI.isSuccess,
    userSettingsAPI.data,
    userSettingsAPI.isFetching,
    userSettingsComplete,
    settings,
  ]);

  const alertsAPI = ApiGetCall({
    url: "/api/GetCippAlerts",
    queryKey: "alertsDashboard",
  });

  useEffect(() => {
    if (alertsAPI.isSuccess && !alertsAPI.isFetching) {
      setFetchingVisible(new Array(alertsAPI.data.length).fill(true));
    }
  }, [alertsAPI.isSuccess, alertsAPI.data, alertsAPI.isFetching]);

  const handleAlertClose = (index) => {
    setFetchingVisible((prevState) =>
      prevState.map((visible, idx) => (idx === index ? !visible : visible))
    );
  };

  // Determine if there are any undismissed alerts
  const hasUndismissedAlerts = fetchingVisible.some((visible) => visible);

  return (
    <>
      <TopNav onNavOpen={mobileNav.handleOpen} openNav={mobileNav.open} />
      {mdDown && <MobileNav onClose={mobileNav.handleClose} open={mobileNav.open} />}
      {!mdDown && <SideNav onPin={handleNavPin} pinned={!!settings.pinNav} />}
      <LayoutRoot
        sx={{
          pl: {
            md: offset + "px",
          },
        }}
      >
        <LayoutContainer>
          {alertsAPI.isSuccess && !alertsAPI.isFetching && hasUndismissedAlerts && (
            <Box sx={{ paddingTop: "1rem" }}>
              {alertsAPI.isSuccess &&
                !alertsAPI.isFetching &&
                alertsAPI.data.map((alert, idx) => (
                  <Collapse key={idx} in={fetchingVisible[idx]} sx={{ padding: "0.5rem" }}>
                    <Alert
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => handleAlertClose(idx)}
                        >
                          <Close fontSize="inherit" />
                        </IconButton>
                      }
                      severity={alert.type}
                    >
                      <Typography variant="body2">
                        {alert.Alert}{" "}
                        <Link target="_blank" href={alert.link}>
                          link
                        </Link>
                      </Typography>
                    </Alert>
                  </Collapse>
                ))}
            </Box>
          )}
          {children}
          <Footer />
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
};
