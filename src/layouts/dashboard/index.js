import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSettings } from "../../hooks/use-settings";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";

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

  const handleNavPin = useCallback(() => {
    settings.handleUpdate({
      pinNav: !settings.pinNav,
    });
  }, [settings]);

  const offset = settings.pinNav ? SIDE_NAV_WIDTH : SIDE_NAV_PINNED_WIDTH;

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
          {children}
          <Footer />
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};
